import Phaser from 'phaser';
import { FlashlightSystem } from './FlashlightSystem';

interface LanternLight {
  glow: Phaser.GameObjects.Image;
  light: Phaser.GameObjects.Light;
}

export class LightingSystem {
  private scene: Phaser.Scene;
  private ambientOverlay: Phaser.GameObjects.Rectangle;
  private fearOverlay: Phaser.GameObjects.Rectangle;
  private flashlightCone: Phaser.GameObjects.Image;
  private flashlightLight: Phaser.GameObjects.Light;
  private lanterns: LanternLight[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.lights.enable();
    this.scene.lights.setAmbientColor(0x172028);

    this.ambientOverlay = scene.add.rectangle(0, 0, 1280, 720, 0x04060a, 0.18).setOrigin(0).setScrollFactor(0).setDepth(900);
    this.fearOverlay = scene.add.rectangle(0, 0, 1280, 720, 0x6c1010, 0).setOrigin(0).setScrollFactor(0).setDepth(901);
    this.flashlightCone = scene.add.image(0, 0, 'flashlight-cone').setDepth(320).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0);
    this.flashlightLight = scene.lights.addLight(0, 0, 230, 0xffefc3, 0);
  }

  applyLit(object: { setPipeline?: (pipeline: string) => unknown }) {
    object.setPipeline?.('Light2D');
  }

  addLantern(x: number, y: number, radius: number) {
    const glow = this.scene.add.image(x, y + 2, 'lantern-glow').setAlpha(0.5).setDepth(90);
    const light = this.scene.lights.addLight(x, y, radius, 0xffd388, 1.2);
    this.lanterns.push({ glow, light });
    return { glow, light };
  }

  triggerGlobalFlicker() {
    this.scene.tweens.add({
      targets: [...this.lanterns.map((entry) => entry.glow), this.flashlightCone],
      alpha: { from: 0.15, to: 0.65 },
      duration: 90,
      yoyo: true,
      repeat: 3
    });
  }

  update(
    camera: Phaser.Cameras.Scene2D.Camera,
    playerX: number,
    playerY: number,
    facing: number,
    flashlight: FlashlightSystem,
    levelDarkness: number,
    fear: number
  ) {
    const intensity = flashlight.getIntensity();
    const offsetX = facing >= 0 ? 125 : -125;
    const offsetY = -8;
    this.flashlightCone.setPosition(playerX + offsetX * 0.6, playerY + offsetY);
    this.flashlightCone.setRotation(facing >= 0 ? 0 : Math.PI);
    this.flashlightCone.setAlpha(intensity * 0.65);
    this.flashlightCone.setScale(0.85 + intensity * 0.4, 0.75 + intensity * 0.35);

    this.flashlightLight.x = playerX + offsetX;
    this.flashlightLight.y = playerY - 6;
    this.flashlightLight.intensity = intensity * 2.4;
    this.flashlightLight.radius = 180 + intensity * 120;

    this.ambientOverlay.setAlpha(Phaser.Math.Clamp(levelDarkness * 0.35 + fear * 0.16, 0.12, 0.5));
    this.fearOverlay.setAlpha(Math.max(0, fear - 0.62) * 0.26);

    this.ambientOverlay.setPosition(camera.scrollX, camera.scrollY);
    this.fearOverlay.setPosition(camera.scrollX, camera.scrollY);
  }
}
