// Fixed-timestep accumulator — the determinism core of the main loop.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStepper } from '../src/engine/loop.js';

test('steady 60 Hz frames at a 120 Hz sim run exactly 2 steps per frame', () => {
  let steps = 0;
  const s = createStepper(1 / 120, () => steps++);
  for (let i = 0; i < 60; i++) assert.equal(s.advance(1 / 60), 2);
  assert.equal(steps, 120);
});

test('total steps are independent of how frame time is chunked', () => {
  const frames = [0.016, 0.031, 0.009, 0.044, 0.021, 0.013]; // irregular frame times
  const run = (chunks) => {
    let n = 0;
    const s = createStepper(1 / 120, () => n++);
    for (const dt of chunks) s.advance(dt);
    return n;
  };
  const whole = run(frames);
  const halved = run(frames.flatMap((dt) => [dt / 2, dt / 2]));
  assert.equal(whole, halved);
  assert.equal(whole, Math.floor(frames.reduce((a, b) => a + b, 0) * 120));
});

test('every step receives exactly fixedDt', () => {
  const dts = new Set();
  const s = createStepper(1 / 120, (dt) => dts.add(dt));
  for (let i = 0; i < 30; i++) s.advance(0.0173); // awkward frame time
  assert.deepEqual([...dts], [1 / 120]);
});

test('alpha stays in [0, 1)', () => {
  const s = createStepper(1 / 120, () => {});
  for (const dt of [0.016, 0.031, 0.009, 0.044]) {
    s.advance(dt);
    assert.ok(s.alpha() >= 0 && s.alpha() < 1, `alpha ${s.alpha()}`);
  }
});

test('hitches are clamped — a 2 s frame cannot spiral the sim', () => {
  let steps = 0;
  const s = createStepper(1 / 120, () => steps++);
  s.advance(2.0);
  assert.ok(steps <= Math.ceil(0.05 * 120), `ran ${steps} steps`);
});

test('reset clears the accumulator', () => {
  const s = createStepper(1 / 120, () => {});
  s.advance(0.005); // not enough for a step, lands in the accumulator
  assert.ok(s.alpha() > 0);
  s.reset();
  assert.equal(s.alpha(), 0);
});
