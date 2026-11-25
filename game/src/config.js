// Ember Ladle — Warung Rush: every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to
// the window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second. */
export const STEP = 1 / 60;

/** Length of one cooking shift, in seconds. */
export const SHIFT_SECONDS = 150;

export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const PLATE_SLOTS = 5;

/** Seconds raw chicken spends on the grill before it is cooked. */
export const GRILL_SECONDS = 2.5;

/** Order patience in seconds at level 1, shrinking as the shift heats up. */
export const PATIENCE_BASE = 46;
export const PATIENCE_MIN = 30;

/** Seconds between new orders at level 1; shrinks per level. */
export const SPAWN_BASE = 9;
export const SPAWN_MIN = 5.5;

/** A level lasts this many seconds; each level spawns faster and hurries orders. */
export const LEVEL_SECONDS = 30;

export const WRONG_SERVE_PENALTY = 25;

/** Ingredients on the counter, in bin order. Keys 1-7 pick them. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', short: 'Nasi', key: '1', color: '#f6efdd', dark: '#cbbf9a', desc: 'Steamed rice' },
  { id: 'mie', name: 'Mie', short: 'Mie', key: '2', color: '#f2c14e', dark: '#b98a1d', desc: 'Egg noodles' },
  { id: 'ayam', name: 'Ayam', short: 'Ayam', key: '3', color: '#ef8a6d', dark: '#c65a3c', desc: 'Needs the grill' },
  { id: 'telur', name: 'Telur', short: 'Telur', key: '4', color: '#fff3b0', dark: '#e0a800', desc: 'Fried egg' },
  { id: 'sayur', name: 'Sayur', short: 'Sayur', key: '5', color: '#57b25e', dark: '#2f7d36', desc: 'Fresh greens' },
  { id: 'sambal', name: 'Sambal', short: 'Sambal', key: '6', color: '#d62828', dark: '#8f1a1a', desc: 'Chili sambal' },
  { id: 'kecap', name: 'Kecap', short: 'Kecap', key: '7', color: '#6b4423', dark: '#3d2412', desc: 'Sweet soy' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

/** The menu: each dish is a multiset of ingredients. Ayam must be grilled. */
export const DISHES = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng', base: 100,
    recipe: [{ ing: 'nasi' }, { ing: 'telur' }, { ing: 'kecap' }, { ing: 'sambal' }],
    blurb: 'Wok-fried rice, egg, sweet soy, sambal',
  },
  {
    id: 'mie-goreng', name: 'Mie Goreng', base: 120,
    recipe: [{ ing: 'mie' }, { ing: 'ayam', cooked: true }, { ing: 'sayur' }, { ing: 'kecap' }],
    blurb: 'Fried noodles with grilled chicken',
  },
  {
    id: 'sate-ayam', name: 'Sate Ayam', base: 130,
    recipe: [{ ing: 'ayam', cooked: true }, { ing: 'ayam', cooked: true }, { ing: 'sambal' }],
    blurb: 'Two grilled skewers, fiery sambal',
  },
  {
    id: 'gado-gado', name: 'Gado-Gado', base: 90,
    recipe: [{ ing: 'sayur' }, { ing: 'telur' }, { ing: 'sambal' }],
    blurb: 'Greens, egg and sambal — quick and fresh',
  },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

export const PALETTE = {
  wall: '#f7d9a0',
  wallDark: '#eec27e',
  tile: '#fff4dd',
  floor: '#8a5a33',
  counter: '#a9713f',
  counterTop: '#c98d54',
  board: '#7a4a21',
  boardPaper: '#fff8e7',
  panel: '#2e1d12',
  panelEdge: '#5a3a20',
  text: '#2e1d12',
  textLight: '#fff8e7',
  muted: '#8a6d4b',
  timer: '#d62828',
  score: '#ffb703',
  serve: '#2f9e44',
  serveGlow: '#69db7c',
  grill: '#e8590c',
  danger: '#d62828',
  heart: '#e63946',
  flame1: '#ffd43b',
  flame2: '#ff922b',
  flame3: '#f03e3e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'ember-ladle-warung-rush.best';
