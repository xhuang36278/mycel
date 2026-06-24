# Mycel — Build & Fix Prompt (Phase 1: personal use → Phase 2: deploy & users)

## What Mycel is (context for whoever builds this)
Mycel is a learning companion for agricultural science students. Its single identity is
**cross-unit connection** — helping a student *feel* how knowledge across different units
connects, like a mycelium network linking separate trees. Logo: a tree growing from an open book.
Stack: a single-file React app (Create React App + Babel), warm cream/soil palette, Fraunces
(display serif), Inter (body), DM Mono (labels). It runs locally via `npm start`; AI calls go
through a Vercel serverless proxy at `/api/chat` that holds the Anthropic key server-side.

## The guiding rule for this whole prompt
**Phase 1 = make it good enough that I (the founder) use it daily.** Not perfect — usable.
Every Phase-1 item must serve that one goal. **Phase 2 = deploy publicly and find real users.**
Do Phase 1 completely before starting Phase 2. Do not add new features that do not move Mycel
toward "I use this every day."

---

## PHASE 1 — Get Mycel to personal-use baseline

### 1A. Make AI actually work (the blocking issue — do first)
- AI currently fails on localhost ("Failed to fetch") because the proxy only runs on Vercel.
- FIX: deploy to Vercel with the `/api/chat` proxy and the `ANTHROPIC_API_KEY` env var set,
  so every AI feature (Learn chat, Voice Quiz, Connection MCQ, Daily focus, Quick Capture) runs.
- Until this works, the founder is "coding blind" — cannot see if features actually function.
- Add a clear, friendly error state everywhere AI is called: if the proxy/key is missing, show
  "AI is not connected yet — features that need AI are paused" instead of a raw runtime error.

### 1B. Verify every function actually works, then fix what is broken
Once AI runs, test each feature end-to-end and fix bugs found. Known/likely problem areas:
- **Learn chat** — streaming response, cross-unit detection inline moment, Note This / Note Session.
- **Voice Quiz** — voice input (Web Speech API) + text fallback, per-question eval, report.
- **Connection MCQ** — question generation, answer reveal, report (priority order + how-to-study).
- **Daily companion** — "Show me where to focus", connection hero card, reads notes/graph/last gap.
- **Quick Capture** — paste content, AI summary + connections + save to notes.
- **Knowledge Network** — nodes from graph, cross-unit gold edges, tap-to-explore.
- **Library** — PDF/text upload, highlight → Ask Mycel / Save reflection.
- **Projects** — group notes by topic.
- Confirm data persists correctly (notes, docs, graph, projects) across reloads.

### 1C. Fix the Library / PDF experience (founder flagged as not good enough)
- CURRENT: PDFs are extracted to plain text and shown as text — not a real document view.
- DESIRED: a proper PDF viewer that shows the actual document pages (like opening a PDF in a
  normal viewer), where the user can highlight directly on the page, and highlights + reflections
  are saved and persist like a real library.
- This needs a real PDF renderer (e.g. pdf.js rendering to canvas, or react-pdf) plus an
  annotation layer that stores highlights by position and reloads them.
- If full visual rendering is too heavy for the single-file build, at minimum: keep highlights
  persistent, show page structure, and make saved reflections reload reliably.

### 1D. Polish the parts the founder will actually look at daily
- Daily screen: the cross-unit connection card is the hero — keep it beautiful, with the
  mycelium-thread motif. Time-aware greeting in Fraunces.
- Typography: Fraunces (display) + Inter (body) + DM Mono (labels), clear hierarchy, no three-font
  clash. Title Case for buttons and titles. No visible " -- " in user-facing text (use natural
  punctuation or a middle dot).
- Empty states: every screen, when empty, shows one warm sentence explaining what it is for.
- Both light and dark themes must work.
- Logo: real tree-from-book logo in header, loading screen, chat header (not the old generic icon).

### 1D-bis. The "curiosity flow → big picture" problem (HIGH PRIORITY — this is core identity)
This is the founder's actual learning pattern, and solving it well IS Mycel's reason to exist.

**The pattern (a strength to protect, not fix):** when learning a new topic, the founder follows
curiosity — asking deeper and deeper into specific aspects. This is how they genuinely understand
and stay motivated, at their own pace. Any solution MUST preserve this free, branching, curiosity-led
flow. Do not replace it with a rigid structure that kills the curiosity.

**Problem 1 — losing the big picture as the chat grows.** The deeper they dig, the longer the chat
gets, and it becomes hard to scroll back to earlier explanations to link things into one coherent
big picture / mechanism. This is an information-architecture problem: a linear chat does not match a
branching, deepening way of learning.
- SOLUTION (founder chose the combined approach): free-flowing chat + a map that builds up as you go
  + an end-of-session synthesis button.
  - **Living map:** as the conversation goes, Mycel quietly maintains a visual map of the concept —
    the parent concept at the centre and the branches the student has dug into around it — updating
    as new sub-questions are asked. The student keeps chatting freely; the map assembles itself.
  - **Synthesis button:** at any point, a "Build the big picture" button takes the whole branching
    conversation and produces one coherent explanation of the full mechanism — how the pieces the
    student explored fit together — so they do not have to scroll back and stitch it mentally.
  - Both should feed the existing Knowledge Network (concepts + cross-unit links), so a study
    session's map becomes part of the long-term network.
- Keep it lightweight: the map is an aid, not a chore. It should never interrupt the chat flow.

**Problem 2 — conflicting data between AI sources.** When digging into a confusing mechanism,
different AIs (Gemini vs ChatGPT) give slightly different answers and sometimes muddle the picture
the student is trying to build. The founder wants ALL THREE of these:
  - **One consistent source:** within Mycel, answers stay internally consistent across a session —
    Mycel does not silently contradict its earlier explanation. If new information revises an
    earlier point, it says so explicitly rather than quietly mixing pictures.
  - **Flag genuine scientific disputes + cite sources:** when a mechanism is genuinely contested or
    uncertain in the literature, Mycel says so openly ("this is debated; the two main views are…")
    and points to sources, instead of presenting one guess as settled fact.
  - **Prefer textbooks / peer-reviewed over guessing:** ground explanations in established sources
    (textbook-level consensus, peer-reviewed work) rather than improvising; when unsure, say so.
  - Net effect: Mycel is a trustworthy anchor while the student branches, so deep-diving does not
    fragment their understanding the way switching between chatbots does.

**Why this fits identity:** the whole point of Mycel is helping a student *feel how pieces connect*
into a big picture. This feature is that mission applied to a single deep-dive session — the same
thing the Knowledge Network does across units, done within one topic.

### 1E. Things explicitly NOT in Phase 1 (defer to later or skip)
- Signup / login / real auth — not needed for personal use; belongs to Phase 2.
- PWA / install-to-homescreen / update notifications — Phase 2.
- Pulling scientific papers / evidence-backup feature — good idea, but a NEW feature; only after
  baseline. Note it in a backlog, do not build it in Phase 1.
- Social features (the removed Commons) — stay removed.

---

## PHASE 2 — Deploy publicly and find users (only after Phase 1 is done)

### 2A. Make it a real product people can reach
- Keep the Vercel deploy + `/api/chat` proxy (already the right architecture).
- Add **auth** so each user has their own notes/graph. Start with a real, simple auth
  (e.g. a hosted auth provider) — NOT a fake UI-only login, because real users store real data.
- Move data from local `window.storage` to per-user server storage so it persists across devices.
- Watch API cost: each user's AI calls cost money. Use the cheaper model (Haiku) for most calls;
  reserve the stronger model for reports. Consider a simple per-user rate limit.

### 2B. PWA + update experience (what the founder asked about earlier)
- Add a manifest (icon = Mycel logo, name, theme colour) so it installs on phone and desktop.
- Add a service worker so it loads fast and works partly offline.
- Add an "update available — reload" banner when a new version is deployed.

### 2C. Pilot with 5–10 real Adelaide ag-science students
- This is the single most valuable Phase-2 step. Measure ONE thing: do they open Mycel
  voluntarily before a lab, without being told to?
- Instrument lightweight, privacy-respecting usage signals (which features get used, where people
  drop off). Use what you learn to decide what to build next — let real use, not theory, drive it.

### 2D. New feature candidates (only after pilot signal, prioritised by the cross-unit identity)
- Scientific paper / evidence retrieval: when a student asks something or needs evidence for an
  idea, Mycel surfaces relevant papers/sources. (Needs a backend search integration; respect
  copyright — link and summarise, do not reproduce.)
- Smallholder-farmer education (LONG-TERM, deferred): a possible future adaptation that connects
  Mycel to Symbia's users. NOT a near-term build — farmers are a fundamentally different audience
  (different language, literacy, devices, motivation) and would need a near-complete redesign; and
  the founder must first listen to real farmers via Symbia before designing anything for them.
  Design principle to keep NOW so it stays adaptable later: Mycel's first-principles teaching
  explains from the underlying idea in plain language and introduces jargon only as a label after
  the idea is clear. That no-jargon, reason-first core is what could later be adapted for
  non-specialist learners. Keep the principle; defer the farmer product.
- Anything else stays in a backlog until a real user asks for it.

---

## Hard technical constraints (must respect — these have broken the build before)
- Single-file React (CRA + Babel). No literal newlines inside string constants — use `\n`.
- No Unicode em-dashes/arrows in JSX *text* — use `--` and `->` inside strings, or HTML-escape
  (`&lt;-&gt;`) in JSX text. Keep all brace/paren/bracket counts balanced.
- No browser localStorage/sessionStorage — use React state or the existing `window.storage`.
- AI calls go to `/api/chat` (the proxy), never directly to api.anthropic.com.
- Logo files live in `/public`: mycel-logo-light.png, mycel-logo-dark.png, favicon.png.
- Models: use current strings (claude-haiku-4-5-* for most, claude-sonnet-4-6 for reports).

## How to work (process, learned the hard way)
- Build in small increments — one feature/screen at a time — then test before the next.
- After every change: verify brace/paren/bracket balance = 0 and no string has an odd number of
  unescaped quotes (these are the two errors that keep breaking the build).
- Keep both themes working after every change.

## One-paragraph summary to paste at the top of any build request
"Bring Mycel to a personal-use baseline first, then deploy. Phase 1: get AI actually working via
the Vercel /api/chat proxy + key so the founder can use every feature; test and fix all functions
(Learn chat, Voice Quiz, Connection MCQ, Daily companion, Quick Capture, Knowledge Network, Library,
Projects); fix the Library so PDFs show as real viewable, highlightable, persistent documents not
plain text; solve the curiosity-flow problem (free branching chat + a living concept map that builds
as you dig + a 'build the big picture' synthesis button, all feeding the Knowledge Network) and make
Mycel a trustworthy anchor that stays internally consistent, flags genuine scientific disputes with
sources, and prefers textbook/peer-reviewed grounding over guessing; polish the daily-use surfaces
(Daily hero connection card, Fraunces/Inter/DM Mono hierarchy, Title Case, no visible double-dashes,
warm empty states, real logo, both themes). Defer auth, PWA, paper-retrieval, and social features.
Phase 2 (only after Phase 1): real auth + per-user server storage, PWA with install + update banner,
a 5–10 student pilot measuring voluntary use, then new features driven by real use — starting with
scientific-paper/evidence retrieval. Respect the hard build constraints (no literal newlines in
strings, no unicode dashes in JSX text, balanced brackets, /api/chat proxy, current model strings)
and build in small tested increments."
