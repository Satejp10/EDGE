# EDGE — progress update (paste into Claude.ai)

> Purpose: bring a Claude.ai chat up to speed on where the EDGE project stands and
> refresh its memory of the key decisions. Last updated **2026-06-10**.
> This complements the original `HANDOFF_edge.md` — read this for "what's true now."

---

## TL;DR of what changed since the handoff

The project moved from **one self-contained `edge.html`** to a **real Vite + vanilla-JS
repo**, it's **live on the web**, and it has passed a **full project audit**.

1. **Git repo, public:** https://github.com/Satejp10/EDGE
2. **Vite migration done (2026-06-06)** — `edge.html` ported into ES modules under
   `src/`, with **gameplay, look, and controls unchanged** (deliberate
   behavior-preserving port, verified by an automated playthrough to a win).
3. **Deployed** — auto-builds to GitHub Pages on every push to `main`.
   **▶ Playable now: https://satejp10.github.io/EDGE/** (desktop / keyboard).
4. **Full audit passed (2026-06-10)** — port re-verified against the original
   line-by-line: zero code defects, deterministic build, 0 npm vulnerabilities,
   pipeline green, live site healthy, docs accurate.
5. **Deploy pipeline future-proofed (2026-06-10)** — all GitHub Actions bumped to
   current majors (checkout/setup-node v6, configure-pages v6, upload-pages-artifact v5,
   deploy-pages v5; build Node 20→24) ahead of GitHub's June 16, 2026 Node-24
   enforcement. Verified: deploy runs clean with zero deprecation warnings.
6. **License added (2026-06-10)** — `LICENSE` is **all-rights-reserved-for-now**:
   anyone may view the source and play, nobody may copy/redistribute/reuse yet.
   Includes a non-affiliation fan-work notice (EDGE © Mobigame / Two Tribes; unofficial,
   non-commercial tribute). Open-source release planned later — owner decides when.
7. **`CLAUDE.md` added (2026-06-10)** — Claude Code sessions in the repo folder now
   bootstrap automatically (constraints, working agreements, roadmap).

Nothing about *how the game plays* has changed since the prototype. All work so far has
been restructuring, hosting, hardening, and documentation.

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

- **Stage:** Playable single level; structured Vite repo; deployed; audited.
- **Stack:** HTML5 + vanilla JS + Canvas 2D, built with **Vite** (the only dependency).
  No framework, no game engine, no WebGL.
- **Module layout** (`src/`): `main.js` (bootstrap + loop), `config.js`,
  `engine/math.js`, `render/{canvas,camera,renderer}.js`,
  `game/{world,cube,dirs,input}.js`, `levels/level1.js`, `ui.js`.
- **Works (verified):** rolling + hold-to-roll, ±1 climb/descend (180° pivot), edging
  (cling / commit / recover), the moving platform carrying the cube, collapsing amber
  fallers, prism pickup, fading trail, goal/win, pause (P/Esc), tuning panel (T),
  restart (R).

## Key decisions to remember (still in force)

- **Canvas 2D hand-rolled renderer, NOT WebGL/three.js.** The original three.js version
  crashed on software/lowp GL contexts. Do **not** reintroduce WebGL/three.js without a
  proven reason. This is the single most important constraint.
- **Vanilla JS, no game engine** (Phaser/Pixi are overkill/mismatched). Keep it a static,
  build-to-`dist` site. Don't add dependencies without asking.
- **No audio, no backend/accounts** for the core demo.
- **TypeScript: deferred** (later, not now).
- **License: all-rights-reserved-for-now**, open-source later (owner's call on timing).
  Keep the fan-work / non-affiliation framing intact.
- **The look is dictated by EDGE** (light bg, glossy white blocks, magenta cube, cyan
  prisms). Do **not** apply the editorial/brutalist portfolio aesthetic here.
- Working style: direct and concise, plain language (analogies help); **plan before
  building anything visual and get sign-off first**; verify capabilities rather than
  assuming.

## What's next (roadmap, in order)

1. **Mobile touch controls** *(next up)* — design approved. Cross + Diamond D-pads,
   switchable via a settings toggle (persist in `localStorage`), gear button for the
   tuning panel. Touch must feed the **same** input path (`heldKeys`/`bufferedDir`) so
   hold-to-roll works for free. Show only on coarse-pointer/touch devices.
   Spec: `controls-mockup.html` in the repo.
2. **Fixed-timestep loop + render interpolation** — make rolls land identically at any
   refresh rate (currently variable-`dt`). First tests land alongside this.
3. **Static/dynamic render split** — cache the static floor; only redraw moving geometry.
4. **Robustness** — `unhandledrejection` handler + auto-pause on `visibilitychange`
   (the rAF loop suspends while the tab is hidden; the beat clock/timer should pause too).
5. **JSON level loader + real levels** — promote the inline `LEVEL` literal to a schema +
   loader, then rebuild actual EDGE stages.
6. **Polish & deploy hardening** — object pooling, device profiling, error telemetry.

## Known gaps (acknowledged, not urgent)

- No test suite yet (planned with the fixed-timestep refactor, roadmap step 2).
- Timer/beat clock keep running if the tab is hidden mid-game (roadmap step 4 fixes).

## Open questions to confirm when relevant

- Expose flat-roll speed in the tuning panel too? (climb speed already is.)
- Keep the amber tint on faller tiles? (prototype aid; not canon EDGE.)
- When to introduce TypeScript.
- When to flip to an open-source license.

---

*For full history and per-change detail, see `CHANGELOG.md`. For original rationale and
the decision log, see `HANDOFF_edge.md`. For Claude Code sessions, `CLAUDE.md` in the
repo root is the bootstrap — no pasting needed there.*
