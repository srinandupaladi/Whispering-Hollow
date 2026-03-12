import Phaser from 'phaser';
import { Player } from './Player';
import { FlashlightSystem } from '../systems/FlashlightSystem';

export class HollowKingBoss extends Phaser.Physics.Arcade.Sprite {
  maxHealth = 10;
  health = 10;
  phase = 1;
  vulnerable = false;
  private attackCooldown = 0;
  private teleportCooldown = 2800;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hollow-king-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(26, 52);
    body.setOffset(18, 8);
    this.setDepth(230);
  }

  updateBoss(player: Player, flashlight: FlashlightSystem, runesLit: number, delta: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.teleportCooldown = Math.max(0, this.teleportCooldown - delta);

    this.phase = this.health <= this.maxHealth / 2 ? 2 : 1;
    this.vulnerable = runesLit >= 3;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.hypot(dx, dy);

    if (this.teleportCooldown <= 0 && distance > 180) {
      this.teleportCooldown = this.phase === 1 ? 3200 : 2200;
      const direction = player.facing >= 0 ? 1 : -1;
      this.setPosition(player.x + Phaser.Math.Between(180, 260) * direction, Phaser.Math.Clamp(player.y - 10, 260, 760));
    }

    body.setVelocityX(Math.sign(dx || 1) * (this.phase === 1 ? 82 : 120));
    body.setVelocityY(Math.sin(this.scene.time.now * 0.002) * 16);
    this.setFlipX(body.velocity.x < 0);
    this.play('hollow-king-idle', true);

    if (distance < 64 && this.attackCooldown <= 0) {
      this.attackCooldown = 1200;
      player.takeHit(this.x, this.phase === 2 ? 2 : 1);
    }

    if (this.vulnerable && flashlight.isPointLit(player.x, player.y, this.x, this.y, player.facing) && Math.random() < 0.025) {
      this.health = Math.max(0, this.health - 1);
      this.setTint(0xffd2bf);
      this.scene.time.delayedCall(160, () => this.clearTint());
    }
  }

  defeated() {
    return this.health <= 0;
  }
}
