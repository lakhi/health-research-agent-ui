# Plan — SSC-Psych Agent UI

**Issue:** [health-research-agent-ui#11](https://github.com/lakhi/health-research-agent-ui/issues/11)
**Backend driver:** [health-research-agent-api#19](https://github.com/lakhi/health-research-agent-api/issues/19)
**Backend citation contract:** `api-apps/health-research-agent-api/future-feat/ssc-psych-inline-citation-excerpts.md`

## Context

The SSC Psychology agent (backed by a separate FastAPI service) needs a public-facing chat UI similar in shape to HeX-GiG: own logo, own splash animation, own theme. Robert Böhm's "quality check" requirement makes this UI non-trivial — every chatbot answer must be visibly **traceable back to its source material** (an SSC page or document), so the standard `[text](url)` markdown link won't be enough on its own. The backend has a locked-in design (linked above) that will emit a top-level `citations` array (and a final `event: citations` SSE frame) carrying a verbatim ~200-char excerpt per cited URL. The UI side of that contract has to land alongside the basic project setup to satisfy the quality-check requirement at launch.

Most of the per-project scaffolding (config entry, deploy workflow, bicepparam file, default CSS palette) is already in `main`; the gaps are: theming the project to match U.Vienna brand blue, placeholder logo + config-driven splash, icon registration, and the citation-rendering pipeline.

## Approach

### A. Project chrome (logo, splash, theme, icon)

1. **Theme — U.Vienna brand blue.** In `src/config/projects.tsx`, overwrite the currently-scaffolded orange/dark palette under `'ssc-psych-chatbot'` with a U.Vienna deep-blue light palette (distinct from hex-gig's lighter blue; the official UV blue is `#0063A6`). Keep the same `ProjectTheme` shape; reuse hex-gig's neutrals (`#1E293B`, `#334155`, `#64748B`, `#F8FAFC`, `#FFFFFF`) as a starting point.
2. **`globals.css` — split off SSC palette.** Today the root `:root` block carries the scaffolded orange/dark vars labelled as ssc-psych. Move those into a `[data-project='ssc-psych-chatbot']` block (replacing values with the new UV-blue palette), and restore a neutral default at `:root` (the same vars hex-gig uses are safe — they're overridden per project anyway). Mirror hex-gig's component-override pattern (ChatInput textarea, send button colours).
3. **Placeholder logo.** Add `public/ssc-psych-logo.svg` (or `.png`) — a simple 64×64 monogram-style placeholder ("SSC ψ" on a UV-blue circle) so the real asset can be dropped in later without code change. Document in the PR description that this is a placeholder.
4. **Icon registration.**
   - `src/components/ui/icon/types.ts`: add `'ssc-psych'` to the `IconType` union.
   - `src/components/ui/icon/custom-icons.tsx`: add `SscPsychIcon` mirroring `HexIcon` (line 960) — `<Image src="/ssc-psych-logo.svg" …>` rounded-full.
   - `src/components/ui/icon/constants.tsx`: register `'ssc-psych': SscPsychIcon` in the ICONS map.
   - Set `icon: 'ssc-psych'` on the ssc-psych project config.
5. **Splash refactor — config-driven.** This is the only non-trivial refactor; it touches code currently hardcoded for hex-gig.
   - Extend `ProjectConfig` in `src/config/projects.tsx` with an optional `splash?: { logo: string; displayName: string; bg: string; fg: string }` field. Populate for `hex-gig` (current values) and `ssc-psych-chatbot` (new).
   - `src/components/SplashScreen.tsx`: read `getProjectConfig().splash`; return `null` if absent. Replace the hardcoded `/hex-gig-logo.png`, `HeX-GiG`, `bg-[#F8FAFC]`, `text-[#1E293B]` with `splash.{logo,displayName,bg,fg}` (inline `style` since Tailwind can't evaluate runtime strings). Keep the framer-motion animation as-is.
   - `src/app/page.tsx`: replace `const isHexGig = … === 'hex-gig'` with `const hasSplash = !!getProjectConfig().splash`. Gate `useState(isHexGig)` and the `useEffect` on `hasSplash` (rename the variable). This keeps the 1200 ms duration shared; if per-project tuning becomes useful, the `splash` config can grow a `durationMs` field later — not now.
6. **Project config copy.** Update `name`, `description`, `metadata.title`, `metadata.description` on the ssc-psych config to a public-facing English string. Keep the description plain text (no React element) for now since there are no canonical external links yet (Robert/Britta haven't committed to a specific landing page).

### B. Citation rendering (the quality-check feature)

The backend will deliver (per `future-feat/ssc-psych-inline-citation-excerpts.md`, implemented in api-apps commit `d1d3db5` referencing issue #37):

- A top-level `citations: Citation[]` field on the JSON response (gated to SSC-Psych; field is absent — not just `[]` — for other agents).
- A final `event: Citations` SSE frame on streamed responses (PascalCase, matching Agno's existing wire convention — `RunStarted`, `RunContent`, etc. — so the FE `RunEvent` enum stays internally consistent with `Citations = 'Citations'`).
- `Citation = { source_url, title, source_type, language, excerpt, score }`.
- The array is already deduplicated by `source_url` (first-seen wins, which matches highest-scoring because Agno returns chunks in relevance order). The FE doesn't need to dedup again.
- `score` is **rank-derived** (`1.0 - rank/total`), not the raw retrieval score — Agno's `Document.to_dict()` doesn't surface the retrieval/reranking score, so the BE approximates from list position. Top-ranked citation = `1.0`; scores decrease. Don't use this for thresholding; ordering is the only reliable signal.
- Empty case: when the SSC agent retrieves no chunks (refusal, out-of-scope), the JSON payload still carries `citations: []` and the stream still emits a terminal `event: Citations` frame with `{"citations": []}` — so the FE handler doesn't need to special-case a missing event.

UI work:

1. **Types** — `src/types/os.ts`:
   - Add `Citation` interface.
   - Add `citations?: Citation[]` to `ChatMessage` (line ~197).
   - Add `citations?: Citation[]` to `RunResponse` (so the streaming chunk type carries it).
   - Add a `Citations` value to the `RunEvent` enum to match the backend's `event: citations` SSE name.
2. **Stream handler** — `src/hooks/useAIStreamHandler.tsx`:
   - In the `onChunk` switch (around line 221+), add a branch for `chunk.event === RunEvent.Citations` that updates the current agent message's `citations` field on the store (mirroring the existing `references` merge at line 294-297 and 431-433).
   - In `RunCompleted` (line 397+), ensure `citations` is preserved on the final merged message (same pattern as `references`).
3. **Non-streaming path** — wherever the non-streaming JSON response is consumed (same hook or its caller), pass through `citations` onto the assistant message. The backend says the field is always present (possibly empty) so no defaulting hacks needed.
4. **Renderer — inline source chips.** This is the visible piece.
   - Extend `src/components/ui/typography/MarkdownRenderer.tsx` (the existing renderer used in `MessageItem.tsx:32,54`) to accept an optional `citations?: Citation[]` prop.
   - When `citations` is non-empty, pass a custom `components.a` to react-markdown that:
     - Renders the link as usual (text + href).
     - Tracks seen URLs across the render (a `Set` declared in the renderer closure or a `useRef`).
     - On the **first occurrence** of a `href` that matches a citation's `source_url`, append an inline source-chip block after the link: a small rounded chip showing `↳ <excerpt>` with title + language badge, styled as muted-italic. Subsequent same-URL occurrences render as bare links.
   - **Styling — source chip:** Tailwind utilities only (consistent with rest of repo). Approximate: `mt-1 ml-4 inline-flex max-w-prose items-start gap-2 rounded-md border-l-2 border-accent/40 bg-background-secondary/60 px-3 py-2 text-sm italic text-muted` + a tiny language pill (`de`/`en`) using `bg-accent/10 text-accent text-xs font-medium`. Cap visible height (~2 lines, `line-clamp-2`); excerpt is already trimmed backend-side to ~200 chars.
   - **Placement nuance:** the backend plan says "below the link's _containing paragraph_". `react-markdown`'s `components.a` only gives the `<a>` element. Initial implementation places the chip immediately after the link inline (acceptable for short paragraphs and matches the "chip" mental model the user picked); document this deviation in the PR. If reviewers want strict paragraph-level placement, swap to a `components.p` override later.
   - `MessageItem.tsx`: pass `message.citations` through to `<MarkdownRenderer>` in both call sites (lines 32 and 54).
5. **Empty / opt-out behaviour:** if `citations` is missing or empty (e.g. hex-gig / vax messages, or an SSC refusal), the renderer skips the chip pass entirely and behaves exactly as today. This satisfies the backend plan's "UI rendering opt-in per project" — no per-project branch needed; the data presence is the signal.

### C. Deploy / infra

The existing scaffolding (workflow file, bicepparam) is already in `main`. Two follow-up actions out of code scope:

- Set `apiEndpoint` on the ssc-psych project config in `projects.tsx` once the backend Container App is deployed and its URL is known (the issue #19 work is still WIP, so this may stay `''` for the first UI PR — local dev uses `NEXT_PUBLIC_API_ENDPOINT` override anyway).
- Configure GitHub secrets (`SSC_PSYCH_CHATBOT_*`) and finalize `infrastructure/ssc-psych-chatbot.bicepparam` placeholders. **Not part of this UI PR** unless backend goes live in parallel.

## Critical files

**Edited:**

- `src/config/projects.tsx` — palette, splash field, copy, icon.
- `src/app/globals.css` — move ssc-psych vars into `[data-project='ssc-psych-chatbot']` block; restore neutral `:root` defaults; add component overrides.
- `src/app/page.tsx` — generalize `isHexGig` → `hasSplash`.
- `src/components/SplashScreen.tsx` — read from `projectConfig.splash`.
- `src/components/ui/icon/types.ts`, `constants.tsx`, `custom-icons.tsx` — register `ssc-psych` icon.
- `src/types/os.ts` — `Citation` type; `ChatMessage.citations`, `RunResponse.citations`, `RunEvent.Citations`.
- `src/hooks/useAIStreamHandler.tsx` — handle `Citations` event; preserve through `RunCompleted`.
- `src/components/ui/typography/MarkdownRenderer.tsx` — `components.a` override + source-chip rendering.
- `src/components/chat/ChatArea/Messages/MessageItem.tsx` — thread `message.citations` into the renderer.

**Created:**

- `public/ssc-psych-logo.svg` — placeholder 64×64 monogram.

**Existing & reused (no edit):**

- `src/config/endpoints.ts` — already resolves `apiEndpoint` from config or env override.
- `.github/workflows/deploy-ssc-psych-chatbot.yml`, `infrastructure/ssc-psych-chatbot.bicepparam` — already scaffolded.
- Sidebar + ChatBlankState — already read `name`, `description`, `icon` from config; nothing to change.

## Verification

1. **Build switching works.** `NEXT_PUBLIC_PROJECT_ID=ssc-psych-chatbot pnpm dev` → page renders with UV-blue theme, placeholder logo splash for ~1.2 s, then chat. `NEXT_PUBLIC_PROJECT_ID=hex-gig pnpm dev` → unchanged from current `main` (regression check on the splash refactor). `NEXT_PUBLIC_PROJECT_ID=vax-study-chatbot pnpm dev` → no splash, current behaviour.
2. **Theme isolation.** Confirm in DevTools that `<body data-project='ssc-psych-chatbot'>` is set and the `[data-project='ssc-psych-chatbot']` CSS block in `globals.css` is what's winning (not the `:root` defaults).
3. **Citation rendering (manual, before backend lands).** Add a temporary local stub in `MessageItem.tsx` (or a Storybook-free scratch route) that hands the renderer a synthetic message with `content` containing `[Bachelor Psychologie](https://ssc-psychologie.univie.ac.at/studium/bachelor/)` and a matching `citations` entry with a known excerpt; verify the chip renders once for first occurrence and not for subsequent ones. Remove the stub before commit.
4. **Citation rendering (end-to-end, once backend PR lands).** Point `NEXT_PUBLIC_API_ENDPOINT` at the local backend, ask the SSC agent a representative question (`"Wie bewerbe ich mich für den Bachelor Psychologie?"`), and confirm: (a) markdown answer streams normally; (b) a source chip appears under the first occurrence of each cited link after the stream finishes; (c) language badge shows `de`/`en`; (d) repeated URLs in the same answer get a chip only on the first occurrence.
5. **Refusal/empty path.** Ask an out-of-scope question; confirm the answer renders with no chips and no console errors (i.e. `citations: []` path works).
6. **Backwards compat for hex-gig / vax.** Send a hex-gig request; confirm `message.citations` is `undefined` and the renderer behaves identically to today (no chip, no extra spacing).
7. **`pnpm validate`** — lint + format check + typecheck must pass. (Note `pnpm validate` is the only mandatory correctness gate; no test framework is configured.)
