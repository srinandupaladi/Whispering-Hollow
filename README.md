# Whispering Hollow

Whispering Hollow is a browser-based 2D horror platformer built with Phaser 3 and TypeScript. The project is structured as a polished, deployable vertical slice with five story levels, adaptive enemy behavior, a hidden fear system, checkpoint lanterns, environmental puzzles, a procedural forest section, and a two-ending boss finale.

## Highlights
- Modular Phaser architecture with dedicated scene, character, system, UI, data, and utility layers.
- Flashlight-centered survival loop with battery drain, low-power flicker, blackout events, and enemy-specific light reactions.
- Horror director that tracks darkness exposure, running, hiding, puzzle progress, and damage to adjust fog, ambience, paranormal events, and spawn pressure.
- Procedural haunted forest dressing layered on authored platforming layouts.
- Save/checkpoint flow stored in `localStorage`.
- Runtime-generated pixel-art textures and synthesized soundscape so the repo stays self-contained.
- Responsive browser build suitable for GitHub Pages, Netlify, and Vercel.

## Controls
- `A / D`: move
- `W / S`: ladder climb / crouch
- `Space`: jump
- `Shift`: sprint
- `E`: interact
- `F`: toggle flashlight
- `Esc`: pause
- `1 / 2`: choose the final ending in the boss scene

## Game Structure
- `Broken Road`: onboarding for movement, lantern checkpoints, lever-gate progression.
- `Hollow Forest`: fog-heavy forest with procedural dressing, runes, and early adaptive pressure.
- `Forgotten Village`: generator + mirror puzzle chain with stalking Watchers.
- `Underground Tunnels`: darker traversal, crate-route puzzle, rune sequence, tight battery pressure.
- `Hollow Cathedral`: lead-in and final confrontation with the Hollow King.

## Core Systems
- `src/systems/FlashlightSystem.ts`: battery, flicker, blackout, cone hit-testing.
- `src/systems/LightingSystem.ts`: ambient darkness, flashlight projection, lantern glows, fear tint.
- `src/systems/HorrorDirectorSystem.ts`: fear metrics, paranormal pacing, spawn pressure, fog pressure.
- `src/systems/FogSystem.ts`: layered drifting fog sheets that react to scene pressure.
- `src/systems/EnemyAISystem.ts`: enemy orchestration plus blind-spot ambush spawning.
- `src/systems/PuzzleSystem.ts`: generator, mirror, rune, and crate puzzle handling.
- `src/systems/ProceduralLevelSystem.ts`: level construction, decorations, lanterns, ladders, pickups, doors, exits.
- `src/systems/SaveSystem.ts`: checkpoint and achievement persistence.

## Local Development
1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Create a production build:
   `npm run build`
4. Preview the production bundle locally:
   `npm run preview`

## Deployment
### GitHub Pages
1. Run `npm run build`.
2. Publish the contents of `dist/` to your Pages branch or deploy with a GitHub Actions workflow that uploads `dist`.
3. The Vite config already uses `base: './'`, so the static output works from a subpath.

### Netlify
- Config is included in `netlify.toml`.
- Build command: `npm run build`
- Publish directory: `dist`

### Vercel
- Config is included in `vercel.json`.
- Framework: Vite
- Output directory: `dist`

## Verification
- `npm run build`
- Result: successful production build with a split Phaser vendor chunk in `dist/`.

## Notes
- Save data lives in browser `localStorage` under `whispering-hollow-save-v1`.
- All art and audio are generated at runtime; see `src/assets/README.md` for the pack manifest.