// ===== BOOTSTRAP + MAIN LOOP =====
import { ctx, W, H, resize } from './render/canvas.js';
import { computeView, depthOf } from './render/camera.js';
import { pushBox, fillPoly, drawPrism, drawGoal, trailQuad, sceneBlocks } from './render/renderer.js';
import { tick as worldTick, resetWorld, goalH } from './game/world.js';
import { LEVEL } from './levels/level1.js';
import { initInput, clearInput } from './game/input.js';
import { initTouch } from './touch.js';
import * as ui from './ui.js';
import * as cube from './game/cube.js';

const ST = cube.ST;

let paused = false, animClock = 0;

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
  const s = cube.stats(); ui.updateHud(s.collected, s.total, s.timeMs);
  window.focus();
}

function onStart() {
  ui.hideStart(); clearInput(); paused = false; window.focus();
  cube.startGame();
}

function onResize() { resize(); computeView(); }

// ===== MAIN LOOP =====
let prev = performance.now();
function frame(now) {
  try {
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now;

    if (!paused) {
      animClock += dt * 1000;
      // tick clock (movers + collapsing blocks)
      if (cube.state !== ST.START && cube.state !== ST.WON) worldTick(dt);
      // cube: timer, roll motion, idle sync, hold-to-roll, prism pop, trail aging
      cube.update(dt);
    }

    // cube display corners (rolls / edge wobble use the frozen animClock)
    const corners = cube.getDisplayCorners(animClock);

    // render (runs even while paused so the frozen frame stays visible)
    ctx.clearRect(0, 0, W, H);
    const list = [];
    for (const blk of sceneBlocks(animClock)) pushBox(list, blk.c, blk.hex, '#cdd6e3', blk.a);
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
initTouch({ onPause: togglePause, onRestart: restart, onTune: ui.toggleTune });

const s0 = cube.stats(); ui.updateHud(s0.collected, s0.total, s0.timeMs);

onResize();
window.addEventListener('resize', onResize);
requestAnimationFrame(frame);
