# Handoff: EDGE — browser recreation

> Generated 2026-06-06 from a Claude.ai thread. Handoff seq: 1 (first).
> **This document is a hypothesis, not ground truth.** Treat every claim about the code as something to verify against the actual files, not a fact to trust. Run the Section 0 audit before doing any work.

---

## 0. Read me first — MANDATORY AUDIT (Claude Code: do this before anything else)

Before you write, edit, plan, or scaffold a single line, perform this audit and report what you find. Do not skip it. Everything below this section was written by an agent that could not see the code — your first job is to confirm reality matches it.

1. **Read this entire handoff**, top to bottom.
2. **Read `CLAUDE.md` / `AGENTS.md`** if they exist. This handoff supplements them; where they conflict, the existing config wins. Do not restate their contents.
3. **Open every file listed in Section 3.** Actually read them — do not rely on the descriptions here. The descriptions may be stale or wrong.
4. **Verify the stack.** Check that the dependencies and versions in Section 3 are actually installed (inspect `package.json` / `requirements.txt` / lockfiles / etc.). Note any mismatch.
5. **Confirm the stated state is real.** Run the build and/or dev command from Section 3 and run the test suite and linter if they exist. Record pass/fail. If there is no test command, say so.
6. **Check git.** Run `git status`, current branch, and recent `git log`. Confirm they match what Section 3 claims.
7. **Treat every claim above as a hypothesis.** Flag every drift you find in the form: *"Doc says X; reality is Y."*
8. **Report, then stop.** Post a short audit summary — what matched, what drifted, what's missing, and any blockers — and then **wait for the user's go-ahead.** Do not silently start building. (Only proceed straight into the Section 4 task if the resume prompt explicitly told you to.)

> **Expectation-setter for this specific project (still verify):** this is currently a **single self-contained `edge.html` file** — no `package.json`, no `CLAUDE.md`, no tests, possibly no git history yet. So steps 2/4/5/6 will mostly come back "not present." That is expected, not a failure — report it plainly. The whole point of the next phase is to give it a real project structure.

---

## 1. What we're building

- **One sentence:** A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE** (Two Tribes / Mobigame) — roll a cube across isometric tile levels, collect prisms, reach the goal.
- **Description:** A from-scratch isometric cube-rolling game that runs in any browser with zero install. It currently lives in one HTML file using a hand-rolled 3D-on-2D-canvas renderer. It is a personal/nostalgia passion project (the user finished the original twice across platforms), not a commercial product.
- **Definition of done / what success looks like:** anyone can open a URL and play a faithful EDGE recreation on **desktop (keyboard) and mobile (touch)**, across several real levels, with the code organized in a maintainable repo and hosted free.

---

## 2. Why — motivation, reasoning, and constraints

- **Why this project / why now:** nostalgia + craft. It's a beloved game the user wants to rebuild and be able to demo to anyone via a browser link. Enjoyment and learning, not revenue.
- **Why the key choices:**
  - **Canvas 2D hand-rolled renderer, NOT WebGL/three.js.** This is the single most important rationale in the whole project. The first version used three.js + WebGL and **crashed**, because the runtime fell back to a **software WebGL context (lowp precision)**. On that context: `MeshStandardMaterial` (PBR) failed to compile, and three.js r128 then threw because the software driver returns `null` from `gl.getParameter(gl.VERSION)` (and the shader-info-log queries), which three calls string methods on without guarding. Rather than keep patching three for a broken GL context, we rewrote the whole renderer to plain Canvas 2D (isometric projection + Rodrigues-rotation cube math + painter's-algorithm depth sort). Result: **zero GPU dependency, can't hit those crashes, truly offline single file.** → **Do not reintroduce WebGL/three.js casually.** Only consider it on confirmed hardware-accelerated contexts, and only if Canvas 2D genuinely can't keep up.
  - **Vanilla JS, not a game engine (planned: + Vite).** The renderer is bespoke isometric math; Phaser/Pixi would sit unused or fight the hand-rolled pipeline. Vanilla carries this game far. (Research-backed: Pixi is a renderer-only lib, Phaser is a ~500KB full framework — both are overkill/mismatched here.)
  - **Single HTML file (so far) because** it was the fastest way to prototype and it is *already* a hostable static site. The agreed plan is to graduate it to a small **Vite + vanilla-JS** repo right before the project grows (level editor, many levels).
- **Hard constraints:**
  - Must run in a plain browser by loading the page. No mandatory backend.
  - Must survive weak/software GPU contexts (hence Canvas 2D).
  - Desktop = keyboard; mobile = on-screen touch controls.
  - Performance target: stable 60fps, designed-in (see Section 4 directions), polished later.
- **Non-goals — explicitly out of scope (resist these temptations):**
  - No WebGL/three.js reintroduction unless the software-context crash is provably gone.
  - No audio/music (the user explicitly said none needed).
  - No backend, accounts, or online services for the core demo.
  - No heavy game engine (Phaser/Pixi/Unity) unless a real need appears.
  - Don't gold-plate performance now — build *with it in mind*, optimize in the finishing phase.

### Decision log

| Decision | Reason | Alternatives rejected (and why) |
|---|---|---|
| Isometric **Canvas 2D** software renderer | Software/lowp WebGL context crashes three.js; 2D has no GPU dependency and still nails the look | three.js/WebGL — crashed on `getParameter(VERSION)` null + PBR shader compile on lowp |
| 1-unit step climb/descend = **180° pivot** about the shared edge; flat roll = 90° | It's the exact rigid-body motion; verified numerically (lands on correct cell + height, rotation matrix stays clean integers) | Two-stage / 90° hacks — wrong final pose / float drift |
| Steps **≥ +2 = wall (blocked)**, drops **≤ −2 = fall** | Matches EDGE feel; only ±1 is traversable | Allowing multi-step climbs — not faithful |
| **Edging**: roll into a drop → cube clings; re-tap same dir = fall, opposite = recover; **OS key-repeat ignored** | Faithful edging + a safety so hold-to-roll can't fling you off a ledge | Auto-commit on hold — accidental deaths |
| **Tick clock** (BEAT ≈ 0.85s) drives movers; movers glide + carry rider; logical cell = one per beat | Clean collision while still gliding smoothly | Continuous-position collision — fractional-cell headaches |
| **Fallers**: armed (~0.45s, amber flash) → fall (~0.35s) → gone (~2s) → reform | "Keep moving" pressure with retry | Permanent collapse — unforgiving for a demo |
| Dynamic `heightAt()` (static + mover cell + faller state) + rule **"no ground under cube → fall"** | One rule cleanly handles vanished blocks and movers sliding away | Per-feature fall checks — brittle |
| Continuous **hold-to-roll** + tap buffering | Responsiveness; original rolls continuously while held | One-move-per-press — felt dead (user complaint that triggered this) |
| **Pause** (P/Esc) freezes tick clock, timer, cube, *and cosmetics* (via `animClock`) | A real pause, not just input lock | Pausing input only — clock/visuals kept moving |
| **Tuning panel** (T): climb-speed ×, camera azimuth, camera elevation | Feel is subjective — give the user live knobs instead of guessing values | Hardcoding magic numbers blindly |
| Camera parameterized `setCamera(azim,elev)`; `depthOf = dot(p, zc)` | Lets the angle change while painter sorting stays correct (zc is unit) | Fixed `x+y+z` depth — breaks at non-default angles |
| Amber tint on faller blocks | Prototype readability aid so players see which tiles are dangerous | (Note: EDGE doesn't tint them — easy to drop later) |
| `crossorigin="anonymous"` on scripts + visible error overlay + loop `try/catch` | Surfaces real errors instead of opaque cross-origin "Script error." | Bare external script tag — masked the real crash |

---

## 3. Current state — where the project is

- **Stage:** **Working single-file prototype.** One HTML file, fully playable, confirmed running by the user. No repo structure / build / tests yet.
- **Stack (current):** HTML5 + vanilla JavaScript + Canvas 2D API. **No build step, no dependencies, no package manager, no framework.**
- **Stack (planned next):** **Vite + vanilla JS** (TypeScript optional later), split into modules (engine / renderer / input / levels), deployed as a static site (itch.io, GitHub Pages, Netlify, or Cloudflare Pages — all free; user is already on GitHub `Satejp10` and connected to Netlify + Cloudflare).
- **Target environment:** the user runs **Windows + CachyOS (Linux)** on the same machine. Node/npm/Vite are cross-platform; **confirm which OS the Claude Code session is on** before assuming shell/path conventions.

### How to get it running
Current (no build):
```
open edge.html in any modern browser   (double-click, or: serve the folder and open it)
```
Planned (after migration):
```
npm install   →   npm run dev   →   open the localhost URL Vite prints
```
- **Env vars / secrets required (names only):** none. This project has no secrets.

### File inventory
> Place the two files from the chat (`edge.html`, `controls-mockup.html`) into the repo before auditing. Line numbers below are approximate — find regions by the named functions, and **read the file rather than trusting this**.

- `edge.html` — **(the entire game)** ~470 lines, single file (HTML + CSS + one inline `<script>` IIFE). Self-contained, no deps. Internal regions, in order:
  - **`LEVEL` object** — the one hardcoded level. Shape: `start:[x,y]`, `goal:[x,y]`, `cells:[[x,y,height],…]` (static, *safe* checkpoints), `fallers:[[x,y,height],…]`, `movers:[{path:[[x,y],…], h, mode:'pingpong'|'loop'}]`, `prisms:[[x,y],…]`. **This is the level "format" — currently a JS literal, no loader.**
  - **Canvas setup + `resize()`** — caps `devicePixelRatio` at 2 (deliberate perf choice).
  - **Math helpers** — `sub/dot/cross/norm/lerp/ease`, `rotAxis` (Rodrigues), `rotAboutEdge`.
  - **Camera** — `setCamera(azimDeg, elevDeg)` builds `zc/xc/yc/camDir`; default `(45, 35.26)` == classic (1,1,1) iso. `computeView()` frames the level; `project(p)` → screen; `depthOf(p)=dot(p,zc)` (painter sort key).
  - **Render primitives** — `shade()`, `boxCorners()`, `FACES`, `pushBox()` (backface-culls, pushes per-face draw records with averaged depth).
  - **Dynamic world** — `staticMap`, `fallerList`/`fallerMap`, `movers`; `moverVisual()` (eased glide), `moverAt()`, `isSafe()`, **`heightAt(x,y)`** (the live collision query: static + mover-current-cell + faller-solid/armed), `armFaller()`, `beatAdvanceMovers()`, `updateFallers()` (the faller state machine).
  - **Cube state** — `ST` enum (START/IDLE/ROLLING/EDGING/FALLING/WON), `pos`, `lastSafe{x,y,h}`, `C` (center), `R` (orientation basis), `cubeAlpha`, `collected`, `timeMs`, `timing`, `beatPhase`, `ridingMover`, `HALF`, `LOCAL`, `baseCorners()`, `DIRS` (per-key dx/dy/axis/theta/off).
  - **Roll machinery** — `beginRoll()` (classifies a move via `heightAt` into roll/climb/down/edge or blocks it; sets pivot, target angle, speed), `commitEdge()`, `bakeRoll()` (rotates + snaps to grid/surface), `finalizeRoll()`, `startFall()`, `tickFall()` (drop + respawn at `lastSafe`), **`idleSync()`** (rides movers, the "no ground → fall" safety, prism pickup).
  - **Prisms / trail / goal** — `prisms[]`, `trail[]`, `dropTrail()`, `checkPrism()`, `win()`.
  - **Input** — `heldKeys` Set + `bufferedDir`; `keydown` (R restart, T tune, P/Esc pause, direction handling, edge-commit on fresh tap, **ignores `e.repeat`**), `keyup`, **`nextDir()`** (most-recent held / buffered), start/again buttons, `togglePause()`, resume button.
  - **Tuning panel** — `toggleTune()`, sliders `t_climb` / `t_azim` / `t_elev`, `applyCam()`.
  - **HUD** — `fmt()`, `updateHud()`.
  - **Draw helpers** — `fillPoly()`, `drawPrism()`, `drawGoal()`, `trailQuad()`, **`sceneBlocks(t)`** (builds all current blocks each frame).
  - **Main loop `frame(now)`** — `dt` capped at 0.05; **all updates gated behind `!paused`**; `animClock` advances only when unpaused (freezes cosmetics); tick clock → cube motion → `idleSync()` → **auto-move** (`nextDir()`→`beginRoll`, this is hold-to-roll) → prism pop → trail aging; then builds cube corners, renders (sceneBlocks→pushBox, cube, decals, depth-sort, draw); `requestAnimationFrame`.
  - **Top `<script>`** — `showFatal()` + `window 'error'` listener → red overlay (`#fatal`).
- `controls-mockup.html` — **(reference only, not game code)** ~95 lines. A static visual mockup of the **approved mobile control layout**: shows BOTH D-pad styles side by side (Cross ▲▼◀▶ and Diamond ↖↗↙↘) plus the system buttons (Pause ⏸ / Restart ⟳ / Tune ⚙). Use it as the visual spec when building real touch controls.

**Intended structure (not yet created) — proposed for the Vite migration:**
```
edge/
  index.html
  package.json
  vite.config.js
  src/
    main.js          # bootstrap, canvas, loop
    engine/
      loop.js        # FIXED-TIMESTEP loop + interpolation (see Section 4)
      math.js        # vectors, rotAxis, rotAboutEdge
    render/
      camera.js      # setCamera, project, depthOf
      renderer.js    # pushBox/shade/fillPoly; STATIC vs DYNAMIC split
    game/
      world.js       # heightAt, movers, fallers, tick clock
      cube.js        # roll/climb/edge/fall state machine
      input.js       # keyboard + touch (D-pad) unified
    levels/
      schema.md      # the level JSON shape
      *.json         # real levels
```

### Status
- **Works (user-confirmed in browser):** rolling (4-dir); continuous hold-to-roll + tap buffering; ±1 climb/descend (180° pivot); edging (cling/commit/recover); moving platforms (tick glide + carry rider); collapsing fallers (full lifecycle); prisms, fading trail, goal ring, win screen, restart; pause (freezes everything); tuning panel (T); error overlay.
- **Verified by tooling during the build (NOT by a human play-through of every path):** JS syntax (`node --check`); the climb/descend landing coordinates + rotation matrix integrity (numeric unit test); mover ping-pong sequence, dynamic `heightAt`, and faller lifecycle (logic simulation). Treat these as "logic-correct, visually unconfirmed in edge cases."
- **In progress / NOT built yet:**
  - **Mobile touch controls** — DESIGN APPROVED, not coded. Decisions locked: support **both** Cross and Diamond D-pads switchable via a **settings toggle**; include a **gear** button for the tuning panel. Touch must feed the *same* `heldKeys`/`bufferedDir` input path so hold-to-roll works for free. Show only on touch/coarse-pointer devices.
  - Vite migration; fixed-timestep loop refactor; static/dynamic render split; `unhandledrejection` handler; Page-Visibility auto-pause.
  - JSON level loader + multiple real levels (currently one inline `LEVEL`).

### Known errors, gotchas, and dead ends
- **Verbatim errors (historical — these are why the architecture is what it is):**
  - `THREE.WebGLRenderer: highp not supported, using lowp instead.` (warning — signals the software/lowp context)
  - `Uncaught TypeError: Cannot read properties of null (reading 'indexOf')` at `three.min.js:6` — three r128 calling `gl.getParameter(gl.VERSION).indexOf(...)` on a `null` the software driver returned (around line 14617 of unminified three).
  - `Uncaught Error: Script error.` — cross-origin masking of the real error before `crossorigin="anonymous"` was added to the script tag.
- **Gotchas:**
  - Software WebGL returns `null` from `gl.getParameter(VERSION / SHADING_LANGUAGE_VERSION)`; three doesn't guard it. (Moot now that we're Canvas 2D — but it's the reason we're Canvas 2D.)
  - Cross-origin `<script>` masks errors as "Script error." → always set `crossorigin="anonymous"` on external scripts.
  - **Isometric control mapping:** the four moves land on screen *diagonals*. `ArrowUp`(−x)→up-right, `ArrowDown`(+x)→down-left, `ArrowRight`(+y)→down-right, `ArrowLeft`(−y)→up-left. This is why the Diamond D-pad (↖↗↙↘) maps more intuitively than a Cross — keep the mapping consistent when wiring touch.
  - The 180° climb flips the cube's orientation; harmless because faces are untextured (edge strokes only), and the rotation matrix rounds back to clean integers.
  - Mover collision *leads* the visual glide by up to one beat (logical cell = the destination for the whole beat). Acceptable; note it if you touch boarding timing.
  - `localStorage`/`sessionStorage` **do not work inside the Claude.ai artifact preview**, but **do** work in a normally-hosted/opened file — so persisting the D-pad-style setting via localStorage is fine once this is a real hosted site.
- **Dead ends (do not retry):**
  - three.js + WebGL on a software/lowp context — crashes (see above). Abandoned for Canvas 2D.
  - An earlier Canvas-2D revision had a **duplicated roll-advance block** that ran rolls at ~2× speed with an overshoot — already removed; don't reintroduce a second `roll.phi` advance.

---

## 4. Pick up here — next steps

- **The immediate next task (do this one thing first):** **Scaffold a Vite + vanilla-JS project and port `edge.html` into it with behavior unchanged** — same gameplay, same look, same controls — just reorganized into the module layout in Section 3. Do this as a faithful, mechanical migration *before* adding any new feature, **because** every later improvement (mobile controls, fixed-timestep loop, render split, more levels) is far cleaner on a real project structure than bolted onto a 470-line single file, and doing it behavior-preserving first means any regression is obviously a migration bug, not a design change.
- **Acceptance criteria for it:**
  - `npm run dev` serves the game; it plays **identically** to `edge.html`: rolling, hold-to-roll, ±1 climb/descend, edging (cling/commit/recover), the moving platform carrying the cube, the collapsing amber bridge, prism pickup, goal/win, pause (P/Esc), and the tuning panel (T) all work.
  - Zero console errors/warnings during a normal play-through.
  - `npm run build` produces a static `dist/` that also runs when served.
  - The single-file behavior and the modular behavior are visually indistinguishable (spot-check the moving platform + climb, which are the trickiest).
- **Then, in order:**
  1. **Mobile touch controls** (design approved). D-pad bottom-left + Pause/Restart/Tune bottom-right; **both Cross and Diamond layouts**, switchable in a settings toggle (persist the choice in `localStorage`); touch dispatches into the existing `heldKeys`/`bufferedDir` path so hold-to-roll and tap-to-commit-edge work unchanged. Show only on coarse-pointer/touch devices. Use `controls-mockup.html` as the spec.
  2. **Fixed-timestep game loop + render interpolation** (`accumulator += dt; while(accumulator >= STEP){ update(STEP) } render(accumulator/STEP)`), **because** the cube roll is currently variable-`dt`, which makes timing framerate-dependent and levels non-replayable; a fixed step makes rolls land identically at 30/60/144 Hz and keeps the speedrun timer fair. Keep the existing 0.05s dt cap to avoid the post-tab-switch jump and guard against the "spiral of death."
  3. **Static/dynamic render split** — the floor never moves, so cache its projected faces (or draw to an offscreen canvas) once per camera change instead of rebuilding `sceneBlocks()` + re-projecting every frame; only the cube/movers/fallers need per-frame work.
  4. **Cheap robustness:** add a `window 'unhandledrejection'` handler, and auto-pause on `visibilitychange` (rAF already throttles when hidden, but the beat clock + timer don't).
  5. **JSON level loader + real levels** — promote the inline `LEVEL` literal to a small JSON schema + loader; then start rebuilding actual EDGE stages. This is the point where structure pays off.
  6. **Later perf:** object pooling / reuse buffers in the loop (the loop allocates arrays per frame — fine at this scale, the eventual jank source as levels grow); profile on real devices; add Sentry for production error telemetry; deploy to itch.io / GitHub Pages / Netlify / Cloudflare Pages.
- **Open questions / decisions still pending (flag, don't assume):**
  - **Migrate now vs. demo-the-single-file-now:** the user weighed hosting `edge.html` immediately for a quick demo and migrating later. Invoking this handoff implies "migrate now," but confirm — they may want the single file hosted first, and/or mobile controls bolted onto the single file before the migration. **Ask which they want before executing the Section 4 task.**
  - Flat-roll speed (`ROLL_SPEED`) is fixed; the user may want it exposed in the tuning panel too.
  - Whether to keep the amber faller tint (prototype aid, not canon EDGE).
  - TypeScript now or later.

---

## 5. Working agreements & preferences

> No `CLAUDE.md` exists yet. **Consider creating one** from the items below so future sessions inherit them automatically.

- **Code conventions / libraries:** vanilla JS, no framework; **do not add dependencies (especially WebGL/three.js or a game engine) without asking and a clear reason.** Keep it a static, build-to-`dist` site.
- **How the user wants the agent to work:**
  - Direct, concise, **no filler**. ADHD-friendly chunking. Prefer **one clear recommendation** over a menu of options.
  - **Plan before building anything visual** — propose the design/approach and get explicit sign-off *before* coding. The user dislikes having tokens/effort spent on a full build before seeing the direction.
  - **Verify platform/tool/feature capabilities (web search) before building — never assume from memory.**
  - "**dark mode**" = OS/app UI preference, **not** a dark visual aesthetic. Don't darken the game on that word.
  - **Aesthetic is chosen per project.** This game's look is dictated by **EDGE** (light bg, glossy white blocks, magenta cube, cyan prisms). The user's editorial/brutalist style is *only* his portfolio brand — **do not apply it here.**
- **Suggested skills for Claude Code to invoke:**
  - `engineering-project-planner` — to phase the migration + remaining features into a realistic plan.
  - `frontend-design` — only for any new UI chrome (settings panel, menus); keep the game canvas faithful to EDGE.

---

## 6. References (don't duplicate — link out)

- Original game: https://store.steampowered.com/app/38740/EDGE/
- Fixed-timestep loop (the canonical source for Section 4 step 2): https://gafferongames.com/post/fix_your_timestep/
- Canvas 2D performance (pre-render, layered canvases, integer coords): https://web.dev/articles/canvas-performance
- GC/jank + object pooling rationale: https://v8.dev/blog/jank-busters
- `controls-mockup.html` — the approved mobile control layout (in this repo).

---

## Resume prompt — paste this into a fresh Claude Code session

```
Read HANDOFF_edge.md in this repo in full. Run the Section 0 audit (open every listed
file — edge.html and controls-mockup.html — verify the stack, attempt the run command,
check git) and report any drift between the doc and reality. Treat the document as
context to verify, not fact.

Note this is currently a single self-contained edge.html with no build/tests/CLAUDE.md
— report that plainly, it's expected. Then explore the code, confirm your understanding
of the renderer and the roll/edge/mover/faller state machine, and before making any
changes, ask me one thing: migrate to a Vite repo now (the Section 4 immediate task) or
do something else first. Wait for my go-ahead.
```
