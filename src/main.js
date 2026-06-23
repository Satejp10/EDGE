// ===== BOOTSTRAP + MAIN LOOP =====
import { ctx, W, H, resize } from './render/canvas.js';
import { computeView, depthOf } from './render/camera.js';
import { pushBox, fillPoly, drawPrism, drawPrismMark, drawGoal, trailQuad, sceneBlocks } from './render/renderer.js';
import { tick as worldTick, initWorld, goalH, movers, moverVisual } from './game/world.js';
import { getLevel, setLevel, levelCount } from './levels/registry.js';
import { initInput, clearInput } from './game/input.js';
import { initTouch } from './touch.js';
import { createStepper } from './engine/loop.js';
import { lerp } from './engine/math.js';
import { FIXED_DT } from './config.js';
import * as ui from './ui.js';
import * as cube from './game/cube.js';

const ST = cube.ST;

let paused = false, animClock = 0;

// ===== FIXED-TIMESTEP SIM + RENDER INTERPOLATION =====
// The sim advances in FIXED_DT steps (identical behavior at any refresh rate);
// rendering lerps cube corners and mover positions between the last two sim states.
let prevCorners = null, currCorners = null;
let prevMovers = null, currMovers = null;

function snapshot() {
  prevCorners = currCorners; currCorners = cube.getDisplayCorners(animClock);
  prevMovers = currMovers; currMovers = movers.map((m) => moverVisual(m));
}

// After a reset/teleport the old snapshot is stale — make prev == curr so the
// first rendered frame doesn't smear across the jump.
function resyncSnapshots() {
  currCorners = cube.getDisplayCorners(animClock); prevCorners = currCorners;
  currMovers = movers.map((m) => moverVisual(m)); prevMovers = currMovers;
}

function stepSim(dt) {
  animClock += dt * 1000;
  // tick clock (movers + collapsing blocks)
  if (cube.state !== ST.START && cube.state !== ST.WON) worldTick(dt);
  // cube: timer, roll motion, idle sync, hold-to-roll, prism pop, trail aging
  cube.update(dt);
  snapshot();
}

const stepper = createStepper(FIXED_DT, stepSim);

const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const SNAP2 = 0.6 * 0.6; // a jump this large in one step is a teleport (respawn) — snap, don't lerp

function lerpedCorners(alpha) {
  if (!prevCorners) return currCorners;
  const dx = currCorners[0][0] - prevCorners[0][0];
  const dy = currCorners[0][1] - prevCorners[0][1];
  const dz = currCorners[0][2] - prevCorners[0][2];
  if (dx * dx + dy * dy + dz * dz > SNAP2) return currCorners;
  return currCorners.map((c, i) => lerp3(prevCorners[i], c, alpha));
}

function lerpedMovers(alpha) {
  if (!prevMovers) return currMovers;
  return currMovers.map((p, i) => [lerp(prevMovers[i][0], p[0], alpha), lerp(prevMovers[i][1], p[1], alpha)]);
}

function togglePause() {
  if (cube.state === ST.START || cube.state === ST.WON) return;
  paused = !paused;
  ui.setPauseVisible(paused);
  if (!paused) window.focus();
}

// ===== LEVEL ORCHESTRATION =====
// The single path that (re)builds world + cube + camera + render snapshots from a
// level. play:false leaves the START screen up (first boot); play:true drops
// straight into IDLE (start / restart / next level).
let currentLevelIndex = 0;

function loadLevel(index, { play = false } = {}) {
  currentLevelIndex = index;
  setLevel(index);
  initWorld();        // rebuild static/faller/mover state + goalH
  cube.initCube();    // rebuild cube + prisms from the new level (reads world heights)
  computeView();      // reframe the camera for the new layout
  clearInput();
  paused = false; ui.hidePause(); ui.hideWin();
  ui.setWinButtonLabel(index + 1 < levelCount() ? 'NEXT LEVEL →' : 'PLAY AGAIN');
  if (play) { ui.hideStart(); cube.startGame(); window.focus(); }
  stepper.reset(); resyncSnapshots();
  const s = cube.stats(); ui.updateHud(s.collected, s.total, s.timeMs);
}

function restart() { loadLevel(currentLevelIndex, { play: true }); }
function onStart() { loadLevel(currentLevelIndex, { play: true }); }

// Win-screen button: advance to the next level, or loop back to the first.
function onAgain() {
  const next = currentLevelIndex + 1;
  loadLevel(next < levelCount() ? next : 0, { play: true });
}

function onResize() { resize(); computeView(); }

// ===== MAIN LOOP =====
let prev = performance.now();
function frame(now) {
  try {
    const frameDt = (now - prev) / 1000; prev = now;

    if (!paused) stepper.advance(frameDt); // hitch clamping lives in the stepper
    const alpha = stepper.alpha();

    // interpolated display state (a frozen alpha while paused keeps the frame static)
    const corners = lerpedCorners(alpha);
    const moverPos = lerpedMovers(alpha);

    // render (runs even while paused so the frozen frame stays visible)
    ctx.clearRect(0, 0, W, H);
    const list = [];
    for (const blk of sceneBlocks(animClock, moverPos)) pushBox(list, blk.c, blk.hex, '#cdd6e3', blk.a);
    pushBox(list, corners, 0xd6249f, '#7a0e5e', cube.cubeAlpha);
    for (const t of cube.trail) list.push({ dep: depthOf([t.x, t.y, t.h + 0.012]) + 0.05, decal: 'trail', t });
    const goal = getLevel().goal;
    list.push({ dep: depthOf([goal[0], goal[1], goalH + 0.02]) + 0.04, decal: 'goal' });
    for (const p of cube.prisms) {
      if (p.taken && p.pop >= 1) continue;
      list.push({ dep: depthOf([p.x, p.y, p.h + 0.02]) + 0.02, decal: 'prismMark', p }); // floor-level marker
      list.push({ dep: depthOf([p.x, p.y, p.h + 0.55]) + 0.02, decal: 'prism', p });      // floating gem
    }

    list.sort((a, b) => a.dep - b.dep);
    for (const it of list) {
      if (it.decal === 'trail') { fillPoly(trailQuad(it.t), '#d6249f', null, Math.max(0, it.t.life / 1.4) * 0.30); }
      else if (it.decal === 'goal') { drawGoal(animClock); }
      else if (it.decal === 'prismMark') { drawPrismMark(it.p); }
      else if (it.decal === 'prism') { drawPrism(it.p, animClock); }
      else { fillPoly(it.pts, it.fill, it.stroke, it.alpha); }
    }

    requestAnimationFrame(frame);
  } catch (err) {
    window.showFatal('loop: ' + (err && err.message ? err.message : err));
  }
}

// ===== WIRE-UP =====
ui.initUI({ onStart, onAgain, onResume: () => { if (paused) togglePause(); } });
initInput({ onTap: cube.onTap, onRestart: restart, onTune: ui.toggleTune, onPause: togglePause });
initTouch({ onPause: togglePause, onRestart: restart, onTune: ui.toggleTune });

resize();                       // size the canvas before computeView() reads W/H
loadLevel(0, { play: false });  // show the start screen on level 1 (camera/HUD/snapshots set)
window.addEventListener('resize', onResize);
requestAnimationFrame(frame);
