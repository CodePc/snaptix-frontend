# SnapTix Frontend — Completeness Tracker

Companion doc: [`snaptix-backend/docs/COMPLETENESS_TRACKER.md`](../../snaptix-backend/docs/COMPLETENESS_TRACKER.md)

Source plan: SnapTix Phase 1 — Real Core Ticketing Flow (attendee: login → explore → book → checkout → QR → verify; organiser: create event → approval queue → publish → manage event → analytics).

## Phase 0 — Hygiene
- [x] Backend concurrency/security WIP committed (see backend tracker) — no frontend change needed for this item.
- [x] Confirm `.env` `VITE_API_BASE_URL=http://127.0.0.1:8081/api/v1` lines up with backend `server.port: 8081` + `context-path: /api/v1`, and default dev port 5173 (`server.ts`) is in the backend's CORS allow-list. No changes needed.
- [x] Create this tracker doc (and the backend counterpart).

## Phase 1 — In progress

### Attendee flow
- [x] **Google login (real)** — `AuthPortalView.tsx` `handleGoogleLogin` now calls `requestGoogleIdToken()` (`services/googleIdentity.ts`, real GIS `initialize`/`prompt`) when `VITE_GOOGLE_CLIENT_ID` is set; falls back to the local `mock|sub|email|name` idToken otherwise.
- [x] **Facebook login (real)** — `AuthPortalView.tsx` `handleFacebookLogin` now calls `requestFacebookAccessToken()` (`services/facebookSdk.ts`, real `FB.login` with `public_profile,email` scope) when `VITE_FACEBOOK_APP_ID` is set; falls back to a local mock access token otherwise. `facebookAuthApi` updated to send only `{accessToken, role}` (backend derives identity from Graph API, not client-supplied email/name).
- [x] **Remove Apple login** — deleted `handleAppleLogin` + Apple button block in `AuthPortalView.tsx`; collapsed Fast Sign-In grid to 3 columns (Google / Facebook / Phone). (Note: unrelated "Apple Pay" checkout payment-method UI in `CheckoutModal.tsx`/`ProfileView.tsx` is untouched — that's a payment method, not Sign in with Apple.)
- [x] **Checkout price integrity** — `CheckoutModal.tsx`: removed fake `SNAP10`/`SAVE20` promo-code UI/state, removed the fake per-ticket service fee, and removed the line overwriting backend `totalPrice`. Displayed total is now `tier.price × quantity` and `onSuccess` passes the backend `Ticket` straight through. Promo codes → backlog.
- [x] **QR generation + verification** — `QRCheckInScannerModal.tsx` now resolves manual/typed codes against the real roster (`activeEvent.attendees`, populated from `GET /events/{id}/attendees`) and calls the awaited `onCheckIn` (real `POST .../check-in`); the old "legacy mock roster fallback" / fake "Simulate Scan Next" path is gone — the button is now "Check In Next Pending Attendee" and only ever acts on real passIds.

### Organiser flow
- [x] **Create event with real date** — `OrganiserEventWizardModal.tsx` Step 2 now uses real `<input type="date">` + `<input type="time">` (start/end show time, doors-open), derives a `LocalDateTime`-formatted `eventDateIso` plus the display strings from those inputs. `mappers.ts` `organiserEventToCreatePayload` sends `event.eventDateIso` (falling back to "+14 days" only if genuinely missing). `EventItem`/`OrganiserEventData` gained an `eventDateIso` field populated straight from the backend's `eventDate` on every fetch, so editing an existing event re-parses the real date/time instead of guessing from display strings.
- [x] **Approval queue enforcement** — no frontend change required; existing UI already gates the Approve/Reject buttons to `currentPersona === 'admin'` and now the backend enforces the same rule server-side (backend item).
- [x] **Attendee roster + manual check-in** — added `fetchEventAttendees` / `manualCheckInApi` to `snaptixApi.ts` (+ `mapAttendeeResponse` in `mappers.ts`); `App.tsx`'s `refreshAttendeesForEvent` populates real `attendees`/`checkedInCount` on `OrganiserEventData`, and `handleCheckInAttendee` is now async and calls the real manual check-in endpoint, surfacing backend validation errors (already-checked-in, wrong event, etc.) back to both the roster "Check In" button and the scanner modal.
- [x] **Tier capacity edit** — added `updateTierCapacityApi` to `snaptixApi.ts`; `App.tsx`'s `handleUpdateTierCapacity` now translates the roster's "available slots" edit into a real total-capacity `PUT`, and `OrganiserEventsView.tsx`'s capacity input commits on blur/Enter (not per-keystroke) to avoid spamming the API. Also fixed `mapBackendEventToOrganiserEvent`'s `grossSales` to sum `price × ticketsSold` per tier instead of `ticketsSold × cheapest-tier-price`.
- [x] **Real analytics** — `OrganiserAnalyticsView.tsx` now fetches `GET /analytics/organiser?range=...` (via `fetchOrganiserAnalyticsApi`) on mount and on 7d/30d/all range changes, and renders: real total gross revenue, avg order value, capacity-sold %, resale royalties, and a gate check-in rate strip, plus a real daily-revenue area chart and a real tickets-by-tier donut + revenue-by-tier bar chart (the fake "Channel Sales Attribution" chart was removed — there's no real channel-attribution data to back it, see backlog).

## Testing (phase 1 exit bar)
- [x] No test runner exists yet for the frontend; automated frontend tests remain backlog, not phase-1-blocking. All new/changed backend endpoints are covered by unit + integration tests (see backend tracker); the frontend was validated via `tsc --noEmit` (no type errors) plus the manual checklist below.
- [ ] Manual E2E checklist (run through before calling phase 1 done):
  - [ ] Login via email/password
  - [ ] Login via Google (real GIS token)
  - [ ] Login via Facebook (real FB SDK token)
  - [ ] Login via phone OTP
  - [ ] Explore events → view event details → select tier → checkout → totals match backend exactly (no phantom discount)
  - [ ] View ticket with live-rotating QR code
  - [ ] Organiser: create event with real date/time pickers → appears in approval queue with the chosen date/time displayed correctly
  - [ ] Organiser (moderator persona): cannot publish/reject own event
  - [ ] Organiser (admin persona): approves/publishes event
  - [ ] Organiser: scans a real attendee's QR at the gate → check-in succeeds, second scan rejected
  - [ ] Organiser: manual check-in from attendee roster (no QR) works, and re-checking in the same attendee shows an "already checked in" error
  - [ ] Organiser: edits tier's available count in Manage Event → tab away/press Enter to commit → cannot set below tickets already sold (shows API error)
  - [ ] Organiser: analytics view shows real sales/check-in numbers matching actual test orders, and updates when switching between 7d/30d/all

## Backlog / Phase 2+ (not built this round)
- Real payment processing (today `paymentStatus` is hardcoded `COMPLETED`); financials/payouts ledger
- Promo codes at checkout (removed as fake in phase 1)
- Analytics: conversion funnel, repeat-attendee %, multi-channel attribution (needs event/session tracking)
- Social/omni publishing + inbound comment tracking (needs real platform API integrations)
- Attendee↔organiser chat (needs a real-time transport)
- Organiser settings / team RBAC (today `persona` is a single-user client toggle, not a real multi-user roles model)
- Camera-based / offline QR scanning (spec already exists in `docs/SCANNER_CLIENT_SPEC.md`)
- Automated frontend test suite
- Already complete, untouched this phase: phone OTP login, resale marketplace, email campaigns (Mailpit)
