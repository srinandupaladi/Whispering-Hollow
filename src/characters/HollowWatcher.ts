import { EnemyState } from '../types/GameTypes';
import { EnemyBase, EnemyContext } from './EnemyBase';

export class HollowWatcher extends EnemyBase {
  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance = 160) {
    super(scene, x, y, 'watcher-0', 'watcher', patrolDistance);
    this.patrolSpeed = 48;
    this.chaseSpeed = 106;
    this.detectionRadius = 320;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 48);
    body.setOffset(8, 4);
  }

  protected reactToLight(context: EnemyContext, dx: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.state = EnemyState.Chase;
    body.setVelocityX(Math.sign(dx || 1) * this.chaseSpeed * (1.25 + context.director.spawnPressure * 0.25));
    this.setTint(0xd3977c);
  }

  protected afterMove(context: EnemyContext, lit: boolean, distance: number) {
    if (!lit) {
      this.clearTint();
    }
    if (context.director.spawnPressure > 0.82 && distance > 300 && Math.random() < 0.003) {
      const offset = context.player.facing >= 0 ? -180 : 180;
      this.setPosition(context.player.x + offset, this.y);
    }
  }

  protected updateAnimation(lit: boolean) {
    if (lit && this.state === EnemyState.Chase) {
      this.setTexture('watcher-attack');
      return;
    }
    this.play('watcher-walk', true);
  }
}
