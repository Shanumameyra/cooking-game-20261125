// Ember Ladle — Warung Rush: boot, game loop, sounds and screenshot mode.
// Live play runs a fixed-step simulation under requestAnimationFrame; a
// ?shot=start|play|serve|end URL stages one deterministic scene instead and
// renders it once, which is how the screenshots are taken.

import { BEST_KEY, FIELD, STEP } from './config.js';
import { attachInput } from './input.js';
import { getZones, render } from './render.js';
import { stageShot } from './shots.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, createWorld } from './world.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');

const params = new URLSearchParams(location.search);
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : (Math.random() * 0xffffffff) | 0;
const shotName = params.get('shot');
const world = createWorld(seed);
// Exposed for play-testing and debugging (read the live state, never a cheat).
window.__emberLadle = world;

let best = 0;
try { best = Number(localStorage.getItem(BEST_KEY) ?? 0) || 0; } catch { best = 0; }

let paused = false;
let muted = false;
let audio = null;

function ensureAudio() {
  if (audio) return audio;
  try {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    audio = AC ? new AC() : null;
  } catch { audio = null; }
  return audio;
}

function beep(freq, dur, type = 'sine', gain = 0.12, when = 0) {
  if (muted) return;
  const ac = ensureAudio();
  if (!ac) return;
  try {
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  } catch { /* sound is decoration; never break the game */ }
}

function playEvents(events) {
  for (const e of events) {
    if (e === 'add') beep(520, 0.08, 'triangle', 0.08);
    else if (e === 'grill-start') { beep(180, 0.25, 'sawtooth', 0.05); beep(90, 0.3, 'sawtooth', 0.06, 0.05); }
    else if (e === 'grill-done') { beep(660, 0.1, 'sine', 0.1); beep(880, 0.14, 'sine', 0.1, 0.09); }
    else if (e === 'serve') { beep(523, 0.12, 'sine', 0.12); beep(659, 0.12, 'sine', 0.12, 0.1); beep(784, 0.2, 'sine', 0.12, 0.2); }
    else if (e === 'wrong') beep(140, 0.25, 'square', 0.08);
    else if (e === 'expire') { beep(330, 0.15, 'square', 0.07); beep(220, 0.25, 'square', 0.07, 0.12); }
    else if (e === 'gameover') { beep(392, 0.2, 'sine', 0.1); beep(311, 0.2, 'sine', 0.1, 0.18); beep(262, 0.4, 'sine', 0.1, 0.36); }
  }
}

function saveBest() {
  if (world.state.score > best) {
    best = world.state.score;
    try { localStorage.setItem(BEST_KEY, String(best)); } catch { /* ignore */ }
  }
}

function setStatus(text) {
  statusEl.textContent = text;
}

function handleAction(id) {
  const s = world.state;
  ensureAudio();
  if (id === 'mute') {
    muted = !muted;
    world.say(muted ? 'Sound off' : 'Sound on');
    return;
  }
  if (id === 'pause') {
    if (s.screen === SCREEN_PLAY) paused = !paused;
    return;
  }
  if (s.screen === SCREEN_TITLE && (id === 'start' || id === 'background')) {
    world.start();
    playEvents(world.popEvents());
    return;
  }
  if (s.screen === SCREEN_OVER && (id === 'restart' || id === 'background')) {
    saveBest();
    world.reset();
    world.start();
    return;
  }
  if (s.screen !== SCREEN_PLAY || paused) {
    if (id === 'restart' && s.screen === SCREEN_OVER) { saveBest(); world.reset(); world.start(); }
    return;
  }
  if (id.startsWith('bin:')) world.addIngredient(id.slice(4));
  else if (id === 'grill') world.startGrill();
  else if (id === 'serve') world.serve();
  else if (id === 'clear') world.clearPlate();
  else if (id === 'restart') { saveBest(); world.reset(); world.start(); }
  if (s.screen === SCREEN_OVER) saveBest();
  playEvents(world.popEvents());
}

function fitCanvas() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(FIELD.width * dpr);
  canvas.height = Math.round(FIELD.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', fitCanvas);
fitCanvas();
attachInput(canvas, getZones, handleAction);

window.addEventListener('error', (event) => {
  window.__gameError = String(event.message ?? event.error ?? 'error');
  setStatus(`game error: ${window.__gameError}`);
});

if (shotName) {
  // Screenshot mode: one deterministic frame, no loop, no audio.
  const staged = stageShot(shotName, world);
  document.title = `Ember Ladle — shot ${shotName}`;
  render(ctx, world, { time: 1.25, best, paused: false });
  const s = world.state;
  setStatus(
    `shot ${shotName}: screen=${staged.screen} score=${s.score} served=${s.served} ` +
    `orders=${s.orders.length} plate=${s.plate.map((p) => p.ing + (p.cooked ? '' : '(raw)')).join(',') || 'empty'} ` +
    `timeLeft=${Math.round(s.timeLeft)}s`,
  );
  window.__shotDone = true;
} else {
  // Live game.
  let last = performance.now();
  let acc = 0;
  let lastWholeSecond = -1;
  function frame(now) {
    const dt = Math.min(0.25, (now - last) / 1000);
    last = now;
    if (!paused) {
      acc += dt;
      while (acc >= STEP) {
        world.step(STEP);
        acc -= STEP;
      }
      const s = world.state;
      if (s.screen === SCREEN_PLAY) {
        const whole = Math.ceil(s.timeLeft);
        if (whole !== lastWholeSecond) {
          lastWholeSecond = whole;
          if (whole <= 5 && whole > 0) beep(880, 0.06, 'sine', 0.06);
        }
      }
      playEvents(world.popEvents());
      if (s.screen === SCREEN_OVER) saveBest();
    }
    const s = world.state;
    render(ctx, world, { time: now / 1000, best, paused });
    setStatus(
      s.screen === SCREEN_TITLE ? 'Ember Ladle — Warung Rush: press Enter or click to start'
        : s.screen === SCREEN_PLAY ? `playing: score ${s.score}, served ${s.served}, time ${Math.round(s.timeLeft)}s`
          : `shift over: score ${s.score}, served ${s.served}, missed ${s.missed}`,
    );
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
