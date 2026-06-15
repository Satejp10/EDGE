// ===== FIXED-TIMESTEP ACCUMULATOR =====
// Standard accumulator loop (see gafferongames.com/post/fix_your_timestep).
// advance(frameDt) runs step(fixedDt) zero or more times; alpha() is the fractional
// remainder of a step, used to interpolate rendering between the last two sim states.
// maxFrame clamps hitches (tab switch, GC pause) so the sim never spirals.

export function createStepper(fixedDt, step, maxFrame = 0.05) {
  let acc = 0;
  return {
    advance(frameDt) {
      acc += Math.min(maxFrame, Math.max(0, frameDt));
      let n = 0;
      while (acc >= fixedDt) { acc -= fixedDt; step(fixedDt); n++; }
      return n;
    },
    alpha: () => acc / fixedDt,
    reset: () => { acc = 0; },
  };
}
