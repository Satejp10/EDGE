// ===== SHADING / GEOMETRY / DRAW HELPERS =====
import { ctx } from './canvas.js';
import { project, depthOf, camDir, lightDir, S } from './camera.js';
import { sub, cross, dot, norm } from '../engine/math.js';
import { getLevel } from '../levels/registry.js';
import { FALL_ANIM } from '../config.js';
import { fallerList, movers, moverVisual, goalH } from '../game/world.js';

export function shade(hex, n) {
  const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
  const diff = Math.max(0, dot(n, lightDir)); const k = Math.min(1, 0.52 + 0.5 * diff);
  return 'rgb(' + Math.round(r * k) + ',' + Math.round(g * k) + ',' + Math.round(b * k) + ')';
}

export function boxCorners(c, hx, hy, hz) {
  return [
    [c[0] - hx, c[1] - hy, c[2] - hz], [c[0] + hx, c[1] - hy, c[2] - hz], [c[0] + hx, c[1] + hy, c[2] - hz], [c[0] - hx, c[1] + hy, c[2] - hz],
    [c[0] - hx, c[1] - hy, c[2] + hz], [c[0] + hx, c[1] - hy, c[2] + hz], [c[0] + hx, c[1] + hy, c[2] + hz], [c[0] - hx, c[1] + hy, c[2] + hz],
  ];
}

const FACES = [[4, 5, 6, 7], [0, 3, 2, 1], [1, 2, 6, 5], [0, 4, 7, 3], [3, 7, 6, 2], [0, 1, 5, 4]];

export function pushBox(list, corners, baseHex, strokeHex, alpha) {
  for (const f of FACES) {
    const a = corners[f[0]], b = corners[f[1]], d = corners[f[2]];
    let n = cross(sub(b, a), sub(d, a));
    if (dot(n, camDir) <= 0) continue;
    n = norm(n);
    const pts = f.map((i) => project(corners[i]));
    const dep = (depthOf(corners[f[0]]) + depthOf(corners[f[1]]) + depthOf(corners[f[2]]) + depthOf(corners[f[3]])) / 4;
    list.push({ dep, fill: shade(baseHex, n), stroke: strokeHex, pts, alpha: alpha == null ? 1 : alpha });
  }
}

export function fillPoly(pts, fill, stroke, alpha) {
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.stroke(); }
  ctx.globalAlpha = 1;
}

// Soft cyan disc on the prism's tile. Sorts at floor level (separate decal), so it
// stays readable even when the floating gem overlaps the cube on a 1-wide corridor.
export function drawPrismMark(p) {
  const s = p.taken ? Math.max(0, 1 - p.pop) : 1; if (s <= 0) return;
  const c = project([p.x, p.y, p.h + 0.02]);
  const rx = 0.30 * S, ry = rx * 0.5;
  ctx.save();
  ctx.globalAlpha = 0.22 * s; ctx.fillStyle = '#15b9c9';
  ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.5 * s; ctx.strokeStyle = '#0a7f8c'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(c[0], c[1], rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();
}

export function drawPrism(p, now) {
  const bob = Math.sin(now * 0.003 + p.x) * 0.06; const s = p.taken ? Math.max(0, 1 - p.pop) : 1; if (s <= 0) return;
  const ctr = project([p.x, p.y, p.h + 0.55 + bob]); const r = 0.24 * S * s;
  const top = [ctr[0], ctr[1] - r], bot = [ctr[0], ctr[1] + r], lf = [ctr[0] - r * 0.72, ctr[1]], rt = [ctr[0] + r * 0.72, ctr[1]];
  // Lower opacity than before (0.96 -> 0.8) so the cube reads through an overlapping gem.
  fillPoly([top, rt, bot, lf], '#15b9c9', '#0a7f8c', 0.8);
  fillPoly([top, rt, [ctr[0], ctr[1]], lf], '#7fe6f0', null, 0.78);
}

export function drawGoal(now) {
  const g = getLevel().goal; const c = project([g[0], g[1], goalH + 0.02]);
  const rx = 0.40 * S, ry = 0.40 * S * 0.5, pulse = 1 + Math.sin(now * 0.004) * 0.08;
  ctx.save(); ctx.globalAlpha = 0.9; ctx.strokeStyle = '#10c2a8'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(c[0], c[1], rx * pulse, ry * pulse, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#10c2a8';
  ctx.beginPath(); ctx.ellipse(c[0], c[1], rx * 0.34, ry * 0.34, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}

export function trailQuad(t) {
  const z = t.h + 0.012, h = 0.4;
  return [[t.x - h, t.y - h, z], [t.x + h, t.y - h, z], [t.x + h, t.y + h, z], [t.x - h, t.y + h, z]].map(project);
}

// Collect every solid block (static + faller + mover) as {c: corners, hex, a: alpha}.
// moverPos (optional) overrides mover visual positions — the main loop passes
// render-interpolated positions; game logic keeps reading exact sim positions.
export function sceneBlocks(now, moverPos) {
  const out = [];
  const pushCell = (x, y, h, hex, a) => {
    if (h <= 0) { out.push({ c: boxCorners([x, y, -0.175], 0.49, 0.49, 0.175), hex, a }); }
    else { for (let k = 0; k < h; k++) out.push({ c: boxCorners([x, y, k + 0.5], 0.49, 0.49, 0.5), hex, a }); }
  };
  for (const [x, y, h0] of getLevel().cells) pushCell(x, y, h0 || 0, 0xffffff, 1);
  for (const f of fallerList) {
    if (f.state === 'gone') continue;
    let zoff = 0, a = 1, hex = 0xF0E2C4;
    if (f.state === 'armed') { hex = (Math.floor(now / 110) % 2 === 0) ? 0xF0A93A : 0xF6C763; }
    else if (f.state === 'falling') { const fr = Math.min(1, f.t / FALL_ANIM); zoff = -fr * 2.4; a = Math.max(0, 1 - fr); }
    else if (f.state === 'rising') { const fr = Math.min(1, f.t / FALL_ANIM); zoff = -(1 - fr) * 2.4; a = fr; }
    const h = f.h;
    if (h <= 0) { out.push({ c: boxCorners([f.x, f.y, -0.175 + zoff], 0.49, 0.49, 0.175), hex, a }); }
    else { for (let k = 0; k < h; k++) out.push({ c: boxCorners([f.x, f.y, k + 0.5 + zoff], 0.49, 0.49, 0.5), hex, a }); }
  }
  movers.forEach((m, i) => {
    const vp = moverPos ? moverPos[i] : moverVisual(m);
    pushCell(vp[0], vp[1], m.h, 0xE7EFFF, 1);
  });
  return out;
}
