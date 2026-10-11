# Frontend memory

AI: read this at the start of every task. Update it at the end of every task. Keep it short — replace stale lines instead of appending forever.

## Current status

- Contract used: v2.0
- Last updated: 2026-10-11 — scaffold complete; `npm run lint` + `npm run build` pass
- Mock mode: available (`VITE_USE_MOCKS=true` in `.env.local`) for health, meta, questions, compliance check, encoded rules

## Screens / components

| Piece | Status | Notes |
|---|---|---|
| Vite proxy, title | ✅ done | |
| api/types.ts, client.ts (all endpoints), errors.ts | ✅ done | |
| api/mocks.ts | 🟡 partial | add mocks per screen |
| Header: nav, VersionBadge, health, EN/हिंदी, MOCK banner | ✅ done | |
| StatusBadge, EvidenceCard, AmendmentAlert, Disclaimer, Loader, ErrorBox | ✅ done | |
| Ask the rules (F1, F2, F6, F7) | ⬜ placeholder | |
| Citizen explanation card (F13) | ⬜ | print slip on Ask |
| Cases list / new case / quick check | ⬜ placeholder | |
| Case review — inputs form (F5) | ⬜ | |
| Case review — SVG plan (F9) | ⬜ | |
| Case review — findings, detail, next actions (F4, F10), reviewer notes | ⬜ | |
| Report + print (F8, F12) | ⬜ placeholder | print CSS ready |
| Rule Lab list (F3) | ✅ done | real API |
| Rule detail + verify panel + tests (F3, F11) | ⬜ placeholder | |
| Benchmark + lookup timing | ⬜ placeholder | |

## Done

- Scaffold: routing, i18n, API layer, shared components, Rule Lab list, print CSS

## Next steps

1. Ask screen (with mocks until backend questions/search are ready)
2. Cases list + Case review (form → check → findings) — use mocks for compliance
3. SVG Plan Inspector
4. Report + print, citizen card
5. Rule detail / verification / tests
6. Benchmark

## Known issues

- `src/App.css` is an unused Vite leftover (not imported). Left untouched.

## Requests for backend

- (none)
