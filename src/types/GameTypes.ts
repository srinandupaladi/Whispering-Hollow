export type LevelId =
  | 'broken-road'
  | 'hollow-forest'
  | 'forgotten-village'
  | 'underground-tunnels'
  | 'hollow-cathedral';

export type EnemyKind = 'crawler' | 'child' | 'watcher';

export type PuzzleKind = 'mirror' | 'generator' | 'crate' | 'rune';

export type EndingKind = 'seal' | 'save' | 'gameover';

export enum EnemyState {
  Idle = 'idle',
  Patrol = 'patrol',
  Investigate = 'investigate',
  Chase = 'chase',
  Flee = 'flee',
  Ambush = 'ambush',
  Attack = 'attack'
}

export interface PlatformDef {
  x: number;
  y: number;
  width: number;
  height: number;
  texture: string;
  immovable?: boolean;
}

export interface LadderDef {
  x: number;
  y: number;
  height: number;
}

export interface LanternDef {
  x: number;
  y: number;
  radius: number;
  checkpointId: string;
}

export interface PickupDef {
  x: number;
  y: number;
  kind: 'battery' | 'diary' | 'relic' | 'symbol';
  id: string;
}

export interface LeverDef {
  x: number;
  y: number;
  id: string;
  opensDoorId?: string;
}

export interface DoorDef {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  startsOpen?: boolean;
}

export interface PuzzleDef {
  id: string;
  kind: PuzzleKind;
  x: number;
  y: number;
  sequence?: string[];
  opensDoorId?: string;
  targetX?: number;
  targetY?: number;
}

export interface EnemySpawnDef {
  x: number;
  y: number;
  kind: EnemyKind;
  patrolDistance?: number;
}

export interface BackgroundLayerDef {
  key: string;
  color: number;
  alpha: number;
  scrollFactor: number;
  y: number;
  scaleY: number;
}

export interface LevelDefinition {
  id: LevelId;
  index: number;
  name: string;
  subtitle: string;
  theme: 'road' | 'forest' | 'village' | 'tunnels' | 'cathedral';
  width: number;
  height: number;
  spawn: { x: number; y: number };
  exit: { x: number; y: number };
  fogDensity: number;
  darkness: number;
  timeLimitHint?: string;
  platforms: PlatformDef[];
  ladders: LadderDef[];
  lanterns: LanternDef[];
  pickups: PickupDef[];
  levers: LeverDef[];
  doors: DoorDef[];
  puzzles: PuzzleDef[];
  enemies: EnemySpawnDef[];
  backgroundLayers: BackgroundLayerDef[];
  proceduralForest?: boolean;
}

export interface SaveData {
  lastCheckpointId: string;
  levelId: LevelId;
  battery: number;
  health: number;
  fear: number;
  inventory: {
    diaryPages: string[];
    relics: string[];
    symbols: string[];
  };
  achievements: {
    noFlashlightRun: boolean;
    speedrun: boolean;
    loreMaster: boolean;
  };
  elapsedMs: number;
}

export interface HorrorMetrics {
  darknessTime: number;
  flashlightTime: number;
  damageTaken: number;
  runningTime: number;
  hideTime: number;
  puzzlesSolved: number;
  fear: number;
}

export interface DirectorSnapshot {
  spawnPressure: number;
  fogDensity: number;
  paranormalChance: number;
  ambientPulse: number;
  fear: number;
}
