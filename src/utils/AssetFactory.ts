import Phaser from 'phaser';

const withGraphics = (
  scene: Phaser.Scene,
  width: number,
  height: number,
  draw: (graphics: Phaser.GameObjects.Graphics) => void
) => {
  const graphics = scene.make.graphics({ x: 0, y: 0 });
  draw(graphics);
  return {
    generate: (key: string) => {
      if (!scene.textures.exists(key)) {
        graphics.generateTexture(key, width, height);
      }
      graphics.destroy();
    }
  };
};

const registerAnimation = (
  scene: Phaser.Scene,
  key: string,
  frames: string[],
  frameRate: number,
  repeat = -1
) => {
  if (scene.anims.exists(key)) {
    return;
  }

  scene.anims.create({
    key,
    frames: frames.map((frame) => ({ key: frame })),
    frameRate,
    repeat
  });
};

const createSolid = (scene: Phaser.Scene, key: string, width: number, height: number, fill: number, border?: number) => {
  withGraphics(scene, width, height, (graphics) => {
    graphics.clear();
    graphics.fillStyle(fill, 1);
    graphics.fillRect(0, 0, width, height);
    if (border !== undefined) {
      graphics.lineStyle(2, border, 1);
      graphics.strokeRect(1, 1, width - 2, height - 2);
    }
  }).generate(key);
};

const createGround = (
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  base: number,
  detail: number,
  grass = false
) => {
  withGraphics(scene, width, height, (graphics) => {
    graphics.clear();
    graphics.fillStyle(base, 1);
    graphics.fillRect(0, 0, width, height);
    graphics.fillStyle(detail, 0.45);
    for (let x = 0; x < width; x += 8) {
      graphics.fillRect(x, Phaser.Math.Between(0, 6), 4, height);
    }
    if (grass) {
      graphics.fillStyle(detail + 0x122800, 0.9);
      for (let x = 0; x < width; x += 6) {
        const bladeHeight = Phaser.Math.Between(4, 10);
        graphics.fillRect(x, 0, 2, bladeHeight);
      }
    }
  }).generate(key);
};

const createLantern = (scene: Phaser.Scene) => {
  withGraphics(scene, 32, 48, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x3a2816, 1);
    graphics.fillRect(12, 2, 8, 6);
    graphics.fillStyle(0xc38a45, 1);
    graphics.fillRect(8, 8, 16, 22);
    graphics.fillStyle(0xffe1a0, 0.9);
    graphics.fillRect(11, 11, 10, 16);
    graphics.fillStyle(0x5d3d24, 1);
    graphics.fillRect(13, 30, 6, 14);
  }).generate('lantern');

  withGraphics(scene, 140, 140, (graphics) => {
    graphics.clear();
    for (let radius = 70; radius > 10; radius -= 8) {
      graphics.fillStyle(0xffc96b, 0.015 + radius / 900);
      graphics.fillCircle(70, 70, radius);
    }
  }).generate('lantern-glow');
};

const createPickupTextures = (scene: Phaser.Scene) => {
  withGraphics(scene, 20, 24, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x203041, 1);
    graphics.fillRect(4, 4, 12, 16);
    graphics.fillStyle(0x8ecbff, 1);
    graphics.fillRect(6, 6, 8, 12);
    graphics.fillStyle(0xeff6ff, 0.7);
    graphics.fillRect(7, 8, 3, 8);
  }).generate('pickup-battery');

  withGraphics(scene, 20, 24, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0xb9ac91, 1);
    graphics.fillRect(4, 2, 12, 20);
    graphics.fillStyle(0x56463d, 1);
    graphics.fillRect(6, 5, 8, 2);
    graphics.fillRect(6, 10, 8, 2);
    graphics.fillRect(6, 15, 8, 2);
  }).generate('pickup-diary');

  withGraphics(scene, 20, 20, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x7a6b56, 1);
    graphics.fillCircle(10, 10, 9);
    graphics.fillStyle(0xd9bc6a, 1);
    graphics.fillCircle(10, 10, 5);
  }).generate('pickup-relic');

  withGraphics(scene, 22, 22, (graphics) => {
    graphics.clear();
    graphics.lineStyle(2, 0xbbe8ff, 1);
    graphics.strokeCircle(11, 11, 8);
    graphics.strokeCircle(11, 11, 4);
    graphics.strokeLineShape(new Phaser.Geom.Line(11, 2, 11, 20));
    graphics.strokeLineShape(new Phaser.Geom.Line(2, 11, 20, 11));
  }).generate('pickup-symbol');
};

const createInterfaceTextures = (scene: Phaser.Scene) => {
  createSolid(scene, 'hud-panel', 320, 82, 0x0b0e13, 0x3b4b56);
  createSolid(scene, 'pause-panel', 420, 320, 0x06080d, 0x515864);
  createSolid(scene, 'inventory-panel', 280, 220, 0x0b0f15, 0x5f6b73);
  createSolid(scene, 'meter-fill', 8, 8, 0xdab36d);
  createSolid(scene, 'meter-fill-danger', 8, 8, 0xbc5448);
  createSolid(scene, 'meter-bg', 8, 8, 0x1b242d);
  createSolid(scene, 'button-touch', 96, 96, 0xffffff);
};

const createParticles = (scene: Phaser.Scene) => {
  withGraphics(scene, 32, 32, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0xffffff, 0.35);
    graphics.fillCircle(16, 16, 12);
  }).generate('particle-fog');

  withGraphics(scene, 14, 14, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0xffc56e, 0.85);
    graphics.fillCircle(7, 7, 4);
  }).generate('particle-ember');

  withGraphics(scene, 12, 12, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x89b5d8, 0.9);
    graphics.fillRect(4, 0, 4, 12);
    graphics.fillRect(0, 4, 12, 4);
  }).generate('particle-rune');

  withGraphics(scene, 18, 18, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x111111, 0.9);
    graphics.fillCircle(9, 9, 7);
  }).generate('particle-shadow');
};

const createLightingTextures = (scene: Phaser.Scene) => {
  withGraphics(scene, 220, 220, (graphics) => {
    graphics.clear();
    for (let radius = 110; radius >= 6; radius -= 6) {
      graphics.fillStyle(0xf7f0d2, 0.007 + radius / 1600);
      graphics.fillCircle(110, 110, radius);
    }
  }).generate('light-circle');

  withGraphics(scene, 320, 160, (graphics) => {
    graphics.clear();
    for (let layer = 0; layer < 8; layer += 1) {
      graphics.fillStyle(0xfaf3cc, 0.02 + layer * 0.02);
      graphics.fillTriangle(12, 80, 260 + layer * 8, 16 + layer * 6, 260 + layer * 8, 144 - layer * 6);
    }
  }).generate('flashlight-cone');

  withGraphics(scene, 240, 180, (graphics) => {
    graphics.clear();
    for (let x = 0; x < 240; x += 16) {
      graphics.fillStyle(0xffffff, 0.04);
      graphics.fillRect(x, 0, 10, 180);
    }
  }).generate('fog-diffuse');
};

const drawHumanoid = (
  scene: Phaser.Scene,
  key: string,
  bodyColor: number,
  accentColor: number,
  poseOffset: number,
  withLight = false,
  crouched = false
) => {
  withGraphics(scene, 32, 32, (graphics) => {
    graphics.clear();
    const bodyTop = crouched ? 13 : 9;
    const bodyHeight = crouched ? 11 : 14;
    const legHeight = crouched ? 5 : 8;

    graphics.fillStyle(accentColor, 1);
    graphics.fillRect(10, bodyTop - 5, 12, 8);
    graphics.fillStyle(bodyColor, 1);
    graphics.fillRect(10, bodyTop, 12, bodyHeight);
    graphics.fillRect(11, bodyTop + bodyHeight, 3, legHeight - Math.max(0, poseOffset));
    graphics.fillRect(18, bodyTop + bodyHeight, 3, legHeight + Math.min(0, poseOffset));
    graphics.fillRect(7 + poseOffset, bodyTop + 2, 4, 8);
    graphics.fillRect(21, bodyTop + 2, 4, 8);
    graphics.fillStyle(0xf2e8d2, 1);
    graphics.fillRect(13, bodyTop - 7, 6, 3);
    if (withLight) {
      graphics.fillStyle(0xe7d6a0, 1);
      graphics.fillRect(23, bodyTop + 4, 6, 3);
    }
  }).generate(key);
};

const createPlayerTextures = (scene: Phaser.Scene) => {
  drawHumanoid(scene, 'player-idle-0', 0x41586b, 0x9ca2a3, 0, false);
  drawHumanoid(scene, 'player-idle-1', 0x445b71, 0x9ca2a3, 1, false);
  drawHumanoid(scene, 'player-walk-0', 0x42586e, 0x9aa2a4, -2, false);
  drawHumanoid(scene, 'player-walk-1', 0x42586e, 0x9aa2a4, 1, false);
  drawHumanoid(scene, 'player-walk-2', 0x42586e, 0x9aa2a4, 2, false);
  drawHumanoid(scene, 'player-run-0', 0x455e75, 0x9aa2a4, -3, false);
  drawHumanoid(scene, 'player-run-1', 0x455e75, 0x9aa2a4, 3, false);
  drawHumanoid(scene, 'player-light-idle-0', 0x465f77, 0x9ca2a3, 0, true);
  drawHumanoid(scene, 'player-light-idle-1', 0x48637a, 0x9ca2a3, 1, true);
  drawHumanoid(scene, 'player-light-walk-0', 0x49657b, 0x9ca2a3, -2, true);
  drawHumanoid(scene, 'player-light-walk-1', 0x49657b, 0x9ca2a3, 1, true);
  drawHumanoid(scene, 'player-light-walk-2', 0x49657b, 0x9ca2a3, 2, true);
  drawHumanoid(scene, 'player-jump', 0x5d7186, 0xc8d2d8, 0, false);
  drawHumanoid(scene, 'player-fall', 0x394f62, 0x88939a, 0, false);
  drawHumanoid(scene, 'player-crouch', 0x404d61, 0x8a959a, 0, false, true);
  drawHumanoid(scene, 'player-damage', 0x8c4f58, 0xc7d3db, 0, true);
  drawHumanoid(scene, 'player-death', 0x2a2b35, 0x656d77, 0, false, true);

  registerAnimation(scene, 'player-idle', ['player-idle-0', 'player-idle-1'], 3);
  registerAnimation(scene, 'player-walk', ['player-walk-0', 'player-walk-1', 'player-walk-2'], 8);
  registerAnimation(scene, 'player-run', ['player-run-0', 'player-run-1'], 10);
  registerAnimation(scene, 'player-light-idle', ['player-light-idle-0', 'player-light-idle-1'], 4);
  registerAnimation(scene, 'player-light-walk', ['player-light-walk-0', 'player-light-walk-1', 'player-light-walk-2'], 10);
  registerAnimation(scene, 'player-damage-flash', ['player-damage', 'player-light-idle-0'], 12, 0);
};

const createEnemyTextures = (scene: Phaser.Scene) => {
  const crawler = (key: string, accent: number, offset: number) => {
    withGraphics(scene, 32, 24, (graphics) => {
      graphics.clear();
      graphics.fillStyle(0x0f1216, 1);
      graphics.fillEllipse(16, 12, 20, 14);
      graphics.fillStyle(accent, 1);
      graphics.fillRect(20, 9, 4, 3);
      for (let index = 0; index < 4; index += 1) {
        graphics.fillRect(4 + index * 6, 16 + (index % 2 === 0 ? offset : -offset), 3, 6);
      }
    }).generate(key);
  };

  crawler('crawler-0', 0xd8875e, 2);
  crawler('crawler-1', 0xd8875e, -1);
  crawler('crawler-2', 0xe9b672, 3);
  crawler('crawler-attack', 0xffd7b2, 0);
  registerAnimation(scene, 'crawler-crawl', ['crawler-0', 'crawler-1', 'crawler-2'], 10);

  const child = (key: string, alpha: number, handOffset: number) => {
    withGraphics(scene, 28, 36, (graphics) => {
      graphics.clear();
      graphics.fillStyle(0xe1ecff, alpha);
      graphics.fillCircle(14, 10, 6);
      graphics.fillRect(11, 16, 6, 12);
      graphics.fillRect(7 - handOffset, 17, 4, 11);
      graphics.fillRect(17 + handOffset, 17, 4, 11);
      graphics.fillRect(11, 28, 3, 7);
      graphics.fillRect(14, 28, 3, 7);
    }).generate(key);
  };

  child('child-0', 0.72, 0);
  child('child-1', 0.52, 1);
  child('child-2', 0.38, 2);
  registerAnimation(scene, 'child-float', ['child-0', 'child-1', 'child-2', 'child-1'], 5);

  const watcher = (key: string, color: number, eyeColor: number, armOffset: number) => {
    withGraphics(scene, 34, 52, (graphics) => {
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(12, 6, 10, 14);
      graphics.fillRect(10, 20, 14, 18);
      graphics.fillRect(9 - armOffset, 18, 3, 17);
      graphics.fillRect(22 + armOffset, 18, 3, 17);
      graphics.fillRect(12, 38, 4, 10);
      graphics.fillRect(18, 38, 4, 10);
      graphics.fillStyle(eyeColor, 1);
      graphics.fillRect(14, 12, 2, 2);
      graphics.fillRect(18, 12, 2, 2);
    }).generate(key);
  };

  watcher('watcher-0', 0x11161a, 0xd7e4f0, 0);
  watcher('watcher-1', 0x161d22, 0xf0b6a0, 1);
  watcher('watcher-attack', 0x1f1718, 0xffd0bf, 2);
  registerAnimation(scene, 'watcher-walk', ['watcher-0', 'watcher-1'], 4);

  const king = (key: string, highlight: number, crownOffset: number) => {
    withGraphics(scene, 64, 64, (graphics) => {
      graphics.clear();
      graphics.fillStyle(0x0a0b10, 1);
      graphics.fillRect(20, 14, 24, 22);
      graphics.fillRect(18, 36, 28, 18);
      graphics.fillRect(22, 54, 6, 8);
      graphics.fillRect(36, 54, 6, 8);
      graphics.fillRect(17 - crownOffset, 18, 3, 18);
      graphics.fillRect(44 + crownOffset, 18, 3, 18);
      graphics.fillStyle(highlight, 1);
      graphics.fillRect(27, 20, 3, 3);
      graphics.fillRect(34, 20, 3, 3);
      graphics.fillRect(26, 8, 14, 5);
      graphics.fillRect(22, 6, 4, 6);
      graphics.fillRect(40, 6, 4, 6);
    }).generate(key);
  };

  king('hollow-king-0', 0xebddd5, 0);
  king('hollow-king-1', 0xffad91, 2);
  registerAnimation(scene, 'hollow-king-idle', ['hollow-king-0', 'hollow-king-1'], 3);
};

const createNpcTextures = (scene: Phaser.Scene) => {
  const makeNpc = (key: string, coat: number, accent: number, glow = false) => {
    withGraphics(scene, 32, 36, (graphics) => {
      graphics.clear();
      graphics.fillStyle(accent, glow ? 0.75 : 1);
      graphics.fillRect(11, 2, 10, 7);
      graphics.fillStyle(coat, glow ? 0.8 : 1);
      graphics.fillRect(9, 10, 14, 16);
      graphics.fillRect(6, 14, 4, 10);
      graphics.fillRect(22, 14, 4, 10);
      graphics.fillRect(11, 26, 4, 8);
      graphics.fillRect(17, 26, 4, 8);
      if (glow) {
        graphics.fillStyle(0xe4f5ff, 0.45);
        graphics.fillRect(12, 6, 8, 4);
      }
    }).generate(key);
  };

  makeNpc('npc-keeper', 0x5f4a35, 0xe2cf9f);
  makeNpc('npc-villager', 0x48515c, 0xd8c1a3);
  makeNpc('npc-echo', 0x9fc1d4, 0xf3f8ff, true);
};
const createEnvironmentTextures = (scene: Phaser.Scene) => {
  createGround(scene, 'ground-road', 128, 64, 0x46362b, 0x85735a);
  createGround(scene, 'ground-forest', 128, 64, 0x213224, 0x587048, true);
  createGround(scene, 'ground-village', 128, 64, 0x4b4138, 0x8c7663);
  createGround(scene, 'ground-tunnel', 128, 64, 0x2c2f39, 0x666d79);
  createGround(scene, 'ground-cathedral', 128, 72, 0x333039, 0x7b727f);
  createGround(scene, 'ledge-stone', 96, 28, 0x535762, 0x8f98a6);
  createGround(scene, 'ledge-root', 96, 28, 0x332519, 0x76593a, true);
  createGround(scene, 'ledge-wood', 96, 28, 0x5b4330, 0x9d7d59);

  withGraphics(scene, 54, 116, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x1a231a, 1);
    graphics.fillRect(22, 34, 10, 82);
    graphics.fillStyle(0x2f4430, 1);
    graphics.fillTriangle(27, 0, 0, 44, 54, 44);
    graphics.fillTriangle(27, 14, 4, 60, 50, 60);
    graphics.fillTriangle(27, 28, 7, 74, 47, 74);
  }).generate('tree');

  withGraphics(scene, 32, 64, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x6f5a3a, 1);
    graphics.fillRect(6, 0, 20, 64);
    graphics.fillStyle(0xd4cc96, 1);
    graphics.fillRect(10, 8, 12, 48);
  }).generate('ladder');

  withGraphics(scene, 40, 86, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x2c221a, 1);
    graphics.fillRect(4, 0, 32, 86);
    graphics.fillStyle(0x7e5f3d, 1);
    graphics.fillRect(8, 6, 24, 74);
  }).generate('door-closed');

  withGraphics(scene, 40, 86, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x1f2a1f, 1);
    graphics.fillRect(4, 0, 32, 86);
    graphics.fillStyle(0x597e66, 1);
    graphics.fillRect(10, 6, 20, 74);
  }).generate('door-open');

  withGraphics(scene, 32, 32, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x745839, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0x3e2c18, 1);
    graphics.strokeRect(2, 2, 28, 28);
  }).generate('crate');

  withGraphics(scene, 18, 36, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x6f4c38, 1);
    graphics.fillRect(7, 12, 4, 24);
    graphics.fillStyle(0xcbb685, 1);
    graphics.fillRect(0, 0, 18, 12);
  }).generate('lever-off');

  withGraphics(scene, 18, 36, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x6f4c38, 1);
    graphics.fillRect(7, 12, 4, 24);
    graphics.fillStyle(0x92c36f, 1);
    graphics.fillRect(0, 0, 18, 12);
  }).generate('lever-on');

  withGraphics(scene, 36, 36, (graphics) => {
    graphics.clear();
    graphics.lineStyle(3, 0xb8e8ff, 1);
    graphics.strokeRect(10, 4, 16, 28);
    graphics.fillStyle(0xd2e7f5, 0.4);
    graphics.fillRect(12, 6, 12, 24);
  }).generate('mirror');

  withGraphics(scene, 44, 36, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x394451, 1);
    graphics.fillRect(0, 0, 44, 36);
    graphics.fillStyle(0x96d7be, 1);
    graphics.fillRect(4, 4, 36, 12);
    graphics.fillStyle(0x283137, 1);
    graphics.fillRect(8, 22, 8, 8);
    graphics.fillRect(20, 22, 8, 8);
  }).generate('generator');

  withGraphics(scene, 36, 36, (graphics) => {
    graphics.clear();
    graphics.lineStyle(3, 0x9bc9e6, 1);
    graphics.strokeCircle(18, 18, 12);
    graphics.strokeLineShape(new Phaser.Geom.Line(18, 3, 18, 33));
    graphics.strokeLineShape(new Phaser.Geom.Line(3, 18, 33, 18));
  }).generate('rune-idle');

  withGraphics(scene, 36, 36, (graphics) => {
    graphics.clear();
    graphics.lineStyle(3, 0xffefb6, 1);
    graphics.strokeCircle(18, 18, 12);
    graphics.strokeLineShape(new Phaser.Geom.Line(18, 3, 18, 33));
    graphics.strokeLineShape(new Phaser.Geom.Line(3, 18, 33, 18));
  }).generate('rune-lit');

  withGraphics(scene, 48, 36, (graphics) => {
    graphics.clear();
    graphics.fillStyle(0x4f3f39, 1);
    graphics.fillRect(8, 10, 32, 22);
    graphics.fillStyle(0x9ca1a8, 1);
    graphics.fillRect(12, 6, 24, 4);
  }).generate('pressure-plate');
};

export const generateRuntimeAssets = (scene: Phaser.Scene) => {
  createLightingTextures(scene);
  createParticles(scene);
  createLantern(scene);
  createEnvironmentTextures(scene);
  createPickupTextures(scene);
  createInterfaceTextures(scene);
  createNpcTextures(scene);
  createPlayerTextures(scene);
  createEnemyTextures(scene);
};

