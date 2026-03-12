import { SaveData, LevelId } from '../types/GameTypes';

const SAVE_KEY = 'whispering-hollow-save-v1';

export class SaveSystem {
  static createDefault(levelId: LevelId = 'broken-road'): SaveData {
    return {
      lastCheckpointId: 'new-game',
      levelId,
      battery: 100,
      health: 5,
      fear: 0.1,
      inventory: {
        diaryPages: [],
        relics: [],
        symbols: []
      },
      achievements: {
        noFlashlightRun: true,
        speedrun: false,
        loreMaster: false
      },
      elapsedMs: 0
    };
  }

  static load(): SaveData {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) {
        return this.createDefault();
      }

      return { ...this.createDefault(), ...JSON.parse(raw) } as SaveData;
    } catch {
      return this.createDefault();
    }
  }

  static write(data: SaveData) {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  static reset() {
    const fresh = this.createDefault();
    this.write(fresh);
    return fresh;
  }

  static saveCheckpoint(partial: Partial<SaveData>) {
    const next = { ...this.load(), ...partial } as SaveData;
    this.write(next);
    return next;
  }

  static addCollectible(kind: 'diaryPages' | 'relics' | 'symbols', id: string) {
    const save = this.load();
    if (!save.inventory[kind].includes(id)) {
      save.inventory[kind].push(id);
      this.write(save);
    }
    return save;
  }

  static updateAchievements(update: Partial<SaveData['achievements']>) {
    const save = this.load();
    save.achievements = { ...save.achievements, ...update };
    this.write(save);
    return save;
  }
}
