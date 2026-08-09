# SnapTix Gate Scanner — Client Specification

**Applies to:** `snaptix-frontend`
**Component:** `src/components/Organiser/QRCheckInScannerModal.tsx`
**Backend counterpart:** `snaptix-backend/docs/CONCURRENCY_AND_OFFLINE_SCANNING.md` §3
**Status:** Specification. Most of this is not yet built — see §1.

---

## 1. What exists today

Read this before estimating anything. The gap between the product description and the implementation is larger here than anywhere else in the system.

| Capability | PDR claim | Reality |
| :--- | :--- | :--- |
| Camera QR capture | "Web-based camera barcode scanner" (FR-4) | **Not implemented.** No `getUserMedia`, no `BarcodeDetector`, no `<video>` element anywhere in `src/`. |
| QR decoding | Implied | **No decode library.** `qrcode.react` only *renders* QR codes for the attendee's pass. |
| Token validation | "0.2s validation" | Implemented, but **online-only** — `validatePassApi` → `POST /passes/{id}/validate`. |
| Offline operation | "Offline Pass Storage ... zero network latency" (FR-2) | **Nothing offline.** No service worker, no IndexedDB, no request queue. |
| PWA | "Mobile Web PWA" (target platform) | **Not a PWA.** No manifest, no service worker registration. |
| Input method | — | Manual paste of `SNAPTIX\|passId\|token`, or click an attendee on the roster. |

So the current "scanner" is a text box and a list. That is a perfectly reasonable place to have started, but three prerequisites sit between here and offline scanning: **camera capture**, **offline storage**, and **PWA installability**. None of them depend on the backend, so they can be built in parallel with the backend work.

---

## 2. QR payload format

### 2.1 Current — v1

```
SNAPTIX|{passId}|{token}
```

Built by `buildPassQrPayload()` and parsed by `parsePassQrPayload()` in `src/services/snaptixApi.ts`. The parser also accepts two loose fallbacks (`passId token`, `passId:token`) via regex, which exist for manual entry.

### 2.2 Target — v2, with authenticity layer

Offline verification requires the QR to carry an Ed25519 signature the scanner can check against a per-event public key (backend doc §3.2).

```
SNAPTIX|v2|{passId}|{eventId}|{token}|{issuedAt}|{sig}
```

| Field | Format | Purpose |
| :--- | :--- | :--- |
| `passId` | UUID | Identifies the pass |
| `eventId` | UUID | Lets the scanner reject tickets for other events without a lookup |
| `token` | 6 digits | Rotating liveness token (L2) |
| `issuedAt` | epoch seconds | Signed, so it cannot be back-dated |
| `sig` | base64url, 86 chars | Ed25519 over `passId ‖ eventId ‖ issuedAt` (L1) |

Total ≈ 190 characters. Comfortably inside QR version 8–10 at error correction level M, which scans reliably from a phone screen at door distance.

**Parser must stay backward compatible.** Passes issued before the migration are v1 and remain valid until their events end. Dispatch on `parts[1] === 'v2'`; anything else falls through to the existing v1 path. Do not remove the loose regex fallbacks — staff rely on them when a screen is cracked or too dim to scan.

**Only `sig` and `issuedAt` are new on the wire.** `token` continues to rotate every 15 seconds via `fetchPassToken`; the signature is stable for the life of the pass and can be fetched once and cached.

---

## 3. Scan modes

The scanner must degrade rather than fail. Mode is determined per-scan, not per-session — connectivity comes and goes at a door.

```
        ┌──────────────────────────────────────────────┐
        │ network reachable?                           │
        └───────────────┬──────────────────────────────┘
              yes       │        no
        ┌───────────────┘        └────────────┐
        ▼                                      ▼
   ┌─────────┐                    ┌────────────────────────┐
   │ ONLINE  │                    │ manifest cached?       │
   └─────────┘                    └───┬────────────────┬───┘
   POST /gate/scan                yes │             no │
   server verifies L1+L2             ▼                ▼
   authoritative               ┌──────────┐    ┌────────────┐
                               │ OFFLINE  │    │  DEGRADED  │
                               └──────────┘    └────────────┘
                               verify L1+L2    verify L1 only
                               locally         admit + flag
```

| Mode | Verifies | Admits | UI treatment |
| :--- | :--- | :--- | :--- |
| `ONLINE` | L1 + L2, server-side | Yes | Green. Current behaviour. |
| `OFFLINE` | L1 + L2, locally | Yes | Green with a small "offline" chip. Security is equivalent to online. |
| `DEGRADED` | L1 only | Yes | **Amber, not green.** Copy: "Admitted — ticket verified, live check unavailable." |

`DEGRADED` deliberately admits the holder. Refusing entry because venue Wi-Fi dropped is worse than admitting a screenshot, and the scan is flagged for the organiser to review afterwards. The amber state exists so door staff know to glance at the holder's screen for the rotating animation.

**Never show `DEGRADED` as a plain success.** If staff cannot distinguish it from a full verification, the flag is worthless.

---

## 4. Local verification

Both offline modes verify without network. Use `crypto.subtle` — Ed25519 is available in Chrome 137+, Safari 17+, and Firefox 129+. Feature-detect at manifest download and warn the organiser during setup, not at the door.

```ts
// L1 — authenticity. Always runs offline.
const ok = await crypto.subtle.verify(
  'Ed25519',
  eventPublicKey,                       // imported once from the manifest
  base64UrlDecode(sig),
  new TextEncoder().encode(`${passId}|${eventId}|${issuedAt}`),
);
```

Then, in order, all offline:

1. `eventId` matches the event this device is scanning — reject `WRONG_EVENT`.
2. `passId` not in the manifest revocation list — reject `REVOKED`.
3. `passId` not already in the local scan log — reject `DUPLICATE`.
4. L2 token digest matches the precomputed set for the current 60-second door bucket — if the manifest is present. Absent → `DEGRADED`.

**Door-bucket note.** Passes rotate at 15s, but offline L2 verification uses a coarser 60-second bucket so the manifest stays around 14 MB for 5,000 passes (backend doc §3.3). Accept the token if it matches any 15s sub-bucket within the current 60s window, ±1 window for clock drift. Device clock drift is the most likely cause of false rejections in the field — surface "check device time" in the error copy rather than a bare "invalid token".

---

## 5. Manifest

Fetched during setup, over venue Wi-Fi, **before doors open**. Roughly 14 MB for 5,000 passes; show a progress bar and refuse to enter offline mode without it.

```
GET /gate/manifest/{eventId}         → full manifest
GET /gate/manifest/{eventId}/delta?since={iso8601}  → revocations only, small
```

```jsonc
{
  "eventId": "…",
  "publicKey": "base64url",            // Ed25519, 32 bytes
  "doorWindow": { "from": "…", "to": "…", "bucketSeconds": 60 },
  "revoked": ["passId", "…"],          // refunded, resold, cancelled
  "tokens": { "passId": ["digest", "…"] },  // 8-byte digests per bucket
  "generatedAt": "…",
  "expiresAt": "…"                     // event end; purge after
}
```

Store in **IndexedDB**, not `localStorage` — the 5–10 MB quota makes `localStorage` unusable at this size, and it is synchronous, so writing 14 MB would block the main thread. Note that `src/utils/api.ts` currently uses `localStorage` for auth, which is fine for a small token; do not extend that pattern here.

Poll `/delta` every 60s while online during doors, so a refund issued mid-event propagates. Purge the manifest at `expiresAt` — it should never outlive the event.

---

## 6. Offline queue and sync

Every scan appends to an IndexedDB log, whether or not it reached the server.

```ts
type ScanRecord = {
  passId: string;
  eventId: string;
  deviceId: string;      // stable per install, generated once
  scannedAt: string;     // ISO 8601, device clock
  localSeq: number;      // monotonic per device — orders scans within a device
  mode: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  result: 'ADMITTED' | 'DUPLICATE' | 'REVOKED' | 'INVALID' | 'WRONG_EVENT';
  synced: boolean;
};
```

On reconnect, flush in batches:

```
POST /gate/scans/sync   → { accepted: [...], conflicts: [{ passId, winningDeviceId, scannedAt }] }
```

The endpoint is idempotent — unique on `(passId, deviceId, scannedAt)` — so a batch that times out mid-flight can be resent wholesale. Only clear `synced: false` on a `2xx` that names the record in `accepted`.

**Conflicts are not errors.** A conflict means another device admitted that pass first. Surface them in a post-event review list for the organiser; never show them at the door, where they would be noise the staff cannot act on.

`localSeq` matters because device clocks drift: if two scans on the same device share a timestamp, sequence disambiguates them.

---

## 7. Implementation order

Steps 1–3 are independent of all backend work and deliver value immediately.

1. **Camera capture** — `getUserMedia` + `BarcodeDetector`, with a `jsQR` fallback for Safari. Keep the manual paste box permanently; it is the fallback when a camera fails or a screen is unreadable.
2. **PWA shell** — manifest, service worker, installability. Required for a device to work at a door at all, and prerequisite for anything offline.
3. **IndexedDB scan log** — log every scan locally, sync opportunistically. Useful immediately: it makes check-ins survive a page refresh, which today they do not.
4. **v2 payload parsing** — extend `parsePassQrPayload`, keep v1 working. Needs the backend to issue signatures first.
5. **Manifest download + local L1/L2 verification** — the actual offline mode.
6. **Conflict review UI** — organiser-facing, post-event.

---

## 8. Open questions

- **Device identity.** `deviceId` needs to be stable across reinstalls to make conflict attribution meaningful. Generated UUID in IndexedDB is simplest but resets on clear-site-data. Organiser-assigned device names may be better operationally — staff can say "gate 3 tablet".
- **Camera permission at the door.** iOS Safari requires a user gesture per session. Worth prompting during setup and keeping the modal mounted rather than re-requesting per scan.
- **Manifest over cellular.** 14 MB is fine over venue Wi-Fi during setup, painful on a phone tethering at the door. Should the client refuse to download over a metered connection, or just warn?
- **Who owns the device→event binding?** A scanner should not be able to switch events mid-shift without re-authenticating, or a leaked manifest becomes reusable.
