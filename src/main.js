// ===== BOOTSTRAP + MAIN LOOP =====
import { ctx, W, H, resize } from './render/canvas.js';
import { computeView, depthOf } from './render/camera.js';
import { pushBox, fillPoly, drawPrism, drawGoal, trailQuad, sceneBlocks } from './render/renderer.js';
import { tick as worldTick, resetWorld, goalH, movers, moverVisual } from './game/world.js';
import { LEVEL } from './levels/level1.js';
import { initInput, clearInput } from './game/input.js';
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

function restart() {
  ui.hideWin(); ui.hideStart();
  resetWorld();
  cube.resetCube();
  clearInput();
  paused = false; ui.hidePause();
  stepper.reset(); resyncSnapshots();
  const s = cube.stats(); ui.updateHud(s.collected, s.total, s.timeMs);
  window.focus();
}

function onStart() {
  ui.hideStart(); clearInput(); paused = false; window.focus();
  cube.startGame();
  stepper.reset(); resyncSnapshots();
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
    list.push({ dep: depthOf([LEVEL.goal[0], LEVEL.goal[1], goalH + 0.02]) + 0.04, decal: 'goal' });
    for (const p of cube.prisms) { if (p.taken && p.pop >= 1) continue; list.push({ dep: depthOf([p.x, p.y, p.h + 0.55]) + 0.02, decal: 'prism', p }); }

    list.sort((a, b) => a.dep - b.dep);
    for (const it of list) {
      if (it.decal === 'trail') { fillPoly(trailQuad(it.t), '#d6249f', null, Math.max(0, it.t.life / 1.4) * 0.30); }
      else if (it.decal === 'goal') { drawGoal(animClock); }
      else if (it.decal === 'prism') { drawPrism(it.p, animClock); }
      else { fillPoly(it.pts, it.fill, it.stroke, it.alpha); }
    }

    requestAnimationFrame(frame);
  } catch (err) {
    window.showFatal('loop: ' + (err && err.message ? err.message : err));
  }
}

// ===== WIRE-UP =====
ui.initUI({ onStart, onAgain: restart, onResume: () => { if (paused) togglePause(); } });
initInput({ onTap: cube.onTap, onRestart: restart, onTune: ui.toggleTune, onPause: togglePause });

const s0 = cube.stats(); ui.updateHud(s0.collected, s0.total, s0.timeMs);

onResize();
resyncSnapshots();
window.addEventListener('resize', onResize);
requestAnimationFrame(frame);
