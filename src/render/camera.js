// ===== ISOMETRIC CAMERA (tunable azimuth / elevation) =====
import { dot, cross, norm } from '../engine/math.js';
import { W, H } from './canvas.js';
import { getLevel } from '../levels/registry.js';

export let camAzim = 45, camElev = 35.26; // degrees; (45, 35.26) == classic (1,1,1) iso
export let zc, xc, yc, camDir;            // basis vectors; camDir points toward the camera
export const lightDir = norm([0.35, 0.25, 1]);
export let S = 60, TX = 0, TY = 0, TZ = 0; // screen scale + look-at target

export function setCamera(azimDeg, elevDeg) {
  camAzim = azimDeg; camElev = elevDeg;
  const a = azimDeg * Math.PI / 180, e = elevDeg * Math.PI / 180;
  zc = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)]; // unit, toward camera
  xc = norm(cross([0, 0, 1], zc));
  yc = cross(zc, xc);
  camDir = zc;
}
setCamera(camAzim, camElev);

// Every cell the view must frame (static + faller + every mover waypoint), for the
// active level. Recomputed per call so a level switch reframes the camera.
function viewCells() {
  const L = getLevel();
  return [
    ...L.cells.map((c) => [c[0], c[1], c[2] || 0]),
    ...L.fallers.map((c) => [c[0], c[1], c[2] || 0]),
    ...L.movers.flatMap((m) => m.path.map((p) => [p[0], p[1], m.h || 0])),
  ];
}

export function computeView() {
  const VIEW_CELLS = viewCells();
  const xs = VIEW_CELLS.map((c) => c[0]), ys = VIEW_CELLS.map((c) => c[1]), hs = VIEW_CELLS.map((c) => c[2]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const maxH = Math.max(0, ...hs);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) + maxH + 3.0;
  TX = cx; TY = cy; TZ = maxH * 0.40;
  S = Math.min(W, H) / (span * 1.16);
}

export function project(p) {
  const r = [p[0] - TX, p[1] - TY, p[2] - TZ];
  return [W / 2 + dot(r, xc) * S, H / 2 - dot(r, yc) * S];
}

// zc is unit -> monotonic with true view depth at any angle (painter-sort key).
export const depthOf = (p) => dot(p, zc);
