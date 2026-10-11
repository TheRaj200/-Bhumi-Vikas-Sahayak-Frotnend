# frontend/AGENTS.md — rules for the AI working on the frontend

First read the root `AGENTS.md`, then `frontend/MEMORY.md`, then `docs/API_CONTRACT.md` (always), `docs/PRD.md` §7–§10, `docs/DOMAIN_RULES.md` (glossary, statuses), `docs/DECISIONS.md`, `docs/FEATURE_MAP.md`.

**You may edit only `frontend/**`.** Never touch `backend/`, `docs/` (unless the user asks) or the source data folder.

## Users and screens

Users: BMC counter clerk (citizen standing in front, needs an answer in under a minute, often prefers Hindi), plan reviewer, architect/applicant, rule verifier (non-technical). Counter PCs are often 1366×768.

| Route | Screen | Features | File |
|---|---|---|---|
| `#/ask` | Ask the rules | F1, F2, F6, F7, F13 | `features/ask/AskPage.tsx` |
| `#/cases` | Case list / new case | journey step 1 | `features/cases/CasesPage.tsx` |
| `#/cases/:id` | Case review = **Visual Plan Inspector** | F4, F5, F9, F10 | `features/cases/CaseReviewPage.tsx` |
| `#/cases/:id/report` | Review report + print | F8, F12 | `features/report/ReportPage.tsx` |
| `#/rule-lab` | Encoded rules list | F3, F11 | `features/rulelab/RuleLabPage.tsx` ✅ |
| `#/rule-lab/:ruleId` | Rule detail, tests, verify | F3, F11 | `features/rulelab/RuleDetailPage.tsx` |
| `#/benchmark` | 17-question eval + lookup timing | success measures | `features/benchmark/BenchmarkPage.tsx` |

Each placeholder page has a comment block with exactly what to build. Replace the `<ComingSoon />` with the real screen.

## Stack (decided — do not change)

- React 19, Vite, TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`; theme in `src/index.css` with `@theme`, no tailwind.config.js).
- Routing: tiny hash router in `src/lib/router.ts` (`useHashRoute`, `hrefFor`, `navigate`). Do **not** add react-router.
- Data loading: `src/lib/useApi.ts` + plain `useState`. Do **not** add React Query, Redux, Zustand, UI kits, CSS-in-JS.
- Plan view: hand-written **SVG** component. Do not add canvas/diagram libraries without asking.
- Allowed only after asking the user: an icon set (e.g. `lucide-react`).

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server on 5173 (proxy `/api`, `/pdf` → 8000) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | eslint |

**Before saying a task is done, run `npm run lint` and `npm run build`. Both must pass.**

## Folder structure (keep it)

```
frontend/src/
  main.tsx  App.tsx  index.css
  api/
    types.ts       = docs/API_CONTRACT.md v2.0 (keep identical)
    client.ts      ONLY place that calls fetch — one function per endpoint (all exist already)
    errors.ts      ApiClientError (code, status, message, details)
    mocks.ts       contract-shaped mocks (VITE_USE_MOCKS=true); add mocks as you build screens
  i18n/
    strings.ts     ALL UI text { en, hi }
    LangContext.ts useLang() → { lang, setLang, t(key), pick(en, hi) }
    LangProvider.tsx
  lib/             router.ts, useApi.ts, format.ts (formatting only)
  components/      AppHeader, StatusBadge, EvidenceCard, VersionInfoBlock (VersionBadge, AmendmentAlert, Disclaimer),
                   Feedback (Loader, ErrorBox, ComingSoon)
  features/
    ask/  cases/  report/  rulelab/  benchmark/
```

New components: feature-specific → that feature folder; shared → `components/`.

## What is already done (do not rewrite — extend)

- Vite proxy, page title, contract types, API client (all 23 endpoints), errors, mocks (health, meta, questions, compliance, encoded rules).
- Header with nav, version badge, server/DB/AI health indicator, EN/हिंदी toggle, MOCK banner.
- StatusBadge (all statuses), EvidenceCard, AmendmentAlert, Disclaimer, Loader, ErrorBox (maps error codes to friendly text), ComingSoon.
- Rule Lab list working against the real API. Print CSS (`.no-print`, `.print-only`, `.evidence-card`).

## API rules

- **All network calls via `src/api/client.ts`.** Components never call `fetch`. Only relative URLs.
- **Never call an LLM from the frontend. Never put a key in the frontend.**
- Types must match the contract. If the backend differs, do not adapt silently — write it under "Requests for backend" in `MEMORY.md` and tell the user.
- Show errors with `<ErrorBox error={...} />`. `NOT_IMPLEMENTED` (501) = backend not built yet — fine during development; use mocks.
- `DB_UNAVAILABLE` on cases → offer "quick check" (inputs in state, `runComplianceCheck` without `application_id`).

## Display rules (accuracy — the jury checks these)

1. **Never show an answer or finding without its evidence.** Use `EvidenceCard` (rule/clause, title, page, exact quote, "Open PDF page" link in new tab).
2. ✓ "Verified quote" only when `quote_verified === true` (EvidenceCard does this).
3. `not_found` → neutral grey box with the backend's text — not an error style.
4. `evidence_only` → amber notice "AI unavailable" + the evidence list.
5. **VersionBadge always visible** (header). **AmendmentAlert** for every response with `version.amendment_warnings`.
6. **Disclaimer** on every answer, case result and report.
7. **Never compute or change numbers.** Show `entered_value`, `required_value`, `difference`, `calculated_value` exactly as sent; only format with `formatValue()` (units, ₹, Indian grouping).
8. `required_value: null` with `manual_review` → show "Manual review required" + `manual_reasons` + notes, never `0` or blank.
9. Render findings, missing inputs and next actions **generically** from arrays — new rules/checks must appear without frontend changes.
10. **Never hard-code rule numbers, fees, setbacks or FAR values** in the UI.
11. Plan view: highlights labelled "Potential issue", never "Rejected/Illegal". Drawn dimensions must equal the entered inputs (scale from plot width/depth).

## Visual Plan Inspector (PRD §10)

- ≥ 1280 px: left inputs | center SVG | right finding detail; bottom panel full width. Smaller: stacked.
- SVG: plot rectangle (width × depth, scaled to fit, keep aspect ratio), road strip on `road_facing_side`, footprint placed using front/left setbacks, dimension labels in metres, overlays from `finding.overlay` (required distance dashed line, entered solid; colour by status). Click overlay or finding → select it.
- Numeric controls only (drag/resize optional, later).

## Language rules

- All UI text in `src/i18n/strings.ts` (`t('key')`). No hard-coded English/Hindi in components (dev-only placeholder comments are fine).
- API bilingual fields → `pick(item.title_en, item.title_hi)`. Answer language comes from the backend (`lang`).
- Use the glossary in `docs/DOMAIN_RULES.md`. Devanagari font stack is in `index.css`.

## UX rules

- Ask box autofocus; `Enter` submits, `Shift+Enter` newline; sample question chips fill the box (do not auto-submit).
- Loading state on every request (button disabled + Loader). LLM answers can take several seconds.
- Base font ≥ 16 px, answer text ≥ 18 px, visible focus rings, text labels on buttons.
- Works at 1366×768 and phone width.
- Print: answer slip (F13) and report (F12) via `window.print()`; hide nav/inputs with `.no-print`.
- No login, tracking, analytics, or storing questions in localStorage.

## Code style

- Function components + hooks; props typed with `interface`. Components < ~150 lines — split when bigger.
- No `any`, no `@ts-ignore`. Tailwind classes in JSX; only `index.css` for theme/print.
- Files exporting components export only components (react-refresh lint). Hooks/contexts in `.ts` files.
- Comments only where logic is not obvious. No dead code.

## When you finish a task

Update `frontend/MEMORY.md` (status table, done, next steps, known issues, requests for backend).
