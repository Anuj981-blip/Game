# Rick's Survival

A rick and morty inspired space invaders style game built with HTML5 canvas, CSS3, and vanilla JavaScript. Dodge falling Mortys, blast them with pickle shots, collect power-ups, and fight off Boss Mortys for as long as you can.



## Story

Morty was infected by an unknown virus that mutated his personality, and legions of freak Mortys are trying to force their way into Rick's portal to spread it to other dimensions. Rick's gun is fully loaded with unlimited pickle ricks — help him hold the line.

## How to Play

Open `index.html` in a browser. No build step, no dependencies, no server required.

The first time the page loads, an in-game tour walks through every mechanic below. It's unskippable by design — Start/Pause/Restart stay locked until you've clicked through it — so nobody misses how the power-ups, enemy types, or parry system work. You can also reopen it anytime with the **How to Play** button.

## Controls

| Key | Action |
| --- | --- |
| Arrow Up / Down / Left / Right | Move Rick |
| Spacebar (hold) | Fire pickle shots |
| Shift | Parry (boss fights only) |
| P | Pause / resume |

## Features

### Core gameplay
- Smooth, acceleration-based movement with friction — no more instant snap-to-speed.
- A single, ever-present weapon (Pickle Rick) that gets *enhanced* by power-ups rather than swapped out.
- Difficulty ramps up over time: enemies spawn faster and move quicker the longer you survive.
- Combo system — chaining kills within a short window multiplies your score.

### Game modes
Selectable from the dropdown before you start, each with its own saved high score:
- **Classic** — 10 lives, standard difficulty ramp.
- **Hardcore** — 5 lives, faster difficulty ramp, 1.5x score multiplier.
- **Time Attack** — 90-second countdown, unlimited attempts within the clock, 2x score multiplier.

### Enemy variety
Regular Mortys aren't all the same — each type rewards a different strategy:
- **Normal** — standard, one hit to kill.
- **Fast** (blue glow) — quick and erratic, but fragile.
- **Tank** (brown, health bar) — slow but takes four hits.
- **Splitter** (purple glow) — splits into two weaker Mortys when destroyed.

Some enemies zigzag on the way down instead of falling straight, so it's not just a shooting gallery.

### Power-ups
Dropped by defeated Mortys (and guaranteed from bosses):
- **Shield** — temporary invulnerability.
- **Rapid Fire** — faster fire rate.
- **Multi-Shot** — 3-way spread shot.
- **Piercing** — shots pass through multiple enemies.
- **Power x2** — double damage.
- **+1 Life** — restores a life (up to your mode's max).
- **Bomb** — clears all regular enemies on screen instantly.

### Boss fights
- A Boss Morty appears once your score crosses a threshold (starting at 60 points), with a cooldown between encounters so you get a breather.
- Regular Morty spawns thin out while a boss is active, so the fight stays readable.
- The boss hovers, patrols side to side, and fires aimed volleys at your position.
- **Parry**: press Shift to open a brief parry window. Reflect a boss bullet back during that window and it slams into the boss for heavy damage instead of hurting you. Parry has its own recharge time (shown live via a "PARRY READY" bar in the HUD) and only works against boss projectiles — not regular falling Mortys.

### Settings & UI
- Independent Music and SFX volume sliders.
- Fullscreen toggle for a distraction-free view of just the game canvas.
- Live HUD showing score, lives, current mode, active power-up timers, combo multiplier, and (during boss fights) the parry status bar.
- Per-mode high scores saved locally in the browser.

## Tech notes
- Pure HTML5 `<canvas>` 2D rendering — no external game engine or build tools.
- Game state lives in a handful of plain JS files under `src/js/`: `rick.js` (player), `bullets.js` (player projectiles + collision), `enemies.js` (regular enemies, boss, boss projectiles), `powerups.js` (drops and effects), `tour.js` (onboarding), and `game.js` (main loop, HUD, modes, game state).
- High scores persist via `localStorage`, scoped per game mode.

