import { DirectorSnapshot, HorrorMetrics } from '../types/GameTypes';

interface DirectorContext {
  flashlightOn: boolean;
  inDarkness: boolean;
  running: boolean;
  hidden: boolean;
  inSafeZone: boolean;
}

export class HorrorDirectorSystem {
  private metrics: HorrorMetrics = {
    darknessTime: 0,
    flashlightTime: 0,
    damageTaken: 0,
    runningTime: 0,
    hideTime: 0,
    puzzlesSolved: 0,
    fear: 0.12
  };

  private snapshot: DirectorSnapshot = {
    spawnPressure: 0.2,
    fogDensity: 0.4,
    paranormalChance: 0.1,
    ambientPulse: 0.14,
    fear: 0.12
  };

  update(delta: number, context: DirectorContext) {
    const seconds = delta / 1000;
    if (context.inDarkness) {
      this.metrics.darknessTime += seconds;
      this.metrics.fear = Math.min(1, this.metrics.fear + seconds * 0.04);
    }

    if (context.flashlightOn) {
      this.metrics.flashlightTime += seconds;
      this.metrics.fear = Math.max(0, this.metrics.fear - seconds * 0.015);
    }

    if (context.running) {
      this.metrics.runningTime += seconds;
      this.metrics.fear = Math.min(1, this.metrics.fear + seconds * 0.012);
    }

    if (context.hidden) {
      this.metrics.hideTime += seconds;
    }

    if (context.inSafeZone) {
      this.metrics.fear = Math.max(0.04, this.metrics.fear - seconds * 0.05);
    }

    const totalBehaviorTime = Math.max(
      1,
      this.metrics.darknessTime + this.metrics.flashlightTime + this.metrics.runningTime + this.metrics.hideTime
    );
    const flashlightRatio = this.metrics.flashlightTime / totalBehaviorTime;
    const runRatio = this.metrics.runningTime / totalBehaviorTime;
    const hideRatio = this.metrics.hideTime / totalBehaviorTime;

    this.snapshot = {
      fear: this.metrics.fear,
      spawnPressure: Phaser.Math.Clamp(0.18 + flashlightRatio * 0.42 + runRatio * 0.28 + this.metrics.damageTaken * 0.03, 0.15, 1),
      fogDensity: Phaser.Math.Clamp(0.3 + this.metrics.fear * 0.5 + hideRatio * 0.12, 0.25, 1),
      paranormalChance: Phaser.Math.Clamp(0.08 + this.metrics.fear * 0.34 + runRatio * 0.1, 0.05, 0.9),
      ambientPulse: Phaser.Math.Clamp(0.14 + this.metrics.fear * 0.55 + this.metrics.damageTaken * 0.02, 0.1, 1)
    };
  }

  registerDamage(amount = 1) {
    this.metrics.damageTaken += amount;
    this.metrics.fear = Math.min(1, this.metrics.fear + amount * 0.14);
  }

  registerPuzzleSolved(speedBonus = 0) {
    this.metrics.puzzlesSolved += 1;
    this.metrics.fear = Math.max(0.04, this.metrics.fear - 0.1 - speedBonus);
  }

  registerParanormalEvent() {
    this.metrics.fear = Math.min(1, this.metrics.fear + 0.06);
  }

  increaseFear(amount: number) {
    this.metrics.fear = Phaser.Math.Clamp(this.metrics.fear + amount, 0, 1);
  }

  calmFear(amount: number) {
    this.metrics.fear = Phaser.Math.Clamp(this.metrics.fear - amount, 0, 1);
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getSnapshot() {
    return { ...this.snapshot };
  }
}
