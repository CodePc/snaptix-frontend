# SnapTix Product Definition & Requirements (PDR)

**Product Name:** SnapTix - Next-Generation Event Ticketing & Anti-Scalping Pass System  
**Version:** 2.0.0  
**Target Platform:** Web (Desktop/Mobile Web PWA), Backend REST API  
**Core Domain:** Event Ticketing, Dynamic Anti-Counterfeit Barcodes, Secondary Market Escrow, Organiser Operations  

---

## 1. Executive Summary & Product Vision

SnapTix is a modern ticketing platform built to end event scalping, ticket fraud, and gate queues. By replacing static PDFs and static QR codes with **dynamic anti-screenshot rotating QR passes** that refresh every 15 seconds via HMAC-SHA256, SnapTix guarantees 100% ticket authenticity.

The platform provides a dual-sided marketplace:
1. **Attendee Experience:** Seamless event discovery, instant 1-click booking, dynamic live passes in offline wallet, and face-value secondary market resale with automated escrow payouts.
2. **Organiser Studio:** Complete event lifecycle management, multi-tiered ticket capacity controls, real-time gate scanner app (0.2s QR validation), AI-assisted marketing copy, and multi-role team access (Admins & Event Moderators).

---

## 2. Target Persona & User Roles

| Role | Key Objectives | Permissions |
| :--- | :--- | :--- |
| **Attendee / Fan** | Discover events, buy tickets, hold dynamic QR passes, list/buy resale tickets at face value | View events, purchase tickets, view passes, list on resale market |
| **Event Moderator** | Create event drafts, manage attendee check-ins, generate promotional copy | Create/edit event drafts, perform QR check-ins, view event stats (cannot publish directly) |
| **Organiser Admin** | Review moderator event drafts, approve & publish live events, process financial payouts, manage team permissions | Full admin control over events, financial payouts, team RBAC, system settings |

---

## 3. Core Functional Requirements

### FR-1: Event Discovery & Exploration
- **Live Search & Filter:** Instant filtering by event title, category, city, distance radius, and quick tags (e.g. "Free", "Techno", "Speakeasy").
- **Featured Spotlight & Categories:** Curated hero spotlight banner and horizontal category carousels (Concerts, Tech, Food, Comedy, Masterclasses).
- **Audio & Media Preview:** Quick audio sample previews for music events and high-definition visual banners.

### FR-2: Dynamic Anti-Scalping Ticket Engine
- **Rotating Barcodes:** QR codes must cycle every 15 seconds using a time-based HMAC-SHA256 hash `HMAC_SHA256(TicketID + Timestamp_Window, SecretKey)`.
- **Anti-Screenshot Security:** Watermarked animated background mesh behind the QR code prevents static screenshot duplication.
- **Ticket Authenticity (offline-verifiable):** Every pass additionally carries an Ed25519 signature over `passId ‖ eventId ‖ issuedAt`, issued under a per-event keypair. Gate scanners hold only the public key, so authenticity is verifiable with no network connection and a compromised scanner cannot forge tickets.
- **Offline Gate Scanning (graceful degradation):** Scanners operate in three modes — online (full verification), offline with a pre-downloaded manifest (full verification), and offline degraded (authenticity verified, liveness unverified, scan flagged for organiser review). Rotating-token verification during doors uses a coarser 60-second bucket so the manifest stays a practical size.

> **Note:** earlier revisions of this document claimed rotating 15s tokens *and* zero-latency offline scanning simultaneously. Those requirements are mutually exclusive as stated — verifying a rotating token requires the pass secret, which cannot safely be distributed to door devices. See `CONCURRENCY_AND_OFFLINE_SCANNING.md` §3 for the layered design that resolves this.

### FR-3: Capped Face-Value Resale Market
- **Escrow-Protected Resale:** Fans can list unused tickets at a maximum price capped at +10% of face value to prevent predatory markup.
- **Automatic Ticket Re-Issuance:** Upon resale completion, the seller's QR pass is invalidated instantly and a brand-new dynamic seed is issued to the buyer.
- **Escrow Payouts:** Funds held in platform escrow until 24 hours post-event to protect buyers against cancelled shows.

### FR-4: Organiser Operations & Gate Scanner
- **0.2-Second Gate Check-In:** Web-based camera barcode scanner validates rotating HMAC tokens in real-time.
- **Tiered Ticket Engine:** Support for Early Bird, General Admission, VIP Backstage, and Free RSVP tiers.
- **Role-Based Approval Workflow:** Moderators submit event drafts for review; Organiser Admins approve and publish events live to the marketplace.

---

## 4. Non-Functional Requirements (NFRs)

- **Performance:** Sub-100ms API response time for event search and pass token validation.
- **Security:** AES-256 encryption at rest for secret keys, JWT-based OAuth2 authentication, TLS 1.3 in transit.
- **Scalability:** System engineered to handle 10,000 requests/second during flash ticket drops.
- **Availability:** 99.95% uptime with multi-region database replication and CDN edge caching.
