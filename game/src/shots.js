// The screenshot scenes behind ?shot=start|play|serve|end. Each one plays the
// real rules forward from a fresh world for a fixed script, steered by a
// simple autopilot (work the oldest order: add its missing ingredients, grill
// raw chicken, serve when the plate matches), so each frame is what a real
// game looks like and the same seed always gives the same frame.

import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './world.js';

const START_SECONDS = 6;
const PLAY_SECONDS = 14;
const END_LIMIT_SECONDS = 600;

/** One autopilot decision per step: work the oldest order on the board. */
function autopilot(world) {
  const s = world.state;
  if (s.screen !== SCREEN_PLAY) return;
  if (s.grilling > 0) return; // wait for the grill
  const order = s.orders[0];
  if (!order) return;
  const dish = world.dishForOrder(order);
  // Serve the moment the plate matches any order.
  if (world.matchingOrder()) {
    world.serve();
    return;
  }
  // Grill raw chicken already on the plate before adding more.
  if (world.hasRawChicken()) {
    world.startGrill();
    return;
  }
  // Add the first recipe item still missing from the plate.
  for (const need of dish.recipe) {
    const have = s.plate.filter((p) => p.ing === need.ing && (need.cooked ? p.cooked : true)).length;
    const want = dish.recipe.filter((r) => r.ing === need.ing).length;
    if (have < want) {
      world.addIngredient(need.ing);
      return;
    }
  }
}

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * start: title over a live kitchen. play: a dish mid-assembly (two items on
 * the plate, timer running). serve: a finished plate ready to serve.
 * end: the shift-over summary.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'serve' && name !== 'end') {
    // Play a few seconds so orders reach the board, then show the title over
    // the live kitchen.
    world.start();
    for (let i = 0; i < START_SECONDS / STEP; i += 1) world.step(STEP);
    world.state.screen = SCREEN_TITLE;
    return { screen: SCREEN_TITLE };
  }
  world.start();
  if (name === 'play') {
    for (let i = 0; i < PLAY_SECONDS / STEP; i += 1) {
      world.step(STEP);
      if (world.state.plate.length >= 2) break;
      autopilot(world);
    }
    return { screen: SCREEN_PLAY };
  }
  if (name === 'serve') {
    for (let i = 0; i < 120 / STEP; i += 1) {
      if (world.matchingOrder()) break;
      world.step(STEP);
      autopilot(world);
      if (world.state.screen === SCREEN_OVER) break;
    }
    return { screen: SCREEN_PLAY };
  }
  // end: play the whole shift out with the autopilot.
  for (let i = 0; i < END_LIMIT_SECONDS / STEP; i += 1) {
    world.step(STEP);
    if (world.state.screen === SCREEN_OVER) break;
    autopilot(world);
  }
  return { screen: world.state.screen === SCREEN_OVER ? SCREEN_OVER : SCREEN_PLAY };
}
