import Phaser from 'phaser';
import { EndingKind } from '../types/GameTypes';
import { SaveSystem } from '../systems/SaveSystem';

export class GameOverScene extends Phaser.Scene {
  private ending: EndingKind = 'gameover';
  private cause = '';

  constructor() {
    super('GameOverScene');
  }

  init(data: { ending?: EndingKind; cause?: string }) {
    this.ending = data.ending ?? 'gameover';
    this.cause = data.cause ?? '';
  }

  create() {
    const save = SaveSystem.load();
    const loreCount = save.inventory.diaryPages.length + save.inventory.relics.length + save.inventory.symbols.length;
    const lines =
      this.ending === 'seal'
        ? [
            'Ending A: Ashen Mercy',
            'Elias seals the rift. Clara vanishes with the Hollow King, but Graves Hollow finally falls silent.',
            'The forest remains empty. The whispers stop.'
          ]
        : this.ending === 'save'
          ? [
              'Ending B: Open Wound',
              'Elias tears the portal wide enough to pull Clara free. The Hollow King escapes behind them.',
              'The village is saved for one night. The world is not.'
            ]
          : ['Game Over', this.cause || 'The fog closes in before Elias reaches Clara.', 'Lanterns are the only places the Hollow will not cross.'];

    this.add.rectangle(640, 360, 1280, 720, 0x05080d, 1);
    this.add.text(640, 156, lines[0], {
      fontSize: '54px',
      color: '#f0e5ca',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(640, 314, [lines[1], '', lines[2]], {
      fontSize: '28px',
      color: '#d6e0e8',
      align: 'center',
      wordWrap: { width: 920 },
      lineSpacing: 14
    }).setOrigin(0.5);

    this.add.text(
      640,
      500,
      [
        `Lore recovered: ${loreCount}`,
        `No Flashlight Run: ${save.achievements.noFlashlightRun ? 'Yes' : 'No'}`,
        `Speedrun: ${save.achievements.speedrun ? 'Yes' : 'No'}`,
        `Lore Master: ${save.achievements.loreMaster ? 'Yes' : 'No'}`
      ],
      {
        fontSize: '24px',
        color: '#b4c7d4',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5);

    this.add.text(
      640,
      640,
      this.ending === 'gameover' ? 'Press R to retry from your last lantern or M for menu' : 'Press M to return to the menu',
      {
        fontSize: '22px',
        color: '#efe0ba'
      }
    ).setOrigin(0.5);

    this.input.keyboard?.on('keydown-M', () => this.scene.start('MenuScene'));
    this.input.keyboard?.on('keydown-R', () => {
      if (this.ending === 'gameover') {
        const latest = SaveSystem.load();
        this.scene.start('LevelScene', { levelId: latest.levelId, continueFromSave: true });
      }
    });
  }
}
