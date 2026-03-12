import Phaser from 'phaser';
import { EnemyKind, EnemyState, DirectorSnapshot } from '../types/GameTypes';
import { Player } from './Player';
import { FlashlightSystem } from '../systems/FlashlightSystem';

export interface EnemyContext {
  player: Player;
  flashlight: FlashlightSystem;
  director: DirectorSnapshot;
  delta: number;
  safeZones: Array<{ x: number; y: number; radius: number }>;
}

export abstract class EnemyBase extends Phaser.Physics.Arcade.Sprite {
  readonly kind: EnemyKind;
  state = EnemyState.Patrol;
  protected homeX: number;
  protected patrolDistance: number;
  protected patrolSpeed = 70;
  protected chaseSpeed = 125;
  protected detectionRadius = 220;
  protected attackCooldownMs = 0;
  protected hoverBaseY = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, kind: EnemyKind, patrolDistance = 120) {
    super(scene, x, y, texture);
    this.kind = kind;
    this.homeX = x;
    this.patrolDistance = patrolDistance;
    this.hoverBaseY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(220, 680);
    this.setDepth(210);
  }

  updateEnemy(context: EnemyContext) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.attackCooldownMs = Math.max(0, this.attackCooldownMs - context.delta);

    const dx = context.player.x - this.x;
    const dy = context.player.y - this.y;
    const distance = Math.hypot(dx, dy);
    const lit = context.flashlight.isPointLit(context.player.x, context.player.y, this.x, this.y, context.player.facing);
    const isSafeZone = context.safeZones.some((zone) => Phaser.Math.Distance.Between(this.x, this.y, zone.x, zone.y) < zone.radius - 30);

    if (isSafeZone) {
      this.state = EnemyState.Flee;
      body.setVelocityX(Math.sign(this.x - context.player.x || 1) * this.chaseSpeed);
      this.setFlipX(body.velocity.x < 0);
      return;
    }

    if (lit) {
      this.reactToLight(context, dx, dy, distance);
    } else if (distance < this.detectionRadius + context.director.spawnPressure * 140) {
      this.state = EnemyState.Chase;
      body.setVelocityX(Math.sign(dx) * this.getChaseVelocity(context));
    } else if (context.director.spawnPressure > 0.78 && distance > 260) {
      this.state = EnemyState.Ambush;
      body.setVelocityX(Math.sign(dx) * this.getPatrolVelocity(context) * 1.2);
    } else {
      this.state = EnemyState.Patrol;
      const leftBound = this.homeX - this.patrolDistance;
      const rightBound = this.homeX + this.patrolDistance;
      if (this.x <= leftBound) {
        body.setVelocityX(this.getPatrolVelocity(context));
      } else if (this.x >= rightBound) {
        body.setVelocityX(-this.getPatrolVelocity(context));
      } else if (Math.abs(body.velocity.x) < 10) {
        body.setVelocityX(this.getPatrolVelocity(context) * (Math.random() > 0.5 ? 1 : -1));
      }
    }

    if (distance < 42 && Math.abs(dy) < 40 && this.attackCooldownMs <= 0 && !lit) {
      this.state = EnemyState.Attack;
      this.attackCooldownMs = 1300;
      context.player.takeHit(this.x, 1);
    }

    this.afterMove(context, lit, distance);
    if (Math.abs(body.velocity.x) > 4) {
      this.setFlipX(body.velocity.x < 0);
    }
    this.updateAnimation(lit);
  }

  protected getPatrolVelocity(context: EnemyContext) {
    return this.patrolSpeed * (0.95 + context.director.spawnPressure * 0.25);
  }

  protected getChaseVelocity(context: EnemyContext) {
    return this.chaseSpeed * (1 + context.director.spawnPressure * 0.25);
  }

  protected afterMove(_context: EnemyContext, _lit: boolean, _distance: number) {}

  protected abstract reactToLight(context: EnemyContext, dx: number, dy: number, distance: number): void;

  protected abstract updateAnimation(lit: boolean): void;
}
