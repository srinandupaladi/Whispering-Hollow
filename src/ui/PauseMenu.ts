import Phaser from 'phaser';

export class PauseMenu extends Phaser.GameObjects.Container {
  private visibleState = false;

  constructor(scene: Phaser.Scene) {
    super(scene, 430, 180);
    const panel = scene.add.rectangle(0, 0, 420, 320, 0x06080d, 0.92).setOrigin(0, 0);
    const title = scene.add.text(40, 36, 'Paused', {
      fontSize: '42px',
      color: '#f0eee6'
    });
    const text = scene.add.text(40, 108, ['ESC Resume', 'F Flashlight', 'E Interact', 'Shift Sprint', 'Lanterns save progress'].join('\n'), {
      fontSize: '20px',
      color: '#cbd8e1',
      lineSpacing: 10
    });
    this.add([panel, title, text]);
    this.setScrollFactor(0);
    this.setDepth(1200);
    this.setVisible(false);
    scene.add.existing(this);
  }

  toggle() {
    this.visibleState = !this.visibleState;
    this.setVisible(this.visibleState);
    return this.visibleState;
  }

  hide() {
    this.visibleState = false;
    this.setVisible(false);
  }
}
