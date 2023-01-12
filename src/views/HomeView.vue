<template>
  <div class="home">
    <!-- <img src="@/assets/person_front.png"/> -->
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
import map from '@/data/map';
import { defineComponent, ref } from 'vue';
import consts from '@/data/consts';
import RayCasting from '@/data/rayCasting';
import { PlayerState } from '@/data/types';
import Player from '@/data/player';
import player2d from '@/data/player2d';

const playerState = new PlayerState();
const player = new Player(playerState);

export default defineComponent({
  name: 'HomeView',
  mounted() {
    window.onkeydown = (e: KeyboardEvent) => {      
      this.currentKey.set(e.code, true);
    };
    window.onkeyup = (e: KeyboardEvent) => {
      this.currentKey.set(e.code, false);
    };

    if (!this.mainCanvas) throw "no canvas";
    const ctx = this.mainCanvas.getContext("2d", { alpha: false });
    if (!ctx) throw "cannot get context";
    this.context = ctx;
    
    this.renderMap();
    this.start();
  },


  
  unmounted(){
    this.stop();
  },
  setup() {
    const mapCanvas = ref(null as HTMLCanvasElement | null);
    const mainCanvas = ref(null as HTMLCanvasElement | null);
    const keyMap = new Map<string, boolean>();
    const currentKey = ref(keyMap);
    let fps = 0;
    const fpsDisplay = ref(0);
    let lastTime = new Date().getTime();
    
    function renderMap() {
      if (!mapCanvas.value) return;
      var ctx = mapCanvas.value.getContext("2d", { alpha: false });
      if (!ctx) return;
      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'white';
      map.drawMap(ctx, playerState);
      player2d.drawOnMap(playerState, ctx);
      ctx.restore();
    }    
    
    // function determinateLittleEndian() {
    //   //Determine whether Uint32 is little- or big-endian.
    //   data[1] = 0x0a0b0c0d;
      
    //   var isLittleEndian = true;
    //   if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
    //       buf[7] === 0x0d) {
    //       isLittleEndian = false;
    //   }
    // }


    // const spriteCanvas = document.createElement('canvas') as HTMLCanvasElement;
    // spriteCanvas.width = 200;
    // spriteCanvas.width = 100;
    // const img = new Image();
    // img.src = '/img/person_front.f04f6938.png';      
    // const sptCtx = spriteCanvas.getContext("2d");
    // img.onload = function () {
    //     sptCtx?.drawImage(img, 0, 0);
    // }
  
    

    const tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
    tempCanvas.width = consts.lookWidth;
    tempCanvas.height = consts.lookHeight;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      throw "Cannot get context";
    }

    const imageData: ImageData = tempCtx.createImageData(consts.lookWidth, consts.lookHeight);      
    const rayCasting = new RayCasting(imageData, playerState);
    const context = ref(null as null | CanvasRenderingContext2D);

    async function renderMain(): Promise<void> {
      if (!tempCtx || !context.value) return;
      rayCasting.reset();
      rayCasting.draw3D();
      
      tempCtx.putImageData(imageData, 0, 0);
      // if (sptCtx) {
      //   tempCtx.putImageData(sptCtx?.getImageData(0, 0, 200, 100), 0, 0);
      // }
      

      context.value.save();
      context.value.clearRect(0, 0, context.value.canvas.width, context.value.canvas.height);
      context.value.scale(context.value.canvas.width / consts.lookWidth, context.value.canvas.height / consts.lookHeight);
      context.value.drawImage(tempCanvas, 0, 0);      
      context.value.restore();
    }

    function keyHandler(now: number): boolean {
      const up = currentKey.value.get('ArrowUp');
      const down = currentKey.value.get('ArrowDown');
      let updates = false;
      updates = player.moveForward((up || down) ?? false, now, up ? 1 : down ? -1 : 0) || updates;

      const left = currentKey.value.get('ArrowLeft');
      const right = currentKey.value.get('ArrowRight');
      updates = player.turn((left || right) ?? false, now, right ? 1 : left ? -1 : 0) || updates; 

      if (currentKey.value.get('Space')) {
        player.jump(now);
        updates = true;
      }

      return updates;
    } 

    const stopped = ref(false);
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
      await renderMain();
      lastTime = now;
      //setTimeout(tick, 0);
      window.requestAnimationFrame(tick);
    }

    return {
      context,
      currentKey,
      mainCanvas,
      mapCanvas,
      keyHandler,
      renderMap,
      start: () => {
        stopped.value = false;
        tick();
      },
      stop: () => {
        stopped.value = true;
      },
      fpsDisplay
    }
  }
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