import Phaser from 'phaser';
import { EnemySpawnDef } from '../types/GameTypes';
import { Player } from '../characters/Player';
import { FlashlightSystem } from './FlashlightSystem';
import { HorrorDirectorSystem } from './HorrorDirectorSystem';
import { ShadowCrawler } from '../characters/ShadowCrawler';
import { WhisperChild } from '../characters/WhisperChild';
import { HollowWatcher } from '../characters/HollowWatcher';
import { EnemyBase } from '../characters/EnemyBase';

export class EnemyAISystem {
  private scene: Phaser.Scene;
  private player: Player;
  private flashlight: FlashlightSystem;
  private director: HorrorDirectorSystem;
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private enemies: EnemyBase[] = [];
  private safeZones: Array<{ x: number; y: number; radius: number }> = [];
  private ambushCooldown = 6000;
  private whisperCallback?: () => void;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    flashlight: FlashlightSystem,
    director: HorrorDirectorSystem,
    platforms: Phaser.Physics.Arcade.StaticGroup,
    whisperCallback?: () => void
  ) {
    this.scene = scene;
    this.player = player;
    this.flashlight = flashlight;
    this.director = director;
    this.platforms = platforms;
    this.whisperCallback = whisperCallback;
  }

  setSafeZones(zones: Array<{ x: number; y: number; radius: number }>) {
    this.safeZones = zones;
  }

  createEnemies(defs: EnemySpawnDef[]) {
    defs.forEach((def) => {
      let enemy: EnemyBase;
      switch (def.kind) {
        case 'crawler':
          enemy = new ShadowCrawler(this.scene, def.x, def.y, def.patrolDistance);
          break;
        case 'child':
          enemy = new WhisperChild(this.scene, def.x, def.y, def.patrolDistance);
          enemy.on('whisper', () => this.whisperCallback?.());
          break;
        case 'watcher':
          enemy = new HollowWatcher(this.scene, def.x, def.y, def.patrolDistance);
          break;
        default:
          return;
      }
      this.scene.physics.add.collider(enemy, this.platforms);
      this.enemies.push(enemy);
    });

    return this.enemies;
  }

  update(delta: number) {
    const snapshot = this.director.getSnapshot();
    this.ambushCooldown -= delta;
    this.enemies.forEach((enemy) => {
      enemy.updateEnemy({
        player: this.player,
        flashlight: this.flashlight,
        director: snapshot,
        delta,
        safeZones: this.safeZones
      });
    });

    if (snapshot.spawnPressure > 0.72 && this.ambushCooldown <= 0 && this.enemies.length < 8) {
      this.spawnAmbush(snapshot.spawnPressure > 0.86 ? 'watcher' : 'child');
      this.ambushCooldown = snapshot.spawnPressure > 0.86 ? 5200 : 7600;
    }
  }

  private spawnAmbush(kind: 'child' | 'watcher') {
    const offset = this.player.facing >= 0 ? -320 : 320;
    const x = Phaser.Math.Clamp(this.player.x + offset, 120, this.scene.physics.world.bounds.width - 120);
    const y = this.player.y - 40;
    const isSafe = this.safeZones.some((zone) => Phaser.Math.Distance.Between(x, y, zone.x, zone.y) < zone.radius);
    if (isSafe) {
      return;
    }

    const enemy = kind === 'child' ? new WhisperChild(this.scene, x, y, 80) : new HollowWatcher(this.scene, x, y, 120);
    if (enemy instanceof WhisperChild) {
      enemy.on('whisper', () => this.whisperCallback?.());
    }
    this.scene.physics.add.collider(enemy, this.platforms);
    this.enemies.push(enemy);
  }

  getThreatLevel() {
    return this.enemies.filter((enemy) => Phaser.Math.Distance.Between(enemy.x, enemy.y, this.player.x, this.player.y) < 260).length;
  }

  getEnemies() {
    return this.enemies;
  }
}
