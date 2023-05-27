<template>
  <div class="home">
    <div class="settings">
      <label>
        <span>fps: {{ fpsDisplay }}</span>
      </label>
      <select class="resolution" v-model="resolution">
        <option value="2048,1536">2048x1536</option>
        <option value="1024,768">1024x768</option>
        <option value="800,600">800x600</option>
        <option value="640,480">640x480</option>
        <option value="320,240">320x240</option>
      </select>
      <label
        ><span>Level texture</span
        ><input type="checkbox" v-model="levelTexture" />
      </label>
      <label
        ><span>Wall texture</span
        ><input type="checkbox" v-model="wallTexture" />
      </label>
      <label>
        <span>Fish eye</span>
        <input v-model="fixFact" type="range" min="0" max="1.5" step="0.1" />
      </label>
      <label>
        <span>Distance</span>
        <input v-model="lookLength" type="range" min="20" max="80" step="5" />
      </label>
    </div>
    <div class="main">
      <canvas width="800" height="600" class="canvas" ref="mainCanvas"></canvas>
    </div>
    <div></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Player from '@/data/player/player';
import PlayerState from '@/data/player/playerState';
import { Main3D } from '@/data/main3D';
import { mod } from '@/data/exts';
import textureStore, { TextureType } from '@/data/texture/textureStore';
import SpriteStore from '@/data/sprite/spriteStore';
import { GameMap } from '@/data/gameMap/gameMap';
import settings, { setLookLength, setResolution } from '@/data/settings';

const playerState = new PlayerState(
  {
    x: 3,
    y: 3,
    z: 0,
    angle: 0,
  },
  { width: settings.playerWidth, height: settings.playerWidth },
  [TextureType.DukeFront, TextureType.DukeBack, TextureType.DukeSide],
  1
);

export default defineComponent({
  name: 'HomeView',
  async mounted() {
    window.onkeydown = (e: KeyboardEvent) => {
      this.currentKey.set(e.code, true);
    };
    window.onkeyup = (e: KeyboardEvent) => {
      this.currentKey.set(e.code, false);
    };

    if (!this.mainCanvas) throw 'no canvas';
    const canvas = this.mainCanvas;
    canvas.onclick = (e: MouseEvent) => {
      canvas.requestPointerLock();
    };
    canvas.onmousemove = (ev: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;

      playerState.position.angle += settings.turnSpeed * ev.movementX;
      playerState.lookVertical -= ev.movementY;
      if (playerState.lookVertical > 300) {
        playerState.lookVertical = 300;
      }
      if (playerState.lookVertical < -300) {
        playerState.lookVertical = -300;
      }
      playerState.halfLookVertical =
        settings.halfHeight + playerState.lookVertical;
    };

    // if ('onpointerlockchange' in document) {
    //   document.addEventListener('pointerlockchange', lockChangeAlert, false);
    // } else if ('onmozpointerlockchange' in document) {
    //   (document as Document).addEventListener(
    //     'mozpointerlockchange',
    //     () => { document.pointerLockElement === canvas },
    //     false
    //   );
    // }

    await textureStore.init();
    await this.gameMap.init();
    await this.spriteStore.init();
    this.main3D.init(this.mainCanvas);

    this.start();
  },

  unmounted() {
    window.onkeydown = null;
    window.onkeyup = null;
    this.stop();
  },
  watch: {
    resolution() {
      const dims = this.resolution.split(',');
      const width = parseInt(dims[0]);
      const height = parseInt(dims[1]);
      setResolution(width, height);
      playerState.halfLookVertical =
        settings.halfHeight + playerState.lookVertical;

      if (!this.mainCanvas) throw 'no canvas';
      this.main3D.init(this.mainCanvas);
    },
    wallTexture() {
      settings.wallTexture = this.wallTexture;
    },
    levelTexture() {
      settings.levelTexture = this.levelTexture;
    },
    fixFact() {
      settings.fixFact = this.fixFact;
    },
    lookLength() {
      setLookLength(this.lookLength);
    },
  },
  setup() {
    const mainCanvas = ref(null as HTMLCanvasElement | null);
    const keyMap = new Map<string, boolean>();
    const currentKey = ref(keyMap);
    let fps = 0;
    const fpsDisplay = ref(0);
    let prevTimestamp = 0;
    const stopped = ref(false);
    const gameMap = new GameMap();
    const spriteStore = new SpriteStore(playerState);
    const main3D = new Main3D(playerState, gameMap, spriteStore);
    const player = new Player(playerState, gameMap);

    function keyHandler(timestamp: number): void {
      const up =
        currentKey.value.get('ArrowUp') || currentKey.value.get('KeyW');
      const down =
        currentKey.value.get('ArrowDown') || currentKey.value.get('KeyS');
      const moveLeft = currentKey.value.get('KeyA');
      const moveRight = currentKey.value.get('KeyD');
      const enter = currentKey.value.get('Enter');

      if (enter) {
        const item = player.checkMovingItem();
        if (item) gameMap.toggleMovingItem(item, timestamp);
      }

      player.move(
        timestamp,
        up ? 1 : down ? -1 : 0,
        moveRight ? 1 : moveLeft ? -1 : 0
      );

      const left = currentKey.value.get('ArrowLeft');
      const right = currentKey.value.get('ArrowRight');
      player.turn(
        (left || right) ?? false,
        timestamp,
        right ? 1 : left ? -1 : 0
      );

      if (currentKey.value.get('Space')) {
        player.jump(timestamp);
      }
    }

    let animationFrame = 0;

    async function tick(timestamp: number) {
      if (stopped.value) return;
      if (mod(timestamp | 0, 4) === 0) {
        const diff = timestamp - prevTimestamp;
        fps = (1000 / diff) | 0;
        fpsDisplay.value = fps;
      }
      keyHandler(timestamp);
      gameMap.tickMovingItem(timestamp);
      //gameMap.tickPlatform(timestamp);
      player.tick(timestamp);
      main3D.renderMain();
      prevTimestamp = timestamp;
      animationFrame = window.requestAnimationFrame(tick);
    }
    const resolution = ref(
      `${settings.resolution.width},${settings.resolution.height}`
    );
    const levelTexture = ref(true);
    const wallTexture = ref(true);
    const fixFact = ref(settings.fixFact);
    const lookLength = ref(settings.lookLength);

    return {
      lookLength,
      fixFact,
      wallTexture,
      levelTexture,
      resolution,
      gameMap,
      currentKey,
      mainCanvas,
      spriteStore,
      keyHandler,
      start: () => {
        stopped.value = false;
        animationFrame = window.requestAnimationFrame(tick);
      },
      stop: () => {
        stopped.value = true;
        if (animationFrame) {
          window.cancelAnimationFrame(animationFrame);
        }
      },
      fpsDisplay,
      main3D,
    };
  },
});
</script>
<style lang="scss">
.home {
  display: flex;
  flex-direction: row;
}
.main,
.settings {
  display: flex;
  flex-direction: column;
}
.canvas {
  border: 1px black solid;
  background-color: #000;
}
.resolution {
  width: 200px;
}
.settings {
  margin-left: -90px;
  margin-right: 10px;
  width: 200px;
}
</style>
