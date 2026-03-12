import Phaser from 'phaser';
import { LEVELS, LEVEL_BY_ID } from '../data/levels';
import { LevelId } from '../types/GameTypes';
import { Player, ControlState } from '../characters/Player';
import { FlashlightSystem } from '../systems/FlashlightSystem';
import { LightingSystem } from '../systems/LightingSystem';
import { FogSystem } from '../systems/FogSystem';
import { HorrorDirectorSystem } from '../systems/HorrorDirectorSystem';
import { ProceduralLevelSystem, LanternRuntime, PickupRuntime } from '../systems/ProceduralLevelSystem';
import { PuzzleSystem } from '../systems/PuzzleSystem';
import { EnemyAISystem } from '../systems/EnemyAISystem';
import { SaveSystem } from '../systems/SaveSystem';
import { HUD } from '../ui/HUD';
import { Inventory } from '../ui/Inventory';
import { PauseMenu } from '../ui/PauseMenu';
import { Soundscape } from '../utils/Soundscape';

interface LevelSceneData {
  levelId?: LevelId;
  continueFromSave?: boolean;
}

export class LevelScene extends Phaser.Scene {
  private levelId: LevelId = 'broken-road';
  private continueFromSave = false;
  private player!: Player;
  private flashlight = new FlashlightSystem();
  private lighting!: LightingSystem;
  private fog!: FogSystem;
  private director = new HorrorDirectorSystem();
  private enemyAI!: EnemyAISystem;
  private puzzles!: PuzzleSystem;
  private hud!: HUD;
  private inventory!: Inventory;
  private pauseMenu!: PauseMenu;
  private levelBuild!: ReturnType<ProceduralLevelSystem['build']>;
  private soundscape!: Soundscape;
  private saveData = SaveSystem.createDefault();
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
  };
  private elapsedMs = 0;
  private currentCheckpoint?: LanternRuntime;
  private lastSafeCheckpointId = '';
  private loreTotal = 0;
  private lastSolvedCount = 0;
  private paranormalTimer = 5000;
  private pausedState = false;
  private heartbeatBucket = -1;

  constructor() {
    super('LevelScene');
  }

  init(data: LevelSceneData) {
    this.levelId = data.levelId ?? 'broken-road';
    this.continueFromSave = Boolean(data.continueFromSave);
  }

  create() {
    const level = LEVEL_BY_ID[this.levelId];
    this.saveData = SaveSystem.load();
    this.soundscape = this.registry.get('soundscape') as Soundscape;
    this.soundscape.startAmbience(level.theme);
    this.elapsedMs = this.continueFromSave ? this.saveData.elapsedMs : (this.registry.get('elapsedMs') as number | undefined) ?? 0;
    this.loreTotal = LEVELS.reduce(
      (total, entry) => total + entry.pickups.filter((pickup) => pickup.kind !== 'battery').length,
      0
    );

    this.physics.world.setBounds(0, 0, level.width, level.height);
    this.cameras.main.setBounds(0, 0, level.width, level.height);

    this.lighting = new LightingSystem(this);
    const proceduralLevel = new ProceduralLevelSystem(this, level, this.lighting);
    this.levelBuild = proceduralLevel.build();
    this.fog = new FogSystem(this, level.width, level.height);
    this.fog.setDensity(level.fogDensity);

    const spawn = this.getSpawnPoint();
    this.player = new Player(this, spawn.x, spawn.y);
    this.player.health = this.continueFromSave && this.saveData.levelId === this.levelId ? this.saveData.health : this.player.maxHealth;
    this.flashlight.battery = this.continueFromSave && this.saveData.levelId === this.levelId ? this.saveData.battery : 100;

    this.lighting.applyLit(this.player);
    this.physics.add.collider(this.player, this.levelBuild.platforms);
    this.levelBuild.doors.forEach((door) => {
      this.physics.add.collider(this.player, door);
    });

    this.levelBuild.crates.forEach((crate) => {
      this.physics.add.collider(crate, this.levelBuild.platforms);
      this.physics.add.collider(this.player, crate);
      this.levelBuild.doors.forEach((door) => this.physics.add.collider(crate, door));
    });

    this.enemyAI = new EnemyAISystem(
      this,
      this.player,
      this.flashlight,
      this.director,
      this.levelBuild.platforms,
      () => this.onWhisperEvent()
    );
    this.enemyAI.setSafeZones(this.levelBuild.lanterns.map((lantern) => ({ x: lantern.x, y: lantern.y, radius: lantern.radius })));
    const enemies = this.enemyAI.createEnemies(level.enemies);
    enemies.forEach((enemy) => this.lighting.applyLit(enemy));

    this.puzzles = new PuzzleSystem(this, level, this.levelBuild.doors, this.levelBuild.crates, (message) => {
      this.hud.flashMessage(message);
      this.director.registerPuzzleSolved(0.02);
      this.soundscape.playEffect('pickup');
    });
    this.puzzles.build();

    this.levelBuild.pickups.forEach((pickup) => {
      if (pickup.kind !== 'battery' && this.hasCollected(pickup.id)) {
        pickup.sprite.destroy();
        return;
      }
      this.physics.add.overlap(this.player, pickup.sprite, () => this.collectPickup(pickup));
    });

    this.player.on('landed', () => this.soundscape.playEffect('land'));

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.hud = new HUD(this);
    this.inventory = new Inventory(this);
    this.pauseMenu = new PauseMenu(this);
    this.syncInventoryUI();
    this.setObjective();

    const added = this.input.keyboard?.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      sprint: Phaser.Input.Keyboard.KeyCodes.SHIFT,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      flashlight: Phaser.Input.Keyboard.KeyCodes.F,
      pause: Phaser.Input.Keyboard.KeyCodes.ESC
    }) as LevelScene['keys'];

    if (!added) {
      throw new Error('Keyboard input is required for Whispering Hollow.');
    }
    this.keys = added;

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.soundscape.stopAmbience();
    });

    this.hud.flashMessage(`${level.index}. ${level.name}`);
  }

  update(_time: number, delta: number) {
    if (Phaser.Input.Keyboard.JustDown(this.keys.pause)) {
      this.togglePause();
    }

    if (this.pausedState) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.flashlight)) {
      this.flashlight.toggle();
      this.soundscape.playEffect('toggle');
    }

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (Phaser.Input.Keyboard.JustDown(this.keys.jump) && body.onFloor()) {
      this.soundscape.playEffect('jump');
    }

    const controls = this.getControls();
    const inSafeZone = Boolean(this.getNearbyLantern());
    const flashlightOn = this.flashlight.enabled;

    this.director.update(delta, {
      flashlightOn,
      inDarkness: !inSafeZone && this.flashlight.getIntensity() < 0.2,
      running: this.player.isRunning,
      hidden: this.player.isHidden(flashlightOn),
      inSafeZone
    });

    const snapshot = this.director.getSnapshot();
    this.flashlight.update(delta, snapshot, this.enemyAI.getThreatLevel(), inSafeZone);
    this.player.update(controls, delta, this.levelBuild.ladderZones, this.flashlight.enabled);
    this.enemyAI.update(delta);
    this.puzzles.update();

    this.fog.setDensity(LEVEL_BY_ID[this.levelId].fogDensity + snapshot.fogDensity * 0.1);
    this.fog.update(this.time.now, this.flashlight.getIntensity());
    this.lighting.update(this.cameras.main, this.player.x, this.player.y, this.player.facing, this.flashlight, LEVEL_BY_ID[this.levelId].darkness, snapshot.fear);

    this.handleCheckpoint(inSafeZone);
    this.handleInteractionPrompt();
    if (Phaser.Input.Keyboard.JustDown(this.keys.interact)) {
      this.handleInteraction();
    }

    this.handleParanormalEvents(delta);
    this.updateProgress(delta);

    if (this.puzzles.getSolvedCount() !== this.lastSolvedCount) {
      this.lastSolvedCount = this.puzzles.getSolvedCount();
      this.setObjective();
    }

    if (this.player.health <= 0 || this.player.y > LEVEL_BY_ID[this.levelId].height + 120) {
      this.gameOver('The Hollow overtakes Elias.');
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

  private getSpawnPoint() {
    const level = LEVEL_BY_ID[this.levelId];
    if (this.continueFromSave && this.saveData.levelId === this.levelId) {
      const checkpoint = level.lanterns.find((lantern) => lantern.checkpointId === this.saveData.lastCheckpointId);
      if (checkpoint) {
        return { x: checkpoint.x - 34, y: checkpoint.y - 10 };
      }
    }
    return level.spawn;
  }

  private hasCollected(id: string) {
    return (
      this.saveData.inventory.diaryPages.includes(id) ||
      this.saveData.inventory.relics.includes(id) ||
      this.saveData.inventory.symbols.includes(id)
    );
  }

  private collectPickup(pickup: PickupRuntime) {
    if (!pickup.sprite.active) {
      return;
    }

    pickup.sprite.disableBody(true, true);
    switch (pickup.kind) {
      case 'battery':
        this.flashlight.addBattery(32);
        this.hud.flashMessage('Battery cells recovered');
        break;
      case 'diary':
        this.saveData = SaveSystem.addCollectible('diaryPages', pickup.id);
        this.hud.flashMessage('Diary page found');
        break;
      case 'relic':
        this.saveData = SaveSystem.addCollectible('relics', pickup.id);
        this.hud.flashMessage('Ancient relic recovered');
        break;
      case 'symbol':
        this.saveData = SaveSystem.addCollectible('symbols', pickup.id);
        this.hud.flashMessage('Hidden symbol traced');
        break;
    }
    this.soundscape.playEffect('pickup');
    this.syncInventoryUI();
  }

  private syncInventoryUI() {
    this.inventory.updateCounts(
      this.saveData.inventory.diaryPages.length,
      this.saveData.inventory.relics.length,
      this.saveData.inventory.symbols.length
    );
    const loreCount =
      this.saveData.inventory.diaryPages.length + this.saveData.inventory.relics.length + this.saveData.inventory.symbols.length;
    this.hud?.setLoreProgress(loreCount, this.loreTotal);
  }

  private getNearbyLantern() {
    return this.levelBuild.lanterns.find(
      (lantern) => Phaser.Math.Distance.Between(this.player.x, this.player.y, lantern.x, lantern.y) < lantern.radius
    );
  }

  private handleCheckpoint(inSafeZone: boolean) {
    if (!inSafeZone) {
      return;
    }

    const lantern = this.getNearbyLantern();
    if (!lantern || lantern.checkpointId === this.lastSafeCheckpointId) {
      return;
    }

    this.currentCheckpoint = lantern;
    this.lastSafeCheckpointId = lantern.checkpointId;
    this.director.calmFear(0.14);
    this.hud.flashMessage('Lantern checkpoint reached');
    this.saveSceneProgress(lantern.checkpointId);
  }

  private saveSceneProgress(checkpointId: string) {
    this.saveData = SaveSystem.saveCheckpoint({
      lastCheckpointId: checkpointId,
      levelId: this.levelId,
      battery: this.flashlight.battery,
      health: this.player.health,
      fear: this.director.getSnapshot().fear,
      elapsedMs: this.elapsedMs,
      achievements: {
        ...this.saveData.achievements,
        noFlashlightRun: !this.flashlight.usedFlashlight
      }
    });
    this.registry.set('saveData', this.saveData);
    this.registry.set('elapsedMs', this.elapsedMs);
  }

  private isExitReady() {
    const totalPuzzles = this.puzzles.getTotalCount();
    if (this.levelId === 'broken-road') {
      const gate = this.levelBuild.doors.get('road-gate');
      return gate ? !gate.body?.enable : false;
    }
    if (this.levelId === 'hollow-cathedral') {
      return totalPuzzles === 0 || this.puzzles.getSolvedCount() >= totalPuzzles;
    }
    return totalPuzzles === 0 || this.puzzles.getSolvedCount() >= totalPuzzles;
  }

  private setObjective() {
    const objectives: Record<LevelId, string> = {
      'broken-road': 'Pull the gate lever and enter Graves Hollow',
      'hollow-forest': 'Solve the rune path and survive the shifting woods',
      'forgotten-village': 'Restore power and align the church mirror',
      'underground-tunnels': 'Use the crate route and finish the tunnel rites',
      'hollow-cathedral': 'Reach the altar and confront the breach'
    };

    const solved = this.puzzles?.getSolvedCount?.() ?? 0;
    const total = this.puzzles?.getTotalCount?.() ?? 0;
    const suffix = total > 0 ? ` (${solved}/${total})` : '';
    this.hud?.setObjective(objectives[this.levelId] + suffix);
  }

  private handleInteractionPrompt() {
    const nearbyLever = this.getNearbyLever();
    const nearExit = Phaser.Geom.Rectangle.Contains(this.levelBuild.exitZone.getBounds(), this.player.x, this.player.y);
    if (nearbyLever) {
      this.hud.setPrompt('Press E to pull the lever');
      return;
    }
    if (this.canUsePuzzle()) {
      this.hud.setPrompt('Press E to interact');
      return;
    }
    if (nearExit && this.isExitReady()) {
      this.hud.setPrompt(this.levelId === 'hollow-cathedral' ? 'Press E to enter the altar chamber' : 'Press E to continue onward');
      return;
    }
    this.hud.setPrompt('');
  }

  private getNearbyLever() {
    for (const [id, sprite] of this.levelBuild.levers.entries()) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, sprite.x, sprite.y) < 68) {
        return { id, sprite };
      }
    }
    return null;
  }

  private canUsePuzzle() {
    return this.puzzles.canInteract(this.player.x, this.player.y);
  }

  private handleInteraction() {
    const nearbyLever = this.getNearbyLever();
    if (nearbyLever) {
      const leverDef = LEVEL_BY_ID[this.levelId].levers.find((lever) => lever.id === nearbyLever.id);
      nearbyLever.sprite.setTexture('lever-on');
      if (leverDef?.opensDoorId) {
        const door = this.levelBuild.doors.get(leverDef.opensDoorId);
        if (door) {
          door.setTexture('door-open');
          door.setAlpha(0.45);
          const doorBody = door.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
          if (doorBody) {
            doorBody.enable = false;
          }
        }
      }
      this.hud.flashMessage('Mechanism unlocked');
      this.soundscape.playEffect('pickup');
      this.setObjective();
      return;
    }

    if (this.puzzles.tryInteract(this.player.x, this.player.y, this.flashlight.enabled)) {
      this.setObjective();
      return;
    }

    const nearExit = Phaser.Geom.Rectangle.Contains(this.levelBuild.exitZone.getBounds(), this.player.x, this.player.y);
    if (nearExit && this.isExitReady()) {
      this.advanceLevel();
    }
  }

  private handleParanormalEvents(delta: number) {
    this.paranormalTimer -= delta;
    const snapshot = this.director.getSnapshot();
    if (this.paranormalTimer > 0 || Math.random() > snapshot.paranormalChance * 0.03) {
      return;
    }

    this.paranormalTimer = Phaser.Math.Between(3800, 7600);
    this.director.registerParanormalEvent();
    const eventIndex = Phaser.Math.Between(0, 3);
    if (eventIndex === 0) {
      this.flashlight.forceBlackout(900);
      this.lighting.triggerGlobalFlicker();
      this.hud.flashMessage('The flashlight dies in your hands.');
      this.soundscape.playEffect('damage');
      return;
    }

    if (eventIndex === 1) {
      const apparition = this.add.sprite(this.player.x + (this.player.facing > 0 ? 260 : -260), this.player.y - 20, 'child-1');
      apparition.setAlpha(0.2).setDepth(150).setTint(0xdce8ff);
      this.tweens.add({
        targets: apparition,
        alpha: 0,
        x: apparition.x + (this.player.facing > 0 ? -90 : 90),
        duration: 900,
        onComplete: () => apparition.destroy()
      });
      this.hud.flashMessage('A child watches from the fog.');
      this.soundscape.playEffect('whisper');
      return;
    }

    if (eventIndex === 2) {
      this.fog.pulseFog(0.45);
      this.cameras.main.shake(170, 0.0018);
      this.hud.flashMessage('A door slams somewhere in the village of the dead.');
      return;
    }

    this.onWhisperEvent();
  }

  private onWhisperEvent() {
    this.hud.flashMessage('A whisper circles just beyond the beam.');
    this.soundscape.playEffect('whisper');
  }

  private updateProgress(delta: number) {
    this.elapsedMs += delta;
    this.registry.set('elapsedMs', this.elapsedMs);
    this.hud.updateHealth(this.player.health, this.player.maxHealth);
    this.hud.updateBattery(this.flashlight.battery, this.flashlight.maxBattery);
    this.hud.updateTimer(this.elapsedMs);

    const fear = this.director.getSnapshot().fear;
    const heartbeatBucket = Math.floor(fear * 5);
    if (heartbeatBucket !== this.heartbeatBucket) {
      this.heartbeatBucket = heartbeatBucket;
      this.soundscape.setHeartbeat(fear);
    }

    if (this.flashlight.usedFlashlight) {
      this.saveData.achievements.noFlashlightRun = false;
    }
  }

  private advanceLevel() {
    const currentIndex = LEVELS.findIndex((level) => level.id === this.levelId);
    const nextLevel = LEVELS[currentIndex + 1];
    const achievements = {
      ...this.saveData.achievements,
      noFlashlightRun: !this.flashlight.usedFlashlight && this.saveData.achievements.noFlashlightRun,
      speedrun: this.elapsedMs < 18 * 60 * 1000,
      loreMaster:
        this.saveData.inventory.diaryPages.length + this.saveData.inventory.relics.length + this.saveData.inventory.symbols.length >= this.loreTotal
    };

    this.saveData = SaveSystem.saveCheckpoint({
      lastCheckpointId: this.lastSafeCheckpointId || `exit-${this.levelId}`,
      levelId: nextLevel?.id ?? this.levelId,
      battery: this.flashlight.battery,
      health: this.player.health,
      fear: this.director.getSnapshot().fear,
      elapsedMs: this.elapsedMs,
      achievements
    });
    this.registry.set('saveData', this.saveData);

    if (this.levelId === 'hollow-cathedral') {
      this.scene.start('BossScene');
      return;
    }

    if (!nextLevel) {
      this.scene.start('BossScene');
      return;
    }

    this.scene.start('LevelScene', { levelId: nextLevel.id });
  }

  private togglePause() {
    this.pausedState = this.pauseMenu.toggle();
    if (this.pausedState) {
      this.physics.world.pause();
    } else {
      this.physics.world.resume();
    }
  }

  private gameOver(reason: string) {
    this.saveSceneProgress(this.lastSafeCheckpointId || 'game-over');
    this.scene.start('GameOverScene', { ending: 'gameover', cause: reason });
  }
}


