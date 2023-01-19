<template>
  <div class="home">
    <span>{{ fpsDisplay }}</span>
    <!-- <div>
      <canvas width="200" height="100" class="canvas" ref="mapCanvas"></canvas>
    </div> -->
    <div>
      <canvas width="800" height="600" class="canvas" ref="mainCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
// import map from '@/data/map';
import { defineComponent, ref } from 'vue';
// import consts from '@/data/consts';
import Player from '@/data/player';
// import player2d from '@/data/player2d';
import { PlayerState } from '@/data/playerState';
import { Main3D } from '@/data/main3D';
import consts from '@/data/consts';
import { GameMap } from '@/data/gameMap';

const playerState = new PlayerState();

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

    await this.gameMap.init();
    await this.main3D.initAsync(this.mainCanvas);

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
    let lastTime = new Date().getTime();
    const stopped = ref(false);
    const gameMap = new GameMap();
    const main3D = new Main3D(playerState, gameMap);
    const player = new Player(playerState, gameMap);

    // function renderMap() {
    //   if (!mapCanvas.value) return;
    //   var ctx = mapCanvas.value.getContext("2d", { alpha: false });
    //   if (!ctx) return;
    //   ctx.save();
    //   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    //   ctx.fillStyle = 'white';
    //   ctx.strokeStyle = 'white';
    //   map.drawMap(ctx, playerState);
    //   player2d.drawOnMap(playerState, ctx);
    //   ctx.restore();
    // }

    // function determinateLittleEndian() {
    //   //Determine whether Uint32 is little- or big-endian.
    //   data[1] = 0x0a0b0c0d;

    //   var isLittleEndian = true;
    //   if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
    //       buf[7] === 0x0d) {
    //       isLittleEndian = false;
    //   }
    // }

    function keyHandler(now: number): boolean {
      const up =
        currentKey.value.get('ArrowUp') || currentKey.value.get('KeyW');
      const down =
        currentKey.value.get('ArrowDown') || currentKey.value.get('KeyS');
      const moveLeft = currentKey.value.get('KeyA');
      const moveRight = currentKey.value.get('KeyD');

      let updates = false;

      updates =
        player.move(
          now,
          up ? 1 : down ? -1 : 0,
          moveRight ? 1 : moveLeft ? -1 : 0
        ) || updates;

      const left = currentKey.value.get('ArrowLeft');
      const right = currentKey.value.get('ArrowRight');
      updates =
        player.turn((left || right) ?? false, now, right ? 1 : left ? -1 : 0) ||
        updates;

      if (currentKey.value.get('Space')) {
        player.jump(now);
        updates = true;
      }

      return updates;
    }

    async function tick() {
      if (stopped.value) return;
      const now = new Date().getTime();
      if (now % 10 === 0) {
        const diff = now - lastTime;
        fps = (1000 / diff) << 0;
        fpsDisplay.value = fps;
      }
      //renderMap();
      keyHandler(now);
      player.tick(now);
      main3D.renderMain();
      lastTime = now;
      window.requestAnimationFrame(tick);
    }

    return {
      gameMap,
      currentKey,
      mainCanvas,
      //mapCanvas,
      keyHandler,
      start: () => {
        stopped.value = false;
        tick();
      },
      stop: () => {
        stopped.value = true;
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
