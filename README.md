# EDGE — browser recreation

A faithful, browser-playable recreation of the 2008 puzzle-platformer **EDGE**
(Two Tribes / Mobigame). Roll a cube across isometric tile levels, collect prisms,
reach the goal. Zero install — it runs in any modern browser.

This is a personal nostalgia / craft project, not a commercial product.

**▶ Play it: https://satejp10.github.io/EDGE/** (desktop keyboard · mobile touch)

> Original game: https://store.steampowered.com/app/38740/EDGE/

---

## Status

**Playable on desktop (keyboard) and mobile (touch).** The game lives in ES modules
under [`src/`](src/), built with Vite and deployed to GitHub Pages. The original
single-file prototype is kept as [`edge.html`](edge.html) for reference.

Next planned phase: static/dynamic render split and more levels. See
[CHANGELOG.md](CHANGELOG.md) for the running log and [the roadmap](#roadmap) below.

## Play it now

No build required:

```
open edge.html in any modern browser   (double-click, or serve the folder and open it)
```

After the Vite migration this becomes:

```
npm install   →   npm run dev   →   open the localhost URL Vite prints
```

## Controls (desktop)

| Key | Action |
|---|---|
| `W` `A` `S` `D` / arrow keys | Roll along the isometric diagonals |
| **hold** a direction | Keep rolling continuously |
| tap toward a ledge again | Commit the edge → fall; opposite tap → recover |
| `P` / `Esc` | Pause (freezes everything) |
| `R` | Restart |
| `T` | Tuning panel (climb speed, camera azimuth/elevation) |

The four moves land on screen **diagonals**: `↑`→up-right, `↓`→down-left,
`→`→down-right, `←`→up-left.

## Controls (mobile)

On coarse-pointer devices (or with `?touch` in the URL) an on-screen **D-pad** appears
bottom-left and round **⏸ / ⟳ / ⚙** system buttons bottom-right. The default
**diamond** pad points each arrow the way the cube actually moves on screen; a
**cross** layout is available via the toggle in the tuning panel (⚙), persisted in
`localStorage`. Hold an arrow to keep rolling; at a ledge, tap the same arrow again to
commit the fall — identical semantics to the keyboard, because the buttons feed the
same input path. Original mockup: [`controls-mockup.html`](controls-mockup.html).

---

## Architecture — and why

The single most important decision: **the renderer is hand-rolled Canvas 2D, not
WebGL / three.js.**

The first version used three.js + WebGL and **crashed** on machines that fell back to a
software WebGL context (lowp precision): `MeshStandardMaterial` failed to compile, and
three.js r128 then threw because the software driver returns `null` from
`gl.getParameter(gl.VERSION)`, which three calls string methods on without guarding.
Rather than keep patching three for a broken GL context, the whole renderer was rewritten
to plain Canvas 2D — **isometric projection + Rodrigues-rotation cube math + painter's-
algorithm depth sort**. Result: zero GPU dependency, can't hit those crashes, truly
offline single file.

> **Do not reintroduce WebGL / three.js casually.** Only on a confirmed
> hardware-accelerated context, and only if Canvas 2D genuinely can't keep up.

Other key choices:

- **Vanilla JS, no game engine.** The renderer is bespoke isometric math; Phaser (~500KB
  full framework) or Pixi (renderer-only) would sit unused or fight the hand-rolled
  pipeline.
- **Single HTML file (so far)** because it was the fastest way to prototype and is
  *already* a hostable static site. Graduating to **Vite + vanilla JS** right before the
  project grows (level editor, many levels).

### Core mechanics

- **Roll math:** flat roll = 90° pivot about the shared edge; ±1 step climb/descend =
  180° pivot. Steps ≥ +2 are walls (blocked); drops ≤ −2 are falls. Only ±1 is traversable.
- **Edging:** roll into a drop → the cube clings; re-tap the same direction = fall, opposite
  = recover. OS key-repeat is ignored so hold-to-roll can't fling you off a ledge.
- **Movers:** a global tick clock (BEAT ≈ 0.85s) drives moving platforms; they glide
  smoothly and carry a rider. Logical cell updates once per beat.
- **Fallers:** collapsing tiles cycle `solid → armed → falling → gone → rising → solid`,
  giving "keep moving" pressure with a retry.
- **Fall rule:** a dynamic `heightAt()` query (static cells + mover current cell + faller
  state) plus one rule — *no ground under the cube → fall* — handles vanished blocks and
  movers sliding away cleanly.

A fuller decision log and historical gotchas live in `HANDOFF_edge.md` (kept in-repo as
project context).

---

## Roadmap

1. ~~**Vite + vanilla-JS migration**~~ — DONE (v0.2.0).
2. ~~**Mobile touch controls**~~ — DONE: Cross + Diamond D-pads switchable via a settings
   toggle, feeding the same input path so hold-to-roll works for free. Auto-enabled on
   coarse-pointer devices; forced on any device with `?touch` in the URL (desktop testing).
3. ~~**Fixed-timestep loop + render interpolation**~~ — DONE: 120 Hz fixed sim +
   alpha-lerped rendering (`engine/loop.js`), first test suite via `npm test` (node:test).
4. **Static/dynamic render split** — cache the static floor; only redraw moving geometry.
5. **JSON level loader + real levels** — promote the inline `LEVEL` literal to a schema + loader.
6. **Polish & deploy** — object pooling, profiling, error telemetry; host on a free static host.

## Project layout

```
EDGE/
  index.html           # Vite entry (markup + CSS + early error overlay)
  vite.config.js       # base:'./' so the build runs from the Pages subpath
  package.json
  src/
    main.js            # bootstrap, wiring, main loop
    config.js          # timing constants + live-tunable settings
    engine/math.js     # vectors, rotAxis, rotAboutEdge
    render/            # canvas.js, camera.js, renderer.js
    game/              # world.js, cube.js, dirs.js, input.js
    levels/level1.js   # the level literal
    ui.js              # HUD, overlays, tuning panel
    touch.js           # mobile D-pad + system buttons (coarse-pointer, or ?touch)
  .github/workflows/deploy.yml   # build + deploy to GitHub Pages
  edge.html            # original single-file prototype (reference)
  controls-mockup.html # mobile control layout mockup (now implemented in src/touch.js)
  README.md
  CHANGELOG.md         # running log of changes & progress
  HANDOFF_edge.md      # original project handoff / decision log (context)
```

## Constraints / non-goals

- Must run in a plain browser with no mandatory backend, and survive weak/software GPU
  contexts (hence Canvas 2D).
- No audio, no accounts/backend for the core demo, no heavy game engine.
- No WebGL/three.js reintroduction unless the software-context crash is provably gone.

---

## License & affiliation

**Source-visible, not open-source (yet).** You're welcome to read the code and play the
game, but copying, redistribution, or reuse isn't permitted for now — see
[LICENSE](LICENSE). The plan is to adopt a proper open-source license once the project
matures.

This is an **unofficial, non-profit fan recreation**. EDGE was created by **Mobigame**
(published with **Two Tribes**); the name, design, and trademarks belong to their
respective owners. This project is not affiliated with or endorsed by them, and is not
monetized in any form. If you enjoy it, [buy the original](https://store.steampowered.com/app/38740/EDGE/).

## References

- Original game: https://store.steampowered.com/app/38740/EDGE/
- Fixed-timestep loop: https://gafferongames.com/post/fix_your_timestep/
- Canvas 2D performance: https://web.dev/articles/canvas-performance
- GC / jank & object pooling: https://v8.dev/blog/jank-busters
