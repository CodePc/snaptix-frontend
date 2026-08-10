# SnapTix frontend

React 19 · Vite · Tailwind · Express `server.ts` · `:5173` · API `VITE_API_BASE_URL=http://127.0.0.1:8081/api/v1`.

## Token budget
- One screen/API-client vertical per chat. Prefer `StrReplace` over rewriting whole views.
- Validate with `npx tsc --noEmit` — no frontend test runner yet.
- Do not load backend Java sources unless wiring a new DTO/endpoint.

## Context (on demand)
- Parent: `../CONTEXT_CACHE.md`
- Skill: **snaptix-phase**
- Tracker: `docs/COMPLETENESS_TRACKER.md`

## Key paths
`src/App.tsx` · `src/services/snaptixApi.ts` · `src/services/mappers.ts` · `src/components/Organiser/*` · `src/components/Auth/*`
