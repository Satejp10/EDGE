// ===== TIMING / TUNABLES =====

export const FIXED_DT = 1 / 120; // simulation step, seconds — decoupled from display refresh
export const BEAT = 0.85;        // global tick (mover cadence), seconds
export const ROLL_SPEED = 7.5;   // rad/s
export const EDGE_FRAC = 0.60;   // how far a cube tips when it clings to a ledge
export const FALL_DELAY = 0.45;  // armed -> falling
export const FALL_ANIM = 0.35;   // sink / rise duration
export const FALL_RESPAWN = 2.0; // gone -> rising

// Live-tunable settings (mutated by the tuning panel). Climbs/descents sweep 180°;
// keeping this above ROLL_SPEED stops them feeling sluggish.
export const settings = {
  climbSpeed: ROLL_SPEED * 1.5,
};
