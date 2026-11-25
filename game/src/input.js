// Ember Ladle — Warung Rush: keyboard and mouse input. The renderer owns the
// clickable zones (bins, grill, serve, clear, start, restart); this module
// translates raw events into semantic actions and hands them to the game.

import { FIELD } from './config.js';

export function attachInput(canvas, zonesFn, onAction) {
  const toLogical = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  };

  canvas.addEventListener('pointerdown', (event) => {
    const p = toLogical(event);
    const zones = zonesFn();
    for (let i = zones.length - 1; i >= 0; i -= 1) {
      const z = zones[i];
      if (p.x >= z.x && p.x <= z.x + z.w && p.y >= z.y && p.y <= z.y + z.h) {
        onAction(z.id, p);
        return;
      }
    }
    onAction('background', p);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const map = {
      '1': 'bin:nasi', '2': 'bin:mie', '3': 'bin:ayam', '4': 'bin:telur',
      '5': 'bin:sayur', '6': 'bin:sambal', '7': 'bin:kecap',
      g: 'grill', ' ': 'serve', x: 'clear', backspace: 'clear',
      enter: 'start', p: 'pause', r: 'restart', m: 'mute',
    };
    const action = map[key];
    if (action) {
      if (key === ' ' || key === 'backspace') event.preventDefault();
      onAction(action, null);
    }
  });
}
