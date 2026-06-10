# EDGE — browser recreation

Faithful browser recreation of the 2008 puzzle-platformer EDGE (Mobigame/Two Tribes).
Personal non-profit passion project. Live: https://satejp10.github.io/EDGE/

## Commands

- `npm run dev` — Vite dev server (game at the printed localhost URL)
- `npm run build` — production build to `dist/`
- No tests yet (planned alongside the fixed-timestep refactor).

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

1. **Mobile touch controls** ← next. Design approved: Cross + Diamond D-pads, settings
   toggle (persist in localStorage), must feed the existing `heldKeys`/`bufferedDir`
   input path; coarse-pointer devices only. Spec: `controls-mockup.html`.
2. Fixed-timestep loop + render interpolation (+ first tests).
3. Static/dynamic render split (cache the static floor).
4. Robustness: `unhandledrejection` handler, auto-pause on `visibilitychange`.
5. JSON level loader + real levels.
6. Polish: pooling, profiling, telemetry.
