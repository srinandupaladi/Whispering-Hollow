import { EnemyState } from '../types/GameTypes';
import { EnemyBase, EnemyContext } from './EnemyBase';

export class WhisperChild extends EnemyBase {
  private whisperTimer = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, patrolDistance = 90) {
    super(scene, x, y, 'child-0', 'child', patrolDistance);
    this.patrolSpeed = 52;
    this.chaseSpeed = 92;
    this.detectionRadius = 250;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
  }

  protected reactToLight(context: EnemyContext, dx: number, dy: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.state = EnemyState.Flee;
    body.setVelocityX(-Math.sign(dx || 1) * this.chaseSpeed * 1.25);
    body.setVelocityY(Math.sign(-dy || -1) * this.chaseSpeed * 0.35);
    this.setAlpha(0.15);
  }

  protected afterMove(context: EnemyContext, lit: boolean, distance: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(Math.sin(this.scene.time.now * 0.003 + this.x * 0.01) * 40);
    this.setAlpha(lit ? 0.15 : 0.7);
    if (!lit && distance < 220) {
      this.whisperTimer -= context.delta;
      if (this.whisperTimer <= 0) {
        this.whisperTimer = 3600;
        this.emit('whisper');
      }
    }
  }

  protected updateAnimation(_lit: boolean) {
    this.play('child-float', true);
  }
}
