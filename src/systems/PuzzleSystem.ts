import Phaser from 'phaser';
import { LevelDefinition, PuzzleDef } from '../types/GameTypes';

interface PuzzleRuntime {
  def: PuzzleDef;
  solved: boolean;
  sprite?: Phaser.GameObjects.Sprite;
  runes?: Array<{ sprite: Phaser.GameObjects.Sprite; label: string; lit: boolean; labelText: Phaser.GameObjects.Text }>;
  currentIndex?: number;
  requiredRotation?: number;
  currentRotation?: number;
}

export class PuzzleSystem {
  private scene: Phaser.Scene;
  private level: LevelDefinition;
  private doors: Map<string, Phaser.Physics.Arcade.Sprite>;
  private notify: (message: string) => void;
  private runtimes = new Map<string, PuzzleRuntime>();
  private startedAt = performance.now();
  private crateTargets = new Map<string, Phaser.Math.Vector2>();
  private crates: Phaser.Physics.Arcade.Sprite[];

  constructor(
    scene: Phaser.Scene,
    level: LevelDefinition,
    doors: Map<string, Phaser.Physics.Arcade.Sprite>,
    crates: Phaser.Physics.Arcade.Sprite[],
    notify: (message: string) => void
  ) {
    this.scene = scene;
    this.level = level;
    this.doors = doors;
    this.crates = crates;
    this.notify = notify;
  }

  build() {
    this.level.puzzles.forEach((puzzle) => {
      const runtime: PuzzleRuntime = { def: puzzle, solved: false };

      if (puzzle.kind === 'generator') {
        runtime.sprite = this.scene.add.sprite(puzzle.x, puzzle.y, 'generator').setDepth(130);
      }

      if (puzzle.kind === 'mirror') {
        runtime.sprite = this.scene.add.sprite(puzzle.x, puzzle.y, 'mirror').setDepth(130);
        runtime.requiredRotation = puzzle.targetX && puzzle.targetX > puzzle.x ? 0 : 180;
        runtime.currentRotation = 0;
        if (puzzle.targetX && puzzle.targetY) {
          this.scene.add.image(puzzle.targetX, puzzle.targetY, 'rune-idle').setDepth(128);
        }
      }

      if (puzzle.kind === 'rune') {
        runtime.currentIndex = 0;
        runtime.runes = (puzzle.sequence ?? []).map((label, index) => {
          const sprite = this.scene.add.sprite(puzzle.x + index * 52, puzzle.y, 'rune-idle').setDepth(132);
          const labelText = this.scene.add
            .text(sprite.x - 18, sprite.y - 34, label.slice(0, 1).toUpperCase(), {
              fontSize: '14px',
              color: '#dceffd'
            })
            .setDepth(133);
          return { sprite, label, lit: false, labelText };
        });
      }

      if (puzzle.kind === 'crate' && puzzle.targetX && puzzle.targetY) {
        this.crateTargets.set(puzzle.id, new Phaser.Math.Vector2(puzzle.targetX, puzzle.targetY));
      }

      this.runtimes.set(puzzle.id, runtime);
    });
  }

  private solve(runtime: PuzzleRuntime, message: string) {
    if (runtime.solved) {
      return false;
    }

    runtime.solved = true;
    if (runtime.def.opensDoorId) {
      this.openDoor(runtime.def.opensDoorId);
    }
    const solveMs = performance.now() - this.startedAt;
    this.notify(`${message} (${Math.max(1, Math.round(solveMs / 1000))}s)`);
    this.scene.add.particles(runtime.def.x, runtime.def.y - 12, 'particle-rune', {
      speed: { min: 30, max: 90 },
      lifespan: 650,
      quantity: 12,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });
    return true;
  }

  openDoor(id: string) {
    const door = this.doors.get(id);
    if (!door) {
      return;
    }
    door.setTexture('door-open');
    door.setAlpha(0.45);
    const doorBody = door.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody | null;
    if (doorBody) {
      doorBody.enable = false;
    }
  }

  update() {
    this.runtimes.forEach((runtime) => {
      if (runtime.def.kind === 'crate' && !runtime.solved) {
        const target = this.crateTargets.get(runtime.def.id);
        const crate = this.crates[0];
        if (crate && target && Phaser.Math.Distance.Between(crate.x, crate.y, target.x, target.y) < 26) {
          crate.setVelocity(0, 0);
          crate.setPosition(target.x, target.y);
          const crateBody = crate.body as Phaser.Physics.Arcade.Body | null;
          if (crateBody) {
            crateBody.moves = false;
          }
          this.solve(runtime, 'Crate path secured');
        }
      }
    });
  }

  tryInteract(playerX: number, playerY: number, flashlightOn: boolean) {
    for (const runtime of this.runtimes.values()) {
      if (runtime.solved) {
        continue;
      }

      if (runtime.def.kind === 'generator' && runtime.sprite) {
        if (Phaser.Math.Distance.Between(playerX, playerY, runtime.sprite.x, runtime.sprite.y) < 72) {
          runtime.sprite.setTint(0x9fe0c0);
          this.solve(runtime, 'Generator restored');
          return true;
        }
      }

      if (runtime.def.kind === 'mirror' && runtime.sprite) {
        if (Phaser.Math.Distance.Between(playerX, playerY, runtime.sprite.x, runtime.sprite.y) < 72) {
          runtime.currentRotation = ((runtime.currentRotation ?? 0) + 90) % 360;
          runtime.sprite.setAngle(runtime.currentRotation);
          if (flashlightOn && runtime.currentRotation === runtime.requiredRotation) {
            runtime.sprite.setTint(0xffefaf);
            this.solve(runtime, 'Mirror beam aligned');
          } else {
            this.notify('Mirror rotated');
          }
          return true;
        }
      }

      if (runtime.def.kind === 'rune' && runtime.runes) {
        for (const rune of runtime.runes) {
          if (Phaser.Math.Distance.Between(playerX, playerY, rune.sprite.x, rune.sprite.y) < 64) {
            const expected = runtime.def.sequence?.[runtime.currentIndex ?? 0];
            if (expected === rune.label) {
              rune.lit = true;
              rune.sprite.setTexture('rune-lit');
              runtime.currentIndex = (runtime.currentIndex ?? 0) + 1;
              if (runtime.currentIndex >= (runtime.def.sequence?.length ?? 0)) {
                this.solve(runtime, 'Runes answered');
              } else {
                this.notify('Rune sequence progressed');
              }
            } else {
              runtime.currentIndex = 0;
              runtime.runes.forEach((entry) => {
                entry.lit = false;
                entry.sprite.setTexture('rune-idle');
              });
              this.notify('The runes reject the order');
            }
            return true;
          }
        }
      }
    }

    return false;
  }

  canInteract(playerX: number, playerY: number) {
    return Array.from(this.runtimes.values()).some((runtime) => {
      if (runtime.solved) {
        return false;
      }
      if (runtime.sprite && Phaser.Math.Distance.Between(playerX, playerY, runtime.sprite.x, runtime.sprite.y) < 72) {
        return true;
      }
      return Boolean(runtime.runes?.some((rune) => Phaser.Math.Distance.Between(playerX, playerY, rune.sprite.x, rune.sprite.y) < 64));
    });
  }

  getSolvedCount() {
    return Array.from(this.runtimes.values()).filter((runtime) => runtime.solved).length;
  }

  getTotalCount() {
    return this.runtimes.size;
  }
}


