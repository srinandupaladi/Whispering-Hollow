import Phaser from 'phaser';
import { BatteryIndicator } from './BatteryIndicator';

export class HUD {
  readonly batteryIndicator: BatteryIndicator;
  private healthSegments: Phaser.GameObjects.Rectangle[] = [];
  private objectiveText: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  private loreText: Phaser.GameObjects.Text;
  private messageText: Phaser.GameObjects.Text;
  private promptText: Phaser.GameObjects.Text;
  private messageTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene) {
    scene.add.rectangle(26, 26, 360, 90, 0x0b0f14, 0.8).setOrigin(0, 0).setScrollFactor(0).setDepth(950);
    this.objectiveText = scene.add
      .text(44, 36, 'Objective', {
        fontSize: '18px',
        color: '#e5ecef'
      })
      .setScrollFactor(0)
      .setDepth(951);

    this.timerText = scene.add
      .text(44, 68, '00:00', {
        fontSize: '18px',
        color: '#c5d6df'
      })
      .setScrollFactor(0)
      .setDepth(951);

    this.loreText = scene.add
      .text(240, 68, 'Lore 0/0', {
        fontSize: '18px',
        color: '#c5d6df'
      })
      .setScrollFactor(0)
      .setDepth(951);

    this.messageText = scene.add
      .text(640, 64, '', {
        fontSize: '22px',
        color: '#f5efcc',
        stroke: '#0c0f12',
        strokeThickness: 4,
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(970)
      .setAlpha(0);

    this.promptText = scene.add
      .text(640, 664, '', {
        fontSize: '20px',
        color: '#dee9ef',
        stroke: '#091014',
        strokeThickness: 4,
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(970);

    for (let index = 0; index < 5; index += 1) {
      const segment = scene.add.rectangle(380 + index * 28, 56, 18, 18, 0xc35153).setOrigin(0, 0.5).setScrollFactor(0).setDepth(952);
      this.healthSegments.push(segment);
    }

    this.batteryIndicator = new BatteryIndicator(scene, 380, 88);
    this.batteryIndicator.setScrollFactor(0);
    this.batteryIndicator.setDepth(952);
  }

  updateHealth(health: number, maxHealth: number) {
    this.healthSegments.forEach((segment, index) => {
      segment.setFillStyle(index < health ? 0xc35153 : 0x29313a);
      segment.setAlpha(index < maxHealth ? 1 : 0.4);
    });
  }

  updateBattery(value: number, max: number) {
    this.batteryIndicator.updateValue(value, max);
  }

  updateTimer(elapsedMs: number) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    this.timerText.setText(`${minutes}:${seconds}`);
  }

  setObjective(text: string) {
    this.objectiveText.setText(text);
  }

  setLoreProgress(current: number, total: number) {
    this.loreText.setText(`Lore ${current}/${total}`);
  }

  setPrompt(text: string) {
    this.promptText.setText(text);
  }

  flashMessage(text: string) {
    this.messageText.setText(text);
    this.messageTween?.stop();
    this.messageText.setAlpha(1);
    this.messageTween = this.messageText.scene.tweens.add({
      targets: this.messageText,
      alpha: 0,
      duration: 2000,
      ease: 'Quad.out',
      delay: 600
    });
  }
}
