import Phaser from 'phaser';

export class Inventory extends Phaser.GameObjects.Container {
  private panel: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 980, 88);
    this.panel = scene.add.rectangle(0, 0, 260, 120, 0x0b0f15, 0.82).setOrigin(0, 0);
    this.text = scene.add.text(16, 14, '', {
      fontSize: '16px',
      color: '#dde7ee',
      lineSpacing: 6
    });
    this.add([this.panel, this.text]);
    this.setScrollFactor(0);
    this.setDepth(960);
    scene.add.existing(this);
  }

  updateCounts(diaryCount: number, relicCount: number, symbolCount: number) {
    this.text.setText([
      'Inventory',
      `Diary Pages: ${diaryCount}`,
      `Ancient Relics: ${relicCount}`,
      `Hidden Symbols: ${symbolCount}`
    ]);
  }
}
