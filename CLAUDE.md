# EDGE — browser recreation

Faithful browser recreation of the 2008 puzzle-platformer EDGE (Mobigame/Two Tribes).
Personal non-profit passion project. Live: https://satejp10.github.io/EDGE/

## Commands

- `npm run dev` — Vite dev server (game at the printed localhost URL)
- `npm run build` — production build to `dist/`
- `npm test` — node:test suite in `tests/` (loop stepper, math, world). Zero test deps.

## Orientation — read these before working

1. `CHANGELOG.md` — running log of what's done and what's next. **Update it when work lands.**
2. `README.md` — architecture rationale, roadmap, controls.
3. `HANDOFF_edge.md` — original decision log / history (context, partially stale; the
   Vite migration it plans is DONE).
4. `PROGRESS_for_claude.md` — status doc for pasting into claude.ai chats (not for Claude
   Code). Refresh it when asked.

## Architecture (src/)

Hand-rolled **Canvas 2D isometric renderer** (projection + Rodrigues rotation + painter's
sort). `main.js` bootstraps and runs the loop; `engine/math.js` (vectors/rotations);
`render/` (canvas, camera, renderer); `game/` (world = heightAt/movers/fallers/beat clock,
cube = roll/edge/fall state machine, input = keyboard layer, dirs = direction table);
`levels/level1.js` (level literal); `ui.js` (HUD/overlays/tuning panel); `config.js`
(timing constants + live-tunable settings). Dependency graph is acyclic — input/ui take
callbacks, they never import game logic.

## Hard constraints — do not violate

- **NO WebGL / three.js.** The project exists in Canvas 2D *because* three.js crashed on
  software/lowp GL contexts. Don't reintroduce it without a confirmed
  hardware-accelerated context and the user's explicit OK.
- **No new dependencies without asking** (especially game engines). Vite stays the only one.
- **No audio, no backend/accounts.** Static site, builds to `dist/`, deployed by
  `.github/workflows/deploy.yml` to GitHub Pages on push to `main`.
- **The look is dictated by EDGE**: light background, glossy white blocks, magenta cube,
  cyan prisms. Never apply other aesthetics. "Dark mode" means UI chrome preference,
  never darkening the game.
- License is all-rights-reserved-for-now (see `LICENSE`); open-source later, user decides when.

## Working agreements

- Direct, concise, no filler. One clear recommendation, not a menu.
- **Plan before building anything visual; get sign-off before coding it.**
- Verify tool/platform capabilities instead of assuming from memory.
- Refactors must be behavior-preserving unless the task says otherwise; verify by
  playing (build + browser), not just by compiling.
- Commit messages: imperative summary; update `CHANGELOG.md` in the same commit when a
  feature/fix lands.

## Roadmap (current order)

1. ~~Mobile touch controls~~ — DONE, **merged & live** (PR #1, 2026-06-18). `src/touch.js`;
   Cross/Diamond D-pads, `?touch` URL flag for desktop testing, layout in localStorage.
2. ~~Fixed-timestep loop + render interpolation (+ first tests)~~ — DONE, merged & live
   (`engine/loop.js` stepper, FIXED_DT=1/120, lerped cube/mover rendering, 21 tests).
3. ~~Polish: prism-visibility readability fix + faller reform speed-up~~ — DONE, merged &
   live 2026-06-18 (`drawPrismMark` floor disc + gem alpha 0.8; `FALL_RESPAWN` 2.0→1.2s).
4. **JSON level loader + real levels** ← NEXT (chosen 2026-06-18). Plan: Phase 1 =
   data-driven, re-initializable level loading (convert `levels/level1.js`→JSON + registry,
   add `loadLevel()`, make world/cube/camera/renderer read the active level instead of a
   baked import, add a "next level" win flow) — **behavior-preserving for level 1**.
   Phase 2 = author 2–3 new original levels. Decisions: build-time JSON import (no fetch),
   linear auto-advance, original teaching levels first (faithful EDGE stage recreations
   deferred). Plan drafted + approved; not started.
5. Static/dynamic render split (cache the static floor) — deferred; premature for one
   small level.
6. Robustness: `unhandledrejection` handler, auto-pause on `visibilitychange`
   (timer/beat clock keep running when the tab is hidden — a real bug to fix here).
7. Polish: pooling, profiling, telemetry.
