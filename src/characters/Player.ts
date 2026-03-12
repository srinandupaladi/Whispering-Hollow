import Phaser from 'phaser';

export interface ControlState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  jump: boolean;
  sprint: boolean;
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly maxHealth = 5;
  health = 5;
  facing = 1;
  isRunning = false;
  isCrouching = false;
  isClimbing = false;
  private invulnerabilityMs = 0;
  private previousJump = false;
  private wasOnFloor = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-idle-0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 28);
    body.setOffset(9, 4);
    body.setCollideWorldBounds(true);
    body.setMaxVelocity(360, 780);

    this.setDepth(220);
  }

  update(controls: ControlState, delta: number, ladderZones: Phaser.Geom.Rectangle[], flashlightOn: boolean) {
    this.invulnerabilityMs = Math.max(0, this.invulnerabilityMs - delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onFloor = body.onFloor();
    const currentLadder = ladderZones.find((ladder) => Phaser.Geom.Rectangle.Contains(ladder, this.x, this.y));
    const wantsClimb = Boolean(currentLadder && (controls.up || controls.down));

    this.isClimbing = wantsClimb;
    if (this.isClimbing) {
      body.setAllowGravity(false);
      body.setVelocityY((controls.up ? -1 : controls.down ? 1 : 0) * 185);
      body.setVelocityX(Phaser.Math.Linear(body.velocity.x, 0, 0.25));
    } else {
      body.setAllowGravity(true);
    }

    if (!this.isClimbing) {
      const moveDirection = (controls.left ? -1 : 0) + (controls.right ? 1 : 0);
      this.isCrouching = controls.down && onFloor;
      this.isRunning = controls.sprint && !this.isCrouching && moveDirection !== 0;
      const speed = this.isCrouching ? 95 : this.isRunning ? 285 : 185;
      body.setVelocityX(moveDirection * speed);

      if (moveDirection !== 0) {
        this.facing = moveDirection > 0 ? 1 : -1;
      }

      const jumpJustPressed = controls.jump && !this.previousJump;
      if (jumpJustPressed && onFloor) {
        body.setVelocityY(-430);
      }
    }

    this.previousJump = controls.jump;
    this.setFlipX(this.facing < 0);
    this.updateAnimation(flashlightOn);

    if (!this.wasOnFloor && onFloor) {
      this.emit('landed');
    }
    this.wasOnFloor = onFloor;
  }

  private updateAnimation(flashlightOn: boolean) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const speedX = Math.abs(body.velocity.x);
    const onFloor = body.onFloor();

    if (this.invulnerabilityMs > 0) {
      this.play('player-damage-flash', true);
      return;
    }

    if (!onFloor) {
      this.setTexture(body.velocity.y < 0 ? 'player-jump' : 'player-fall');
      return;
    }

    if (this.isCrouching) {
      this.setTexture('player-crouch');
      return;
    }

    if (speedX < 10) {
      this.play(flashlightOn ? 'player-light-idle' : 'player-idle', true);
      return;
    }

    if (this.isRunning) {
      this.play('player-run', true);
      return;
    }

    this.play(flashlightOn ? 'player-light-walk' : 'player-walk', true);
  }

  isHidden(flashlightOn: boolean) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return this.isCrouching && Math.abs(body.velocity.x) < 14 && !flashlightOn;
  }

  isInvulnerable() {
    return this.invulnerabilityMs > 0;
  }

  heal(amount: number) {
    this.health = Phaser.Math.Clamp(this.health + amount, 0, this.maxHealth);
  }

  takeHit(sourceX: number, amount = 1) {
    if (this.isInvulnerable()) {
      return false;
    }

    this.health -= amount;
    this.invulnerabilityMs = 1250;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.x < sourceX ? -210 : 210);
    body.setVelocityY(-220);
    return this.health > 0;
  }

  restoreAt(x: number, y: number, health = this.maxHealth) {
    this.health = health;
    this.invulnerabilityMs = 0;
    this.setPosition(x, y);
    this.setVelocity(0, 0);
  }
}
