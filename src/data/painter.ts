import consts from "./consts";
import { PlayerState } from "./playerState";
import { Level, SpriteData, Side } from "./types";

const maxLight = 255;
const halfHeight = consts.lookHeight / 2;
const halfWidth = consts.lookWidth / 2;

export class DynamicAlpha {
  private b = 0;
  private f = 0;
  private playerState?: PlayerState;

  public init(
    playerState: PlayerState,
    level: Level,
    params: { mirrorFact: number }
  ): void {
    this.b =
      consts.lookWidth *
      (playerState.z + playerState.lookHeight - level.bottom);
    this.f = (maxLight / consts.deep) * params.mirrorFact;
    this.playerState = playerState;
  }
  public getAlpha(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return 0;
    return (consts.deep - this.b / a) * this.f;
  }

  public getDistance(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return Infinity;
    return this.b / a;
  }

  public getPlayerState() {
    return this.playerState;
  }
}

class Painter {
  private static dynamicAlpha = new DynamicAlpha();

  public static InitDynamicAlpha(
    playerState: PlayerState,
    level: Level,
    params: { mirrorFact: number }
  ): void {
    this.dynamicAlpha.init(playerState, level, params);
  }

  private static limitX(x: number): number {
    if (x < 0) return 0;
    if (x >= consts.lookWidth) return consts.lookWidth - 1;
    return x << 0;
  }

  private static limitY(y: number): number {
    if (y < 0) return 0;
    if (y >= consts.lookHeight) return consts.lookHeight - 1;
    return y << 0;
  }

  private static getTopBottom(params: { y0: number; y1: number }): {
    top: number;
    bottom: number;
  } {
    return params.y1 > params.y0
      ? { top: this.limitY(params.y0), bottom: this.limitY(params.y1) }
      : { top: this.limitY(params.y1), bottom: this.limitY(params.y0) };
  }

  public static drawLineDynamic(
    data: Uint32Array,
    params: { x: number; y0: number; y1: number; shift: number; color: number },
    pixelsCounter: { count: number }
  ): void {
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
    while (topBottom.top <= topBottom.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(topBottom.top, params.shift);

      if (data[index] !== 0 || alpha < 1) {
        topBottom.top++;
        index += consts.lookWidth;
        continue;
      }

      data[index] = params.color | alpha << 24;

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.lookWidth;
    }
  }

  public static drawLineStatic(
    data: Uint32Array,
    params: { x: number; y0: number; y1: number; color: number; alpha: number },
    pixelsCounter: { count: number }
  ): void {
    if (params.alpha < 1) return;
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
    const alphaMask = params.alpha << 24;
    while (topBottom.top <= topBottom.bottom) {
      if (data[index] !== 0) {
        topBottom.top++;
        index += consts.lookWidth;
        continue;
      }

      data[index] = params.color | alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.lookWidth;
    }
  }

  public static drawSpriteLine(
    data: Uint32Array,
    params: {
      x: number;
      spriteX: number;
      y0: number;
      y1: number;
      color: number;
      alpha: number;
      scale: number;
      checkAlpha: boolean
    },
    pixelsCounter: { count: number },
    spriteData: SpriteData
  ): void {
    if (params.alpha < 1) return;
    const alphaMask = 0x00ffffff | params.alpha << 24;
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.lookWidth + this.limitX(params.x);

    let y = topBottom.top - params.y0;
    const hRate = spriteData.height / (Math.abs(params.y1 - params.y0) + 1) * params.scale;

    while (topBottom.top <= topBottom.bottom) {
      const spriteIndex = 
       ((y * hRate) << 0) % spriteData.height * spriteData.width + params.spriteX;

      const pixel = spriteData.data[spriteIndex];

      if (data[index] !== 0 || (params.checkAlpha && pixel === 0)) {
        topBottom.top++;
        index += consts.lookWidth;
        y++;
        continue;
      }

      data[index] = pixel & alphaMask;

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.lookWidth;
      y++;
    }
  }

  /*public static drawSpriteLineDynamic(
    data: Uint32Array,
    params: {
      x: number;
      sideX: number;
      //spriteX: number;
      y0: number;
      y1: number;
      color: number;
      //scale: number;
      shift: number,
      angle: number,
      distance: number,
      fixDistance: number
    },
    pixelsCounter: { count: number },
    spriteData: SpriteData
  ): void {
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.lookWidth + this.limitX(params.x);

    //let y = topBottom.top - params.y0;
    //const max = spriteData.data.length;
    let y = 0;
    const dist0 = this.dynamicAlpha.getDistance(params.y0, params.shift);

    while (topBottom.top <= topBottom.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(topBottom.top, params.shift);
      const dist = this.dynamicAlpha.getDistance(topBottom.top, params.shift);
      if (alpha < 1) break;

      const diff = Math.abs(dist0 - dist);
      const angle = params.angle;
      const fact = consts.lookWidth / dist;
      const hRate = spriteData.height / fact;
      const sideX = params.sideX - Math.cos(angle) * diff / params.fixDistance;
      const spriteX = (sideX * spriteData.width) << 0;

      const spriteIndex = (((diff * 20) % spriteData.height << 0) * spriteData.width + (spriteX % spriteData.width)) << 0;

      if (data[index] !== 0 || (params.checkAlpha && pixel === 0)) {
        topBottom.top++;
        index += consts.lookWidth;
        y++;
        continue;
      }

      data[index] =
        (alpha << 24) | (spriteData.data[spriteIndex] & 0x00ffffff);

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.lookWidth;
      y++;
    }
  }*/

  public static drawSpriteLineDynamic(
    data: Uint32Array,
    params: {
      x: number;
      side: Side,
      sideX: number;
      y0: number;
      y1: number;
      color: number;
      shift: number,
      angle: number,
      distance: number,
      fixDistance: number
    },
    pixelsCounter: { count: number },
    spriteData: SpriteData
  ): void {
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.lookWidth + this.limitX(params.x);

    const scale = 1;
    const dist0 = this.dynamicAlpha.getDistance(params.y0, params.shift);

    const side0 = params.sideX;

    while (topBottom.top <= topBottom.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(topBottom.top, params.shift);
      const dist = this.dynamicAlpha.getDistance(topBottom.top, params.shift);
      if (alpha < 1) break;

      const diff = Math.abs(dist0 - dist);
      const angle = params.angle;

      let spriteIndex = 0;
      if (params.side === Side.x) {
        const sign = Math.sign(Math.sin(angle));
        const sin = Math.sin(angle) * sign;
        const cos = Math.cos(angle);
        const sideX = side0 - cos * diff / params.fixDistance;
        let spriteX = ((sideX * spriteData.width) << 0) % spriteData.width;
        if(spriteX < 0) {
          spriteX = spriteX + spriteData.width - 1;
        }
        const spriteY = (scale * diff * spriteData.height * sin / params.fixDistance) << 0
        const fixed = sign > 0 ? spriteData.height - spriteY % spriteData.height - 1 : spriteY % spriteData.height;
        spriteIndex = fixed * spriteData.width + spriteX;
      } else {
        const signX = Math.sign(Math.cos(angle));
        const cos = signX * Math.cos(angle);
        const sin = Math.sin(angle);
        const sideX = side0 - sin * diff / params.fixDistance;
        let spriteY = ((sideX * spriteData.height) << 0) % spriteData.height;
        if(spriteY < 0) {
          spriteY = spriteY + spriteData.height - 1;
        }
        const spriteX = (scale * diff * spriteData.width * cos / params.fixDistance) << 0
        const fixedY = spriteY % spriteData.height;
        const fixedX = signX > 0 ? spriteData.width - spriteX % spriteData.width - 1 : spriteX % spriteData.width;
        spriteIndex = fixedY * spriteData.width + fixedX;      
      }
     

      if (data[index] !== 0 || spriteData.data[spriteIndex] === 0) {
        topBottom.top++;
        index += consts.lookWidth;
        continue;
      }

      data[index] =
        (alpha << 24) | (spriteData.data[spriteIndex] & 0x00ffffff);

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.lookWidth;
    }
  }
}

export default Painter;
