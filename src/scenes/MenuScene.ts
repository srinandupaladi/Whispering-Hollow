import Phaser from 'phaser';
import { SaveSystem } from '../systems/SaveSystem';
import { Soundscape } from '../utils/Soundscape';
import { LEVEL_BY_ID } from '../data/levels';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const save = SaveSystem.load();
    const soundscape = this.registry.get('soundscape') as Soundscape;

    this.add.rectangle(640, 360, 1280, 720, 0x081018, 1);
    for (let index = 0; index < 5; index += 1) {
      this.add
        .rectangle(640, 160 + index * 90, 1600, 120, 0x12202d + index * 0x030304, 0.18 + index * 0.04)
        .setScrollFactor(0.2 + index * 0.08);
    }

    this.add.text(640, 118, 'WHISPERING HOLLOW', {
      fontSize: '64px',
      color: '#efe8d0',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(640, 184, '2D Horror Platformer', {
      fontSize: '24px',
      color: '#b8cad8'
    }).setOrigin(0.5);

    this.add.text(
      640,
      290,
      [
        'A/D Move   Space Jump   Shift Sprint',
        'E Interact   F Flashlight   ESC Pause',
        'Lanterns are safe zones. The light is both shield and bait.'
      ],
      {
        fontSize: '24px',
        color: '#d8e1e8',
        align: 'center',
        lineSpacing: 12
      }
    ).setOrigin(0.5);

    const buttonStyle = {
      fontSize: '30px',
      color: '#fff1d6',
      backgroundColor: '#162535',
      padding: { x: 24, y: 12 }
    };

    const newGame = this.add.text(640, 430, 'New Game', buttonStyle).setOrigin(0.5).setInteractive({ useHandCursor: true });
    const continueGame = this.add
      .text(640, 500, `Continue: ${LEVEL_BY_ID[save.levelId].name}`, buttonStyle)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    const footer = this.add.text(640, 610, 'Generated art + synthesized soundscape. Browser-ready for static deployment.', {
      fontSize: '18px',
      color: '#9eb4c3'
    }).setOrigin(0.5);

    const startIntro = () => {
      soundscape.unlock();
      const fresh = SaveSystem.reset();
      this.registry.set('saveData', fresh);
      this.registry.set('elapsedMs', 0);
      this.scene.start('IntroScene', { levelId: 'broken-road' });
    };

    const continueFromSave = () => {
      soundscape.unlock();
      this.registry.set('saveData', save);
      this.registry.set('elapsedMs', save.elapsedMs);
      this.scene.start('LevelScene', { levelId: save.levelId, continueFromSave: true });
    };

    newGame.on('pointerdown', startIntro);
    continueGame.on('pointerdown', continueFromSave);

    this.input.keyboard?.on('keydown-ENTER', continueFromSave);
    this.input.keyboard?.on('keydown-N', startIntro);
    this.tweens.add({ targets: footer, alpha: { from: 0.55, to: 1 }, duration: 1800, yoyo: true, repeat: -1 });
  }
}
