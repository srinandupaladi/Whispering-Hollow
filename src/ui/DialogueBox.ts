import Phaser from 'phaser';

export class DialogueBox extends Phaser.GameObjects.Container {
  private panel: Phaser.GameObjects.Rectangle;
  private nameText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private hintText: Phaser.GameObjects.Text;
  private lines: string[] = [];
  private lineIndex = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 70, 500);
    this.panel = scene.add.rectangle(0, 0, 1140, 170, 0x070b10, 0.94).setOrigin(0, 0);
    this.nameText = scene.add.text(24, 18, '', {
      fontSize: '22px',
      color: '#f2e7c8',
      fontStyle: 'bold'
    });
    this.bodyText = scene.add.text(24, 58, '', {
      fontSize: '24px',
      color: '#d9e4ec',
      wordWrap: { width: 1088 },
      lineSpacing: 8
    });
    this.hintText = scene.add.text(1098, 138, 'E continue', {
      fontSize: '16px',
      color: '#a9bfce'
    }).setOrigin(1, 0);

    this.add([this.panel, this.nameText, this.bodyText, this.hintText]);
    this.setScrollFactor(0);
    this.setDepth(1400);
    this.setVisible(false);
    scene.add.existing(this);
  }

  open(name: string, lines: string[]) {
    this.lines = lines;
    this.lineIndex = 0;
    this.nameText.setText(name);
    this.bodyText.setText(lines[0] ?? '');
    this.setVisible(true);
  }

  advance() {
    this.lineIndex += 1;
    if (this.lineIndex >= this.lines.length) {
      this.close();
      return false;
    }

    this.bodyText.setText(this.lines[this.lineIndex]);
    return true;
  }

  close() {
    this.lines = [];
    this.lineIndex = 0;
    this.setVisible(false);
  }

  isOpen() {
    return this.visible;
  }
}