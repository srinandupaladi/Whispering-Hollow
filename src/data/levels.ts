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
    subtitle: 'The road into Graves Hollow feels more like a walk into a memory than a platform run.',
    theme: 'road',
    width: 3200,
    height: 900,
    spawn: { x: 160, y: 590 },
    exit: { x: 3050, y: 590 },
    fogDensity: 0.45,
    darkness: 0.56,
    timeLimitHint: 'Stay close to the lanterns and listen to the people who never left.',
    platforms: [
      { x: 520, y: 690, width: 1040, height: 64, texture: 'ground-road' },
      { x: 1620, y: 690, width: 1060, height: 64, texture: 'ground-road' },
      { x: 2710, y: 690, width: 1020, height: 64, texture: 'ground-road' },
      { x: 1490, y: 628, width: 140, height: 28, texture: 'ledge-stone' },
      { x: 2085, y: 626, width: 170, height: 28, texture: 'ledge-stone' },
      { x: 2530, y: 604, width: 160, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [],
    lanterns: [
      { x: 360, y: 610, radius: 175, checkpointId: 'road-start' },
      { x: 1580, y: 610, radius: 195, checkpointId: 'road-mid' },
      { x: 2910, y: 610, radius: 185, checkpointId: 'road-gate' }
    ],
    pickups: [
      { x: 980, y: 634, kind: 'battery', id: 'road-battery-1' },
      { x: 2420, y: 634, kind: 'battery', id: 'road-battery-2' },
      { x: 2140, y: 634, kind: 'diary', id: 'road-diary-1' }
    ],
    levers: [{ x: 2870, y: 624, id: 'road-gate-lever', opensDoorId: 'road-gate' }],
    doors: [{ x: 3010, y: 598, width: 42, height: 120, id: 'road-gate' }],
    puzzles: [],
    enemies: [
      { x: 1830, y: 640, kind: 'crawler', patrolDistance: 160 },
      { x: 2480, y: 636, kind: 'child', patrolDistance: 90 }
    ],
    npcs: [
      {
        id: 'road-keeper',
        x: 520,
        y: 624,
        name: 'Lantern Keeper',
        role: 'keeper',
        dialogue: [
          'Do not hurry. The Hollow prefers people who move like they are being chased.',
          'Walk with the road. When the fog thickens, stop and let the lantern speak louder than your fear.'
        ]
      },
      {
        id: 'road-clara',
        x: 2140,
        y: 624,
        name: 'Clara\'s Echo',
        role: 'echo',
        dialogue: [
          'Elias... the village still stands, but only if you look at it slowly.',
          'The light is not just a weapon. It is how you remember where home used to be.'
        ],
        tint: 0xdceeff
      }
    ],
    backgroundLayers: skyLayers(0x19283a, 0x5b746f)
  },
  {
    id: 'hollow-forest',
    index: 2,
    name: 'Hollow Forest',
    subtitle: 'The forest should feel like walking beside something that keeps pace just outside the beam.',
    theme: 'forest',
    width: 4600,
    height: 960,
    spawn: { x: 180, y: 650 },
    exit: { x: 4380, y: 650 },
    fogDensity: 0.72,
    darkness: 0.68,
    timeLimitHint: 'Most of this path is grounded now. Let the dread come from the space around you.',
    platforms: [
      { x: 720, y: 760, width: 1440, height: 64, texture: 'ground-forest' },
      { x: 2300, y: 760, width: 1250, height: 64, texture: 'ground-forest' },
      { x: 3840, y: 760, width: 1260, height: 64, texture: 'ground-forest' },
      { x: 1540, y: 708, width: 170, height: 28, texture: 'ledge-root' },
      { x: 3080, y: 704, width: 210, height: 28, texture: 'ledge-root' },
      { x: 4080, y: 692, width: 180, height: 28, texture: 'ledge-root' }
    ],
    ladders: [],
    lanterns: [
      { x: 420, y: 690, radius: 175, checkpointId: 'forest-start' },
      { x: 2210, y: 690, radius: 190, checkpointId: 'forest-mid' },
      { x: 4210, y: 690, radius: 175, checkpointId: 'forest-end' }
    ],
    pickups: [
      { x: 1180, y: 706, kind: 'battery', id: 'forest-battery-1' },
      { x: 3010, y: 706, kind: 'battery', id: 'forest-battery-2' },
      { x: 3450, y: 706, kind: 'relic', id: 'forest-relic-1' },
      { x: 3900, y: 706, kind: 'diary', id: 'forest-diary-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [{ id: 'forest-runes', kind: 'rune', x: 2810, y: 700, sequence: ['north', 'west', 'east'] }],
    enemies: [
      { x: 1440, y: 700, kind: 'crawler', patrolDistance: 150 },
      { x: 1960, y: 688, kind: 'child', patrolDistance: 110 },
      { x: 2570, y: 700, kind: 'watcher', patrolDistance: 220 },
      { x: 3640, y: 700, kind: 'crawler', patrolDistance: 170 }
    ],
    npcs: [
      {
        id: 'forest-ranger',
        x: 1300,
        y: 706,
        name: 'Ranger Echo',
        role: 'echo',
        dialogue: [
          'This path used to be all footfall and birds. Now the forest waits to see whether you will run.',
          'If you keep walking, the place feels almost honest. If you leap through it, it turns theatrical.'
        ],
        tint: 0xd3f0ff
      },
      {
        id: 'forest-child',
        x: 3550,
        y: 706,
        name: 'Lost Child',
        role: 'echo',
        dialogue: [
          'I followed the whispers because they sounded like my mother calling from town.',
          'Do not chase every voice. Some of them only exist to make the woods feel bigger.'
        ],
        tint: 0xe6f2ff
      }
    ],
    backgroundLayers: skyLayers(0x162d22, 0x7aa190),
    proceduralForest: true
  },
  {
    id: 'forgotten-village',
    index: 3,
    name: 'Forgotten Village',
    subtitle: 'This stretch should read like walking a dead main street with doors that still remember voices.',
    theme: 'village',
    width: 4200,
    height: 960,
    spawn: { x: 160, y: 650 },
    exit: { x: 3910, y: 590 },
    fogDensity: 0.6,
    darkness: 0.62,
    timeLimitHint: 'The village is more street than obstacle now. Take in the windows, then solve the blackout.',
    platforms: [
      { x: 700, y: 760, width: 1500, height: 64, texture: 'ground-village' },
      { x: 2360, y: 760, width: 1380, height: 64, texture: 'ground-village' },
      { x: 3780, y: 760, width: 700, height: 64, texture: 'ground-village' },
      { x: 1350, y: 708, width: 170, height: 28, texture: 'ledge-wood' },
      { x: 2520, y: 708, width: 180, height: 28, texture: 'ledge-wood' },
      { x: 3640, y: 704, width: 220, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [{ x: 2520, y: 652, height: 110 }],
    lanterns: [
      { x: 350, y: 690, radius: 170, checkpointId: 'village-start' },
      { x: 2180, y: 690, radius: 175, checkpointId: 'village-mid' },
      { x: 3750, y: 690, radius: 190, checkpointId: 'village-church' }
    ],
    pickups: [
      { x: 1220, y: 706, kind: 'battery', id: 'village-battery-1' },
      { x: 2580, y: 706, kind: 'battery', id: 'village-battery-2' },
      { x: 3270, y: 706, kind: 'symbol', id: 'village-symbol-1' },
      { x: 3600, y: 706, kind: 'diary', id: 'village-diary-1' }
    ],
    levers: [{ x: 1200, y: 705, id: 'generator-switch', opensDoorId: 'church-door' }],
    doors: [{ x: 3900, y: 598, width: 42, height: 128, id: 'church-door' }],
    puzzles: [
      { id: 'village-generator', kind: 'generator', x: 1120, y: 705, opensDoorId: 'church-door' },
      { id: 'village-mirror', kind: 'mirror', x: 2480, y: 705, targetX: 3860, targetY: 610, opensDoorId: 'church-door' }
    ],
    enemies: [
      { x: 900, y: 705, kind: 'watcher', patrolDistance: 240 },
      { x: 1760, y: 705, kind: 'child', patrolDistance: 100 },
      { x: 2890, y: 705, kind: 'crawler', patrolDistance: 160 },
      { x: 3440, y: 705, kind: 'watcher', patrolDistance: 160 }
    ],
    npcs: [
      {
        id: 'village-old-marrow',
        x: 820,
        y: 705,
        name: 'Old Marrow',
        role: 'villager',
        dialogue: [
          'The first night was quiet. No screams. Just every lamp in town turning to look the same wrong way.',
          'Walk the street slowly and you can still tell which houses loved their people.'
        ],
        tint: 0xe8d9c0
      },
      {
        id: 'village-shop-echo',
        x: 2240,
        y: 705,
        name: 'Shopkeeper Echo',
        role: 'echo',
        dialogue: [
          'The shelves are gone, but the habit of waiting behind the counter stayed.',
          'If you restore power, the church mirror will show what the fog has been hiding from the road.'
        ],
        tint: 0xd8f1ff
      },
      {
        id: 'village-clara',
        x: 3520,
        y: 705,
        name: 'Clara\'s Trace',
        role: 'echo',
        dialogue: [
          'I kept the village calm by making the streets feel familiar. Do not rush through the last familiar thing left here.',
          'The cathedral is louder than the forest. It just uses stone instead of leaves.'
        ],
        tint: 0xe4f4ff
      }
    ],
    backgroundLayers: skyLayers(0x392d29, 0x827466)
  },
  {
    id: 'underground-tunnels',
    index: 4,
    name: 'Underground Tunnels',
    subtitle: 'The mine narrows again, but it should still feel deliberate rather than springy.',
    theme: 'tunnels',
    width: 4300,
    height: 980,
    spawn: { x: 150, y: 690 },
    exit: { x: 4050, y: 580 },
    fogDensity: 0.78,
    darkness: 0.75,
    timeLimitHint: 'A little climbing stays here, but the pacing should still feel heavy and careful.',
    platforms: [
      { x: 620, y: 790, width: 1250, height: 64, texture: 'ground-tunnel' },
      { x: 2120, y: 790, width: 1180, height: 64, texture: 'ground-tunnel' },
      { x: 3620, y: 790, width: 1080, height: 64, texture: 'ground-tunnel' },
      { x: 1490, y: 650, width: 220, height: 28, texture: 'ledge-stone' },
      { x: 3170, y: 652, width: 220, height: 28, texture: 'ledge-stone' },
      { x: 3920, y: 580, width: 200, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [
      { x: 1490, y: 735, height: 160 },
      { x: 3170, y: 735, height: 160 }
    ],
    lanterns: [
      { x: 300, y: 720, radius: 160, checkpointId: 'tunnel-start' },
      { x: 2200, y: 720, radius: 170, checkpointId: 'tunnel-mid' },
      { x: 3950, y: 530, radius: 180, checkpointId: 'tunnel-shaft' }
    ],
    pickups: [
      { x: 1020, y: 735, kind: 'battery', id: 'tunnel-battery-1' },
      { x: 2230, y: 735, kind: 'battery', id: 'tunnel-battery-2' },
      { x: 3190, y: 610, kind: 'relic', id: 'tunnel-relic-1' },
      { x: 3820, y: 735, kind: 'symbol', id: 'tunnel-symbol-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [
      { id: 'tunnel-crate', kind: 'crate', x: 2550, y: 735, targetX: 2820, targetY: 735 },
      { id: 'tunnel-runes', kind: 'rune', x: 3750, y: 735, sequence: ['south', 'north', 'south'] }
    ],
    enemies: [
      { x: 1240, y: 735, kind: 'crawler', patrolDistance: 150 },
      { x: 2350, y: 735, kind: 'watcher', patrolDistance: 190 },
      { x: 3320, y: 610, kind: 'child', patrolDistance: 100 },
      { x: 3720, y: 735, kind: 'crawler', patrolDistance: 200 }
    ],
    npcs: [
      {
        id: 'tunnel-miner',
        x: 2160,
        y: 735,
        name: 'Miner Echo',
        role: 'echo',
        dialogue: [
          'We used to walk these rails with lunch pails and jokes. Fear makes every tunnel feel vertical.',
          'Keep your pace low. The dark below you is not the danger. The dark beside you is.'
        ],
        tint: 0xd5e7ff
      }
    ],
    backgroundLayers: skyLayers(0x202126, 0x626e7d)
  },
  {
    id: 'hollow-cathedral',
    index: 5,
    name: 'Hollow Cathedral',
    subtitle: 'The final approach should feel ceremonial, like walking toward an answer you already know.',
    theme: 'cathedral',
    width: 3400,
    height: 980,
    spawn: { x: 180, y: 700 },
    exit: { x: 3000, y: 580 },
    fogDensity: 0.7,
    darkness: 0.74,
    timeLimitHint: 'Less platforming, more procession. Let the room carry the weight.',
    platforms: [
      { x: 720, y: 800, width: 1500, height: 72, texture: 'ground-cathedral' },
      { x: 2490, y: 800, width: 760, height: 72, texture: 'ground-cathedral' },
      { x: 1320, y: 708, width: 200, height: 28, texture: 'ledge-stone' },
      { x: 1820, y: 662, width: 220, height: 28, texture: 'ledge-stone' },
      { x: 2350, y: 620, width: 240, height: 28, texture: 'ledge-stone' },
      { x: 2860, y: 580, width: 240, height: 28, texture: 'ledge-stone' }
    ],
    ladders: [],
    lanterns: [
      { x: 420, y: 730, radius: 190, checkpointId: 'cathedral-start' },
      { x: 2920, y: 540, radius: 215, checkpointId: 'cathedral-altar' }
    ],
    pickups: [
      { x: 1490, y: 666, kind: 'battery', id: 'cathedral-battery-1' },
      { x: 2320, y: 620, kind: 'battery', id: 'cathedral-battery-2' },
      { x: 2880, y: 760, kind: 'diary', id: 'cathedral-diary-1' }
    ],
    levers: [],
    doors: [],
    puzzles: [{ id: 'cathedral-runes', kind: 'rune', x: 2650, y: 760, sequence: ['west', 'east', 'north'] }],
    enemies: [],
    npcs: [
      {
        id: 'cathedral-clara',
        x: 2120,
        y: 620,
        name: 'Clara',
        role: 'echo',
        dialogue: [
          'You made it here because you stopped treating this place like a game board and started treating it like a grave.',
          'One more walk, Elias. Then you choose whether the Hollow loses me or the world.'
        ],
        tint: 0xf0f7ff
      }
    ],
    backgroundLayers: skyLayers(0x2b2028, 0x8d816e)
  }
];

export const LEVEL_BY_ID = Object.fromEntries(LEVELS.map((level) => [level.id, level])) as Record<
  LevelDefinition['id'],
  LevelDefinition
>;