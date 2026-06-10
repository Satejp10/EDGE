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
- `LICENSE` — all-rights-reserved-for-now license with a non-affiliation / fan-work
  notice (EDGE © Mobigame / Two Tribes); open-source release planned later. README
  gained a matching "License & affiliation" section. (2026-06-10)

### Verified
- Touch chain end-to-end in the dev preview at phone size (375×812, `?touch=1`),
  driving real `PointerEvent`s: tap-to-roll, hold-to-roll, edge cling → same-direction
  tap commits the fall → respawn; pause/restart/tune buttons; layout toggle + reload
  persistence. Desktop unchanged (no pads, keyboard path re-verified, zero console
  errors). `npm run build` clean (17 modules). Caught and fixed in review: `.hidden`
  was overridden by the later `.cross`/`.diamond` display rules (CSS order) — both
  pads showed at once; re-asserted with `.cross.hidden,.diamond.hidden`. Not yet
  tested on a physical phone. (2026-06-10)

### Changed
- Deploy workflow bumped ahead of GitHub's June 16, 2026 Node 24 enforcement:
  `checkout` v4→v6, `setup-node` v4→v6 (build Node 20→24), `configure-pages` v5→v6,
  `upload-pages-artifact` v3→v5, `deploy-pages` v4→v5. (2026-06-10)

### Notes
- Full project audit on 2026-06-10: zero code defects found (port re-verified against
  the original line-by-line), build deterministic, 0 npm vulnerabilities, live site
  healthy. Remaining gaps: no CLAUDE.md, no test suite (planned alongside the
  fixed-timestep refactor).
- **Next planned task:** fixed-timestep loop + render interpolation, with the first
  test suite alongside it (roadmap item 2).

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
