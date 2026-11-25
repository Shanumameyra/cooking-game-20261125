// Ember Ladle — Warung Rush: everything on screen, drawn with canvas shapes
// only (no images, no fonts from the network). The playfield is a fixed
// 1280x720 logical area scaled to the window. render() also records the
// clickable zones (bins, grill, serve, clear) that input uses.

import { DISH_BY_ID, FIELD, FONT, INGREDIENTS, ING_BY_ID, MAX_HEARTS, PALETTE, PLATE_SLOTS } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, dishForPlate } from './world.js';

let zones = [];
export function getZones() { return zones; }

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight = '700', align = 'left') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

/** Small vector icon for one ingredient, centred at (cx, cy) with radius r. */
export function drawIngredientIcon(ctx, id, cx, cy, r, cooked = true) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = Math.max(2, r * 0.08);
  if (id === 'nasi') {
    ctx.fillStyle = '#fbf7ea';
    ctx.strokeStyle = '#cbbf9a';
    ctx.beginPath();
    ctx.arc(0, r * 0.25, r * 0.85, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#d9cba6';
    for (const [dx, dy] of [[-0.4, -0.1], [0, -0.35], [0.4, -0.05], [-0.15, 0.1], [0.25, 0.15]]) {
      ctx.beginPath();
      ctx.arc(dx * r, dy * r, r * 0.09, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.8, i * r * 0.45);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.45 - r * 0.35, r * 0.3, i * r * 0.45 + r * 0.35, r * 0.8, i * r * 0.45);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = cooked ? '#c97b2d' : '#ef8a6d';
    ctx.strokeStyle = cooked ? '#8a4d16' : '#c65a3c';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.1, r * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#f6efdd';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(r * 0.3, r * 0.25);
    ctx.lineTo(r * 0.85, r * 0.7);
    ctx.stroke();
    ctx.fillStyle = '#f6efdd';
    ctx.beginPath();
    ctx.arc(r * 0.88, r * 0.62, r * 0.16, 0, Math.PI * 2);
    ctx.arc(r * 0.72, r * 0.82, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    if (cooked) {
      ctx.strokeStyle = '#8a4d16';
      ctx.lineWidth = r * 0.1;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.3);
      ctx.lineTo(-r * 0.1, 0.1);
      ctx.moveTo(-r * 0.1, -r * 0.45);
      ctx.lineTo(r * 0.2, -r * 0.05);
      ctx.stroke();
    }
  } else if (id === 'telur') {
    ctx.fillStyle = '#fffdf5';
    ctx.strokeStyle = '#e0d6b8';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ffb703';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#57b25e';
    ctx.strokeStyle = '#2f7d36';
    for (const [dx, dy, rot] of [[-0.35, 0.1, -0.6], [0, -0.25, 0], [0.35, 0.15, 0.6]]) {
      ctx.save();
      ctx.translate(dx * r, dy * r);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.32, r * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else if (id === 'sambal') {
    ctx.fillStyle = '#d62828';
    ctx.strokeStyle = '#8f1a1a';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.2);
    ctx.quadraticCurveTo(-r * 0.2, r * 0.9, r * 0.85, -r * 0.35);
    ctx.quadraticCurveTo(r * 0.3, r * 0.1, -r * 0.8, -r * 0.2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#2f7d36';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.2);
    ctx.quadraticCurveTo(-r * 1.05, -r * 0.5, -r * 0.9, -r * 0.75);
    ctx.stroke();
  } else if (id === 'kecap') {
    ctx.fillStyle = '#6b4423';
    ctx.strokeStyle = '#3d2412';
    rr(ctx, -r * 0.42, -r * 0.15, r * 0.84, r * 0.95, r * 0.18);
    ctx.fill();
    ctx.stroke();
    ctx.fillRect(-r * 0.2, -r * 0.75, r * 0.4, r * 0.65);
    ctx.fillStyle = '#d62828';
    ctx.fillRect(-r * 0.28, -r * 0.95, r * 0.56, r * 0.28);
    ctx.fillStyle = '#f6efdd';
    ctx.font = `700 ${Math.round(r * 0.5)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('K', 0, r * 0.55);
  }
  ctx.restore();
}

function flame(ctx, cx, cy, s, t) {
  const flick = Math.sin(t * 9 + cx) * 0.12 + Math.sin(t * 23) * 0.06;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1 + flick, 1 - flick * 0.5);
  for (const [color, w, h, dy] of [
    [PALETTE.flame3, s * 1.0, s * 1.5, 0],
    [PALETTE.flame2, s * 0.72, s * 1.1, s * 0.15],
    [PALETTE.flame1, s * 0.45, s * 0.7, s * 0.3],
  ]) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-w / 2, dy);
    ctx.quadraticCurveTo(-w / 2, -h * 0.6, 0, -h);
    ctx.quadraticCurveTo(w / 2, -h * 0.6, w / 2, dy);
    ctx.quadraticCurveTo(0, dy + h * 0.25, -w / 2, dy);
    ctx.fill();
  }
  ctx.restore();
}

function patienceColor(frac) {
  if (frac > 0.55) return '#2f9e44';
  if (frac > 0.28) return '#f08c00';
  return '#d62828';
}

function drawOrderTicket(ctx, order, x, y, w, h) {
  const dish = DISH_BY_ID[order.dishId];
  const frac = Math.max(0, order.patience / order.maxPatience);
  rr(ctx, x, y, w, h, 12);
  ctx.fillStyle = PALETTE.boardPaper;
  ctx.fill();
  ctx.strokeStyle = '#d9cba6';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Customer face.
  const skin = ['#f2c89b', '#e8b07e', '#c98d5f'][(order.id - 1) % 3];
  ctx.fillStyle = skin;
  ctx.beginPath();
  ctx.arc(x + 28, y + 26, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2e1d12';
  ctx.beginPath();
  ctx.arc(x + 21, y + 22, 2.5, 0, Math.PI * 2);
  ctx.arc(x + 35, y + 22, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2e1d12';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x + 28, y + 28, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  text(ctx, `#${order.id}`, x + w - 10, y + 20, 12, PALETTE.muted, '700', 'right');
  text(ctx, order.name, x + 56, y + 32, 20, PALETTE.text, '800');
  // Recipe chips.
  let cx = x + 14;
  for (const need of dish.recipe) {
    const ing = ING_BY_ID[need.ing];
    ctx.fillStyle = need.cooked ? ing.color : '#f3d9c8';
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx + 12, y + h - 26, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawIngredientIcon(ctx, need.ing, cx + 12, y + h - 26, 8, need.cooked);
    cx += 28;
  }
  if (dish.recipe.some((r) => r.cooked && r.ing === 'ayam')) {
    text(ctx, 'needs grill', x + w - 10, y + h - 21, 11, '#e8590c', '700', 'right');
  }
  // Patience bar.
  rr(ctx, x + 14, y + h - 11, w - 28, 6, 3);
  ctx.fillStyle = '#e9dcc3';
  ctx.fill();
  rr(ctx, x + 14, y + h - 11, (w - 28) * frac, 6, 3);
  ctx.fillStyle = patienceColor(frac);
  ctx.fill();
}

export function render(ctx, world, ui) {
  const s = world.state;
  const t = ui.time;
  zones = [];
  const W = FIELD.width;
  const H = FIELD.height;

  // --- Kitchen walls, tiles, floor.
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = PALETTE.wallDark;
  for (let x = 0; x < W; x += 96) ctx.fillRect(x, 0, 4, 64);
  // Window with a sunny street.
  ctx.fillStyle = '#bfe3f2';
  rr(ctx, 980, 78, 260, 150, 10);
  ctx.fill();
  ctx.fillStyle = '#ffd43b';
  ctx.beginPath();
  ctx.arc(1170, 120, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#69b7a0';
  ctx.beginPath();
  ctx.moveTo(1000, 228);
  ctx.lineTo(1040, 178);
  ctx.lineTo(1080, 228);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 6;
  rr(ctx, 980, 78, 260, 150, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(1110, 78);
  ctx.lineTo(1110, 228);
  ctx.moveTo(980, 153);
  ctx.lineTo(1240, 153);
  ctx.stroke();
  // Hanging pans and shelf.
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(340, 92, 560, 12);
  for (let i = 0; i < 4; i += 1) {
    const px = 380 + i * 130;
    ctx.strokeStyle = '#5a3a20';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, 104);
    ctx.lineTo(px, 128);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? '#adb5bd' : '#495057';
    ctx.beginPath();
    ctx.arc(px, 152, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#343a40';
    ctx.beginPath();
    ctx.arc(px, 152, 15, 0, Math.PI * 2);
    ctx.fill();
  }
  // Floor and counter back.
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 560, W, 160);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = 0; x < W; x += 120) ctx.fillRect(x, 560, 3, 160);

  // --- Top bar.
  ctx.fillStyle = PALETTE.panel;
  ctx.fillRect(0, 0, W, 64);
  ctx.fillStyle = PALETTE.panelEdge;
  ctx.fillRect(0, 60, W, 4);
  flame(ctx, 34, 44, 14, t);
  text(ctx, 'EMBER LADLE', 56, 28, 22, '#ffd43b', '800');
  text(ctx, 'Warung Rush', 56, 50, 13, '#ffb703', '600');
  // Timer.
  const mm = Math.floor(Math.max(0, s.timeLeft) / 60);
  const ss = Math.floor(Math.max(0, s.timeLeft) % 60);
  const lowTime = s.timeLeft < 30 && s.screen === SCREEN_PLAY;
  const timerColor = lowTime && Math.sin(t * 8) > 0 ? '#ff6b6b' : '#fff8e7';
  text(ctx, `${mm}:${String(ss).padStart(2, '0')}`, 640, 40, 34, timerColor, '800', 'center');
  text(ctx, 'SHIFT', 640, 58, 11, PALETTE.muted, '700', 'center');
  // Score, served, hearts.
  text(ctx, `SCORE ${s.score}`, 830, 28, 18, PALETTE.score, '800');
  text(ctx, `served ${s.served}   combo x${Math.max(1, s.combo)}`, 830, 50, 13, '#fff8e7', '600');
  for (let i = 0; i < MAX_HEARTS; i += 1) {
    const hx = 1150 + i * 36;
    ctx.fillStyle = i < s.hearts ? PALETTE.heart : '#5a3a20';
    ctx.beginPath();
    ctx.moveTo(hx, 40);
    ctx.bezierCurveTo(hx - 12, 28, hx - 20, 38, hx, 52);
    ctx.bezierCurveTo(hx + 20, 38, hx + 12, 28, hx, 40);
    ctx.fill();
  }
  text(ctx, 'LIVES', 1130, 20, 10, PALETTE.muted, '700');

  // --- Order board (left).
  ctx.fillStyle = PALETTE.board;
  rr(ctx, 16, 80, 300, 330, 14);
  ctx.fill();
  ctx.strokeStyle = '#5a3a20';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, 'ORDER BOARD', 166, 112, 20, '#ffd43b', '800', 'center');
  text(ctx, s.orders.length === 0 ? 'no orders yet — breathe!' : `${s.orders.length} order${s.orders.length > 1 ? 's' : ''} waiting`, 166, 134, 12, '#f6efdd', '600', 'center');
  let oy = 146;
  for (const order of s.orders) {
    drawOrderTicket(ctx, order, 30, oy, 272, 82);
    oy += 88;
  }

  // --- Plate (centre) with the dish mid-assembly.
  text(ctx, 'YOUR PLATE', 600, 330, 16, PALETTE.text, '800', 'center');
  const readyOrder = dishForPlate(s.plate) ? world.matchingOrder() : null;
  const plateDish = dishForPlate(s.plate);
  // Plate shadow + dish.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(600, 500, 185, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f8f9fa';
  ctx.strokeStyle = '#ced4da';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(600, 488, 175, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#e9ecef';
  ctx.beginPath();
  ctx.ellipse(600, 488, 140, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  if (s.plate.length === 0) {
    text(ctx, 'empty — pick ingredients below', 600, 492, 15, '#adb5bd', '600', 'center');
  } else {
    const n = s.plate.length;
    s.plate.forEach((item, i) => {
      const ax = 600 + (i - (n - 1) / 2) * 62;
      const ay = 488 + Math.sin(i * 1.7) * 6;
      drawIngredientIcon(ctx, item.ing, ax, ay, 26, item.cooked);
      if (item.ing === 'ayam' && !item.cooked) {
        text(ctx, 'RAW', ax, ay + 40, 11, '#d62828', '800', 'center');
      }
    });
  }
  // Plate slots.
  for (let i = 0; i < PLATE_SLOTS; i += 1) {
    ctx.fillStyle = i < s.plate.length ? '#2f9e44' : '#dee2e6';
    ctx.beginPath();
    ctx.arc(528 + i * 36, 556, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Recipe hint for the oldest order — or the ready-to-serve callout.
  // Drawn on a light pill so it stays readable over the floor band.
  const oldest = s.orders[0];
  let hint = null;
  let hintColor = PALETTE.text;
  let hintSize = 14;
  let hintPill = 'rgba(255,248,231,0.92)';
  if (plateDish && readyOrder) {
    hint = `✓ ${plateDish.name} is ready — SERVE it!`;
    hintColor = '#fff';
    hintSize = 16;
    hintPill = '#2f9e44';
  } else if (plateDish) {
    hint = `${plateDish.name} built — but no order wants it right now`;
    hintColor = '#fff';
    hintPill = '#e8590c';
  } else if (oldest && s.screen === SCREEN_PLAY) {
    const dish = DISH_BY_ID[oldest.dishId];
    const parts = dish.recipe.map((need) => {
      const want = dish.recipe.filter((r) => r.ing === need.ing && (r.cooked ?? false) === (need.cooked ?? false)).length;
      const have = s.plate.filter((p) => p.ing === need.ing && (need.cooked ? p.cooked : true)).length;
      return `${have >= want ? '✓' : '○'} ${ING_BY_ID[need.ing].short}${need.cooked ? ' (grilled)' : ''}`;
    });
    hint = `${oldest.name}: ${parts.join('  ')}`;
  }
  if (hint) {
    ctx.font = `700 ${hintSize}px ${FONT}`;
    const hw = ctx.measureText(hint).width + 36;
    rr(ctx, 600 - hw / 2, 566, hw, 30, 15);
    ctx.fillStyle = hintPill;
    ctx.fill();
    text(ctx, hint, 600, 587, hintSize, hintColor, '700', 'center');
  }

  // --- Stove / grill (right column).
  text(ctx, 'STOVE', 1070, 330, 16, PALETTE.text, '800', 'center');
  ctx.fillStyle = '#343a40';
  rr(ctx, 900, 340, 340, 120, 14);
  ctx.fill();
  ctx.fillStyle = '#212529';
  ctx.beginPath();
  ctx.arc(1070, 400, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#868e96';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Chicken sizzling on the pan while grilling.
  if (s.grilling > 0) {
    flame(ctx, 1030, 462, 16, t);
    flame(ctx, 1070, 468, 20, t + 0.7);
    flame(ctx, 1110, 462, 16, t + 1.3);
    drawIngredientIcon(ctx, 'ayam', 1070, 396, 24, false);
    rr(ctx, 990, 440, 160, 10, 5);
    ctx.fillStyle = '#495057';
    ctx.fill();
    rr(ctx, 990, 440, 160 * s.grilling, 10, 5);
    ctx.fillStyle = '#ff922b';
    ctx.fill();
    text(ctx, 'GRILLING…', 1070, 478, 13, '#ff922b', '800', 'center');
  } else if (world.hasRawChicken()) {
    drawIngredientIcon(ctx, 'ayam', 1070, 396, 24, false);
    text(ctx, 'raw chicken on your plate — grill it!', 1070, 478, 13, '#fff8e7', '700', 'center');
  } else {
    ctx.fillStyle = '#868e96';
    ctx.beginPath();
    ctx.arc(1070, 400, 34, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, 'grill is free', 1070, 478, 13, '#adb5bd', '600', 'center');
  }
  // Grill button.
  const grillReady = world.hasRawChicken() && s.grilling === 0;
  rr(ctx, 900, 486, 340, 44, 10);
  ctx.fillStyle = grillReady ? PALETTE.grill : '#6c757d';
  ctx.fill();
  if (grillReady && Math.sin(t * 6) > 0) {
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 3;
    rr(ctx, 900, 486, 340, 44, 10);
    ctx.stroke();
  }
  text(ctx, s.grilling > 0 ? 'GRILLING…' : 'GRILL  [G]', 1070, 514, 18, '#fff', '800', 'center');
  zones.push({ id: 'grill', x: 900, y: 486, w: 340, h: 44 });

  // Serve + clear buttons.
  const canServe = readyOrder !== null && s.grilling === 0;
  rr(ctx, 900, 540, 220, 56, 12);
  ctx.fillStyle = canServe ? PALETTE.serve : '#6c757d';
  ctx.fill();
  if (canServe && Math.sin(t * 6) > -0.2) {
    ctx.strokeStyle = PALETTE.serveGlow;
    ctx.lineWidth = 4;
    rr(ctx, 900, 540, 220, 56, 12);
    ctx.stroke();
  }
  text(ctx, 'SERVE  [Space]', 1010, 575, 18, '#fff', '800', 'center');
  zones.push({ id: 'serve', x: 900, y: 540, w: 220, h: 56 });
  rr(ctx, 1132, 540, 108, 56, 12);
  ctx.fillStyle = '#868e96';
  ctx.fill();
  text(ctx, 'CLEAR [X]', 1186, 575, 15, '#fff', '800', 'center');
  zones.push({ id: 'clear', x: 1132, y: 540, w: 108, h: 56 });

  // --- Ingredient counter (bottom bins).
  ctx.fillStyle = PALETTE.counter;
  ctx.fillRect(0, 604, W, 116);
  ctx.fillStyle = PALETTE.counterTop;
  ctx.fillRect(0, 604, W, 10);
  text(ctx, 'COUNTER — click a bin or press 1–7', 16, 600, 13, PALETTE.text, '800');
  const binW = 172;
  const gap = 10;
  INGREDIENTS.forEach((ing, i) => {
    const x = 16 + i * (binW + gap);
    const y = 622;
    rr(ctx, x, y, binW, 86, 12);
    ctx.fillStyle = '#fff8e7';
    ctx.fill();
    ctx.strokeStyle = ing.dark;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawIngredientIcon(ctx, ing.id, x + 34, y + 40, 22, true);
    text(ctx, ing.name, x + 62, y + 34, 17, PALETTE.text, '800');
    text(ctx, ing.desc, x + 62, y + 54, 11, PALETTE.muted, '600');
    ctx.fillStyle = '#e9ecef';
    rr(ctx, x + binW - 30, y + 8, 22, 22, 6);
    ctx.fill();
    text(ctx, ing.key, x + binW - 19, y + 24, 13, PALETTE.text, '800', 'center');
    zones.push({ id: `bin:${ing.id}`, x, y, w: binW, h: 86 });
  });

  // --- Toast feedback.
  if (s.toastTimer > 0 && s.toast) {
    ctx.globalAlpha = Math.min(1, s.toastTimer);
    const tw = ctx.measureText(s.toast).width + 40;
    rr(ctx, 640 - tw / 2, 96, tw, 36, 18);
    ctx.fillStyle = 'rgba(46,29,18,0.92)';
    ctx.fill();
    text(ctx, s.toast, 640, 120, 15, '#fff8e7', '700', 'center');
    ctx.globalAlpha = 1;
  }

  // --- Wrong-serve flash.
  if (s.flash > 0) {
    ctx.fillStyle = `rgba(214,40,40,${Math.min(0.35, s.flash)})`;
    ctx.fillRect(0, 0, W, H);
  }

  // --- Title screen.
  if (s.screen === SCREEN_TITLE) {
    ctx.fillStyle = 'rgba(46,29,18,0.78)';
    ctx.fillRect(0, 0, W, H);
    flame(ctx, 640, 190, 34, t);
    text(ctx, 'EMBER LADLE', 640, 260, 64, '#ffd43b', '800', 'center');
    text(ctx, '— Warung Rush —', 640, 300, 26, '#fff8e7', '700', 'center');
    text(ctx, 'Orders fly in on the board. Build each dish on your plate,', 640, 350, 18, '#fff8e7', '600', 'center');
    text(ctx, 'grill the chicken raw, and serve before patience runs out!', 640, 376, 18, '#fff8e7', '600', 'center');
    text(ctx, 'Click bins or press 1–7  •  G grills  •  Space serves  •  X clears', 640, 416, 16, '#ffd43b', '700', 'center');
    text(ctx, '150-second shift  •  3 hearts  •  combos pay extra', 640, 444, 15, '#fff8e7', '600', 'center');
    if (ui.best > 0) text(ctx, `Best score: ${ui.best}`, 640, 478, 16, '#69db7c', '800', 'center');
    if (Math.sin(t * 4) > -0.4) text(ctx, 'Click anywhere or press Enter to start', 640, 530, 20, '#fff', '800', 'center');
    zones.push({ id: 'start', x: 0, y: 0, w: W, h: H });
  }

  // --- Game over screen.
  if (s.screen === SCREEN_OVER) {
    ctx.fillStyle = 'rgba(46,29,18,0.82)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'SHIFT OVER!', 640, 220, 56, '#ffd43b', '800', 'center');
    text(ctx, s.hearts <= 0 ? 'Three customers walked away…' : 'The dinner rush is done.', 640, 262, 18, '#fff8e7', '600', 'center');
    const rows = [
      ['Final score', String(s.score)],
      ['Dishes served', String(s.served)],
      ['Orders missed', String(s.missed)],
      ['Best combo', `x${s.bestCombo}`],
      ['Favourite dish', s.lastServedDish || '—'],
    ];
    let ry = 336;
    for (const [label, value] of rows) {
      text(ctx, label, 480, ry, 18, '#adb5bd', '600');
      text(ctx, value, 800, ry, 18, '#fff8e7', '800', 'right');
      ry += 36;
    }
    if (ui.best > 0) text(ctx, `Best score: ${ui.best}`, 640, ry + 12, 17, '#69db7c', '800', 'center');
    if (Math.sin(t * 4) > -0.4) text(ctx, 'Press R to cook another shift', 640, ry + 56, 20, '#fff', '800', 'center');
    zones.push({ id: 'restart', x: 0, y: 0, w: W, h: H });
  }

  // --- Pause.
  if (ui.paused && s.screen === SCREEN_PLAY) {
    ctx.fillStyle = 'rgba(46,29,18,0.6)';
    ctx.fillRect(0, 0, W, H);
    text(ctx, 'PAUSED — press P to continue', 640, 360, 28, '#fff8e7', '800', 'center');
  }
}
