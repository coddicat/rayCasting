<template>
  <div class="home">
    <span>{{ fpsDisplay }}</span>
    <div>
      <canvas width="200" height="100" class="canvas" ref="mapCanvas"></canvas>
    </div>
    <div>
      <canvas width="640" height="480" class="canvas" ref="mainCanvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import map from '@/data/map';
import player from '@/data/player';
import { defineComponent, ref } from 'vue';
import rayCasting from '@/data/rayCasting';
import consts from '@/data/consts';

export default defineComponent({
  name: 'HomeView',
  mounted() {
    window.onkeydown = (e: KeyboardEvent) => {      
      this.currentKey.set(e.code, true);
    };
    window.onkeyup = (e: KeyboardEvent) => {
      this.currentKey.set(e.code, false);
    };

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
      map.drawMap(1.7, ctx);
      player.drawOnMap(1.7, ctx);
      ctx.restore();
    }
    
    function renderMain() {
      if (!mainCanvas.value) return;
      const ctx = mainCanvas.value.getContext("2d", { alpha: false });
      if (!ctx) return;

      const tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
      tempCanvas.width = consts.lookWidth;
      tempCanvas.height = consts.lookHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;
      const imageData: ImageData = tempCtx.createImageData(consts.lookWidth, consts.lookHeight);
      rayCasting.draw3D(imageData);
      tempCtx.putImageData(imageData, 0, 0);


      ctx.save();
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.scale(ctx.canvas.width / consts.lookWidth, ctx.canvas.height / consts.lookHeight);
      ctx.drawImage(tempCanvas, 0, 0);
      ctx.restore();
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
    let updates = true;
    function tick() {
      if (stopped.value) return;
      const now = new Date().getTime();
      if (now % 10 === 0) {
        const diff = now - lastTime;
        fps = Math.ceil(1000 / diff);
        fpsDisplay.value = fps;
      }
      renderMap();
      updates = keyHandler(now) || updates;
      updates = player.tick(now) || updates;
      if(updates) {
        renderMain();
        updates = false;
      }
      lastTime = now;
      //setTimeout(tick, 0);
      window.requestAnimationFrame(tick);
    }

    return {
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