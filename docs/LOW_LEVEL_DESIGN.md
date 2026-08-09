# SnapTix Low-Level Design (LLD)

## 1. Class & Package Specifications (Java 17 / Spring Boot 3)

The backend follows a clean, layered architecture:
`Controller Layer` -> `Service Layer` -> `Repository Layer` -> `Database Entity Layer`.

### 1.1 Package Overview
```
com.snaptix.backend
├── config              # Security, OpenAPI, CORS configuration
├── controller          # REST Controller endpoints
├── dto                 # Request/Response Data Transfer Objects
├── entity              # JPA Database Entities
├── exception           # Custom Domain Exceptions & Global Exception Handler
├── repository          # Spring Data JPA Repositories
├── security            # JWT Filters, UserDetails, RSA Signer
└── service             # Core Business Logic Services
```

---

## 2. Dynamic Pass Token Generation Algorithm (Anti-Scalping)

To eliminate screenshot scalping, each `TicketPass` contains a cryptographically secure randomly generated `secretHMACKey`.

> **⚠️ Accuracy note:** this key is described here as "AES-256 encrypted in storage". It is not — `ticket_passes.secret_hmac_key` is currently a plaintext `VARCHAR`, so read access to the database is equivalent to the ability to forge any pass. Tracked as defect **D5** in `CONCURRENCY_AND_OFFLINE_SCANNING.md` §1.1.
>
> The validation logic in §2.2 below is also **online-only** — it loads the secret from the database on every scan. Offline verification uses a separate Ed25519 authenticity layer; see §3 of that document.

### 2.1 Token Generation Logic
```
Time Step = 15 Seconds
Current Time Bucket T = Floor(System.currentTimeMillis() / 15000)
Input Message M = PassID + ":" + T
Dynamic Token = Truncate(HMAC-SHA256(SecretKey, M), 6_Digits)
```

### 2.2 Validation Logic at Gate
The Scanner transmits the scanned 6-digit token alongside `passId` to the `TicketPassController`.
The service calculates HMAC for time buckets $T$, $T-1$, and $T+1$ to account for minor clock drift, ensuring $0.2$-second verification speed.

---

## 3. High-Concurrency Ticket Reservation & Locking Strategy

> **⚠️ Superseded — see `CONCURRENCY_AND_OFFLINE_SCANNING.md` §2.**
>
> The Redisson-based sketch below is **not implemented and is not the target design**. There is no Redis in the deployment. The code in `OrderService.createOrder` uses a JPA `PESSIMISTIC_WRITE` lock instead, and the agreed target is an atomic conditional `UPDATE` plus a `ticket_holds` table.
>
> Two problems with the sketch, retained here because they are instructive: it holds a distributed lock across what will eventually be a payment-gateway call, and a distributed lock over a transactional database introduces a second source of truth for money-adjacent state. Kept for historical context only.

To handle high-demand ticket drops without overselling:

```java
@Transactional
public OrderResponse createOrder(CreateOrderRequest request, UUID userId) {
    // 1. Acquire Redis Distributed Lock for Tier ID
    RLock lock = redissonClient.getLock("LOCK_TIER_" + request.getTierId());
    try {
        if (!lock.tryLock(3, 10, TimeUnit.SECONDS)) {
            throw new TicketSoldOutException("High demand - please retry");
        }
        
        TicketTier tier = ticketTierRepository.findByIdWithLock(request.getTierId())
            .orElseThrow(() -> new ResourceNotFoundException("Tier not found"));
            
        if (tier.getTicketsSold() + request.getQuantity() > tier.getCapacity()) {
            throw new InsufficientCapacityException("Requested quantity exceeds remaining capacity");
        }
        
        // 2. Increment sold count
        tier.setTicketsSold(tier.getTicketsSold() + request.getQuantity());
        ticketTierRepository.save(tier);
        
        // 3. Persist Order and Generate TicketPasses
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(tier.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        order.setPaymentStatus("COMPLETED");
        Order savedOrder = orderRepository.save(order);
        
        List<TicketPass> passes = new ArrayList<>();
        for (int i = 0; i < request.getQuantity(); i++) {
            TicketPass pass = new TicketPass();
            pass.setOrderId(savedOrder.getId());
            pass.setUserId(userId);
            pass.setTierId(tier.getId());
            pass.setPassStatus("ACTIVE");
            pass.setSecretHMACKey(UUID.randomUUID().toString().replace("-", ""));
            passes.add(ticketPassRepository.save(pass));
        }
        
        return OrderResponse.fromEntity(savedOrder, passes);
    } finally {
        if (lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
```

---

## 4. Design Patterns Applied

- **Strategy Pattern:** Used for Payment Gateways (Stripe, Apple Pay, Escrow Engine).
- **Factory Pattern:** Used for generating dynamic anti-scalping pass payloads.
- **Observer Pattern:** Triggers async notifications via Spring `@EventListener` when orders are completed or resales are matched.
- **Decorator Pattern:** Wraps security validation rules around event creation workflows based on `OrganiserPersona`.
