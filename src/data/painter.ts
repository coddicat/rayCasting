import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import RayCasting from './rayCasting';
import {
  TextureData,
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
  private data: Uint32Array;
  private rayCastingState: RayCasting;

  constructor(
    pixelsCounter: PixelCounter,
    dynamicAlpha: DynamicAlpha,
    data: Uint32Array,
    rayCastingState: RayCasting
  ) {
    this.pixelsCounter = pixelsCounter;
    this.dynamicAlpha = dynamicAlpha;
    this.data = data;
    this.rayCastingState = rayCastingState;
  }

  private refs = {
    top: 0,
    bottom: 0,
    dataIndex: 0,
    alphaMask: 0,
  };

  private initRefs(props: { y0: number; y1: number }) {
    if (props.y0 > props.y1) {
      this.refs.top = props.y1 | 0;
      this.refs.bottom = props.y0 | 0;
    } else {
      this.refs.top = props.y0 | 0;
      this.refs.bottom = props.y1 | 0;
    }

    if (this.refs.top < 0) this.refs.top = 0;
    if (this.refs.bottom >= consts.resolution.height)
      this.refs.bottom = maxBottom;

    this.refs.dataIndex =
      Math.imul(this.refs.top, consts.resolution.width) +
      (this.rayCastingState.displayX | 0);
  }

  public drawLineStatic(props: StaticLineProps): void {
    if (props.light < 1) return;
    this.initRefs(props);
    this.refs.alphaMask = props.light << 24;
    while (this.refs.top <= this.refs.bottom) {
      if (this.data[this.refs.dataIndex]) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] = props.color | this.refs.alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      this.pixelsCounter.count++;
      if (this.pixelsCounter.count >= consts.resolution.height) return;

      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  public drawLineDynamic(props: DynamicLineProps): void {
    this.initRefs(props);

    while (this.refs.top <= this.refs.bottom) {
      if (this.data[this.refs.dataIndex]) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.dynamicAlpha.setDistanceAlpha(this.refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] =
        props.color | (this.dynamicAlpha.alpha << 24);

      this.pixelsCounter.count++;
      if (this.pixelsCounter.count >= consts.resolution.height) return;

      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  private slRefs = {
    hRate: 0,
    index: 0,
    pixel: 0,
  };

  public drawSpriteLine(
    props: SpriteLineProps,
    textureData: TextureData
  ): void {
    if (props.light < 1 || props.y1 === props.y0) return;
    this.refs.alphaMask = 0x00ffffff | (props.light << 24);
    this.initRefs(props);

    let y = this.refs.top - props.y0;
    this.slRefs.hRate = props.repeatedHeight / (props.y1 - props.y0);

    while (this.refs.top <= this.refs.bottom) {
      if (this.data[this.refs.dataIndex]) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      this.slRefs.index =
        Math.imul(
          ((y * this.slRefs.hRate) | 0) % textureData.height,
          textureData.width
        ) + props.spriteX;

      this.slRefs.pixel = textureData.data[this.slRefs.index];

      if (props.checkAlpha && !this.slRefs.pixel) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      this.data[this.refs.dataIndex] = this.slRefs.pixel & this.refs.alphaMask;

      this.pixelsCounter.count++;
      if (this.pixelsCounter.count >= consts.resolution.height) return;

      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
      y++;
    }
  }

  private sldRefs = {
    dist: 0,
    diff: 0,
    index: 0,
    sideX: 0,
    spriteX: 0,
    spriteY: 0,
    fixedX: 0,
    pixel: 0,
  };

  public setSpriteIndexBySideX(props: DynamicSpriteLineProps): void {
    this.sldRefs.sideX =
      props.rayState.sideX -
      ((this.rayCastingState.rayAngle.fixCos * this.sldRefs.diff) % 1);

    this.sldRefs.spriteX =
      ((1 + this.sldRefs.sideX) * props.textureData.width) %
        props.textureData.width |
      0;

    this.sldRefs.spriteY = (this.sldRefs.diff * props.textureData.factY) | 0;
    this.sldRefs.fixedX =
      this.rayCastingState.rayAngle.sinSign > 0
        ? props.textureData.maxY -
          (this.sldRefs.spriteY % props.textureData.height)
        : this.sldRefs.spriteY % props.textureData.height;

    this.sldRefs.index =
      Math.imul(this.sldRefs.fixedX, props.textureData.width) +
      this.sldRefs.spriteX;
  }

  public setSpriteIndexBySideY(props: DynamicSpriteLineProps): void {
    this.sldRefs.sideX =
      props.rayState.sideX -
      ((this.rayCastingState.rayAngle.fixSin * this.sldRefs.diff) % 1);

    this.sldRefs.spriteY =
      ((1 + this.sldRefs.sideX) * props.textureData.height) %
        props.textureData.height |
      0;

    this.sldRefs.spriteX = (this.sldRefs.diff * props.textureData.factX) | 0;
    this.sldRefs.fixedX =
      this.rayCastingState.rayAngle.cosSign > 0
        ? props.textureData.maxX -
          (this.sldRefs.spriteX % props.textureData.width)
        : this.sldRefs.spriteX % props.textureData.width;

    this.sldRefs.index =
      Math.imul(this.sldRefs.spriteY, props.textureData.width) +
      this.sldRefs.fixedX;
  }

  public drawSpriteLineDynamic(props: DynamicSpriteLineProps): void {
    this.initRefs(props);

    if (props.textureData.rayTimestamp !== props.rayState.rayAngle.timestamp) {
      props.textureData.factX =
        props.textureData.width * this.rayCastingState.rayAngle.fixCosAbs;
      props.textureData.factY =
        props.textureData.height * this.rayCastingState.rayAngle.fixSinAbs;
      props.textureData.rayTimestamp = props.rayState.rayAngle.timestamp;
    }

    this.sldRefs.diff = 0;
    while (this.refs.top <= this.refs.bottom) {
      if (this.data[this.refs.dataIndex]) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.dynamicAlpha.setDistanceAlpha(this.refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.sldRefs.diff = Math.abs(
        props.rayState.fixedDistance - this.dynamicAlpha.distance
      );

      props.rayState.spriteIndexSetter.call(this, props);

      this.sldRefs.pixel = props.textureData.data[this.sldRefs.index];
      if (!this.sldRefs.pixel) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] =
        (this.dynamicAlpha.alpha << 24) | (this.sldRefs.pixel & 0x00ffffff);

      this.pixelsCounter.count++;
      if (this.pixelsCounter.count >= consts.resolution.height) return;

      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }
}

export default Painter;
