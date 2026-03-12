import Phaser from 'phaser';
import { Player, ControlState } from '../characters/Player';
import { FlashlightSystem } from '../systems/FlashlightSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { FogSystem } from '../systems/FogSystem';
import { HorrorDirectorSystem } from '../systems/HorrorDirectorSystem';
import { HUD } from '../ui/HUD';
import { PauseMenu } from '../ui/PauseMenu';
import { HollowKingBoss } from '../characters/HollowKingBoss';
import { SaveSystem } from '../systems/SaveSystem';
import { Soundscape } from '../utils/Soundscape';
import { LEVELS } from '../data/levels';

export class BossScene extends Phaser.Scene {
  private player!: Player;
  private flashlight = new FlashlightSystem();
  private lighting!: LightingSystem;
  private fog!: FogSystem;
  private director = new HorrorDirectorSystem();
  private hud!: HUD;
  private pauseMenu!: PauseMenu;
  private boss!: HollowKingBoss;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private keys!: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
    sprint: Phaser.Input.Keyboard.Key;
    interact: Phaser.Input.Keyboard.Key;
    flashlight: Phaser.Input.Keyboard.Key;
    pause: Phaser.Input.Keyboard.Key;
    one: Phaser.Input.Keyboard.Key;
    two: Phaser.Input.Keyboard.Key;
  };
  private runeNodes: Array<{ sprite: Phaser.GameObjects.Sprite; lit: boolean }> = [];
  private lanterns = [
    { x: 330, y: 720, radius: 170 },
    { x: 2920, y: 500, radius: 200 }
  ];
  private elapsedMs = 0;
  private pausedState = false;
  private endingChoiceVisible = false;
  private endingText?: Phaser.GameObjects.Text;
  private soundscape!: Soundscape;
  private heartbeatBucket = -1;

  constructor() {
    super('BossScene');
  }

  create() {
    this.soundscape = this.registry.get('soundscape') as Soundscape;
    this.soundscape.startAmbience('cathedral');

    const save = SaveSystem.load();
    this.elapsedMs = save.elapsedMs;
    this.flashlight.battery = save.battery;

    this.physics.world.setBounds(0, 0, 3400, 980);
    this.cameras.main.setBounds(0, 0, 3400, 980);

    this.add.rectangle(1700, 200, 4000, 340, 0x211922, 1).setScrollFactor(0.1);
    this.add.rectangle(1700, 420, 4000, 300, 0x2f2733, 0.65).setScrollFactor(0.25);
    for (let x = 320; x < 3200; x += 420) {
      this.add.rectangle(x, 460, 30, 360, 0x3a3540, 0.52).setDepth(30);
    }

    this.lighting = new LightingSystem(this);
    this.fog = new FogSystem(this, 3400, 980);
    this.fog.setDensity(0.84);

    this.platforms = this.physics.add.staticGroup();
    [
      { x: 720, y: 800, width: 1500, height: 72 },
      { x: 2490, y: 800, width: 760, height: 72 },
      { x: 1260, y: 620, width: 200, height: 28 },
      { x: 1720, y: 540, width: 200, height: 28 },
      { x: 2190, y: 620, width: 200, height: 28 },
      { x: 2810, y: 540, width: 240, height: 28 }
    ].forEach((platform) => {
      const sprite = this.platforms.create(platform.x, platform.y, platform.height > 30 ? 'ground-cathedral' : 'ledge-stone') as Phaser.Physics.Arcade.Sprite;
      sprite.setDisplaySize(platform.width, platform.height).refreshBody();
      this.lighting.applyLit(sprite);
    });

    this.player = new Player(this, 220, 700);
    this.player.health = save.health;
    this.physics.add.collider(this.player, this.platforms);
    this.lighting.applyLit(this.player);
    this.player.on('landed', () => this.soundscape.playEffect('land'));

    this.lanterns.forEach((lantern) => {
      const sprite = this.add.image(lantern.x, lantern.y, 'lantern').setDepth(118);
      this.lighting.addLantern(lantern.x, lantern.y, lantern.radius);
      this.lighting.applyLit(sprite);
    });

    [1100, 1730, 2360].forEach((x) => {
      const sprite = this.add.sprite(x, 740, 'rune-idle').setDepth(132);
      this.runeNodes.push({ sprite, lit: false });
      this.lighting.applyLit(sprite);
    });

    this.boss = new HollowKingBoss(this, 2640, 700);
    this.lighting.applyLit(this.boss);
    this.soundscape.playEffect('boss');

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.hud = new HUD(this);
    this.hud.setObjective('Light all three seal runes, then burn the Hollow King with the beam');
    this.pauseMenu = new PauseMenu(this);

    const added = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      flashlight: Phaser.Input.Keyboard.KeyCodes.F,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC,
      one: Phaser.Input.Keyboard.KeyCodes.ONE,
      two: Phaser.Input.Keyboard.KeyCodes.TWO
    }) as BossScene['keys'];
    if (!added) {
      throw new Error('Keyboard input is required for Whispering Hollow.');
    }
    this.keys = added;
  }

  update(_time: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }
    if (this.pausedState) {
      return;
    }

    if (this.endingChoiceVisible) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.one)) {
        this.finish('seal');
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.two)) {
        this.finish('save');
      }
      return;
    }

    const inSafeZone = this.lanterns.some((lantern) => Phaser.Math.Distance.Between(this.player.x, this.player.y, lantern.x, lantern.y) < lantern.radius);
    const controls = this.getControls();
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;

    if (Phaser.Input.Keyboard.JustDown(this.keys.flashlight)) {
      this.flashlight.toggle();
      this.soundscape.playEffect('toggle');
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && playerBody.onFloor()) {
      this.soundscape.playEffect('jump');
    }

    this.director.update(delta, {
      flashlightOn: this.flashlight.enabled,
      inDarkness: !inSafeZone && this.flashlight.getIntensity() < 0.15,
      running: this.player.isRunning,
      hidden: this.player.isHidden(this.flashlight.enabled),
      inSafeZone
    });
    const snapshot = this.director.getSnapshot();
    this.flashlight.update(delta, snapshot, 1 + (this.boss.health > 0 ? 1 : 0), inSafeZone);
    this.player.update(controls, delta, [], this.flashlight.enabled);
    this.boss.updateBoss(this.player, this.flashlight, this.runesLit(), delta);
    this.fog.setDensity(0.82 + snapshot.fogDensity * 0.08);
    this.fog.update(this.time.now, this.flashlight.getIntensity());
    this.lighting.update(this.cameras.main, this.player.x, this.player.y, this.player.facing, this.flashlight, 0.76, snapshot.fear);

    this.handleRunePrompt();
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.tryLightRune();
    }

    this.elapsedMs += delta;
    this.hud.updateTimer(this.elapsedMs);
    this.hud.updateHealth(this.player.health, this.player.maxHealth);
    this.hud.updateBattery(this.flashlight.battery, this.flashlight.maxBattery);
    this.hud.setLoreProgress(this.runesLit(), 3);

    const fear = snapshot.fear;
    const heartbeatBucket = Math.floor(fear * 5);
    if (heartbeatBucket !== this.heartbeatBucket) {
      this.heartbeatBucket = heartbeatBucket;
      this.soundscape.setHeartbeat(fear);
    }

    if (this.boss.defeated()) {
      this.showEndingChoice();
      return;
    }

    if (this.player.health <= 0) {
      this.scene.start('GameOverScene', { ending: 'gameover', cause: 'The Hollow King tears the seal apart.' });
    }
  }

  private getControls(): ControlState {
    return {
      left: this.keys.left.isDown,
      right: this.keys.right.isDown,
      up: this.keys.up.isDown,
      down: this.keys.down.isDown,
      jump: this.keys.jump.isDown,
      sprint: this.keys.sprint.isDown
    };
  }

  private handleRunePrompt() {
    const nearRune = this.runeNodes.find((rune) => !rune.lit && Phaser.Math.Distance.Between(this.player.x, this.player.y, rune.sprite.x, rune.sprite.y) < 72);
    if (nearRune) {
      this.hud.setPrompt('Press E to strengthen the seal rune');
      return;
    }
    this.hud.setPrompt('');
  }

  private tryLightRune() {
    const rune = this.runeNodes.find((entry) => !entry.lit && Phaser.Math.Distance.Between(this.player.x, this.player.y, entry.sprite.x, entry.sprite.y) < 72);
    if (!rune) {
      return;
    }
    rune.lit = true;
    rune.sprite.setTexture('rune-lit');
    this.add.particles(rune.sprite.x, rune.sprite.y - 10, 'particle-rune', {
      speed: { min: 40, max: 90 },
      lifespan: 650,
      quantity: 12,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });
    this.hud.flashMessage(this.runesLit() < 3 ? 'The rune glows brighter.' : 'The Hollow King is exposed to the beam.');
    this.soundscape.playEffect('pickup');
  }

  private runesLit() {
    return this.runeNodes.filter((rune) => rune.lit).length;
  }

  private showEndingChoice() {
    this.endingChoiceVisible = true;
    this.flashlight.setEnabled(false);
    this.endingText = this.add
      .text(
        this.cameras.main.midPoint.x,
        this.cameras.main.midPoint.y - 80,
        [
          'Clara holds the breach with the last of her light.',
          '',
          '1 Seal the portal forever and lose Clara.',
          '2 Tear the seal open to save Clara.'
        ],
        {
          fontSize: '28px',
          color: '#f0e8d2',
          align: 'center',
          stroke: '#090c11',
          strokeThickness: 5
        }
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(1400);
  }

  private finish(ending: 'seal' | 'save') {
    const save = SaveSystem.load();
    const loreCount = save.inventory.diaryPages.length + save.inventory.relics.length + save.inventory.symbols.length;
    const loreTotal = LEVELS.reduce((total, level) => total + level.pickups.filter((pickup) => pickup.kind !== 'battery').length, 0);
    SaveSystem.saveCheckpoint({
      levelId: 'hollow-cathedral',
      lastCheckpointId: 'hollow-king-defeated',
      battery: this.flashlight.battery,
      health: this.player.health,
      fear: this.director.getSnapshot().fear,
      elapsedMs: this.elapsedMs,
      achievements: {
        ...save.achievements,
        noFlashlightRun: save.achievements.noFlashlightRun && !this.flashlight.usedFlashlight,
        speedrun: this.elapsedMs < 18 * 60 * 1000,
        loreMaster: loreCount >= loreTotal
      }
    });
    this.scene.start('GameOverScene', { ending });
  }

  private togglePause() {
    this.pausedState = this.pauseMenu.toggle();
    if (this.pausedState) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }
}
