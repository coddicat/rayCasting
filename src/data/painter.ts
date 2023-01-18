import consts from "./consts";
import { PlayerState } from "./playerState";
import { Level, SpriteData, Axis, RayCastingState } from "./types";

const maxLight = 255;
const halfHeight = consts.resolution.height / 2;
const halfWidth = consts.resolution.width / 2;

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
      consts.resolution.width *
      (playerState.z + playerState.lookHeight - level.bottom);
    this.f = (maxLight / consts.lookLength) * params.mirrorFact;
    this.playerState = playerState;
  }
  public getAlpha(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return 0;
    return (consts.lookLength - this.b / a) * this.f;
  }

  public getDistance(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return consts.lookLength;
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
    if (x >= consts.resolution.width) return consts.resolution.width - 1;
    return x << 0;
  }

  private static limitY(y: number): number {
    if (y < 0) return 0;
    if (y >= consts.resolution.height) return consts.resolution.height - 1;
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
    let index = topBottom.top * consts.resolution.width + this.limitX(params.x);
    while (topBottom.top <= topBottom.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(topBottom.top, params.shift);

      if (data[index] !== 0 || alpha < 1) {
        topBottom.top++;
        index += consts.resolution.width;
        continue;
      }

      data[index] = params.color | alpha << 24;

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.resolution.width;
    }
  }

  public static drawLineStatic(
    data: Uint32Array,
    params: { x: number; y0: number; y1: number; color: number; alpha: number },
    pixelsCounter: { count: number }
  ): void {
    if (params.alpha < 1) return;
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.resolution.width + this.limitX(params.x);
    const alphaMask = params.alpha << 24;
    while (topBottom.top <= topBottom.bottom) {
      if (data[index] !== 0) {
        topBottom.top++;
        index += consts.resolution.width;
        continue;
      }

      data[index] = params.color | alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.resolution.width;
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
    let index = topBottom.top * consts.resolution.width + this.limitX(params.x);

    let y = topBottom.top - params.y0;
    const hRate = spriteData.height / (Math.abs(params.y1 - params.y0) + 1) * params.scale;

    while (topBottom.top <= topBottom.bottom) {
      const spriteIndex =
        (((y * hRate) << 0) % spriteData.height) * spriteData.width + params.spriteX;

      const pixel = spriteData.data[spriteIndex];

      if (data[index] !== 0 || (params.checkAlpha && pixel === 0)) {
        topBottom.top++;
        index += consts.resolution.width;
        y++;
        continue;
      }

      data[index] = pixel & alphaMask;

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.resolution.width;
      y++;
    }
  }

  public static drawSpriteLineDynamic(
    data: Uint32Array,
    params: {
      x: number;
      side: Axis,
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
    spriteData: SpriteData,
    rayCastingState: RayCastingState
  ): void {
    const topBottom = this.getTopBottom(params);
    let index = topBottom.top * consts.resolution.width + this.limitX(params.x);

    const scale = 1;
    const dist0 = this.dynamicAlpha.getDistance(params.y0, params.shift);

    const side0 = params.sideX;
    const factY = scale * spriteData.height * rayCastingState.fixSinAbs;
    const factX = scale * spriteData.width * rayCastingState.fixCosAbs;

    while (topBottom.top <= topBottom.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(topBottom.top, params.shift);
      const dist = this.dynamicAlpha.getDistance(topBottom.top, params.shift);

      if (alpha < 1) {
        topBottom.top++;
        index += consts.resolution.width;
        continue;
      };

      const diff = Math.abs(dist0 - dist);

      let spriteIndex = 0;

      if (params.side === Axis.x) {
        const sideX = side0 - rayCastingState.fixCos * diff;

        let spriteX = ((sideX * spriteData.width) << 0) % spriteData.width;
        if (spriteX < 0) spriteX = spriteX + spriteData.width - 1;

        const spriteY = (diff * factY) << 0
        const fixed = rayCastingState.rayAngle.sinSign > 0
          ? spriteData.height - spriteY % spriteData.height - 1
          : spriteY % spriteData.height;
        spriteIndex = fixed * spriteData.width + spriteX;
      } else {
        const sideX = side0 - rayCastingState.fixSin * diff;

        let spriteY = ((sideX * spriteData.height) << 0) % spriteData.height;
        if (spriteY < 0) spriteY = spriteY + spriteData.height - 1;

        const spriteX = (diff * factX) << 0
        const fixedY = spriteY % spriteData.height;
        const fixedX = rayCastingState.rayAngle.cosSign > 0
          ? spriteData.width - spriteX % spriteData.width - 1
          : spriteX % spriteData.width;
        spriteIndex = fixedY * spriteData.width + fixedX;
      }

      if (data[index] !== 0 || spriteData.data[spriteIndex] === 0) {
        topBottom.top++;
        index += consts.resolution.width;
        continue;
      }

      data[index] =
        (alpha << 24) | (spriteData.data[spriteIndex] & 0x00ffffff);

      pixelsCounter.count++;
      topBottom.top++;
      index += consts.resolution.width;
    }
  }
}

export default Painter;
