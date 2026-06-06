// ===== INPUT =====
// Dumb input layer: maintains the held-keys set + buffered direction, and translates
// raw key events into semantic callbacks. main wires the callbacks to game actions so
// this module needs no game/UI imports (keeps the dependency graph acyclic).
import { DIRS } from './dirs.js';

const heldKeys = new Set();
let bufferedDir = null;

let handlers = {
  onTap: () => {},     // fresh direction tap (not OS auto-repeat)
  onRestart: () => {},
  onTune: () => {},
  onPause: () => {},
};

export function initInput(h) { handlers = { ...handlers, ...h }; }

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyR') { handlers.onRestart(); return; }
  if (e.code === 'KeyT') { handlers.onTune(); return; }
  if (e.code === 'KeyP') { e.preventDefault(); handlers.onPause(); return; }
  if (e.code === 'Escape') { handlers.onPause(); return; }
  if (!(e.code in DIRS)) return;
  e.preventDefault();
  heldKeys.add(e.code);
  if (e.repeat) return;          // ignore OS auto-repeat; we drive continuity ourselves
  handlers.onTap(e.code);        // a fresh tap: commits an edge or buffers the next move
});
window.addEventListener('keyup', (e) => { if (e.code in DIRS) heldKeys.delete(e.code); });

export function setBufferedDir(code) { bufferedDir = code; }

export function nextDir() {
  if (bufferedDir) { const d = bufferedDir; bufferedDir = null; return d; }
  const arr = [...heldKeys];
  for (let i = arr.length - 1; i >= 0; i--) if (DIRS[arr[i]]) return arr[i]; // most-recent still-held
  return null;
}

export function clearInput() { heldKeys.clear(); bufferedDir = null; }
