// ===== DIRECTION TABLE =====
// Per-key roll geometry. Shared by input (to recognise direction keys) and the cube
// roll machinery (dx/dy step, pivot axis, sweep angle, pivot offset).
//
// The four moves land on screen diagonals:
//   ArrowUp   (-x) -> up-right     ArrowDown (+x) -> down-left
//   ArrowRight(+y) -> down-right   ArrowLeft (-y) -> up-left

export const DIRS = {
  ArrowDown:  { dx: 1,  dy: 0,  axis: [0, 1, 0], theta:  Math.PI / 2, off: [0.5, 0] },
  KeyS:       { dx: 1,  dy: 0,  axis: [0, 1, 0], theta:  Math.PI / 2, off: [0.5, 0] },
  ArrowUp:    { dx: -1, dy: 0,  axis: [0, 1, 0], theta: -Math.PI / 2, off: [-0.5, 0] },
  KeyW:       { dx: -1, dy: 0,  axis: [0, 1, 0], theta: -Math.PI / 2, off: [-0.5, 0] },
  ArrowRight: { dx: 0,  dy: 1,  axis: [1, 0, 0], theta: -Math.PI / 2, off: [0, 0.5] },
  KeyD:       { dx: 0,  dy: 1,  axis: [1, 0, 0], theta: -Math.PI / 2, off: [0, 0.5] },
  ArrowLeft:  { dx: 0,  dy: -1, axis: [1, 0, 0], theta:  Math.PI / 2, off: [0, -0.5] },
  KeyA:       { dx: 0,  dy: -1, axis: [1, 0, 0], theta:  Math.PI / 2, off: [0, -0.5] },
};
