# SnapTix — Inventory Concurrency & Offline Gate Scanning

**Status:** Design agreed, not yet implemented
**Supersedes:** `LOW_LEVEL_DESIGN.md` §3 (Redisson locking sketch), `PDR.md` FR-2 bullet 3 (offline pass storage)
**Scope:** Two problems that turned out to be coupled — how we avoid overselling under contention, and how gate scanners work when the venue's network is unreliable.

---

## 0. Why these two are one document

SnapTix's core product claim is the **rotating 15-second QR pass** — it is what makes screenshot resale impossible and it is the reason the resale market can be trusted. That claim is architecturally opposed to offline scanning: a rotating token can only be verified by something that holds the pass secret, and today only the server does.

`PDR.md` FR-2 currently asserts both properties at once ("Rotating Barcodes" and "Offline Pass Storage ... zero network latency"). As written, those two bullets cannot both be true. §3 of this document resolves the conflict rather than picking a side.

---

## 1. Current implementation — what is actually in the code

This section describes `main` as it stands, not the target. It exists so the gap is explicit.

| Concern | Current behaviour | Location |
| :--- | :--- | :--- |
| Inventory guard | Read tier → compare `ticketsSold + qty > capacity` → increment → save | `OrderService.createOrder` |
| Locking | JPA `PESSIMISTIC_WRITE` applied by overriding `findById` | `TicketTierRepository` |
| Payment | Stubbed — `paymentStatus` hardcoded to `COMPLETED` | `OrderService:45` |
| Pass token | HMAC-SHA256 → 6 digits, 15s bucket, ±1 window tolerance | `DynamicPassService` |
| Gate check-in | Server-side only; loads `secretHmacKey` from DB per scan | `DynamicPassService.validateGateCheckIn` |
| Scan audit | None | — |
| Database | MySQL 8 on `127.0.0.1:3310`, Flyway V1/V2, `ddl-auto: update` | `application.yml` |

Note the divergence from the written design docs: there is no Redis, no Redisson, no message queue, and no microservice split. The system is a single Spring Boot application on MySQL. The docs describe a target state; this table describes reality.

### 1.1 Defects to fix regardless of which direction we take

**D1 — The pessimistic lock is on the wrong method.**
`TicketTierRepository` overrides `findById` with `@Lock(PESSIMISTIC_WRITE)`. Spring Data applies that to *every* caller of `findById`, not just checkout. `ResaleService:42` calls it purely to read `price` for the face-value cap — so every resale price check now takes a write lock on the tier row and serializes against every concurrent purchase in that tier. Pure contention, zero benefit.

**D2 — The lock will span the payment call.**
Today the transaction is short because payment is fake. The moment a real PSP call lands inside `createOrder`, the tier row lock is held across a network round-trip and effective throughput drops to one buyer per gateway latency.

**D3 — Orders are not idempotent.**
No idempotency key. A double-click, a retried request, or a client-side timeout produces two orders and two charges.

**D4 — Check-in has a lost-update race.**
`validateGateCheckIn` reads the pass, tests `passStatus == ACTIVE`, then writes `CHECKED_IN`. Two gates scanning the same pass concurrently both read `ACTIVE` and both succeed. The transaction boundary does not help — there is no lock and no version column.

**D5 — Pass secrets are stored in plaintext.**
`ticket_passes.secret_hmac_key` is a plain `VARCHAR`. Read access to the database is equivalent to the ability to forge any pass, indefinitely. `LOW_LEVEL_DESIGN.md` §2 already claims these are "AES-256 encrypted in storage" — they are not.

**D6 — Brute-force surface on check-in.**
A 6-digit token with a ±1 window means 3 valid values out of 10⁶ at any instant, with no attempt limiting. `passId` being a UUID is currently the only thing preventing a grind attack.

**D7 — No scan audit trail.**
There is no record of who scanned what, where, or when. This is needed for offline reconciliation (§3.4), for door disputes, and for organiser analytics.

**D8 — `ddl-auto: update` runs alongside Flyway.**
Two mechanisms manage the schema. Hibernate silently patches whatever the migrations declare, so migrations stop being the source of truth and environments drift. Should be `validate`.

---

## 2. Inventory under contention

### 2.1 Options considered

| Approach | Mechanism | Verdict |
| :--- | :--- | :--- |
| Pessimistic row lock | `SELECT ... FOR UPDATE` on the tier | Correct, but throughput is capped at 1 / transaction-duration. Every buyer for a tier queues on one row. Current implementation. |
| **Atomic conditional update** | Single guarded `UPDATE`, check rows-affected | **Chosen.** Correct at `READ COMMITTED`, no lock held, minimal change to the existing counter model. |
| Row-per-ticket + `SKIP LOCKED` | Pre-materialise inventory rows, claim N skipping locked ones | Excellent under heavy contention and required for reserved seating. Larger change; revisit when we do seat maps. |
| `SERIALIZABLE` isolation | Engine detects conflicts and aborts | Converts contention into retry storms. Not a solution. |
| Redis counter / Redisson lock | Distributed lock or Lua decrement | What `LOW_LEVEL_DESIGN.md` §3 sketches. Introduces a second source of truth for money-adjacent state. Not justified until measurement demands it. |

### 2.2 Chosen model — hold, then pay

The governing rule: **never hold a database lock across a payment call.** Checkout splits into a fast transactional *claim* and a slow external *pay*.

```
POST /orders/hold      ──▶ atomic claim, creates hold, expires_at = now + 10min
       │
       ├─ 0 rows affected ──▶ 409 SOLD_OUT
       │
       ▼
   client completes payment with PSP (no DB transaction open)
       │
       ▼
PSP webhook ──▶ hold → order, mint ticket_passes, release hold
       │
       └─ hold expired before webhook? ──▶ refund path, do not issue passes
```

**The claim, as a single statement:**

```sql
UPDATE ticket_tiers
   SET tickets_sold = tickets_sold + :qty
 WHERE id = :tierId
   AND tickets_sold + :qty <= capacity;
```

Rows affected `= 1` → claimed. `= 0` → insufficient capacity, return `409`. No lock is taken and no read-modify-write window exists, because the guard and the mutation are the same statement.

`tickets_sold` becomes "sold *or* held". Expiry decrements it back. Availability shown to users is `capacity - tickets_sold`, which is conservative during a rush — correct, and it is the behaviour users already expect from a checkout timer.

**Repository split (fixes D1):**

```java
// plain read — used by ResaleService, EventService, listings
Optional<TicketTierEntity> findById(UUID id);

// only for paths that genuinely mutate inventory
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("select t from TicketTierEntity t where t.id = :id")
Optional<TicketTierEntity> findByIdForUpdate(@Param("id") UUID id);

@Modifying
@Query(value = """
    UPDATE ticket_tiers
       SET tickets_sold = tickets_sold + :qty
     WHERE id = :tierId
       AND tickets_sold + :qty <= capacity
    """, nativeQuery = true)
int claimCapacity(@Param("tierId") UUID tierId, @Param("qty") int qty);
```

### 2.3 Hold expiry

Expiry is evaluated at **read time**, not solely by a sweeper. A `ticket_holds` row with `expires_at < now()` is treated as released by any query that counts inventory, so a lagging or crashed sweeper cannot cause phantom sold-outs. The scheduled sweeper still runs — it returns capacity to `tickets_sold` and keeps reporting clean — but correctness does not depend on its punctuality.

```sql
-- sweeper, idempotent, safe to run concurrently with itself
UPDATE ticket_tiers t
  JOIN ticket_holds h ON h.tier_id = t.id
   SET t.tickets_sold = t.tickets_sold - h.quantity,
       h.status = 'EXPIRED'
 WHERE h.status = 'HELD' AND h.expires_at < NOW();
```

### 2.4 Idempotency (fixes D3)

Checkout accepts an `Idempotency-Key` header. Persist it on `orders` with a unique index; on collision, return the existing order rather than creating a second. The same key must be forwarded to the PSP so the gateway also deduplicates.

Webhooks need the same treatment in reverse — PSP webhooks arrive out of order and more than once, so `HELD → SOLD` must be a conditional transition, not a blind write.

### 2.5 Backstop

```sql
ALTER TABLE ticket_tiers
  ADD CONSTRAINT chk_capacity CHECK (tickets_sold <= capacity);
```

MySQL enforces `CHECK` from 8.0.16. `DATABASE_DESIGN.md` already documents this constraint; Flyway `V1` never created it. Cheap insurance against a future code path that forgets the guard.

---

## 3. Offline gate scanning

### 3.1 The constraint

A rotating token proves *liveness* — that the holder's device is generating codes right now, so a screenshot is worthless. Verifying it requires the pass secret. Shipping raw pass secrets to door devices would mean a stolen scanner can forge every ticket for that event, which trades one fraud vector for a worse one.

So we separate the two things a QR must prove, and let them fail independently.

### 3.2 Layered QR

| Layer | Mechanism | Proves | Verifiable offline? |
| :--- | :--- | :--- | :--- |
| **L1 — Authenticity** | Ed25519 signature over `passId ‖ eventId ‖ issuedAt`, per-event keypair | The ticket was issued by SnapTix and not altered | **Yes** — scanner holds only the public key |
| **L2 — Liveness** | Existing 15s rotating HMAC digits | The holder's device is live; not a screenshot | Only with a manifest (§3.3) |

QR payload stays compact — a 64-byte Ed25519 signature plus identifiers is roughly 110 base64url characters, comfortably inside QR capacity at door-scanning densities.

**Ed25519 rather than HMAC for L1 is the load-bearing choice.** Door devices are the weakest link in the system: they are shared, borrowed, left on tables, and operated by temporary staff. With asymmetric signing they hold only a public key, so a compromised scanner can verify tickets and forge nothing.

### 3.3 Scanner modes

```
┌─ ONLINE ──────────── verify L1 + L2 server-side, atomic check-in     ─ full security
├─ OFFLINE + manifest ─ verify L1 + L2 locally against precomputed set ─ full security
└─ OFFLINE degraded ─── verify L1 only, admit, flag scan DEGRADED      ─ anti-counterfeit only
```

Degraded mode is a deliberate product decision: when the network is gone and no manifest was fetched, we keep the counterfeit guarantee and lose the anti-screenshot guarantee, rather than refusing entry. Those scans are flagged so an organiser can review them afterwards.

**Manifest contents, fetched before doors open:**

- Event public key (L1 verification)
- Revocation list — passes refunded, resold, or cancelled since issuance
- Precomputed L2 token digests for the door window
- Staff credentials and device binding, expiring at event end

**Precomputed digests, not secrets.** For each pass we compute the expected token for every time bucket in the door window and ship truncated 8-byte digests. The scanner can verify but cannot forge, and holds no material useful after the event.

Sizing, for a 6-hour door window at 5,000 passes:

| Bucket size | Buckets/pass | Bytes/pass | 5,000 passes |
| :--- | ---: | ---: | ---: |
| 15s (current) | 1,440 | 11.3 KB | ~56 MB |
| 30s | 720 | 5.6 KB | ~28 MB |
| **60s (door mode)** | **360** | **2.8 KB** | **~14 MB** |

15s is impractical to precompute at scale. The resolution is a **door-mode bucket**: passes rotate at 15s in the app for the anti-screenshot effect, but L2 verification accepts a coarser 60s bucket during the event window. A 60-second screenshot window is not a usable resale vector — by the time a screenshot is transmitted and presented, it has expired — so the security loss is negligible and the manifest becomes a 14 MB download.

### 3.4 Sync and reconciliation

Devices log every scan locally and push on reconnect:

```
POST /gate/scans/sync
[ { passId, eventId, deviceId, scannedAt, mode, result, localSeq }, ... ]
```

Server rules:

- **Idempotent** — unique on `(pass_id, device_id, scanned_at)`; replays are no-ops.
- **First-scan-wins** — earliest `scannedAt`, ties broken by `deviceId`, takes the check-in.
- **Later scans recorded as `DUPLICATE`** — never silently dropped. They are the evidence for a fraud investigation.

**The honest limitation:** two devices that are both offline cannot detect a duplicate between themselves. Mitigations, in order of practicality:

1. **Partition by gate** — a given ticket class enters through one door, so duplicates would have to pass the same device twice, which it catches locally.
2. **Peer sync** — devices in local Wi-Fi/BLE range gossip their scan logs.
3. **Accept and reconcile** — log everything, review afterwards.

Most real venues run (1) plus (3). Duplicate rates are low and the fraud is provable after the fact, which is usually sufficient deterrence.

### 3.5 Atomic check-in (fixes D4)

Replace the read-test-write in `validateGateCheckIn` with a conditional update:

```sql
UPDATE ticket_passes
   SET pass_status = 'CHECKED_IN',
       checked_in_at = :scannedAt,
       checked_in_device_id = :deviceId
 WHERE id = :passId
   AND pass_status = 'ACTIVE';
```

Exactly one concurrent scanner sees 1 row affected and admits; the others see 0 and show "already checked in". This is the same shape as the inventory claim in §2.2, for the same reason.

---

## 4. Schema additions

```sql
-- V3: inventory holds
CREATE TABLE ticket_holds (
    id          UUID PRIMARY KEY,
    tier_id     UUID NOT NULL REFERENCES ticket_tiers(id),
    user_id     UUID NOT NULL REFERENCES users(id),
    quantity    INTEGER NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'HELD',   -- HELD | CONVERTED | EXPIRED | RELEASED
    expires_at  TIMESTAMP NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_holds_sweep ON ticket_holds(status, expires_at);

ALTER TABLE orders
    ADD COLUMN idempotency_key VARCHAR(80),
    ADD COLUMN hold_id UUID REFERENCES ticket_holds(id),
    ADD CONSTRAINT uq_orders_idem UNIQUE (idempotency_key);

ALTER TABLE ticket_tiers
    ADD CONSTRAINT chk_capacity CHECK (tickets_sold <= capacity);

-- V4: per-event signing keys for L1
CREATE TABLE event_signing_keys (
    event_id         UUID PRIMARY KEY REFERENCES events(id) ON DELETE CASCADE,
    public_key       VARBINARY(64)  NOT NULL,
    private_key_enc  VARBINARY(256) NOT NULL,   -- AES-GCM, key from KMS/vault
    algorithm        VARCHAR(20) NOT NULL DEFAULT 'Ed25519',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- V5: append-only scan audit
CREATE TABLE scan_logs (
    id          UUID PRIMARY KEY,
    pass_id     UUID NOT NULL REFERENCES ticket_passes(id),
    event_id    UUID NOT NULL REFERENCES events(id),
    device_id   VARCHAR(64) NOT NULL,
    scanned_at  TIMESTAMP NOT NULL,
    synced_at   TIMESTAMP NULL,
    mode        VARCHAR(16) NOT NULL,   -- ONLINE | OFFLINE | DEGRADED
    result      VARCHAR(16) NOT NULL,   -- ADMITTED | DUPLICATE | REVOKED | INVALID
    CONSTRAINT uq_scan_idem UNIQUE (pass_id, device_id, scanned_at)
);
CREATE INDEX idx_scan_event ON scan_logs(event_id, scanned_at);

ALTER TABLE ticket_passes
    ADD COLUMN checked_in_at TIMESTAMP NULL,
    ADD COLUMN checked_in_device_id VARCHAR(64) NULL,
    ADD COLUMN signature VARBINARY(64) NULL,     -- L1
    ADD COLUMN version INTEGER NOT NULL DEFAULT 0;

-- secret_hmac_key becomes ciphertext (D5); migrate existing rows in place
ALTER TABLE ticket_passes
    MODIFY COLUMN secret_hmac_key VARBINARY(256) NOT NULL;
```

---

## 5. API surface

| Endpoint | Purpose | Notes |
| :--- | :--- | :--- |
| `POST /orders/hold` | Claim capacity, open a 10-minute window | `Idempotency-Key` required |
| `POST /orders/confirm` | Internal — PSP webhook converts hold → order | Idempotent on PSP event id |
| `DELETE /orders/hold/{id}` | User abandons checkout | Releases immediately |
| `GET /gate/manifest/{eventId}` | Scanner pre-download | Public key, revocations, L2 digests |
| `GET /gate/manifest/{eventId}/delta` | Revocation updates since `?since=` | Small, pollable during doors |
| `POST /gate/scan` | Online single scan | Atomic conditional check-in |
| `POST /gate/scans/sync` | Offline batch upload | Idempotent, returns conflicts |

---

## 6. Implementation order

Each slice is independently shippable and independently useful.

1. **Hygiene (D1, D8)** — split the repository methods, set `ddl-auto: validate`. No behaviour change, removes an active contention bug.
2. **Inventory (D2, D3)** — `ticket_holds`, conditional claim, idempotency key, `CHECK` constraint, sweeper. Backend-only; the frontend keeps working against the existing endpoint until we cut over.
3. **Scan integrity (D4, D6, D7)** — atomic check-in, `scan_logs`, attempt throttling. Needed regardless of offline support.
4. **Secret encryption (D5)** — AES-GCM at rest, key from vault, migrate existing rows.
5. **L1 signatures** — per-event keypairs, sign at issuance, extend QR payload. Scanner still online-only; nothing user-visible changes.
6. **Offline mode** — manifest generation, door-mode bucket, local verification in `QRCheckInScannerModal`, sync endpoint and reconciliation UI.

Steps 1–3 are small and remove real defects. Step 6 is the largest and is the only one that touches the scanner UI.

---

## 7. Open questions

- **Door-mode bucket size.** §3.3 proposes 60s. If the resale threat model demands tighter, 30s doubles the manifest to ~28 MB — acceptable over venue Wi-Fi during setup, painful over cellular.
- **Manifest distribution.** Pull from the scanner at setup time, or push when the organiser opens doors in the app?
- **Payment provider.** The hold model in §2.2 assumes webhook confirmation. Provider choice affects webhook ordering guarantees and therefore how defensive §2.4 needs to be.
- **Escrow interaction.** `PDR.md` FR-3 holds resale funds until 24h post-event. Does a `DEGRADED` scan count as attendance for escrow release?
- **Reserved seating.** Not in scope here. If seat maps arrive, revisit the row-per-ticket + `SKIP LOCKED` option from §2.1 — the counter model does not extend to named seats.
