import Phaser from 'phaser';

export class FogSystem {
  private scene: Phaser.Scene;
  private layers: Phaser.GameObjects.TileSprite[] = [];
  private pulse = 0;

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    this.scene = scene;
    const configs = [
      { alpha: 0.22, depth: 120, scrollFactor: 0.2, y: worldHeight * 0.28, height: 180 },
      { alpha: 0.32, depth: 210, scrollFactor: 0.45, y: worldHeight * 0.44, height: 210 },
      { alpha: 0.4, depth: 305, scrollFactor: 0.7, y: worldHeight * 0.6, height: 240 }
    ];

    this.layers = configs.map((config, index) =>
      scene.add
        .tileSprite(worldWidth / 2, config.y, worldWidth + 640, config.height, 'fog-diffuse')
        .setAlpha(config.alpha)
        .setTint(index === 2 ? 0xcfd6db : 0xb8cad2)
        .setDepth(config.depth)
        .setScrollFactor(config.scrollFactor)
    );
  }

  setDensity(density: number) {
    this.layers.forEach((layer, index) => {
      const multiplier = 0.16 + index * 0.07;
      layer.alpha = Phaser.Math.Clamp(multiplier + density * 0.34 + this.pulse * 0.12, 0.08, 0.82);
    });
  }

  pulseFog(amount: number) {
    this.pulse = Phaser.Math.Clamp(this.pulse + amount, 0, 1);
  }

  update(time: number, flashlightIntensity: number) {
    this.pulse = Phaser.Math.Linear(this.pulse, 0, 0.03);
    this.layers.forEach((layer, index) => {
      layer.tilePositionX = time * (0.009 + index * 0.004);
      layer.tilePositionY = Math.sin(time * 0.0004 + index) * 18;
      layer.alpha = Math.max(0.08, layer.alpha - flashlightIntensity * 0.02 * (index + 1));
    });
  }
}
