# SnapTix High-Level System Design (HLD)

> **Shared document.** An identical copy lives in both `snaptix-backend/docs/` and
> `snaptix-frontend/docs/`. Edit one and copy it across — otherwise the two drift and
> neither is trustworthy. Last synced: 2026-08-09.


## 0. As-Built vs. Target

> This document describes a **target architecture**. What currently runs is materially simpler, and the gap matters when planning work:
>
> | Documented | Actually deployed |
> | :--- | :--- |
> | Event-driven microservices | One Spring Boot application (`snaptix-backend`) |
> | PostgreSQL 16 + read replicas | MySQL 8, single instance, `127.0.0.1:3310` |
> | Redis 7 cache / Redisson locks | No Redis. JPA pessimistic locking. |
> | RabbitMQ message queue | None |
> | Spring Cloud Gateway / Nginx | None — client calls the service directly |
>
> **Repository layout.** The codebase is split into two independent git repositories:
> `snaptix-backend` (Spring Boot API) and `snaptix-frontend` (React client + Node BFF).
>
> **Undocumented component — the frontend BFF.** `snaptix-frontend/server.ts` is not merely
> a dev server. It is an Express application that serves the built client *and* hosts
> AI endpoints (`POST /api/ai/generate-event`, `POST /api/ai/generate-promotion`) which
> call the Gemini API with a server-held key. It is a real backend-for-frontend tier and
> is absent from the diagram below. Anything that needs the Gemini key must live there,
> not in the Spring Boot service.

---

## 1. System Architecture Diagram

SnapTix follows an **Event-Driven Microservices Architecture** built with **Java 21 & Spring Boot 3**, backed by **PostgreSQL**, **Redis**, and a **React + Tailwind** front-end client.

```
                     +---------------------------------------+
                     |    Client Tier (React 18 / PWA)      |
                     +---------------------------------------+
                                         |
                                         | HTTPS / WebSocket
                                         v
                     +---------------------------------------+
                     |   API Gateway / Reverse Proxy         |
                     |   (Spring Cloud Gateway / Nginx)      |
                     +---------------------------------------+
                                         |
            +----------------------------+----------------------------+
            |                            |                            |
            v                            v                            v
  +-------------------+        +-------------------+        +-------------------+
  | Auth & User       |        | Event & Discovery |        | Ticketing & Order |
  | Service           |        | Service           |        | Service           |
  | (Spring Boot 3)   |        | (Spring Boot 3)   |        | (Spring Boot 3)   |
  +-------------------+        +-------------------+        +-------------------+
            |                            |                            |
            +----------------------------+----------------------------+
                                         |
                                         v
                     +---------------------------------------+
                     |    Dynamic Pass Generator &           |
                     |    HMAC Token Engine                  |
                     +---------------------------------------+
                                         |
       +---------------------------------+---------------------------------+
       |                                 |                                 |
       v                                 v                                 v
+--------------+                 +---------------+                 +---------------+
| PostgreSQL   |                 | Redis Cache   |                 | Message Queue |
| Primary DB   |                 | (Token/Pass)  |                 | (RabbitMQ)    |
+--------------+                 +---------------+                 +---------------+
```

---

## 2. Component Descriptions

### 2.1 API Gateway Tier
- Serves as the single entry point for all client web & mobile applications.
- Performs Rate Limiting (Token Bucket algorithm via Redis), CORS handling, SSL termination, and JWT validation.

### 2.2 Auth & User Microservice
- Handles User Registration, Authentication (JWT with RSA-256 signing), and Role-Based Access Control (RBAC: `ATTENDEE`, `MODERATOR`, `ORGANISER_ADMIN`).

### 2.3 Event & Discovery Microservice
- Manages Event creation, Draft moderation workflow (`pending_approval` -> `published`), Location distance filtering, Category indexing, and AI marketing copy generation.

### 2.4 Ticketing & Order Engine (Core Transactional Service)
- Manages high-concurrency ticket reservations using Redis Distributed Locks (`Redisson`) to prevent double-selling during flash ticket sales.
- Processes payment webhooks and generates immutable Ticket Pass records.

### 2.5 Dynamic Pass Engine (Anti-Scalping Token Service)
- Generates time-variant HMAC-SHA256 OTP tokens that update every 15 seconds.
- Validates gate check-ins with sub-0.2s latency.

---

## 3. High Availability & Data Persistence Strategy
- **Relational Persistence:** PostgreSQL with Read Replicas for transactional safety, ACID compliance, and relational integrity across Events, Orders, and Passes.
- **In-Memory Cache:** Redis for active session caching, ticket inventory countdowns, and short-lived OTP validation keys.
