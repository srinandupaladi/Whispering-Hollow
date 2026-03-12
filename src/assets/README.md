# Runtime Asset Pack

Whispering Hollow uses generated assets so the repository stays self-contained and commercially safe without bundling third-party binaries.

## Graphics Pack
- `sprites/`: Elias, Shadow Crawler, Whisper Child, Hollow Watcher, Hollow King, crates, doors, ladders, mirrors, generators, runes.
- `tilesets/`: road, forest, village, tunnel, cathedral terrain tiles and ledges.
- `backgrounds/`: parallax silhouettes, structures, forest dressing, tunnel supports, cathedral pillars.
- `particles/`: fog motes, embers, rune sparks, shadow fragments.
- `lighting/`: flashlight cone, lantern glow, fog diffusion, radial light textures.
- `ui/`: HUD panels, battery segments, pause/inventory surfaces.

## Sound Pack
- `audio/music/`: runtime ambient drones per biome and finale.
- `audio/ambient/`: synthesized wind/noise beds and heartbeat tension layers.
- `audio/effects/`: jump, landing, toggle, pickup, whisper, damage, boss stingers.

Implementation lives in:
- `src/utils/AssetFactory.ts`
- `src/utils/Soundscape.ts`