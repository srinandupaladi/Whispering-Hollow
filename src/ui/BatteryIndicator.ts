import Phaser from 'phaser';

export class BatteryIndicator extends Phaser.GameObjects.Container {
  private segments: Phaser.GameObjects.Rectangle[] = [];
  private label: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.label = scene.add.text(0, -18, 'BATTERY', {
      fontSize: '12px',
      color: '#d0d9df'
    });
    this.add(this.label);

    for (let index = 0; index < 10; index += 1) {
      const segment = scene.add.rectangle(index * 16, 0, 12, 12, 0xdab36d).setOrigin(0, 0.5);
      this.segments.push(segment);
      this.add(segment);
    }

    scene.add.existing(this);
  }

  updateValue(value: number, max: number) {
    const filled = Math.round((value / max) * this.segments.length);
    this.segments.forEach((segment, index) => {
      segment.setFillStyle(index < filled ? (filled <= 2 ? 0xbc5448 : 0xdab36d) : 0x1b242d);
      segment.setAlpha(index < filled ? 1 : 0.7);
    });
  }
}
