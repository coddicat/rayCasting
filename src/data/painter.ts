import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import { PlayerState } from './playerState';
import RayCasting from './rayCasting';
import RayHandler from './rayHandler';
import {
  Level,
  SpriteData,
  Axis,
  PixelCounter,
  StaticLineProps,
  SpriteLineProps,
  DynamicLineProps,
  DynamicSpriteLineProps,
} from './types';

const maxBottom = consts.resolution.height - 1;
class Painter {
  private dynamicAlpha;
  private pixelsCounter: PixelCounter;

  constructor(pixelsCounter: PixelCounter, dynamicAlpha: DynamicAlpha) {
    this.pixelsCounter = pixelsCounter;
    this.dynamicAlpha = dynamicAlpha;
  }

  private refs = {
    top: 0,
    bottom: 0,
    dataIndex: 0,
  };

  private initRefs(props: { y0: number; y1: number; x: number }) {
    if (props.y0 > props.y1) {
      this.refs.top = props.y1 << 0;
      this.refs.bottom = props.y0 << 0;
    } else {
      this.refs.top = props.y0 << 0;
      this.refs.bottom = props.y1 << 0;
    }

    if (this.refs.top < 0) this.refs.top = 0;
    if (this.refs.bottom >= consts.resolution.height)
      this.refs.bottom = maxBottom;

    if (props.x < 0) {
      this.refs.dataIndex = this.refs.top * consts.resolution.width;
    } else if (props.x >= consts.resolution.width) {
      this.refs.dataIndex =
        this.refs.top * consts.resolution.width + consts.resolution.width - 1;
    } else {
      this.refs.dataIndex =
        this.refs.top * consts.resolution.width + (props.x << 0);
    }
  }

  public drawLineStatic(data: Uint32Array, props: StaticLineProps): void {
    if (props.light < 1) return;
    this.initRefs(props);
    const alphaMask = props.light << 24;
    while (this.refs.top <= this.refs.bottom) {
      if (data[this.refs.dataIndex] !== 0) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      data[this.refs.dataIndex] = props.color | alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  public drawLineDynamic(
    data: Uint32Array,
    props: DynamicLineProps,
    pixelsCounter: { count: number }
  ): void {
    this.initRefs(props);

    while (this.refs.top <= this.refs.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(this.refs.top, props.yShift);

      if (data[this.refs.dataIndex] !== 0 || alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      data[this.refs.dataIndex] = props.color | (alpha << 24);

      pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  public drawSpriteLine(
    data: Uint32Array,
    props: SpriteLineProps,
    pixelsCounter: { count: number },
    spriteData: SpriteData
  ): void {
    if (props.light < 1) return;
    const alphaMask = 0x00ffffff | (props.light << 24);
    this.initRefs(props);

    let y = this.refs.top - props.y0;
    const hRate =
      (spriteData.height / (Math.abs(props.y1 - props.y0) + 1)) * props.scale;

    while (this.refs.top <= this.refs.bottom) {
      const spriteIndex =
        (((y * hRate) << 0) % spriteData.height) * spriteData.width +
        props.spriteX;

      const pixel = spriteData.data[spriteIndex];

      if (
        data[this.refs.dataIndex] !== 0 ||
        (props.checkAlpha && pixel === 0)
      ) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      data[this.refs.dataIndex] = pixel & alphaMask;

      pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
      y++;
    }
  }

  public drawSpriteLineDynamic(
    data: Uint32Array,
    props: DynamicSpriteLineProps,
    pixelsCounter: { count: number },
    spriteData: SpriteData,
    rayCastingState: RayCasting
  ): void {
    this.initRefs(props);

    const dist0 = this.dynamicAlpha.getDistance(props.y0, props.yShift);
    const side0 = props.sideX;
    const factY =
      props.scale * spriteData.height * rayCastingState.rayAngle.fixSinAbs;
    const factX =
      props.scale * spriteData.width * rayCastingState.rayAngle.fixCosAbs;

    while (this.refs.top <= this.refs.bottom) {
      const alpha = this.dynamicAlpha.getAlpha(this.refs.top, props.yShift);
      const dist = this.dynamicAlpha.getDistance(this.refs.top, props.yShift);

      if (alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      const diff = Math.abs(dist0 - dist);

      let spriteIndex = 0;

      if (props.side === Axis.x) {
        const sideX = side0 - rayCastingState.rayAngle.fixCos * diff;

        let spriteX = ((sideX * spriteData.width) << 0) % spriteData.width;
        if (spriteX < 0) spriteX = spriteX + spriteData.width - 1;

        const spriteY = (diff * factY) << 0;
        const fixed =
          rayCastingState.rayAngle.sinSign > 0
            ? spriteData.height - (spriteY % spriteData.height) - 1
            : spriteY % spriteData.height;
        spriteIndex = fixed * spriteData.width + spriteX;
      } else {
        const sideX = side0 - rayCastingState.rayAngle.fixSin * diff;

        let spriteY = ((sideX * spriteData.height) << 0) % spriteData.height;
        if (spriteY < 0) spriteY = spriteY + spriteData.height - 1;

        const spriteX = (diff * factX) << 0;
        const fixedY = spriteY % spriteData.height;
        const fixedX =
          rayCastingState.rayAngle.cosSign > 0
            ? spriteData.width - (spriteX % spriteData.width) - 1
            : spriteX % spriteData.width;
        spriteIndex = fixedY * spriteData.width + fixedX;
      }

      if (
        data[this.refs.dataIndex] !== 0 ||
        spriteData.data[spriteIndex] === 0
      ) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      data[this.refs.dataIndex] =
        (alpha << 24) | (spriteData.data[spriteIndex] & 0x00ffffff);

      pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }
}

export default Painter;
