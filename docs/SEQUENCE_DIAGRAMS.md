# SnapTix Data Sequence & Flow Diagrams

## 1. Ticket Purchase Flow (Anti-Scalping Escrow Order)

```mermaid
sequenceDiagram
    autonumber
    actor Fan as Attendee / Fan
    participant Web as React Client
    participant GW as API Gateway
    participant OrderSvc as Order Service
    participant Redis as Redis Lock Engine
    participant DB as PostgreSQL DB
    participant PassEng as Dynamic Pass Generator

    Fan->>Web: Clicks "Book Tickets"
    Web->>GW: POST /api/orders
    GW->>OrderSvc: Forward order request
    OrderSvc->>Redis: Acquire lock on Tier ID
    Redis-->>OrderSvc: Lock Granted
    OrderSvc->>DB: Query Tier capacity FOR UPDATE
    DB-->>OrderSvc: Remaining Capacity OK
    OrderSvc->>DB: Increment tickets_sold
    OrderSvc->>DB: Insert Order record
    OrderSvc->>PassEng: Generate HMAC secret seed per ticket
    PassEng-->>OrderSvc: HMAC Seed Keys
    OrderSvc->>DB: Insert TicketPasses (ACTIVE status)
    OrderSvc->>Redis: Release lock on Tier ID
    OrderSvc-->>GW: Return 201 Created + Order & Pass IDs
    GW-->>Web: JSON Response
    Web-->>Fan: Render Confirmed Order & Rotating Pass
```

---

## 2. Gate QR Scanner Verification Sequence (0.2s Validation)

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Event Gate Staff
    participant App as Mobile Gate Scanner
    participant PassSvc as Dynamic Pass Service
    participant DB as PostgreSQL DB

    Note over App: Client recalculates 6-digit HMAC token every 15s
    Staff->>App: Scans live dynamic QR on fan phone
    App->>PassSvc: POST /api/passes/validate {passId, token}
    PassSvc->>DB: Fetch secretHMACKey for passId
    DB-->>PassSvc: Return secretKey & status
    PassSvc->>PassSvc: Calculate HMAC-SHA256 for current, prev, next 15s window
    alt Token Matches & Pass ACTIVE
        PassSvc->>DB: Update passStatus = 'CHECKED_IN'
        PassSvc-->>App: 200 OK {valid: true, attendeeName, tierName}
        App-->>Staff: Green Light "ENTRY GRANTED"
    else Token Mismatch or Already Used
        PassSvc-->>App: 400 Bad Request {valid: false, reason: "INVALID_OR_USED"}
        App-->>Staff: Red Light "ENTRY DENIED"
    end
```

---

## 3. Moderator Event Approval Sequence (RBAC Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Mod as Moderator
    actor Admin as Organiser Admin
    participant App as Organiser Studio Web UI
    participant EvtSvc as Event Service
    participant DB as PostgreSQL DB

    Mod->>App: Creates new event draft
    App->>EvtSvc: POST /api/events {status: 'draft'}
    EvtSvc->>DB: Save Event (status: 'draft', createdByPersona: 'moderator')
    Mod->>App: Clicks "Submit for Review"
    App->>EvtSvc: PUT /api/events/{id}/status {status: 'pending_approval'}
    EvtSvc->>DB: Update status to 'pending_approval'
    EvtSvc-->>App: Event placed in Review Queue
    
    Admin->>App: Opens Admin Dashboard & sees Pending Alert
    Admin->>App: Clicks "Approve & Publish"
    App->>EvtSvc: PUT /api/events/{id}/status {status: 'published'}
    EvtSvc->>DB: Update status to 'published'
    EvtSvc-->>App: Event is now Live on Explore Marketplace
```
