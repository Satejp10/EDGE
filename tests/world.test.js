// Dynamic world: collision query, mover beat clock, faller lifecycle.
// world.js is module-level singleton state, so every test starts with resetWorld().
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  tick, resetWorld, movers, fallerList, fallerMap, heightAt, isSafe, armFaller, moverVisual,
} from '../src/game/world.js';
import { FIXED_DT, BEAT, FALL_DELAY, FALL_ANIM, FALL_RESPAWN } from '../src/config.js';

beforeEach(() => resetWorld());

// Advance the world in fixed steps (one extra step absorbs float accumulation).
const stepFor = (seconds) => {
  const n = Math.round(seconds / FIXED_DT) + 1;
  for (let i = 0; i < n; i++) tick(FIXED_DT);
};

test('heightAt: static cells, empty space', () => {
  assert.equal(heightAt(0, 1), 0);   // start cell
  assert.equal(heightAt(7, 2), 1);   // goal cell
  assert.equal(heightAt(9, 9), null);
  assert.ok(isSafe(0, 1));
  assert.ok(!isSafe(1, 1)); // faller cells are not safe checkpoints
});

test('mover ping-pongs along its path, one cell per beat', () => {
  const m = movers[0];
  assert.deepEqual(m.cur, [5, 1]);
  assert.equal(heightAt(5, 1), m.h);
  stepFor(BEAT);
  assert.deepEqual(m.cur, [5, 2]);
  assert.equal(heightAt(5, 1), null); // vacated the old cell
  stepFor(BEAT);
  assert.deepEqual(m.cur, [5, 1]);    // bounced back
});

test('moverVisual eases between prev and cur within a beat', () => {
  const m = movers[0];
  stepFor(BEAT);            // beat fires: prev [5,1] -> cur [5,2], phase ~0
  stepFor(BEAT / 2 - FIXED_DT * 2); // park mid-beat (stay clear of the next beat)
  const [x, y] = moverVisual(m);
  assert.equal(x, 5);
  assert.ok(y > 1 && y < 2, `mid-beat y ${y}`);
});

test('faller lifecycle: solid → armed → falling → gone → rising → solid', () => {
  const f = fallerMap.get('1,1');
  assert.equal(f.state, 'solid');
  assert.equal(heightAt(1, 1), 0);

  armFaller(1, 1);
  assert.equal(f.state, 'armed');
  assert.equal(heightAt(1, 1), 0);   // armed still supports the cube

  stepFor(FALL_DELAY);
  assert.equal(f.state, 'falling');
  assert.equal(heightAt(1, 1), null); // no ground while falling

  stepFor(FALL_ANIM);
  assert.equal(f.state, 'gone');

  stepFor(FALL_RESPAWN);
  assert.equal(f.state, 'rising');

  stepFor(FALL_ANIM);
  assert.equal(f.state, 'solid');
  assert.equal(heightAt(1, 1), 0);   // back in play
});

test('armFaller only arms solid tiles', () => {
  armFaller(1, 1);
  stepFor(FALL_DELAY);
  const f = fallerMap.get('1,1');
  assert.equal(f.state, 'falling');
  armFaller(1, 1);                   // re-arming mid-fall must not reset it
  assert.equal(f.state, 'falling');
});

test('determinism: identical fixed-step runs produce identical world state', () => {
  const snap = () => JSON.stringify({
    movers: movers.map((m) => ({ idx: m.idx, dir: m.dir, prev: m.prev, cur: m.cur })),
    fallers: fallerList.map((f) => ({ state: f.state, t: f.t })),
  });
  const run = () => {
    resetWorld();
    armFaller(2, 1);
    for (let i = 0; i < 600; i++) tick(FIXED_DT); // 5 s of sim
    return snap();
  };
  assert.equal(run(), run());
});
