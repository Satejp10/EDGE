# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-24**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."

---

## This week's update log (2026-06-18 → 2026-06-24)

Everything below is **merged to `main` and live** at https://satejp10.github.io/EDGE/.

The big one: the game went from **one hardcoded level to a real, data-driven, multi-level
game** — done in three PRs.

1. **Level system, Phase 1 — data-driven loader** (PR #5). The single inline `LEVEL` was
   promoted to **JSON data** (`levels/level1.json`) plus a small **registry**
   (`levels/registry.js` = the level catalog + the "active level" pointer). World, cube,
   camera, and renderer now read the active level *at call time* instead of baking one
   level at import; `main.js` gained **`loadLevel()`**, the single path that rebuilds the
   whole scene from level data. Added a **"next level" win flow**. Built to be
   **behavior-preserving** — level 1 plays byte-for-byte as before (verified by a full
   playthrough to a win + 21/21 tests).
2. **Level system, Phase 2 — three new levels** (PR #6). Original "teaching" levels, each
   isolating one mechanic and rising in difficulty:
   - **Corner Climb** — turning + a ±1 climb/descend chain.
   - **Ferry** — chaining two moving platforms with a safe mid-platform checkpoint.
   - **Crumble Run** — faller urgency under turns (an S-shaped bridge of collapsing tiles
     with safe corners).
   The game now auto-advances **1 → 2 → 3 → 4 → 1**. Each level was verified solvable.
3. **Prism-readability fix** (PR #7). The floating cyan gem sits at cube-body height, so
   rolling onto a prism tile drew the gem *over* the magenta cube and looked "stuck
   inside" it. The gem now **fades out as the cube approaches its tile** (the floor-marker
   disc stays as the "prism here" indicator), so the overlap is gone. Render-only — no
   gameplay change.

**Decided for next:** performance + robustness, not more features yet — see "What's next."

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
  Now a **four-level game** with linear progression — the level system is done.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only runtime dep).
  No framework, no game engine, no WebGL. `npm test` via `node:test` (no test deps).
- **Module layout** (`src/`): `main.js` (bootstrap + loop + render interpolation +
  `loadLevel`), `config.js` (timings incl. `FIXED_DT`), `engine/{math,loop}.js`,
  `render/{canvas,camera,renderer}.js`, `game/{world,cube,dirs,input}.js`,
  **`levels/` (`*.json` level data + `registry.js` loader)**, `ui.js`, `touch.js`.
  Tests in `tests/`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup (with the new approach-fade), fading trail, goal/win, the
  **next-level progression (1→2→3→4→1)**, pause, tuning panel, restart, and the full
  mobile touch chain.

## Key decisions to remember (still in force)

- **Canvas 2D hand-rolled renderer, NOT WebGL/three.js.** The original three.js version
  crashed on software/lowp GL contexts. Do **not** reintroduce WebGL/three.js without a
  proven reason. This is the single most important constraint.
- **Vanilla JS, no game engine** (Phaser/Pixi are overkill/mismatched). Static,
  build-to-`dist` site. Don't add dependencies without asking. (`node:test` keeps the
  test suite dependency-free.)
- **Levels are JSON data** loaded through `registry.js` + `loadLevel()`. New levels =
  new JSON files registered in the catalog; **build-time JSON import, no runtime fetch**
  (stays offline/static). Schema is documented in the `registry.js` header.
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

## What's next (nothing started yet)

1. **Static/dynamic render split** — cache the static floor and only redraw moving
   geometry (cube, movers, fallers, decals). Deferred perf work, now that there are
   several levels to benefit from it.
2. **Robustness:** auto-pause on `visibilitychange` (today the beat clock + timer keep
   running while the tab is hidden — a real bug) and an `unhandledrejection` handler.
3. **More / faithful levels & polish** — eventually recreate *actual* EDGE stages (needs
   reference maps; a bigger job than the original teaching levels), object pooling,
   profiling.

## Open questions to confirm when relevant

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When to introduce TypeScript.
- When to flip to an open-source license.

---

*For full per-change detail, see `CHANGELOG.md`. For original rationale and the decision
log, see `HANDOFF_edge.md`. For Claude Code sessions, `CLAUDE.md` in the repo root is the
bootstrap — no pasting needed there.*
