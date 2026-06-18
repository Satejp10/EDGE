# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-18**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."

---

## This week's update log (2026-06-11 → 2026-06-18)

Everything below is **merged to `main` and live** at https://satejp10.github.io/EDGE/.

1. **Mobile touch controls — shipped & live** (PR #1, merged 2026-06-18). On-screen D-pad
   (Diamond default, Cross via a tuning-panel toggle, saved in `localStorage`) + ⏸/⟳/⚙
   buttons, feeding the same input path as the keyboard. Active on touch devices or via
   `?touch` in the URL. The game is now playable on **desktop *and* phone**.
2. **Fixed-timestep loop + render interpolation + first test suite — shipped & live**
   (PR #2). Sim steps at `FIXED_DT = 1/120 s`, so motion is identical at any refresh rate;
   rendering lerps between sim states. `npm test` = Node's `node:test`, **21 tests**, no
   new deps.
3. **Prism-visibility readability fix — shipped & live** (PR #3, 2026-06-18). Floating
   prism gems overlapped the cube on the 1-wide corridor; added a soft cyan floor-marker
   disc under each prism (`drawPrismMark`) and lowered gem opacity 0.96→0.8. No gameplay
   change.
4. **Faller reform speed-up — shipped & live** (PR #4, 2026-06-18). Collapsed tiles come
   back faster: `FALL_RESPAWN` 2.0 s → 1.2 s. Animation durations unchanged.
5. **Housekeeping (around 2026-06-10):** full project audit (zero defects), deploy
   pipeline future-proofed for GitHub's Node-24 cutover, `LICENSE` added
   (all-rights-reserved-for-now + EDGE fan-work notice), `CLAUDE.md` added so Claude Code
   sessions self-bootstrap.

**Decided for next:** start building **real levels** (a JSON level loader + new stages) —
see "What's next" below. Plan is drafted and approved; coding not started.

---

## What the project is (memory refresh)

- A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE**
  (Two Tribes / Mobigame): roll a cube across isometric tile levels, collect prisms,
  reach the goal.
- Personal nostalgia / craft project. Enjoyment + learning, not revenue. Friends can
  play via the public link.
- Definition of done: anyone can open a URL and play a faithful EDGE recreation on
  **desktop (keyboard) and mobile (touch)**, across several real levels, hosted free.

## Current state

- **Stage:** Live and playable on desktop + mobile; structured Vite repo; tested.
  Still **one level** — making it multi-level is the next task.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only runtime dep).
  No framework, no game engine, no WebGL. `npm test` via `node:test` (no test deps).
- **Module layout** (`src/`): `main.js` (bootstrap + loop + render interpolation),
  `config.js` (timings incl. `FIXED_DT`), `engine/{math,loop}.js`,
  `render/{canvas,camera,renderer}.js`, `game/{world,cube,dirs,input}.js`,
  `levels/level1.js`, `ui.js`, `touch.js`. Tests in `tests/`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup, fading trail, goal/win, pause, tuning panel, restart, and the
  full mobile touch chain.

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
  building anything visual and get sign-off first**; verify behavior by playing (build +
  browser), not just compiling.

## What's next — real levels (chosen 2026-06-18, plan approved)

Turn the one hardcoded level into a **data-driven, multi-level game**:

- **Phase 1 — level system (behavior-preserving):** convert `levels/level1.js`→JSON + a
  small level registry; add a `loadLevel()` that rebuilds world / cube / camera / render
  state from level data (instead of today's "bake one LEVEL at import"); add a
  "next level" win flow. **Level 1 must still play identically.** Keep tests green + add
  loader tests.
- **Phase 2 — content:** author 2–3 new original levels of rising difficulty; verify each
  is solvable.
- **Decisions made:** build-time JSON import (no runtime fetch — stays offline/static);
  linear auto-advance progression; original "teaching" levels first (faithful recreations
  of *actual* EDGE stages deferred — they need reference maps and are a bigger job).

After this: static/dynamic render split (deferred perf), then robustness
(`unhandledrejection` + auto-pause on tab-hidden), then more levels / polish.

## Open questions to confirm when relevant

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When to introduce TypeScript.
- When to flip to an open-source license.

---

*For full per-change detail, see `CHANGELOG.md`. For original rationale and the decision
log, see `HANDOFF_edge.md`. For Claude Code sessions, `CLAUDE.md` in the repo root is the
bootstrap — no pasting needed there.*
