// Vector / rotation helpers — the geometric core of the roll machinery.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rotAxis, rotAboutEdge, ease, lerp, cellLerp, norm, dot } from '../src/engine/math.js';

const close = (a, b, eps = 1e-12) =>
  assert.ok(Math.abs(a - b) < eps, `expected ${a} ≈ ${b}`);
const closeVec = (v, w) => v.forEach((x, i) => close(x, w[i]));

test('rotAxis: 90° about z sends x̂ to ŷ', () => {
  closeVec(rotAxis([1, 0, 0], [0, 0, 1], Math.PI / 2), [0, 1, 0]);
});

test('rotAxis: 90° about y sends x̂ to -ẑ (the roll-down-x pivot)', () => {
  closeVec(rotAxis([1, 0, 0], [0, 1, 0], Math.PI / 2), [0, 0, -1]);
});

test('rotAxis preserves vector length', () => {
  const v = [0.3, -1.7, 2.4];
  const r = rotAxis(v, norm([1, 2, 3]), 1.234);
  close(Math.hypot(...r), Math.hypot(...v));
});

test('rotAxis: four 90° quarter-turns are the identity', () => {
  let v = [0.3, -1.7, 2.4];
  for (let i = 0; i < 4; i++) v = rotAxis(v, [0, 1, 0], Math.PI / 2);
  closeVec(v, [0.3, -1.7, 2.4]);
});

test('rotAboutEdge keeps the pivot fixed', () => {
  const e = [0.5, 1, 0];
  closeVec(rotAboutEdge(e, e, [0, 1, 0], 1.1), e);
});

test('rotAboutEdge: a flat roll lands the cube center one cell over', () => {
  // cube center at (0,0,0.5), pivot at the leading bottom edge (0.5, 0, 0),
  // 90° about +y (the ArrowDown/+x roll from game/dirs.js)
  closeVec(rotAboutEdge([0, 0, 0.5], [0.5, 0, 0], [0, 1, 0], Math.PI / 2), [1, 0, 0.5]);
});

test('ease is a smoothstep: fixed endpoints, faster mid-curve', () => {
  close(ease(0), 0); close(ease(1), 1); close(ease(0.5), 0.5);
  assert.ok(ease(0.25) < 0.25 && ease(0.75) > 0.75);
});

test('lerp and cellLerp endpoints', () => {
  close(lerp(2, 6, 0), 2); close(lerp(2, 6, 1), 6); close(lerp(2, 6, 0.5), 4);
  closeVec(cellLerp([5, 1], [5, 2], 0.5), [5, 1.5]);
});

test('norm returns unit vectors', () => {
  close(Math.hypot(...norm([3, 4, 12])), 1);
  close(dot(norm([1, 1, 1]), norm([1, 1, 1])), 1);
});
