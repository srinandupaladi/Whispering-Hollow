import { EnemyState } from '../types/GameTypes';
import { EnemyBase, EnemyContext } from './EnemyBase';

export class ShadowCrawler extends EnemyBase {
  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance = 120) {
    super(scene, x, y, 'crawler-0', 'crawler', patrolDistance);
    this.patrolSpeed = 78;
    this.chaseSpeed = 140;
    this.detectionRadius = 210;
  }

  protected reactToLight(context: EnemyContext, dx: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.state = EnemyState.Flee;
    body.setVelocityX(-Math.sign(dx || 1) * this.chaseSpeed * 1.15);
  }

  protected afterMove(context: EnemyContext) {
    this.y = this.hoverBaseY + Math.sin(context.delta * 0.01 + this.x * 0.02) * 2;
  }

  protected updateAnimation(lit: boolean) {
    if (lit && this.state === EnemyState.Flee) {
      this.setTexture('crawler-attack');
      return;
    }
    this.play('crawler-crawl', true);
  }
}
