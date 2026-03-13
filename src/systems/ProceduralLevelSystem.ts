import Phaser from 'phaser';
import { LevelDefinition, LanternDef, PickupDef, NpcDef } from '../types/GameTypes';
import { LightingSystem } from './LightingSystem';

export interface LanternRuntime extends LanternDef {
  sprite: Phaser.GameObjects.Image;
}

export interface PickupRuntime extends PickupDef {
  sprite: Phaser.Physics.Arcade.Sprite;
}

export interface NpcRuntime extends NpcDef {
  sprite: Phaser.Physics.Arcade.Sprite;
}

export interface LevelBuildResult {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  doors: Map<string, Phaser.Physics.Arcade.Sprite>;
  lanterns: LanternRuntime[];
  pickups: PickupRuntime[];
  levers: Map<string, Phaser.Physics.Arcade.Sprite>;
  crates: Phaser.Physics.Arcade.Sprite[];
  ladderZones: Phaser.Geom.Rectangle[];
  npcs: NpcRuntime[];
  exitZone: Phaser.GameObjects.Zone;
}

export class ProceduralLevelSystem {
  private scene: Phaser.Scene;
  private level: LevelDefinition;
  private lighting: LightingSystem;

  constructor(scene: Phaser.Scene, level: LevelDefinition, lighting: LightingSystem) {
    this.scene = scene;
    this.level = level;
    this.lighting = lighting;
  }

  private createRepeatedStatic(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, width: number, height: number, texture: string) {
    const textureFrame = this.scene.textures.get(texture).getSourceImage() as { width: number; height: number };
    const segmentWidth = textureFrame.width || 128;
    const count = Math.max(1, Math.ceil(width / segmentWidth));
    for (let index = 0; index < count; index += 1) {
      const partWidth = index === count - 1 ? width - segmentWidth * (count - 1) : segmentWidth;
      const sprite = group.create(x - width / 2 + partWidth / 2 + index * segmentWidth, y, texture) as Phaser.Physics.Arcade.Sprite;
      sprite.setDisplaySize(Math.max(8, partWidth), height).refreshBody();
      this.lighting.applyLit(sprite);
    }
  }

  private createBackdrop() {
    this.level.backgroundLayers.forEach((layer, index) => {
      this.scene.add
        .rectangle(this.level.width / 2, layer.y, this.level.width + 800, 180 * layer.scaleY, layer.color, layer.alpha)
        .setScrollFactor(layer.scrollFactor)
        .setDepth(index * 8);
    });

    if (this.level.theme === 'forest' || this.level.proceduralForest) {
      const rng = new Phaser.Math.RandomDataGenerator([this.level.id]);
      for (let index = 0; index < 30; index += 1) {
        const x = rng.between(100, this.level.width - 100);
        const y = rng.between(470, 720);
        const tree = this.scene.add.image(x, y, 'tree').setDepth(60 + rng.between(0, 60));
        tree.setScale(rng.realInRange(0.8, 1.35));
        tree.setAlpha(rng.realInRange(0.45, 0.9));
      }
    }

    if (this.level.theme === 'village') {
      for (let x = 500; x < this.level.width - 200; x += 620) {
        this.scene.add.rectangle(x, 560, 220, 200, 0x241e1c, 0.65).setDepth(45).setScrollFactor(0.55);
        this.scene.add.rectangle(x - 40, 520, 26, 44, 0xd7b982, 0.25).setDepth(46).setScrollFactor(0.55);
        this.scene.add.rectangle(x + 72, 516, 20, 38, 0xd7b982, 0.18).setDepth(46).setScrollFactor(0.55);
        this.scene.add.rectangle(x - 112, 690, 12, 120, 0x3e3024, 0.55).setDepth(62);
        this.scene.add.rectangle(x - 112, 632, 34, 18, 0xe6c27b, 0.18).setDepth(63);
      }
    }

    if (this.level.theme === 'tunnels') {
      for (let x = 250; x < this.level.width; x += 340) {
        this.scene.add.rectangle(x, 520, 14, 420, 0x3f372f, 0.5).setDepth(48);
        this.scene.add.rectangle(x + 24, 480, 14, 420, 0x3f372f, 0.4).setDepth(48);
      }
    }

    if (this.level.theme === 'cathedral') {
      for (let x = 360; x < this.level.width; x += 420) {
        this.scene.add.rectangle(x, 500, 30, 360, 0x3a3540, 0.5).setDepth(46).setScrollFactor(0.45);
      }
    }
  }

  build() {
    this.createBackdrop();
    const platforms = this.scene.physics.add.staticGroup();
    const doors = new Map<string, Phaser.Physics.Arcade.Sprite>();
    const lanterns: LanternRuntime[] = [];
    const pickups: PickupRuntime[] = [];
    const levers = new Map<string, Phaser.Physics.Arcade.Sprite>();
    const crates: Phaser.Physics.Arcade.Sprite[] = [];
    const ladderZones: Phaser.Geom.Rectangle[] = [];
    const npcs: NpcRuntime[] = [];

    this.level.platforms.forEach((platform) => {
      this.createRepeatedStatic(platforms, platform.x, platform.y, platform.width, platform.height, platform.texture);
    });

    this.level.ladders.forEach((ladder) => {
      const rungCount = Math.ceil(ladder.height / 64);
      for (let index = 0; index < rungCount; index += 1) {
        this.scene.add.image(ladder.x, ladder.y - ladder.height / 2 + 32 + index * 64, 'ladder').setDepth(110);
      }
      ladderZones.push(new Phaser.Geom.Rectangle(ladder.x - 20, ladder.y - ladder.height / 2, 40, ladder.height));
    });

    this.level.lanterns.forEach((lantern) => {
      const sprite = this.scene.add.image(lantern.x, lantern.y, 'lantern').setDepth(118);
      this.lighting.addLantern(lantern.x, lantern.y, lantern.radius);
      lanterns.push({ ...lantern, sprite });
      this.lighting.applyLit(sprite);
    });

    this.level.pickups.forEach((pickup) => {
      const texture = `pickup-${pickup.kind}`;
      const sprite = this.scene.physics.add.sprite(pickup.x, pickup.y, texture);
      sprite.body.allowGravity = false;
      sprite.setDepth(140);
      this.scene.tweens.add({
        targets: sprite,
        y: pickup.y - 8,
        duration: 1200 + Math.random() * 300,
        yoyo: true,
        repeat: -1
      });
      pickups.push({ ...pickup, sprite });
      this.lighting.applyLit(sprite);
    });

    this.level.npcs.forEach((npc) => {
      const key = npc.role === 'keeper' ? 'npc-keeper' : npc.role === 'villager' ? 'npc-villager' : 'npc-echo';
      const sprite = this.scene.physics.add.sprite(npc.x, npc.y, key);
      sprite.body.allowGravity = false;
      sprite.setImmovable(true);
      sprite.setDepth(146);
      if (npc.tint) {
        sprite.setTint(npc.tint);
      }
      if (npc.role === 'echo') {
        sprite.setAlpha(0.82);
        this.scene.tweens.add({
          targets: sprite,
          y: npc.y - 6,
          duration: 1600,
          yoyo: true,
          repeat: -1
        });
      }
      npcs.push({ ...npc, sprite });
      this.lighting.applyLit(sprite);
    });

    this.level.levers.forEach((lever) => {
      const sprite = this.scene.physics.add.sprite(lever.x, lever.y, 'lever-off');
      sprite.body.allowGravity = false;
      sprite.setImmovable(true);
      levers.set(lever.id, sprite);
      this.lighting.applyLit(sprite);
    });

    this.level.doors.forEach((door) => {
      const sprite = this.scene.physics.add.sprite(door.x, door.y, door.startsOpen ? 'door-open' : 'door-closed');
      sprite.body.allowGravity = false;
      sprite.setImmovable(true);
      sprite.setDisplaySize(door.width, door.height);
      if (door.startsOpen) {
        sprite.body.enable = false;
        sprite.setAlpha(0.4);
      }
      doors.set(door.id, sprite);
      this.lighting.applyLit(sprite);
    });

    this.level.puzzles
      .filter((puzzle) => puzzle.kind === 'crate')
      .forEach((puzzle) => {
        const crate = this.scene.physics.add.sprite(puzzle.x, puzzle.y, 'crate');
        crate.setBounce(0);
        crate.setDragX(900);
        crate.setDepth(142);
        crates.push(crate);
        this.lighting.applyLit(crate);
        if (puzzle.targetX && puzzle.targetY) {
          this.scene.add.image(puzzle.targetX, puzzle.targetY, 'pressure-plate').setDepth(102);
        }
      });

    const exitZone = this.scene.add.zone(this.level.exit.x, this.level.exit.y, 110, 170).setDepth(60);
    this.scene.physics.add.existing(exitZone, true);

    return {
      platforms,
      doors,
      lanterns,
      pickups,
      levers,
      crates,
      ladderZones,
      npcs,
      exitZone
    } satisfies LevelBuildResult;
  }
}