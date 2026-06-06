# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-06**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."

---

## TL;DR of what changed since the handoff

The project moved from **one self-contained `edge.html`** to a **real Vite + vanilla-JS
repo**, and it's now **live on the web**.

1. **Git repo created and public:** https://github.com/Satejp10/EDGE
2. **Vite migration done** — `edge.html` ported into ES modules under `src/`, with
   **gameplay, look, and controls unchanged** (a deliberate behavior-preserving port).
3. **Deployed** — auto-builds and ships to GitHub Pages on every push to `main`.
   **▶ Playable now: https://satejp10.github.io/EDGE/** (desktop / keyboard).
4. **Docs in the repo:** `README.md`, `CHANGELOG.md` (running log), and the original
   `HANDOFF_edge.md` kept as context. The old `edge.html` is kept as a reference prototype.

Nothing about *how the game plays* changed. This phase was pure restructuring + hosting.

---

## What the project is (memory refresh)

- A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE**
  (Two Tribes / Mobigame): roll a cube across isometric tile levels, collect prisms,
  reach the goal.
- Personal nostalgia / craft project. Enjoyment + learning, not revenue.
- Definition of done: anyone can open a URL and play a faithful EDGE recreation on
  **desktop (keyboard) and mobile (touch)**, across several real levels, hosted free.

## Current state

- **Stage:** Playable single level, now a structured Vite repo, deployed.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only dependency).
  No framework, no game engine, no WebGL.
- **Module layout** (`src/`): `main.js` (bootstrap + loop), `config.js`,
  `engine/math.js`, `render/{canvas,camera,renderer}.js`,
  `game/{world,cube,dirs,input}.js`, `levels/level1.js`, `ui.js`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup, fading trail, goal/win, pause (P/Esc), tuning panel (T),
  restart (R). Verified via a clean build (zero warnings), zero console errors, and a
  full automated playthrough to a win (2/2 prisms).

## Key decisions to remember (still in force)

- **Canvas 2D hand-rolled renderer, NOT WebGL/three.js.** The original three.js version
  crashed on software/lowp GL contexts. Do **not** reintroduce WebGL/three.js without a
  proven reason. This is the single most important constraint.
- **Vanilla JS, no game engine** (Phaser/Pixi are overkill/mismatched). Keep it a static,
  build-to-`dist` site. Don't add dependencies without asking.
- **No audio, no backend/accounts** for the core demo.
- **TypeScript: deferred** (later, not now) to keep the migration mechanical.
- **The look is dictated by EDGE** (light bg, glossy white blocks, magenta cube, cyan
  prisms). Do **not** apply the editorial/brutalist portfolio aesthetic here.
- Working style: direct and concise; **plan before building anything visual and get
  sign-off first**; verify capabilities rather than assuming.

## What's next (roadmap, in order)

1. **Mobile touch controls** *(next up)* — design approved. Cross + Diamond D-pads,
   switchable via a settings toggle (persist in `localStorage`), gear button for the
   tuning panel. Touch must feed the **same** input path so hold-to-roll works for free.
   Show only on coarse-pointer/touch devices. Spec: `controls-mockup.html` in the repo.
2. **Fixed-timestep loop + render interpolation** — make rolls land identically at any
   refresh rate (currently variable-`dt`).
3. **Static/dynamic render split** — cache the static floor; only redraw moving geometry.
4. **Robustness** — `unhandledrejection` handler + auto-pause on `visibilitychange`
   (the rAF loop suspends while the tab is hidden; the beat clock/timer should pause too).
5. **JSON level loader + real levels** — promote the inline `LEVEL` literal to a schema +
   loader, then rebuild actual EDGE stages.
6. **Polish & deploy hardening** — object pooling, device profiling, error telemetry.

## Open questions to confirm when relevant

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When to introduce TypeScript.

---

*For full history and per-change detail, see `CHANGELOG.md`. For original rationale and
the decision log, see `HANDOFF_edge.md`.*
