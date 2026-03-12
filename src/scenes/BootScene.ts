import Phaser from 'phaser';
import { generateRuntimeAssets } from '../utils/AssetFactory';
import { Soundscape } from '../utils/Soundscape';
import { SaveSystem } from '../systems/SaveSystem';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    generateRuntimeAssets(this);
    if (!this.registry.has('soundscape')) {
      this.registry.set('soundscape', new Soundscape());
    }

    const save = SaveSystem.load();
    this.registry.set('saveData', save);
    this.registry.set('elapsedMs', save.elapsedMs);
    this.scene.start('MenuScene');
  }
}
