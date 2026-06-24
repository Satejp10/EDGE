# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-24**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."
>
> **Status: the project is CONCLUDED** as a stable 5-level showcase, live and tidy.
> No further features are planned (see "What's next" — it's all intentionally cut).

---

## This week's update log (2026-06-18 → 2026-06-24)

Everything below is **merged to `main` and live** at https://satejp10.github.io/EDGE/.

The game went from **one hardcoded level to a finished, data-driven, 5-level showcase**
with a proper finale — done across PRs #5–#11.

1. **Level system, Phase 1 — data-driven loader** (PR #5). The single inline `LEVEL` was
   promoted to **JSON data** (`levels/level1.json`) plus a small **registry**
   (`levels/registry.js` = the level catalog + the "active level" pointer). World, cube,
   camera, and renderer now read the active level *at call time* instead of baking one
   level at import; `main.js` gained **`loadLevel()`**, the single path that rebuilds the
   whole scene from level data. Added a **"next level" win flow**. Behavior-preserving —
   level 1 played byte-for-byte as before (verified by a full playthrough + 21/21 tests).
2. **Level system, Phase 2 — three new levels** (PR #6): **Corner Climb** (turning + a ±1
   climb chain), **Ferry** (chaining moving platforms with a safe mid-checkpoint),
   **Crumble Run** (an S-bridge of collapsing fallers). Each verified solvable.
3. **Prism-readability fix** (PR #7). The floating gem now **fades as the cube approaches**
   its tile, so it no longer reads as "stuck inside" the magenta cube. Render-only.
4. **Level 1 simplified** (PR #9). Removed the sideways moving platform from the opener —
   it over-complicated the first level. Two static tiles now bridge the gap; the moving
   platform is still taught later (Ferry). Start-screen hint copy updated to match.
5. **Robustness polish** (PR #10). **Auto-pause when the tab is hidden** (`visibilitychange`
   → pause overlay, so you return to a deliberately stopped frame instead of a silent
   jump-in) plus an **`unhandledrejection` handler** that surfaces stray promise errors in
   the on-screen fatal overlay. *Note:* the long-suspected "beat clock keeps running while
   hidden" bug **does not actually reproduce** — `requestAnimationFrame` already suspends in
   background tabs and the fixed-timestep loop clamps the return hitch — so this shipped as
   honest UX polish, not a desync fix.
6. **Capstone: Level 5 "Topple"** (PR #11). The finale chains everything: a climb staircase
   → a 3-tile collapsing-faller bridge → a moving-platform **ferry across a real gap** to a
   raised goal. The game now auto-advances **1 → 2 → 3 → 4 → 5 → 1**, and clearing the last
   level shows a tribute card — **"TOPPLE — an EDGE homage."**

**Wrap-up housekeeping:** all 11 feature branches (PRs #1–#11) are merged and **deleted**
from local and `origin` — the repo is now just `main`. A branch-cleanup log lives in
`HANDOFF_edge_wrapup.md`.

---

## What the project is (memory refresh)

- A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE**
  (Two Tribes / Mobigame): roll a cube across isometric tile levels, collect prisms,
  reach the goal.
- Personal nostalgia / craft project. Enjoyment + learning, not revenue. Friends can
  play via the public link.
- Definition of done (**now met**): anyone can open a URL and play a faithful EDGE
  recreation on **desktop (keyboard) and mobile (touch)**, across several real levels,
  hosted free — ending on a deliberate capstone.

## Current state

- **Stage:** **Concluded.** Live and playable on desktop + mobile; structured Vite repo;
  tested. A **five-level game** with linear progression (1→2→3→4→5→1) ending in the
  capstone **Topple** and an "an EDGE homage" completion card.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only runtime dep).
  No framework, no game engine, no WebGL. `npm test` via `node:test` (no test deps), 21 tests.
- **Module layout** (`src/`): `main.js` (bootstrap + loop + render interpolation +
  `loadLevel`), `config.js` (timings incl. `FIXED_DT`), `engine/{math,loop}.js`,
  `render/{canvas,camera,renderer}.js`, `game/{world,cube,dirs,input}.js`,
  **`levels/` (`level1–5.json` + `registry.js` loader)**, `ui.js`, `touch.js`.
  Tests in `tests/`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup (with approach-fade), fading trail, goal/win, the **five-level
  progression** with the **"TOPPLE — an EDGE homage" finale card**, auto-pause on
  tab-hide, pause, tuning panel, restart, and the full mobile touch chain.

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
- **The look is dictated by EDGE** (light bg, glossy white blocks, magenta cube, cyan
  prisms). Do **not** apply the editorial/brutalist portfolio aesthetic here.
  "Dark mode" = UI chrome preference, never darken the game art.
- **License: all-rights-reserved-for-now**, open-source later (owner's call on timing).
  Keep the fan-work / non-affiliation framing intact.
- Working style: direct and concise, plain language (analogies help); **plan before
  building anything visual and get sign-off first**; verify behavior by playing (build +
  browser), not just compiling.

## What's next (intentionally nothing — the project is parked here)

The conclusion was a deliberate stopping point. The following were **considered and cut**
to keep the showcase stable; revisit only if the owner reopens the project:

1. **Static/dynamic render split** (cache the static floor) — *cut*: premature for levels
   this small.
2. **Faithful recreations of actual EDGE stages** — *cut*: needs reference maps, a much
   bigger job than the original teaching levels.
3. **TypeScript** — *cut/deferred indefinitely*.
4. **Perf work** (object pooling, profiling, telemetry) — *cut*: no measured need.

The only remaining task is **non-code and owner-owned**: record a short muted clip of
Topple for the portfolio.

## Open questions (only if the project reopens)

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When (if ever) to introduce TypeScript / flip to an open-source license.

---

*For full per-change detail, see `CHANGELOG.md`. For original rationale and the decision
log, see `HANDOFF_edge.md`. For the wrap-up + branch-cleanup log, see
`HANDOFF_edge_wrapup.md`. For Claude Code sessions, `CLAUDE.md` in the repo root is the
bootstrap — no pasting needed there.*
