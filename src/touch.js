// ===== TOUCH CONTROLS =====
// On-screen D-pad + system buttons for coarse-pointer devices. DOM-only layer like
// ui.js: direction presses feed the same heldKeys/bufferedDir path as the keyboard
// (via touchPress/touchRelease), system actions are injected callbacks — no game
// imports, so the dependency graph stays acyclic.
//
// Activation: (pointer: coarse) media query, or a ?touch URL flag for desktop testing.
// Layout (cross vs diamond D-pad) persists in localStorage['edge.padLayout'].
import { touchPress, touchRelease } from './game/input.js';

const LS_LAYOUT = 'edge.padLayout';
const $ = (id) => document.getElementById(id);

function lsGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch { /* private mode */ } }

// Pointer capture so a finger sliding off a button still releases it cleanly.
function bindButton(el, onDown, onUp) {
  el.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch { /* inactive pointer (e.g. synthetic event) */ }
    el.classList.add('pressed');
    onDown();
  });
  const up = () => { el.classList.remove('pressed'); if (onUp) onUp(); };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
}

export function initTouch({ onPause, onRestart, onTune }) {
  const wanted = matchMedia('(pointer: coarse)').matches
    || new URLSearchParams(location.search).has('touch');
  if (!wanted) return;

  document.body.classList.add('touch-on');
  $('touch').classList.remove('hidden');
  $('modeTag').textContent = 'TOUCH · HOLD AN ARROW TO KEEP ROLLING';
  $('startHelp').innerHTML = 'roll · ride the moving block · don’t linger on the amber tiles · reach the goal<br>' +
    'hold a D-pad arrow to keep rolling · at a ledge, tap the same arrow again to drop off';

  for (const el of document.querySelectorAll('#touch [data-dir]')) {
    bindButton(el, () => touchPress(el.dataset.dir), () => touchRelease(el.dataset.dir));
  }
  bindButton($('tcPause'), onPause);
  bindButton($('tcRestart'), onRestart);
  bindButton($('tcTune'), onTune);
  $('touch').addEventListener('contextmenu', (e) => e.preventDefault()); // no long-press menu

  // layout toggle (lives in the tuning panel), persisted
  const btn = $('t_pad');
  $('t_padrow').classList.remove('hidden');
  const apply = (layout) => {
    $('padCross').classList.toggle('hidden', layout !== 'cross');
    $('padDiamond').classList.toggle('hidden', layout !== 'diamond');
    btn.textContent = layout.toUpperCase();
  };
  let layout = lsGet(LS_LAYOUT) === 'cross' ? 'cross' : 'diamond';
  apply(layout);
  btn.addEventListener('click', () => {
    layout = layout === 'cross' ? 'diamond' : 'cross';
    lsSet(LS_LAYOUT, layout);
    apply(layout);
  });
}
