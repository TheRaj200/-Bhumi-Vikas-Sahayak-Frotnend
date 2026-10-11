# frontend/AGENTS.md — rules for the AI working on the frontend

First read the root `AGENTS.md`, then `docs/API_CONTRACT.md`, `docs/DOMAIN_RULES.md`, `docs/DECISIONS.md` and `frontend/MEMORY.md`.

**You may edit only `frontend/**`.** Never touch `backend/`, `docs/` (unless the user asks) or the source data folder.

## Who uses this screen

A BMC building-permission clerk at a counter PC (often 1366×768, sometimes old Chrome), with a citizen standing in front. They need the answer **in under a minute**, with the rule number to show the citizen. Many clerks are more comfortable in Hindi.

Design for: big readable text, few clicks, keyboard-first, works without training.

## Stack (already set up — do not change)

- React 19, Vite, TypeScript (strict), Tailwind CSS v4 via `@tailwindcss/vite`.
- Tailwind v4: there is **no** `tailwind.config.js`. Theme tokens go in `src/index.css` with `@theme`.
- Do **not** add: UI kits (MUI, Chakra, AntD…), Redux/Zustand, React Query, routers, CSS-in-JS — unless the user asks. Plain React state + `fetch` is enough.
- Allowed small additions if needed (ask first anyway): an icon set like `lucide-react`.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | dev server on 5173 |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | eslint |

**Before saying a task is done, run `npm run lint` and `npm run build`.** Both must pass.

## Vite proxy (add once to `vite.config.ts`, change nothing else there)

```ts
server: {
  proxy: {
    '/api': 'http://localhost:8000',
    '/pdf': 'http://localhost:8000',
  },
},
```

## Folder structure

```
frontend/src/
  main.tsx  App.tsx  index.css
  api/
    types.ts       TS types = docs/API_CONTRACT.md (keep identical)
    client.ts      ONLY place that calls fetch: ask(), calculate(), getRules(), getRule(), getEvalLatest(), getHealth()
    mocks.ts       mock responses matching the contract (used when VITE_USE_MOCKS=true)
  features/
    ask/           question box + answer card
    calculator/    plot form + results table ("Counter mode")
    scoreboard/    accuracy on the 17 sample questions
  components/      shared pieces: CitationCard, VersionBadge, AmendmentAlert, Disclaimer, LangToggle, Loader, ErrorBox
  i18n/
    strings.ts     all UI text in { en, hi }
  lib/             small helpers (formatting numbers, INR, etc.)
```

Keep this structure. New files go in the matching folder.

## API rules

- **All network calls go through `src/api/client.ts`.** Components never call `fetch` directly.
- Only relative URLs: `/api/...`, `/pdf/...`. Never `http://localhost:8000` in components.
- **Never call any LLM API from the frontend. Never put any key in the frontend** (`VITE_*` vars are public).
- Types in `src/api/types.ts` must match the contract exactly. If the backend sends something different, do not "adapt" silently — write it in `MEMORY.md` → "Requests for backend" and tell the user.
- Error shape is `{ error: { code, message } }`. Show `message` in a friendly ErrorBox. For `LLM_UNAVAILABLE` show: "AI service is down — use rule search below" (and Hindi).
- Mock mode: if `import.meta.env.VITE_USE_MOCKS === 'true'`, `client.ts` returns data from `mocks.ts`. Mocks must follow the contract exactly. Use this while the backend is not ready.

## Display rules (accuracy — the jury checks these)

1. **Never show an answer without its citations.** Each citation shows: rule number, title, pages, the quote, and a link "Open PDF page" → `citation.pdf_url` (new tab).
2. Show a ✓ "verified quote" mark only when `quote_verified === true`.
3. `status: "not_found"` → a clear, neutral box with the not_found text. Not styled as an error.
4. **Always show the VersionBadge**: "Rules consolidated to 6 Mar 2025" / "6 मार्च 2025 तक संशोधित नियम".
5. **Amendment warnings** (`version.amendment_warnings`) → prominent red/amber alert with message in current language + source link.
6. **Always show the disclaimer** from the response.
7. **Do not compute or change numbers.** Show `value` + `unit` exactly as the backend sends (only format: e.g. `₹1,20,000`, `3.0 m`). Do not round differently, do not calculate totals.
8. Calculator results: `status: "manual_check"` → show "Manual check needed" + note, never a blank or `0`. `not_applicable` → "Not applicable".
9. Render calculator rows **generically** from `results[]` (use `label_en`/`label_hi`), so new backend keys appear without frontend changes.
10. Never hard-code rule numbers, fees or setbacks in the UI.

## Language rules

- All UI text lives in `src/i18n/strings.ts` as `{ en: "...", hi: "..." }`. No hard-coded English in components.
- A language toggle (EN | हिंदी) in the header controls UI text. The **answer** language comes from the backend (`lang` in the response).
- Use the Hindi glossary in `docs/DOMAIN_RULES.md` for UI labels.
- Font: include a Devanagari-friendly stack, e.g. `"Noto Sans Devanagari", "Noto Sans", system-ui, sans-serif`. Test that Hindi does not break layout.

## UX rules

- Question box autofocus. `Enter` submits, `Shift+Enter` new line.
- Show example questions as clickable chips (from `sample_questions.md`) — fills the box, does not auto-submit.
- Loading state on every request (button disabled + spinner). LLM answers can take several seconds.
- Base font ≥ 16px, answer text ≥ 18px. Good contrast. Visible focus rings. Buttons with text labels, not icon-only.
- Must look fine at 1366×768 and on a phone width.
- **Print**: an answer/calculator result can be printed as a one-page slip (`@media print`: hide nav/inputs, show answer, citations, version, disclaimer, date).
- No login, no tracking, no analytics, no storing questions in localStorage (no personal data).

## Code style

- Function components + hooks. Props typed with `interface`.
- Small components (< ~150 lines). Extract when bigger.
- No `any`. No `// @ts-ignore` without a reason.
- Tailwind classes in JSX; no separate CSS files except `index.css` (theme + print styles).
- Comments only where the logic is not obvious. No dead code.

## When you finish a task

Update `frontend/MEMORY.md` (status, what changed, next steps, known issues, requests for backend).
