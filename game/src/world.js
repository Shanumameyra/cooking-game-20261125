// Ember Ladle — Warung Rush: the simulation. No drawing here, only rules:
// orders spawn on the board with a patience timer, the player builds a plate
// from the counter bins, raw chicken must be grilled before it counts, and a
// plate that matches an order can be served for points and a tip. The shift
// runs 150 seconds; three expired orders end the shift early in spirit — they
// cost hearts, and losing all three ends the shift at once.

import {
  DISHES, GRILL_SECONDS, LEVEL_SECONDS, MAX_HEARTS, MAX_ORDERS, PATIENCE_BASE,
  PATIENCE_MIN, PLATE_SLOTS, SHIFT_SECONDS, SPAWN_BASE, SPAWN_MIN, STEP,
  WRONG_SERVE_PENALTY,
} from './config.js';
import { createRandom } from './random.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_OVER = 'over';

export const EVENT_SERVED = 1;
export const EVENT_WRONG = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_OVER = 8;

export function dishForPlate(plate) {
  if (plate.length === 0) return null;
  // A dish matches when the plate holds exactly its recipe: same ingredients,
  // same counts, and chicken grilled wherever the recipe says so. Other
  // ingredients count in any state (they are never raw on the plate).
  for (const dish of DISHES) {
    if (dish.recipe.length !== plate.length) continue;
    const rest = plate.slice();
    let ok = true;
    for (const need of dish.recipe) {
      const idx = rest.findIndex((p) => p.ing === need.ing && (need.cooked ? p.cooked : true));
      if (idx === -1) { ok = false; break; }
      rest.splice(idx, 1);
    }
    if (ok) return dish;
  }
  return null;
}

export function createWorld(seed) {
  const world = {
    state: null,
    rng: createRandom(seed),
    seed,
    reset(nextSeed) {
      if (nextSeed !== undefined) {
        world.seed = nextSeed;
        world.rng = createRandom(nextSeed);
      }
      world.state = {
        screen: SCREEN_TITLE,
        elapsed: 0,
        timeLeft: SHIFT_SECONDS,
        level: 1,
        score: 0,
        served: 0,
        missed: 0,
        wrongServes: 0,
        hearts: MAX_HEARTS,
        combo: 0,
        bestCombo: 0,
        orders: [],
        nextOrderId: 1,
        spawnTimer: 1.0,
        plate: [],
        grilling: 0, // 0 = idle, otherwise 0..1 progress
        grillDone: false,
        flash: 0, // seconds left of the red "wrong serve" flash
        toast: '',
        toastTimer: 0,
        lastServedDish: '',
        events: [],
      };
      return world.state;
    },
    start() {
      const s = world.state;
      s.screen = SCREEN_PLAY;
      s.events.push('start');
    },
    level() {
      const s = world.state;
      return Math.min(5, 1 + Math.floor(s.elapsed / LEVEL_SECONDS));
    },
    spawnInterval() {
      return Math.max(SPAWN_MIN, SPAWN_BASE - (world.level() - 1) * 0.9);
    },
    patience() {
      return Math.max(PATIENCE_MIN, PATIENCE_BASE - (world.level() - 1) * 4);
    },
    spawnOrder() {
      const s = world.state;
      if (s.orders.length >= MAX_ORDERS) return;
      const onBoard = new Set(s.orders.map((o) => o.dishId));
      const fresh = DISHES.filter((d) => !onBoard.has(d.id));
      const pool = fresh.length > 0 ? fresh : DISHES;
      const dish = pool[Math.floor(world.rng() * pool.length)];
      const patience = world.patience();
      s.orders.push({
        id: s.nextOrderId,
        dishId: dish.id,
        name: dish.name,
        patience,
        maxPatience: patience,
      });
      world.state.nextOrderId += 1;
    },
    addIngredient(ingId) {
      const s = world.state;
      if (s.screen !== SCREEN_PLAY || s.plate.length >= PLATE_SLOTS) return false;
      s.plate.push({ ing: ingId, cooked: ingId !== 'ayam' });
      s.events.push('add');
      return true;
    },
    hasRawChicken() {
      return world.state.plate.some((i) => i.ing === 'ayam' && !i.cooked);
    },
    startGrill() {
      const s = world.state;
      if (s.screen !== SCREEN_PLAY || s.grilling > 0 || !world.hasRawChicken()) return false;
      s.grilling = 0.0001;
      s.events.push('grill-start');
      return true;
    },
    clearPlate() {
      const s = world.state;
      if (s.screen !== SCREEN_PLAY || s.plate.length === 0) return false;
      s.plate = [];
      s.grilling = 0;
      s.events.push('clear');
      return true;
    },
    dishForOrder(order) {
      return DISHES.find((d) => d.id === order.dishId);
    },
    matchingOrder() {
      const s = world.state;
      const dish = dishForPlate(s.plate);
      if (!dish) return null;
      return s.orders.find((o) => o.dishId === dish.id) ?? null;
    },
    serve() {
      const s = world.state;
      if (s.screen !== SCREEN_PLAY) return false;
      if (s.grilling > 0) {
        world.say('Still on the grill — wait for the sizzle!');
        return false;
      }
      const order = world.matchingOrder();
      if (!order) {
        s.wrongServes += 1;
        s.combo = 0;
        s.score = Math.max(0, s.score - WRONG_SERVE_PENALTY);
        s.flash = 0.6;
        s.events.push('wrong');
        world.say(`No order wants that plate (−${WRONG_SERVE_PENALTY})`);
        return false;
      }
      const dish = DISHES.find((d) => d.id === order.dishId);
      const patienceFrac = order.patience / order.maxPatience;
      const tip = Math.round(dish.base * 0.5 * patienceFrac);
      const comboMult = 1 + 0.2 * Math.min(4, s.combo);
      const points = Math.round((dish.base + tip) * comboMult);
      s.score += points;
      s.served += 1;
      s.combo += 1;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.lastServedDish = dish.name;
      s.orders = s.orders.filter((o) => o.id !== order.id);
      s.plate = [];
      s.events.push('serve');
      world.say(`${dish.name} served! +${points}${s.combo > 1 ? `  (combo x${s.combo})` : ''}`);
      return true;
    },
    say(text) {
      const s = world.state;
      s.toast = text;
      s.toastTimer = 2.4;
    },
    popEvents() {
      const s = world.state;
      const out = s.events;
      s.events = [];
      return out;
    },
    step(dt) {
      const s = world.state;
      if (s.screen !== SCREEN_PLAY) return 0;
      let events = 0;
      s.elapsed += dt;
      s.timeLeft -= dt;
      s.level = world.level();
      if (s.flash > 0) s.flash -= dt;
      if (s.toastTimer > 0) s.toastTimer -= dt;

      // Grill progress: raw chicken on the plate turns golden.
      if (s.grilling > 0) {
        s.grilling += dt / GRILL_SECONDS;
        if (s.grilling >= 1) {
          s.grilling = 0;
          s.grillDone = true;
          for (const item of s.plate) if (item.ing === 'ayam') item.cooked = true;
          s.events.push('grill-done');
          world.say('Chicken grilled — golden and ready!');
        }
      }

      // New orders arrive on the board.
      s.spawnTimer -= dt;
      if (s.spawnTimer <= 0) {
        world.spawnOrder();
        s.spawnTimer = world.spawnInterval() * (0.85 + world.rng() * 0.3);
      }

      // Patience runs out: the customer walks away, a heart is lost.
      for (let i = s.orders.length - 1; i >= 0; i -= 1) {
        const order = s.orders[i];
        order.patience -= dt;
        if (order.patience <= 0) {
          s.orders.splice(i, 1);
          s.missed += 1;
          s.combo = 0;
          s.hearts -= 1;
          events |= EVENT_EXPIRED;
          s.events.push('expire');
          world.say(`${order.name} walked away! (−1 heart)`);
        }
      }

      if (s.timeLeft <= 0 || s.hearts <= 0) {
        s.timeLeft = Math.max(0, s.timeLeft);
        s.screen = SCREEN_OVER;
        s.events.push('gameover');
        events |= EVENT_OVER;
      }
      return events;
    },
  };
  world.reset(seed);
  return world;
}
