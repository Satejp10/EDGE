// ===== MATH =====
// Pure vector / rotation helpers. No state, no DOM — safe to import anywhere.

export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const norm = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (t) => t * t * (3 - 2 * t);
export const cellLerp = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// Rodrigues rotation of vector v about unit axis a by angle ang.
export function rotAxis(v, a, ang) {
  const c = Math.cos(ang), s = Math.sin(ang), d = dot(a, v), cr = cross(a, v);
  return [
    v[0] * c + cr[0] * s + a[0] * d * (1 - c),
    v[1] * c + cr[1] * s + a[1] * d * (1 - c),
    v[2] * c + cr[2] * s + a[2] * d * (1 - c),
  ];
}

// Rotate point p about the edge through e along axis a by angle ang.
export const rotAboutEdge = (p, e, a, ang) => {
  const r = rotAxis(sub(p, e), a, ang);
  return [e[0] + r[0], e[1] + r[1], e[2] + r[2]];
};
