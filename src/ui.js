// ===== UI / DOM GLUE =====
// HUD, overlays, buttons, and the tuning panel. Presentation only — the game state
// is passed in as arguments, and game actions are injected via initUI(), so this
// module imports no game/world code.
import { ROLL_SPEED, settings } from './config.js';
import { setCamera } from './render/camera.js';

const $ = (id) => document.getElementById(id);
const timerVal = document.querySelector('#timer .val');
const prismsVal = document.querySelector('#prisms .val');
const winScreen = $('winScreen');
const startScreen = $('startScreen');
const pauseScreen = $('pauseScreen');
const tune = $('tune');

export function fmt(ms) {
  const t = ms / 1000, m = Math.floor(t / 60), s = Math.floor(t % 60), c = Math.floor((t * 100) % 100);
  return m + ':' + String(s).padStart(2, '0') + '.' + String(c).padStart(2, '0');
}

export function updateHud(collected, total, timeMs) {
  timerVal.textContent = fmt(timeMs);
  prismsVal.textContent = collected + ' / ' + total;
}

export function showWin(timeMs, collected, total) {
  $('winTime').textContent = fmt(timeMs);
  $('winPrisms').textContent = collected + ' / ' + total;
  winScreen.classList.remove('hidden');
}

export function hideStart() { startScreen.classList.add('hidden'); }
export function hideWin() { winScreen.classList.add('hidden'); }
export function setWinButtonLabel(text) { $('againBtn').textContent = text; }
export function setPauseVisible(on) { pauseScreen.classList.toggle('hidden', !on); }
export function hidePause() { pauseScreen.classList.add('hidden'); }

export function toggleTune() {
  tune.classList.toggle('hidden');
  if (tune.classList.contains('hidden')) window.focus();
}

export function initUI({ onStart, onAgain, onResume }) {
  $('startBtn').onclick = onStart;
  $('againBtn').onclick = onAgain;
  $('resumeBtn').onclick = onResume;

  const tClimb = $('t_climb'), tAzim = $('t_azim'), tElev = $('t_elev');
  tClimb.addEventListener('input', () => {
    const m = parseFloat(tClimb.value);
    settings.climbSpeed = ROLL_SPEED * m;
    $('v_climb').textContent = m.toFixed(2) + '×';
  });
  const applyCam = () => {
    setCamera(parseFloat(tAzim.value), parseFloat(tElev.value));
    $('v_azim').textContent = tAzim.value + '°';
    $('v_elev').textContent = tElev.value + '°';
  };
  tAzim.addEventListener('input', applyCam);
  tElev.addEventListener('input', applyCam);
}
