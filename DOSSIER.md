# Ember Ladle — Warung Rush: Dossier

## What it is

**Ember Ladle — Warung Rush** is an original timed cooking game set in a small
Indonesian warung kitchen. You are the cook on a 150-second dinner shift.
Orders fly in on the order board, each with a patience bar. Build each dish on
your plate from the seven ingredient bins on the counter, grill raw chicken on
the stove until golden, and serve before the customer walks away. Serve fast
for tips, chain serves into combos, and don't lose all three hearts.

Everything is original: the warung theme, the four-dish menu, the names, and
all art — every sprite is drawn in code with canvas shapes. No images, fonts,
libraries, or network requests anywhere in the game.

## How to play

1. An order appears on the **order board** (left): dish name, recipe chips,
   and a patience bar (green → orange → red).
2. Click ingredient bins on the **counter** (or press **1–7**) to add them to
   **your plate** (centre). The hint pill under the plate shows the oldest
   order's recipe with checkmarks for what is already on the plate.
3. Chicken arrives **raw**. Click **GRILL [G]** and wait ~2.5 seconds while it
   sizzles — raw chicken never counts toward a dish.
4. When the plate matches an order, the **SERVE** button glows green and the
   hint turns into "ready — SERVE it!". Click **SERVE** or press **Space**.
5. Wrong plate? The game buzzes, −25 points, combo resets — fix the plate or
   press **X** to clear it and start over.
6. An order whose patience hits zero walks away: −1 heart. Lose all 3 hearts
   (or run out the shift timer) and the shift ends with your summary.

## Controls

| Input | Action |
| --- | --- |
| Mouse click on a bin | Add that ingredient to the plate |
| Keys **1–7** | Nasi, Mie, Ayam, Telur, Sayur, Sambal, Kecap |
| **G** or GRILL button | Grill raw chicken on the plate |
| **Space** or SERVE button | Serve the plate to a matching order |
| **X** / Backspace or CLEAR | Empty the plate |
| **P** | Pause |
| **M** | Mute / unmute sounds |
| **R** | Cook another shift (on the shift-over screen) |
| **Enter** / click | Start from the title screen |

## Scoring

- Base points per dish: Gado-Gado 90, Nasi Goreng 100, Mie Goreng 120,
  Sate Ayam 130.
- Tip: up to +50% of base, scaled by patience left when served.
- Combo: each consecutive serve without a miss or wrong serve adds +20%
  (up to +80% at combo x5).
- Wrong serve: −25 points. Expired order: −1 heart.
- Best score is kept in the browser (localStorage).

## The menu

- **Nasi Goreng** — Nasi, Telur, Kecap, Sambal (100)
- **Mie Goreng** — Mie, Ayam (grilled), Sayur, Kecap (120)
- **Sate Ayam** — Ayam (grilled) ×2, Sambal (130)
- **Gado-Gado** — Sayur, Telur, Sambal (90)

As the shift heats up (a level every 30 seconds), orders arrive faster and
patience shrinks — from 46s down to 30s.

## Sound

All sound is synthesized live with WebAudio (short blips, grill sizzle,
serve chime, error buzz). No audio files. Press **M** to mute.

## Tech notes

- Static files only: `game/index.html` + ES modules under `game/src/`
  (`config`, `random`, `world`, `render`, `input`, `shots`, `main`).
  No libraries, no network requests, no external assets of any kind.
- Fixed 1280×720 logical playfield, scaled to the window; fixed 1/60 s
  simulation step, so the game plays the same on any display.
- Seeded RNG (mulberry32): `?seed=N` reproduces a shift exactly.
- Screenshot mode: `?shot=start|play|serve|end&seed=7` stages a real
  gameplay frame deterministically (see `shots.json`):
  - `1-start.jpg` — title over the live kitchen and order board
  - `2-play.jpg` — a dish mid-assembly (Nasi + Telur on the plate), timer running
  - `3-serve.jpg` — a finished Nasi Goreng, SERVE glowing, ready to serve
  - `4-end.jpg` — the shift-over summary (autopilot demo: 21 served, 5895 pts)
- Serve locally with `node serve.ts`, then open http://localhost:8080.
- Hand-in program: `node main.ts` (Node 22) copies `game/` and
  `screenshots/` to the output directory and writes `dossier.json` with the
  vendored make.fun library (`vendor/makefun-game.ts`, kit file, unchanged).
