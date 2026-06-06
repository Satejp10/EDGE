// ===== CUBE STATE + ROLL MACHINERY =====
import { rotAxis, rotAboutEdge } from '../engine/math.js';
import { ROLL_SPEED, EDGE_FRAC, settings } from '../config.js';
import { LEVEL } from '../levels/level1.js';
import { DIRS } from './dirs.js';
import {
  heightAt, isSafe, moverAt, moverVisual, armFaller, fallerMap, staticMap,
} from './world.js';
import { nextDir, setBufferedDir } from './input.js';
import { updateHud, showWin } from '../ui.js';

export const ST = { START: 0, IDLE: 1, ROLLING: 2, EDGING: 3, FALLING: 4, WON: 5 };

export let state = ST.START;
let pos = { x: LEVEL.start[0], y: LEVEL.start[1] };
let lastSafe = { x: pos.x, y: pos.y, h: heightAt(pos.x, pos.y) };
let C = [pos.x, pos.y, heightAt(pos.x, pos.y) + 0.5];
let R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export let cubeAlpha = 1;
let collected = 0, timeMs = 0, timing = false;
let ridingMover = null;

const HALF = 0.45;
const LOCAL = [
  [-HALF, -HALF, -HALF], [HALF, -HALF, -HALF], [HALF, HALF, -HALF], [-HALF, HALF, -HALF],
  [-HALF, -HALF, HALF], [HALF, -HALF, HALF], [HALF, HALF, HALF], [-HALF, HALF, HALF],
];
function baseCorners() {
  return LOCAL.map((L) => [
    C[0] + L[0] * R[0][0] + L[1] * R[1][0] + L[2] * R[2][0],
    C[1] + L[0] * R[0][1] + L[1] * R[1][1] + L[2] * R[2][1],
    C[2] + L[0] * R[0][2] + L[1] * R[1][2] + L[2] * R[2][2],
  ]);
}

let roll = null, edgeDir = null, edgePivot = null, fallT = 0;

function beginRoll(key) {
  if (state !== ST.IDLE) return;
  const dir = DIRS[key]; if (!dir) return;
  if (ridingMover) { C = [pos.x, pos.y, ridingMover.h + 0.5]; } // snap before leaving a moving platform
  const hc = heightAt(pos.x, pos.y); if (hc === null) return;
  const nx = pos.x + dir.dx, ny = pos.y + dir.dy; const hn = heightAt(nx, ny);
  const px = pos.x + dir.off[0], py = pos.y + dir.off[1];
  timing = true;
  if (hn === null || hn <= hc - 2)  { roll = { dir, phi: 0, target: dir.theta * EDGE_FRAC, kind: 'edge',  pivot: [px, py, hc],     speed: ROLL_SPEED }; }
  else if (hn === hc)               { roll = { dir, phi: 0, target: dir.theta,             kind: 'roll',  pivot: [px, py, hc],     speed: ROLL_SPEED }; }
  else if (hn === hc + 1)           { roll = { dir, phi: 0, target: dir.theta * 2,         kind: 'climb', pivot: [px, py, hc + 1], speed: settings.climbSpeed }; }
  else if (hn === hc - 1)           { roll = { dir, phi: 0, target: dir.theta * 2,         kind: 'down',  pivot: [px, py, hc],     speed: settings.climbSpeed }; }
  else return; // wall too tall
  ridingMover = null;
  state = ST.ROLLING;
}

function commitEdge(key) {
  const dir = DIRS[key]; if (!dir) return; const cur = edgeDir;
  if (dir.dx === cur.dx && dir.dy === cur.dy) {
    roll = { dir: cur, phi: cur.theta * EDGE_FRAC, target: cur.theta, kind: 'fall', pivot: edgePivot, speed: ROLL_SPEED }; state = ST.ROLLING;
  } else if (dir.dx === -cur.dx && dir.dy === -cur.dy) {
    roll = { dir: cur, phi: cur.theta * EDGE_FRAC, target: 0, kind: 'recover', pivot: edgePivot, speed: ROLL_SPEED }; state = ST.ROLLING;
  }
}

function bakeRoll(r) {
  R = R.map((col) => rotAxis(col, r.dir.axis, r.target)).map((col) => col.map((v) => Math.round(v)));
  C = rotAboutEdge(C, r.pivot, r.dir.axis, r.target);
  const nx = Math.round(C[0]), ny = Math.round(C[1]); const h = heightAt(nx, ny);
  C = [nx, ny, (h === null ? C[2] : h + 0.5)]; pos = { x: nx, y: ny };
}

function finalizeRoll() {
  const k = roll.kind, dir = roll.dir;
  if (k === 'roll' || k === 'climb' || k === 'down') {
    bakeRoll(roll);
    if (isSafe(pos.x, pos.y)) { lastSafe = { x: pos.x, y: pos.y, h: staticMap.get(pos.x + ',' + pos.y) }; ridingMover = null; }
    else {
      const m = moverAt(pos.x, pos.y);
      if (m) { ridingMover = m; }
      else { ridingMover = null; if (fallerMap.has(pos.x + ',' + pos.y)) armFaller(pos.x, pos.y); }
    }
    dropTrail(pos.x, pos.y); checkPrism();
    if (pos.x === LEVEL.goal[0] && pos.y === LEVEL.goal[1]) { win(); roll = null; return; }
    state = ST.IDLE;
  } else if (k === 'edge') { edgeDir = dir; edgePivot = roll.pivot; state = ST.EDGING; }
  else if (k === 'recover') { state = ST.IDLE; }
  else if (k === 'fall') {
    R = R.map((col) => rotAxis(col, dir.axis, roll.target));
    C = rotAboutEdge(C, roll.pivot, dir.axis, roll.target); state = ST.FALLING; fallT = 0;
  }
  roll = null;
}

function startFall() { ridingMover = null; state = ST.FALLING; fallT = 0; }

function tickFall(dt) {
  fallT += dt; C[2] -= dt * 7 * Math.min(1, fallT * 3); cubeAlpha = Math.max(0, 1 - fallT * 1.5);
  if (fallT > 0.8) {
    pos = { x: lastSafe.x, y: lastSafe.y }; C = [pos.x, pos.y, lastSafe.h + 0.5];
    R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; cubeAlpha = 1; ridingMover = null; state = ST.IDLE;
  }
}

function idleSync() {
  if (ridingMover) {
    const vp = moverVisual(ridingMover);
    pos = { x: ridingMover.cur[0], y: ridingMover.cur[1] };
    C = [vp[0], vp[1], ridingMover.h + 0.5];
    checkPrism();
    if (pos.x === LEVEL.goal[0] && pos.y === LEVEL.goal[1]) win();
  } else if (heightAt(pos.x, pos.y) === null) {
    startFall();
  } else {
    checkPrism();
  }
}

// ===== PRISMS / TRAIL =====
export const prisms = LEVEL.prisms.map(([x, y]) => ({ x, y, h: (heightAt(x, y) || 0), taken: false, pop: 0 }));
export const trail = [];
function dropTrail(x, y) { trail.push({ x, y, h: (heightAt(x, y) || 0), life: 1.4 }); }
function checkPrism() {
  prisms.forEach((p) => {
    if (!p.taken && p.x === pos.x && p.y === pos.y) { p.taken = true; p.pop = 0; collected++; updateHud(collected, prisms.length, timeMs); }
  });
}
function win() {
  if (state === ST.WON) return; state = ST.WON; timing = false;
  showWin(timeMs, collected, prisms.length);
}

// ===== FRAME UPDATE (gated on !paused by the caller) =====
export function update(dt) {
  if (timing && state !== ST.WON && state !== ST.START) { timeMs += dt * 1000; updateHud(collected, prisms.length, timeMs); }

  if (state === ST.ROLLING && roll) {
    const step = (roll.speed || ROLL_SPEED) * dt;
    if (roll.phi < roll.target) roll.phi = Math.min(roll.target, roll.phi + step);
    else if (roll.phi > roll.target) roll.phi = Math.max(roll.target, roll.phi - step);
    if (Math.abs(roll.phi - roll.target) < 1e-4) { roll.phi = roll.target; finalizeRoll(); }
  }
  if (state === ST.FALLING) tickFall(dt);
  if (state === ST.IDLE) idleSync();
  // continuous / buffered movement: keep rolling while a direction is held
  if (state === ST.IDLE) { const code = nextDir(); if (code) beginRoll(code); }

  prisms.forEach((p) => { if (p.taken && p.pop < 1) p.pop += dt * 3.5; });
  for (let i = trail.length - 1; i >= 0; i--) { trail[i].life -= dt; if (trail[i].life <= 0) trail.splice(i, 1); }
}

// Cube corners for this frame, including in-progress roll / edge wobble.
export function getDisplayCorners(animClock) {
  let corners = baseCorners();
  if (state === ST.ROLLING && roll) {
    corners = corners.map((c) => rotAboutEdge(c, roll.pivot, roll.dir.axis, roll.phi));
  } else if (state === ST.EDGING && edgeDir) {
    const phi = edgeDir.theta * EDGE_FRAC + Math.sin(animClock * 0.004) * 0.02;
    corners = corners.map((c) => rotAboutEdge(c, edgePivot, edgeDir.axis, phi));
  }
  return corners;
}

// A fresh direction tap: commit an edge, or buffer the next move.
export function onTap(code) {
  if (state === ST.EDGING) commitEdge(code);
  else setBufferedDir(code);
}

export function startGame() { state = ST.IDLE; }

export function resetCube() {
  prisms.forEach((p) => { p.taken = false; p.pop = 0; });
  collected = 0; timeMs = 0; timing = false; ridingMover = null;
  pos = { x: LEVEL.start[0], y: LEVEL.start[1] };
  lastSafe = { x: pos.x, y: pos.y, h: heightAt(pos.x, pos.y) };
  C = [pos.x, pos.y, heightAt(pos.x, pos.y) + 0.5];
  R = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; cubeAlpha = 1;
  trail.length = 0; roll = null; edgeDir = null; edgePivot = null;
  state = ST.IDLE;
}

// Read-only snapshots for the HUD/win flow used by the restart orchestration.
export const stats = () => ({ collected, total: prisms.length, timeMs });
