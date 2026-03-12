import { LevelDefinition } from '../types/GameTypes';

const skyLayers = (themeColor: number, mistColor: number) => [
  { key: 'bg-sky', color: themeColor, alpha: 0.72, scrollFactor: 0.08, y: 90, scaleY: 1.4 },
  { key: 'bg-far', color: mistColor, alpha: 0.52, scrollFactor: 0.18, y: 180, scaleY: 1.1 },
  { key: 'bg-mid', color: themeColor + 0x111111, alpha: 0.5, scrollFactor: 0.35, y: 260, scaleY: 0.9 },
  { key: 'bg-fog', color: mistColor, alpha: 0.3, scrollFactor: 0.55, y: 410, scaleY: 0.7 },
  { key: 'bg-front', color: 0x0e131a, alpha: 0.55, scrollFactor: 0.8, y: 545, scaleY: 0.55 }
];

export const LEVELS: LevelDefinition[] = [
  {
    id: 'broken-road',
    index: 1,
    name: 'Broken Road',
    subtitle: 'The path to Graves Hollow still remembers the ritual.',
    theme: 'road',
    width: 3200,
    height: 900,
    spawn: { x: 140, y: 590 },
    exit: { x: 3040, y: 540 },
    fogDensity: 0.45,
    darkness: 0.56,
    timeLimitHint: 'Follow the lantern line and learn the light.',
    platforms: [
      { x: 600, y: 690, width: 1200, height: 64, texture: 'ground-road' },
      { x: 1950, y: 690, width: 1180, height: 64, texture: 'ground-road' },
      { x: 1160, y: 580, width: 220, height: 28, texture: 'ledge-stone' },
      { x: 1520, y: 520, width: 160, height: 28, texture: 'ledge-stone' },
      { x: 1880, y: 465, width: 180, height: 28, texture: 'ledge-stone' },
      { x: 2300, y: 590, width: 210, height: 28, texture: 'ledge-stone' },
      { x: 2750, y: 555, width: 220, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [],
    lanterns: [
      { x: 360, y: 610, radius: 170, checkpointId: 'road-start' },
      { x: 1560, y: 440, radius: 200, checkpointId: 'road-mid' },
      { x: 2910, y: 515, radius: 180, checkpointId: 'road-gate' }
    ],
    pickups: [
      { x: 980, y: 540, kind: 'battery', id: 'road-battery-1' },
      { x: 2400, y: 545, kind: 'battery', id: 'road-battery-2' },
      { x: 2100, y: 635, kind: 'diary', id: 'road-diary-1' }
    ],
    levers: [{ x: 2870, y: 510, id: 'road-gate-lever', opensDoorId: 'road-gate' }],
    doors: [{ x: 3010, y: 565, width: 42, height: 120, id: 'road-gate' }],
    puzzles: [],
    enemies: [
      { x: 1750, y: 640, kind: 'crawler', patrolDistance: 180 },
      { x: 2460, y: 540, kind: 'child', patrolDistance: 90 }
    ],
    backgroundLayers: skyLayers(0x19283a, 0x5b746f)
  },
  {
    id: 'hollow-forest',
    index: 2,
    name: 'Hollow Forest',
    subtitle: 'Paths change when Elias looks away.',
    theme: 'forest',
    width: 4600,
    height: 960,
    spawn: { x: 180, y: 650 },
    exit: { x: 4380, y: 600 },
    fogDensity: 0.72,
    darkness: 0.68,
    timeLimitHint: 'The forest reorders itself, but the lanterns anchor the path.',
    platforms: [
      { x: 720, y: 760, width: 1440, height: 64, texture: 'ground-forest' },
      { x: 2300, y: 760, width: 1000, height: 64, texture: 'ground-forest' },
      { x: 3650, y: 760, width: 900, height: 64, texture: 'ground-forest' },
      { x: 1320, y: 620, width: 190, height: 28, texture: 'ledge-root' },
      { x: 1760, y: 550, width: 190, height: 28, texture: 'ledge-root' },
      { x: 3100, y: 610, width: 210, height: 28, texture: 'ledge-root' }
    ],
    ladders: [],
    lanterns: [
      { x: 420, y: 690, radius: 175, checkpointId: 'forest-start' },
      { x: 2210, y: 690, radius: 190, checkpointId: 'forest-mid' },
      { x: 4210, y: 690, radius: 175, checkpointId: 'forest-end' }
    ],
    pickups: [
      { x: 1180, y: 705, kind: 'battery', id: 'forest-battery-1' },
      { x: 3010, y: 705, kind: 'battery', id: 'forest-battery-2' },
      { x: 3450, y: 705, kind: 'relic', id: 'forest-relic-1' },
      { x: 3900, y: 705, kind: 'diary', id: 'forest-diary-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [{ id: 'forest-runes', kind: 'rune', x: 2780, y: 700, sequence: ['north', 'west', 'east'] }],
    enemies: [
      { x: 1380, y: 590, kind: 'crawler', patrolDistance: 160 },
      { x: 1950, y: 500, kind: 'child', patrolDistance: 120 },
      { x: 2570, y: 690, kind: 'watcher', patrolDistance: 240 },
      { x: 3600, y: 690, kind: 'crawler', patrolDistance: 180 }
    ],
    backgroundLayers: skyLayers(0x162d22, 0x7aa190),
    proceduralForest: true
  },
  {
    id: 'forgotten-village',
    index: 3,
    name: 'Forgotten Village',
    subtitle: 'Homes remain, but only shadows answer the doors.',
    theme: 'village',
    width: 4200,
    height: 960,
    spawn: { x: 160, y: 650 },
    exit: { x: 3910, y: 540 },
    fogDensity: 0.6,
    darkness: 0.62,
    timeLimitHint: 'Restore power, mirror the light, and open the church.',
    platforms: [
      { x: 650, y: 760, width: 1200, height: 64, texture: 'ground-village' },
      { x: 2050, y: 760, width: 1050, height: 64, texture: 'ground-village' },
      { x: 3370, y: 760, width: 720, height: 64, texture: 'ground-village' },
      { x: 990, y: 570, width: 220, height: 28, texture: 'ledge-wood' },
      { x: 1430, y: 510, width: 190, height: 28, texture: 'ledge-wood' },
      { x: 2560, y: 560, width: 220, height: 28, texture: 'ledge-wood' },
      { x: 3640, y: 560, width: 210, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [
      { x: 1440, y: 650, height: 150 },
      { x: 2550, y: 650, height: 140 }
    ],
    lanterns: [
      { x: 350, y: 690, radius: 170, checkpointId: 'village-start' },
      { x: 2180, y: 690, radius: 175, checkpointId: 'village-mid' },
      { x: 3750, y: 520, radius: 190, checkpointId: 'village-church' }
    ],
    pickups: [
      { x: 1220, y: 520, kind: 'battery', id: 'village-battery-1' },
      { x: 2580, y: 520, kind: 'battery', id: 'village-battery-2' },
      { x: 3270, y: 705, kind: 'symbol', id: 'village-symbol-1' },
      { x: 3600, y: 705, kind: 'diary', id: 'village-diary-1' }
    ],
    levers: [{ x: 1200, y: 705, id: 'generator-switch', opensDoorId: 'church-door' }],
    doors: [{ x: 3900, y: 585, width: 42, height: 145, id: 'church-door' }],
    puzzles: [
      { id: 'village-generator', kind: 'generator', x: 1120, y: 705, opensDoorId: 'church-door' },
      { id: 'village-mirror', kind: 'mirror', x: 2470, y: 705, targetX: 3860, targetY: 545, opensDoorId: 'church-door' }
    ],
    enemies: [
      { x: 780, y: 705, kind: 'watcher', patrolDistance: 260 },
      { x: 1730, y: 470, kind: 'child', patrolDistance: 120 },
      { x: 2840, y: 705, kind: 'crawler', patrolDistance: 180 },
      { x: 3420, y: 705, kind: 'watcher', patrolDistance: 170 }
    ],
    backgroundLayers: skyLayers(0x392d29, 0x827466)
  },
  {
    id: 'underground-tunnels',
    index: 4,
    name: 'Underground Tunnels',
    subtitle: 'The mine breathes with Clara’s fading seal.',
    theme: 'tunnels',
    width: 4300,
    height: 980,
    spawn: { x: 150, y: 690 },
    exit: { x: 4050, y: 510 },
    fogDensity: 0.78,
    darkness: 0.75,
    timeLimitHint: 'Conserve battery. The tunnel swallows light.',
    platforms: [
      { x: 600, y: 790, width: 1150, height: 64, texture: 'ground-tunnel' },
      { x: 2030, y: 790, width: 1030, height: 64, texture: 'ground-tunnel' },
      { x: 3480, y: 790, width: 740, height: 64, texture: 'ground-tunnel' },
      { x: 980, y: 620, width: 170, height: 28, texture: 'ledge-stone' },
      { x: 1440, y: 540, width: 170, height: 28, texture: 'ledge-stone' },
      { x: 2610, y: 620, width: 190, height: 28, texture: 'ledge-stone' },
      { x: 3220, y: 540, width: 200, height: 28, texture: 'ledge-stone' },
      { x: 3900, y: 520, width: 180, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [
      { x: 1440, y: 730, height: 180 },
      { x: 3210, y: 730, height: 180 }
    ],
    lanterns: [
      { x: 300, y: 720, radius: 160, checkpointId: 'tunnel-start' },
      { x: 2200, y: 720, radius: 170, checkpointId: 'tunnel-mid' },
      { x: 3950, y: 470, radius: 180, checkpointId: 'tunnel-shaft' }
    ],
    pickups: [
      { x: 1000, y: 580, kind: 'battery', id: 'tunnel-battery-1' },
      { x: 2230, y: 735, kind: 'battery', id: 'tunnel-battery-2' },
      { x: 3190, y: 500, kind: 'relic', id: 'tunnel-relic-1' },
      { x: 3820, y: 735, kind: 'symbol', id: 'tunnel-symbol-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [
      { id: 'tunnel-crate', kind: 'crate', x: 2550, y: 735, targetX: 2820, targetY: 735 },
      { id: 'tunnel-runes', kind: 'rune', x: 3750, y: 735, sequence: ['south', 'north', 'south'] }
    ],
    enemies: [
      { x: 1240, y: 500, kind: 'crawler', patrolDistance: 150 },
      { x: 2350, y: 735, kind: 'watcher', patrolDistance: 190 },
      { x: 3320, y: 500, kind: 'child', patrolDistance: 100 },
      { x: 3720, y: 735, kind: 'crawler', patrolDistance: 200 }
    ],
    backgroundLayers: skyLayers(0x202126, 0x626e7d)
  },
  {
    id: 'hollow-cathedral',
    index: 5,
    name: 'Hollow Cathedral',
    subtitle: 'Clara holds the breach with her last light.',
    theme: 'cathedral',
    width: 3400,
    height: 980,
    spawn: { x: 180, y: 700 },
    exit: { x: 3000, y: 520 },
    fogDensity: 0.7,
    darkness: 0.74,
    timeLimitHint: 'The Hollow King is beyond the nave.',
    platforms: [
      { x: 680, y: 800, width: 1500, height: 72, texture: 'ground-cathedral' },
      { x: 2490, y: 800, width: 760, height: 72, texture: 'ground-cathedral' },
      { x: 1260, y: 620, width: 200, height: 28, texture: 'ledge-stone' },
      { x: 1720, y: 540, width: 200, height: 28, texture: 'ledge-stone' },
      { x: 2190, y: 620, width: 200, height: 28, texture: 'ledge-stone' },
      { x: 2810, y: 540, width: 240, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [],
    lanterns: [
      { x: 420, y: 730, radius: 190, checkpointId: 'cathedral-start' },
      { x: 2920, y: 500, radius: 215, checkpointId: 'cathedral-altar' }
    ],
    pickups: [
      { x: 1490, y: 580, kind: 'battery', id: 'cathedral-battery-1' },
      { x: 2320, y: 580, kind: 'battery', id: 'cathedral-battery-2' },
      { x: 2880, y: 760, kind: 'diary', id: 'cathedral-diary-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [{ id: 'cathedral-runes', kind: 'rune', x: 2650, y: 760, sequence: ['west', 'east', 'north'] }],
    enemies: [],
    backgroundLayers: skyLayers(0x2b2028, 0x8d816e)
  }
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level])) as Record<
  LevelDefinition['id'],
  LevelDefinition
>;
