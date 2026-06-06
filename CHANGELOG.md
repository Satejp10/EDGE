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
- Git repository initialized; pushed to GitHub as `Satejp10/EDGE`.
- `README.md` — project overview, how-to-run, controls, architecture rationale
  (Canvas 2D over WebGL), mechanics summary, roadmap, references.
- `CHANGELOG.md` — this running progress log.

### Notes
- Project audited against `HANDOFF_edge.md` on 2026-06-06: single-file prototype
  confirmed working; no prior git history, no build/tests/CLAUDE.md (all expected).
  Inline scripts parse clean. Toolchain present: Node v24.14.0, npm 11.16.0.
- **Next planned task:** Vite + vanilla-JS migration — a behavior-preserving port of
  `edge.html` into a module layout (`engine / render / game / levels`). Not started.

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
