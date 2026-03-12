import Phaser from 'phaser';
import { DirectorSnapshot } from '../types/GameTypes';

export class FlashlightSystem {
  readonly maxBattery = 100;
  battery = 100;
  enabled = false;
  usedFlashlight = false;
  private blackoutMs = 0;
  private flicker = 1;

  toggle() {
    if (this.blackoutMs > 0 || this.battery <= 0) {
      this.enabled = false;
      return this.enabled;
    }

    this.enabled = !this.enabled;
    if (this.enabled) {
      this.usedFlashlight = true;
    }
    return this.enabled;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled && this.blackoutMs <= 0 && this.battery > 0;
    if (this.enabled) {
      this.usedFlashlight = true;
    }
  }

  update(delta: number, director: DirectorSnapshot, nearbyThreat: number, inSafeZone: boolean) {
    if (this.blackoutMs > 0) {
      this.blackoutMs -= delta;
      this.enabled = false;
    }

    if (this.enabled) {
      this.battery = Phaser.Math.Clamp(this.battery - delta * 0.0023, 0, this.maxBattery);
      if (this.battery <= 0) {
        this.enabled = false;
      }
    }

    if (!this.enabled && inSafeZone) {
      this.battery = Phaser.Math.Clamp(this.battery + delta * 0.006, 0, this.maxBattery);
    }

    const lowBatteryFactor = this.battery < 25 ? Phaser.Math.Linear(0.45, 1, this.battery / 25) : 1;
    const threatFlicker = 1 - Math.min(0.45, nearbyThreat * 0.18 + director.paranormalChance * 0.12);
    const randomPulse = this.battery < 20 && Math.random() < 0.08 ? Phaser.Math.FloatBetween(0.35, 0.85) : 1;
    this.flicker = lowBatteryFactor * threatFlicker * randomPulse;
  }

  addBattery(amount: number) {
    this.battery = Phaser.Math.Clamp(this.battery + amount, 0, this.maxBattery);
  }

  forceBlackout(durationMs: number) {
    this.blackoutMs = Math.max(this.blackoutMs, durationMs);
    this.enabled = false;
  }

  getIntensity() {
    if (!this.enabled || this.blackoutMs > 0 || this.battery <= 0) {
      return 0;
    }
    return Phaser.Math.Clamp((this.battery / this.maxBattery) * this.flicker, 0, 1);
  }

  isPointLit(playerX: number, playerY: number, pointX: number, pointY: number, facing: number) {
    const intensity = this.getIntensity();
    if (intensity <= 0.1) {
      return false;
    }

    const dx = pointX - playerX;
    const dy = pointY - (playerY - 10);
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 300) {
      return false;
    }

    const targetAngle = Math.atan2(dy, dx);
    const facingAngle = facing >= 0 ? 0 : Math.PI;
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(targetAngle - facingAngle));
    return angleDiff <= 0.72 && distance <= 300 * intensity + 120;
  }
}
