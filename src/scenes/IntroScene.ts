import Phaser from 'phaser';
import { LevelId } from '../types/GameTypes';

export class IntroScene extends Phaser.Scene {
  private pages = [
    'Years ago, Graves Hollow vanished inside a ritual fog. Elias Ward returns when his sister Clara disappears following the same whispers.',
    'The villagers tried to summon an ancient sovereign of shadow: The Hollow King. They opened a wound between worlds instead.',
    'Clara found the breach and held it shut alone. Elias carries only an investigator’s notebook and a failing flashlight into the dark.',
    'If the light dies, the Hollow sees him. If the light stays on, the Hollow learns him.'
  ];

  private pageIndex = 0;
  private levelId: LevelId = 'broken-road';
  private pageText?: Phaser.GameObjects.Text;

  constructor() {
    super('IntroScene');
  }

  init(data: { levelId?: LevelId }) {
    this.levelId = data.levelId ?? 'broken-road';
  }

  create() {
    this.add.rectangle(640, 360, 1280, 720, 0x05070b, 1);
    this.add.text(640, 108, 'Elias Ward: Case Notes', {
      fontSize: '42px',
      color: '#efe4cb'
    }).setOrigin(0.5);

    this.pageText = this.add.text(640, 340, this.pages[0], {
      fontSize: '30px',
      color: '#d6e0e8',
      align: 'center',
      wordWrap: { width: 880 },
      lineSpacing: 14
    }).setOrigin(0.5);

    this.add.text(640, 620, 'Click or press Space to continue', {
      fontSize: '20px',
      color: '#a6bac7'
    }).setOrigin(0.5);

    const advance = () => {
      this.pageIndex += 1;
      if (this.pageIndex >= this.pages.length) {
        this.scene.start('LevelScene', { levelId: this.levelId });
        return;
      }
      this.pageText?.setText(this.pages[this.pageIndex]);
    };

    this.input.once('pointerdown', () => {});
    this.input.on('pointerdown', advance);
    this.input.keyboard?.on('keydown-SPACE', advance);
  }
}
