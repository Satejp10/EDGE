# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-18**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."

---

## TL;DR of what changed since the handoff

The project went from **one self-contained `edge.html`** to a **real Vite + vanilla-JS
repo**, it's **live on the web**, it now has **mobile touch controls** and a
**frame-rate-independent game loop with a test suite**.

1. **Git repo, public:** https://github.com/Satejp10/EDGE
   **▶ Playable now: https://satejp10.github.io/EDGE/** (desktop keyboard · mobile touch).
2. **Vite migration (2026-06-06)** — `edge.html` ported into ES modules under `src/`,
   behavior-preserving (verified by an automated playthrough to a win).
3. **Audit + hardening (2026-06-10)** — line-by-line port re-verification (zero defects),
   deploy pipeline future-proofed (GitHub Actions bumped for the Node-24 cutover),
   `LICENSE` added (all-rights-reserved-for-now + fan-work notice), `CLAUDE.md` added so
   Claude Code sessions self-bootstrap.
4. **Mobile touch controls (2026-06-10)** — `src/touch.js`: on-screen D-pad (Diamond
   default, Cross via a tuning-panel toggle, choice saved in `localStorage`) + ⏸/⟳/⚙
   system buttons. Feeds the **same** `heldKeys`/`bufferedDir` path (via `touchPress`/
   `touchRelease`), so hold-to-roll and edge-commit feel identical to the keyboard.
   Active on coarse-pointer devices or with `?touch` in the URL (desktop testing).
   Semantic `<button>` elements + aria-labels; pinch-zoom kept for accessibility.
   **Status: shipped on PR #1, OPEN and intentionally held for a physical-phone test —
   do NOT merge until Satej phone-tests (merge auto-deploys to the live site).**
5. **Fixed-timestep loop + render interpolation + first tests (2026-06-11, MERGED via
   PR #2, live)** — `src/engine/loop.js` accumulator stepping the sim at
   `FIXED_DT = 1/120 s`, so rolls/movers/fallers land identically at 30/60/144 Hz;
   render lerps between the last two sim states by the leftover-time alpha (teleports
   snap, not smear). **`npm test`** = Node's built-in `node:test`, **21 tests**, zero new
   dependencies.

## What the project is (memory refresh)

- A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE**
  (Two Tribes / Mobigame): roll a cube across isometric tile levels, collect prisms,
  reach the goal.
- Personal nostalgia / craft project. Enjoyment + learning, not revenue. Friends can
  play via the public link.
- Definition of done: anyone can open a URL and play a faithful EDGE recreation on
  **desktop (keyboard) and mobile (touch)**, across several real levels, hosted free.

## Current state

- **Stage:** Playable single level; structured Vite repo; deployed; tested.
  Desktop keyboard **and** mobile touch both work.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only runtime dep).
  No framework, no game engine, no WebGL. `npm test` via `node:test` (no test deps).
- **Module layout** (`src/`): `main.js` (bootstrap + loop + render interpolation),
  `config.js` (timings incl. `FIXED_DT`), `engine/{math,loop}.js`,
  `render/{canvas,camera,renderer}.js`, `game/{world,cube,dirs,input}.js`,
  `levels/level1.js`, `ui.js`, `touch.js`. Tests in `tests/`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup, fading trail, goal/win, pause (P/Esc), tuning panel (T),
  restart (R), and the full mobile touch chain (driven with real PointerEvents at phone
  size in the dev preview).

## Key decisions to remember (still in force)

- **Canvas 2D hand-rolled renderer, NOT WebGL/three.js.** The original three.js version
  crashed on software/lowp GL contexts. Do **not** reintroduce WebGL/three.js without a
  proven reason. This is the single most important constraint.
- **Vanilla JS, no game engine** (Phaser/Pixi are overkill/mismatched). Static,
  build-to-`dist` site. Don't add dependencies without asking. (`node:test` keeps the
  test suite dependency-free.)
- **No audio, no backend/accounts** for the core demo.
- **TypeScript: deferred** (later, not now).
- **License: all-rights-reserved-for-now**, open-source later (owner's call on timing).
  Keep the fan-work / non-affiliation framing intact.
- **The look is dictated by EDGE** (light bg, glossy white blocks, magenta cube, cyan
  prisms). Do **not** apply the editorial/brutalist portfolio aesthetic here.
  "Dark mode" = UI chrome preference, never darken the game art.
- Working style: direct and concise, plain language (analogies help); **plan before
  building anything visual and get sign-off first**; verify capabilities rather than
  assuming; verify behavior by playing (build + browser), not just compiling.

## What's next (roadmap)

1. ~~Mobile touch controls~~ — **DONE** (on PR #1, awaiting a physical-phone test before merge).
2. ~~Fixed-timestep loop + render interpolation + first tests~~ — **DONE & merged (live).**
3. **Static/dynamic render split** *(next up)* — cache the static floor; only redraw the
   cube/movers/fallers each frame instead of rebuilding + re-projecting every block.
4. **Robustness** — `unhandledrejection` handler + auto-pause on `visibilitychange`
   (the rAF loop suspends while the tab is hidden; the beat clock/timer should pause too).
5. **JSON level loader + real levels** — promote the inline `LEVEL` literal to a schema +
   loader, then rebuild actual EDGE stages.
6. **Polish & deploy hardening** — object pooling, device profiling, error telemetry.

## In flight / pending sign-off

- **PR #1 (touch controls):** mergeable and clean, held only for a real-phone test.
  Merge = deploy. CodeRabbit's review items (re-enable pinch zoom, semantic buttons,
  `?touch` docs) are all addressed in commits; the one inline review thread is resolved.
- **Prism-visibility tweak (awaiting OK):** on level 1's 1-wide corridor the floating
  prisms (drawn at cube-body height) overlap the cube silhouette and read ambiguously.
  Proposed, non-gameplay fix: a soft cyan tile-marker ellipse under each prism + drop
  prism alpha ~0.96→0.8. Not applied yet.

## Open questions to confirm when relevant

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When to introduce TypeScript.
- When to flip to an open-source license.

---

*For full per-change detail, see `CHANGELOG.md`. For original rationale and the decision
log, see `HANDOFF_edge.md`. For Claude Code sessions, `CLAUDE.md` in the repo root is the
bootstrap — no pasting needed there.*
