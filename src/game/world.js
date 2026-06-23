// ===== DYNAMIC WORLD =====
// Static cells, moving platforms, and collapsing fallers, plus the live collision
// query heightAt() and the global beat clock.
import { ease, cellLerp } from '../engine/math.js';
import { getLevel } from '../levels/registry.js';
import { BEAT, FALL_DELAY, FALL_ANIM, FALL_RESPAWN } from '../config.js';

// Stable container identities — rebuilt in place by initWorld() so importers
// (renderer, main) keep valid references across a level switch.
export const staticMap = new Map();
export const fallerList = [];
export const fallerMap = new Map();
export const movers = [];
export let goalH = 0;

// Beat clock — module-private; advanced via tick(), read by moverVisual().
let beatPhase = 0;

// Build all world state from the active level. Called once at import (so the module
// is valid immediately — tests rely on this) and again by loadLevel() on a switch.
export function initWorld() {
  const L = getLevel();
  staticMap.clear();
  for (const c of L.cells) staticMap.set(c[0] + ',' + c[1], c[2] || 0);
  fallerList.length = 0;
  for (const [x, y, h] of L.fallers) fallerList.push({ x, y, h: h || 0, state: 'solid', t: 0 });
  fallerMap.clear();
  for (const f of fallerList) fallerMap.set(f.x + ',' + f.y, f);
  movers.length = 0;
  for (const m of L.movers) movers.push({
    path: m.path, h: m.h || 0, mode: m.mode || 'pingpong', idx: 0, dir: 1, prev: m.path[0], cur: m.path[0],
  });
  goalH = staticMap.get(L.goal[0] + ',' + L.goal[1]) || 0;
  beatPhase = 0;
}

export function moverVisual(m) {
  const t = ease(Math.min(1, beatPhase / BEAT));
  return cellLerp(m.prev, m.cur, t);
}
export function moverAt(x, y) {
  for (const m of movers) if (m.cur[0] === x && m.cur[1] === y) return m;
  return null;
}
export function isSafe(x, y) { return staticMap.has(x + ',' + y); }

export function heightAt(x, y) {
  const key = x + ',' + y;
  if (staticMap.has(key)) return staticMap.get(key);
  for (const m of movers) { if (m.cur[0] === x && m.cur[1] === y) return m.h; }
  const f = fallerMap.get(key);
  if (f && (f.state === 'solid' || f.state === 'armed')) return f.h;
  return null;
}

export function armFaller(x, y) {
  const f = fallerMap.get(x + ',' + y);
  if (f && f.state === 'solid') { f.state = 'armed'; f.t = 0; }
}

function beatAdvanceMovers() {
  for (const m of movers) {
    m.prev = m.cur; let ni;
    if (m.mode === 'loop') { ni = (m.idx + 1) % m.path.length; }
    else {
      ni = m.idx + m.dir;
      if (ni > m.path.length - 1) { m.dir = -1; ni = m.idx + m.dir; }
      else if (ni < 0) { m.dir = 1; ni = m.idx + m.dir; }
    }
    m.idx = ni; m.cur = m.path[ni];
  }
}

function updateFallers(dt) {
  for (const f of fallerList) {
    f.t += dt;
    if (f.state === 'armed' && f.t >= FALL_DELAY) { f.state = 'falling'; f.t = 0; }
    else if (f.state === 'falling' && f.t >= FALL_ANIM) { f.state = 'gone'; f.t = 0; }
    else if (f.state === 'gone' && f.t >= FALL_RESPAWN) { f.state = 'rising'; f.t = 0; }
    else if (f.state === 'rising' && f.t >= FALL_ANIM) { f.state = 'solid'; f.t = 0; }
  }
}

// Advance the tick clock one frame. Caller gates this on game state.
export function tick(dt) {
  beatPhase += dt;
  if (beatPhase >= BEAT) { beatPhase -= BEAT; beatAdvanceMovers(); }
  updateFallers(dt);
}

export function resetWorld() {
  beatPhase = 0;
  fallerList.forEach((f) => { f.state = 'solid'; f.t = 0; });
  movers.forEach((m) => { m.idx = 0; m.dir = 1; m.prev = m.path[0]; m.cur = m.path[0]; });
}

initWorld(); // initialize to the active level at import (default: level 1)
