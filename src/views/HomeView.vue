<template>
  <div class="home">
    <span>fps: {{ fpsDisplay }}</span>
    <div>
      <canvas width="800" height="600" class="canvas" ref="mainCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Player from '@/data/player';
import { PlayerState } from '@/data/playerState';
import { Main3D } from '@/data/main3D';
import consts, { mod } from '@/data/consts';
import { GameMap } from '@/data/gameMap';
import textureStore, { TextureType } from '@/data/textureStore';
import SpriteStore from '@/data/spriteStore';
const playerState = new PlayerState(
  {
    x: 3,
    y: 3,
    z: 0,
  },
  { width: consts.playerWidth, height: consts.playerWidth },
  [TextureType.DukeFront, TextureType.DukeBack, TextureType.DukeSide],
  1
);
const halfHeight = consts.resolution.height / 2;

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

      playerState.angle += consts.turnSpeed * ev.movementX;
      playerState.lookVertical -= ev.movementY;
      if (playerState.lookVertical > 300) {
        playerState.lookVertical = 300;
      }
      if (playerState.lookVertical < -300) {
        playerState.lookVertical = -300;
      }
      playerState.halfLookVertical = halfHeight + playerState.lookVertical;
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
        const res = player.checkDoor();
        if (res.door) {
          gameMap.toggleDoor(res.door, timestamp);
        }
        if (res.platform) {
          gameMap.togglePlatform(res.platform, timestamp);
        }
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
      gameMap.tickDoor(timestamp);
      gameMap.tickPlatform(timestamp);
      player.tick(timestamp);
      spriteStore.tick(timestamp);
      main3D.renderMain();
      prevTimestamp = timestamp;
      animationFrame = window.requestAnimationFrame(tick);
    }

    return {
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
  flex-direction: column;
}
.canvas {
  border: 1px black solid;
  background-color: #000;
}
</style>
