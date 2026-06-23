# Changelog

All notable changes to **EDGE** are recorded here. This is the running log of progress —
updated as work lands, newest first.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/), and the
project aims to follow [Semantic Versioning](https://semver.org/) once it has releases.

Conventions used here:
- **Added / Changed / Fixed / Removed** group the entries within a release.
- `[Unreleased]` collects work in progress that hasn't been tagged a version yet.
- Dates are ISO 8601 (`YYYY-MM-DD`).

---

## [Unreleased]

### Added
- **Three new original levels — level system Phase 2** (roadmap item 4). Authored as
  JSON and registered in `registry.js` (`LEVELS` now has 4 entries; linear auto-advance
  chains 1→2→3→4 and loops back to 1):
  - **Corner Climb** (`level2.json`) — teaches turning + a ±1 climb/descend chain: roll
    east, turn south up a 2-high step, grab the prism on top, descend to the goal.
  - **Ferry** (`level3.json`) — teaches chaining two moving platforms with a safe
    mid-platform checkpoint between them (an escalation of level 1's single mover).
  - **Crumble Run** (`level4.json`) — teaches faller urgency under turns: an S-shaped
    bridge of collapsing tiles with safe corners (≤2 fallers per run, so it's fair).
  - Each carries 2 prisms. No engine changes — pure level data on top of the Phase 1
    loader. (2026-06-24)
- **Data-driven level system — Phase 1** (roadmap item 4, behavior-preserving for level 1):
  - `src/levels/level1.json` — the level promoted from a JS literal to JSON data
    (values unchanged). `src/levels/registry.js` — the level catalog (`LEVELS`, built-time
    JSON import via the `with { type: 'json' }` attribute — works in both Vite and
    `node --test`) plus the active-level pointer (`getLevel`/`setLevel`/`levelCount`).
    `src/levels/level1.js` deleted.
  - World/cube/camera/renderer now read `getLevel()` at call time instead of baking an
    imported `LEVEL` at module load. `world.js` gains `initWorld()` and `cube.js` gains
    `initCube()` — re-callable builders that rebuild the **same** exported container
    identities in place (so `main.js`'s held references survive a level switch); `goalH`
    became a live binding. Both still self-initialize at import (tests rely on it).
  - `main.js` gains `loadLevel(index, { play })` — the single path that rebuilds
    world + cube + camera + render snapshots from a level. Bootstrap, `restart`, and
    `onStart` all route through it; `restart` is now `loadLevel(current, {play:true})`.
  - **"Next level" win flow:** the win-screen button reads "NEXT LEVEL →" when a next
    level exists and advances to it (looping back to the first after the last), else
    "PLAY AGAIN". With only level 1 present the label stays "PLAY AGAIN" and replays —
    **byte-for-byte today's behavior**; the next-level machinery stays dormant until
    Phase 2 adds more levels. (2026-06-24, PR #5)

### Fixed
- **Prism visibility on the 1-wide corridor** — the floating prism gems (drawn at
  cube-body height) overlapped the cube silhouette and read ambiguously on level 1.
  Added a soft cyan tile-marker disc under each prism (`drawPrismMark` in
  `render/renderer.js`, sorted as a separate floor-level decal so it stays readable when
  the gem overlaps the cube) and lowered the gem opacity (0.96 → 0.8) so the cube reads
  through. Marker fades with the prism on pickup. No geometry or gameplay change.
  (2026-06-18)

### Added
- **Fixed-timestep loop + render interpolation** (roadmap item; pattern per
  gafferongames.com/post/fix_your_timestep):
  - New `src/engine/loop.js` — `createStepper(fixedDt, step)` accumulator. The sim now
    advances in `FIXED_DT = 1/120 s` steps (`config.js`), so rolls, movers, and fallers
    behave identically at 30/60/144 Hz displays. The 0.05 s hitch clamp moved into the
    stepper (no spiral of death on tab-switch/GC pauses).
  - `main.js` snapshots cube corners and mover visual positions after every sim step
    and lerps between the last two states by the accumulator remainder (alpha) at
    render time. Teleports (respawn, restart) snap instead of smearing (distance
    guard + snapshot resync on start/restart). `sceneBlocks(now, moverPos)` accepts
    interpolated mover positions; game logic still reads exact sim positions.
  - **First test suite** — `npm test` runs Node's built-in `node:test` (zero new
    dependencies): 21 tests across `tests/loop.test.js` (step count independent of
    frame chunking, alpha bounds, hitch clamp), `tests/math.test.js` (Rodrigues
    rotations, roll-landing geometry), and `tests/world.test.js` (heightAt, mover
    ping-pong + easing, faller lifecycle, fixed-step determinism). (2026-06-11)
- **Mobile touch controls** (roadmap item 1, design per `controls-mockup.html`). New
  `src/touch.js` (DOM-only, callbacks injected — dependency graph stays acyclic):
  - On-screen **D-pad bottom-left** — Diamond layout by default (each arrow points the
    way the cube moves on screen), Cross layout via a new toggle row in the tuning
    panel, persisted as `localStorage['edge.padLayout']`.
  - **System buttons bottom-right**: ⏸ pause · ⟳ restart · ⚙ tune.
  - Buttons feed the existing `heldKeys`/`bufferedDir` path via new
    `touchPress`/`touchRelease` exports in `game/input.js`, so hold-to-roll and
    tap-at-ledge-to-commit semantics are identical to the keyboard.
  - Active only on coarse-pointer devices, or with a `?touch` URL flag for desktop
    testing. Pointer Events + pointer capture (multi-touch safe, clean release when a
    finger slides off); keyboard hint hidden and start-screen copy swapped when active.
  - `index.html`: pad markup/CSS (mockup styles), viewport meta gains
    `viewport-fit=cover`, pads respect safe-area insets. Keys are semantic
    `<button type="button">` elements with aria-labels naming the on-screen roll
    direction (review feedback). Pinch zoom stays enabled
    for accessibility (review feedback) — gameplay gestures are already suppressed
    by `touch-action: none` on the game surface and pads, while the menu overlays
    remain zoomable. (2026-06-10)
  - *Note:* shipped behind PR #1, held for a physical-phone test; not yet merged.
- `LICENSE` — all-rights-reserved-for-now license with a non-affiliation / fan-work
  notice (EDGE © Mobigame / Two Tribes); open-source release planned later. README
  gained a matching "License & affiliation" section. (2026-06-10)

### Changed
- Collapsed faller tiles reform faster: `FALL_RESPAWN` 2.0 s → 1.2 s — the time a tile
  stays gone before it rises back. Snappier retry; the arm / fall / rise animation
  durations are unchanged. (2026-06-18)
- Deploy workflow bumped ahead of GitHub's June 16, 2026 Node 24 enforcement:
  `checkout` v4→v6, `setup-node` v4→v6 (build Node 20→24), `configure-pages` v5→v6,
  `upload-pages-artifact` v3→v5, `deploy-pages` v4→v5. (2026-06-10)

### Verified
- Level system Phase 2: 21/21 tests green, `npm run build` clean (identical bundle hash
  with/without the dev-only driver). Each new level driven to a win headlessly by stepping
  the sim directly — Corner Climb (climb/descend, 2/2 prisms), Ferry (both ferries timed
  and ridden, 2/2), Crumble Run (faller S-run, 2/2). Win-flow progression confirmed:
  labels are "NEXT LEVEL →" on 1–3 and "PLAY AGAIN" on 4, and the chain advances
  1→2→3→4→1 with no console errors. (2026-06-24)
- Level system Phase 1: 21/21 tests green (world sim unchanged), `npm run build` clean
  (19 modules; identical bundle hash with/without the dev-only verification hook, so it
  never ships). Full headless playthrough of level 1 to a win driven by stepping the sim
  directly (the preview suspends `requestAnimationFrame`): start → faller bridge → prism 1
  → board the mover → ride to [5,2] → ±1 climb → prism 2 → goal, ending WON with 2/2
  prisms, zero console errors. Win → "PLAY AGAIN" reloads a fresh, playable level 1.
  (2026-06-18)
- Fixed-timestep refactor: 21/21 tests green, `npm run build` clean (17 modules), and
  a full play session in the dev preview (roll, hold-to-roll, edge commit, mover
  riding, both prisms collected) with zero console errors. (2026-06-11)
- Touch chain end-to-end in the dev preview at phone size (375×812, `?touch=1`),
  driving real `PointerEvent`s: tap-to-roll, hold-to-roll, edge cling → same-direction
  tap commits the fall → respawn; pause/restart/tune buttons; layout toggle + reload
  persistence. Desktop unchanged (no pads, keyboard path re-verified, zero console
  errors). `npm run build` clean (17 modules). Caught and fixed in review: `.hidden`
  was overridden by the later `.cross`/`.diamond` display rules (CSS order) — both
  pads showed at once; re-asserted with `.cross.hidden,.diamond.hidden`. Not yet
  tested on a physical phone. (2026-06-10)

### Notes
- Full project audit on 2026-06-10: zero code defects found (port re-verified against
  the original line-by-line), build deterministic, 0 npm vulnerabilities, live site
  healthy. Remaining gaps: no CLAUDE.md, no test suite (planned alongside the
  fixed-timestep refactor).
- Known visual issue (reported 2026-06-11, fix planned): floating prisms can overlap
  the cube silhouette in the isometric projection on this level, which reads as
  ambiguous/occluding. Needs a readability fix in the prism decal rendering.
- **Next planned task:** prism-readability render fix (the floating gem at `h+0.55` sits
  inside the cube's `h+0.05..0.95` body, so it overlaps the cube when rolling onto a prism
  tile — reported confusing). Then the deferred static/dynamic render split.

---

## [0.2.0] — 2026-06-06 — Vite migration

Behavior-preserving port of the single-file `edge.html` into a Vite + vanilla-JS repo,
split into ES modules. Same gameplay, same look, same controls — just reorganized.

### Added
- Vite project: `package.json`, `vite.config.js` (`base: './'` so the build runs from a
  Pages subpath), `index.html` entry, `npm run dev` / `build` / `preview`.
- Module layout under `src/`:
  - `engine/math.js` — vectors, `rotAxis`, `rotAboutEdge`.
  - `config.js` — timing constants + live-tunable `settings`.
  - `levels/level1.js` — the level literal.
  - `render/canvas.js` — canvas/ctx/size + `resize()`.
  - `render/camera.js` — `setCamera`/`computeView`/`project`/`depthOf`.
  - `render/renderer.js` — `shade`/`pushBox`/`fillPoly`/`sceneBlocks` + decal draws.
  - `game/world.js` — `heightAt`, movers, fallers, beat clock.
  - `game/cube.js` — the roll/edge/mover/faller state machine.
  - `game/dirs.js` — shared direction table.
  - `game/input.js` — keyboard layer (callbacks wired by main, keeps deps acyclic).
  - `ui.js` — HUD, overlays, tuning panel (presentation only, data passed in).
  - `main.js` — bootstrap, wiring, main loop.
- GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys
  `dist/` to GitHub Pages on push to `main`.
- `package-lock.json` (Vite as the only devDependency).

### Verified
- `npm run build` produces a clean `dist/` (16 modules, zero errors/warnings).
- Loaded in a browser preview: zero console errors/warnings; start screen, HUD, and
  scene render identically to `edge.html`.
- **Full automated playthrough to a win** (driven via a temporary dev-only step hook):
  rolling across the faller bridge, prism pickup, boarding the moving platform, being
  carried, the ±1 climb, second prism, and reaching the goal (state → WON, 2/2 prisms).
- Pause (P/Esc), tuning panel (T), and restart (R) all confirmed working.

### Notes
- `edge.html` is kept in the repo as the reference prototype.
- Observed (not a regression): the headless preview suspends `requestAnimationFrame`
  while the page is hidden, freezing the loop. Real browsers tick normally; a
  Page-Visibility auto-pause is already on the roadmap (robustness step).
- All temporary debug instrumentation used for verification was removed; the production
  bundle never contained it (dev-only, tree-shaken).

---

## [0.1.0] — prototype (pre-repo)

The starting point captured when this repo was created — a single self-contained
`edge.html` built in a Claude.ai thread, confirmed playable in-browser.

### Added
- Hand-rolled **Canvas 2D isometric renderer**: tunable camera (`setCamera`), painter's-
  algorithm depth sort, backface culling, per-face shading.
- **Cube roll state machine** (`START / IDLE / ROLLING / EDGING / FALLING / WON`):
  - 4-direction rolling with continuous hold-to-roll + tap buffering.
  - ±1 step climb/descend as a 180° pivot; ≥+2 blocked as walls, ≤−2 as falls.
  - **Edging**: cling at a ledge, commit (same dir = fall) or recover (opposite); OS
    key-repeat ignored.
- **Moving platforms** driven by a global tick clock (BEAT ≈ 0.85s); glide smoothly and
  carry the riding cube.
- **Collapsing faller tiles** with a full lifecycle: `solid → armed → falling → gone →
  rising → solid` (amber tint as a prototype readability aid).
- Dynamic `heightAt()` collision query + the single rule "no ground under cube → fall".
- Prisms (collectible), fading trail, pulsing goal ring, win screen, restart.
- **Pause** (`P` / `Esc`) that freezes the tick clock, timer, cube, and cosmetics.
- **Tuning panel** (`T`): live climb-speed, camera azimuth, camera elevation.
- Error overlay + `window 'error'` listener surfacing fatal errors instead of opaque
  "Script error."
- `controls-mockup.html` — approved (not yet wired) mobile control layout: Cross +
  Diamond D-pads and Pause / Restart / Tune system buttons.

### Verified
- JS syntax (`node --check` on the extracted script).
- Climb/descend landing coordinates + rotation-matrix integrity (numeric check).
- Mover ping-pong sequence, dynamic `heightAt`, and faller lifecycle (logic simulation).
- *Not* yet verified by an exhaustive human play-through of every path.

### Known limitations
- Desktop / keyboard only — mobile touch controls designed but not built.
- One hardcoded inline `LEVEL`; no level loader yet.
- Variable-`dt` loop (timing is framerate-dependent until the fixed-timestep refactor).
- No `unhandledrejection` handler; no Page-Visibility auto-pause.
