// ===== CANVAS SURFACE =====
// Owns the <canvas>, its 2D context, and the current pixel dimensions.
// resize() updates W/H/DPR; the caller (main) is responsible for re-framing the
// camera afterwards (keeps this module free of a camera dependency).

export const canvas = document.getElementById('c');
export const ctx = canvas.getContext('2d');

export let W = 0, H = 0, DPR = 1;

export function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2); // cap at 2 — deliberate perf choice
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
