import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import Ray from './ray';
import RayCasting from './rayCasting';
import {
  SpriteData,
  Axis,
  PixelCounter,
  StaticLineProps,
  SpriteLineProps,
  DynamicLineProps,
  DynamicSpriteLineProps,
} from './types';

const maxBottom = consts.resolution.height - 1;
const maxRight = consts.resolution.width - 1;
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
      this.refs.top = props.y1 << 0;
      this.refs.bottom = props.y0 << 0;
    } else {
      this.refs.top = props.y0 << 0;
      this.refs.bottom = props.y1 << 0;
    }

    if (this.refs.top < 0) this.refs.top = 0;
    if (this.refs.bottom >= consts.resolution.height)
      this.refs.bottom = maxBottom;

    this.refs.dataIndex =
      this.refs.top * consts.resolution.width +
      (this.rayCastingState.displayX << 0);
  }

  public drawLineStatic(props: StaticLineProps): void {
    if (props.light < 1) return;
    this.initRefs(props);
    this.refs.alphaMask = props.light << 24;
    while (this.refs.top <= this.refs.bottom) {
      if (this.data[this.refs.dataIndex] !== 0) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] = props.color | this.refs.alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  public drawLineDynamic(props: DynamicLineProps): void {
    this.initRefs(props);

    while (this.refs.top <= this.refs.bottom) {
      this.dynamicAlpha.setAlpha(this.refs.top);

      if (this.data[this.refs.dataIndex] !== 0 || this.dynamicAlpha.alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] =
        props.color | (this.dynamicAlpha.alpha << 24);

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }

  private slRefs = {
    hRate: 0,
    index: 0,
    pixel: 0,
  };

  public drawSpriteLine(props: SpriteLineProps, spriteData: SpriteData): void {
    if (props.light < 1 || props.y1 === props.y0) return;
    this.refs.alphaMask = 0x00ffffff | (props.light << 24);
    this.initRefs(props);

    let y = this.refs.top - props.y0;
    this.slRefs.hRate = //height * scale -> const
      (spriteData.height * props.scale) / (props.y1 - props.y0);

    while (this.refs.top <= this.refs.bottom) {
      this.slRefs.index =
        (((y * this.slRefs.hRate) << 0) % spriteData.height) *
          spriteData.width +
        props.spriteX;

      this.slRefs.pixel = spriteData.data[this.slRefs.index];

      if (
        this.data[this.refs.dataIndex] !== 0 ||
        (props.checkAlpha && this.slRefs.pixel === 0)
      ) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      this.data[this.refs.dataIndex] = this.slRefs.pixel & this.refs.alphaMask;

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
      y++;
    }
  }

  private sldRefs = {
    dist0: 0,
    dist: 0,
    side0: 0,
    factY: 0,
    factX: 0,
    diff: 0,
    index: 0,
    sideX: 0,
    spriteX: 0,
    spriteY: 0,
    fixedX: 0,
    fixedY: 0,
  };

  private setSpriteIndexBySideX(spriteData: SpriteData): void {
    this.sldRefs.sideX =
      this.sldRefs.side0 -
      this.rayCastingState.rayAngle.fixCos * this.sldRefs.diff;

    this.sldRefs.spriteX =
      ((this.sldRefs.sideX * spriteData.width) << 0) % spriteData.width;
    if (this.sldRefs.spriteX < 0)
      this.sldRefs.spriteX = this.sldRefs.spriteX + spriteData.width - 1;

    this.sldRefs.spriteY = (this.sldRefs.diff * this.sldRefs.factY) << 0;
    this.sldRefs.fixedX =
      this.rayCastingState.rayAngle.sinSign > 0
        ? spriteData.height - (this.sldRefs.spriteY % spriteData.height) - 1
        : this.sldRefs.spriteY % spriteData.height;
    this.sldRefs.index =
      this.sldRefs.fixedX * spriteData.width + this.sldRefs.spriteX;
  }

  private setSpriteIndexBySideY(spriteData: SpriteData): void {
    this.sldRefs.sideX =
      this.sldRefs.side0 -
      this.rayCastingState.rayAngle.fixSin * this.sldRefs.diff;

    this.sldRefs.spriteY =
      ((this.sldRefs.sideX * spriteData.height) << 0) % spriteData.height;
    if (this.sldRefs.spriteY < 0)
      this.sldRefs.spriteY = this.sldRefs.spriteY + spriteData.height - 1;

    this.sldRefs.spriteX = (this.sldRefs.diff * this.sldRefs.factX) << 0;
    this.sldRefs.fixedY = this.sldRefs.spriteY % spriteData.height;
    this.sldRefs.fixedX =
      this.rayCastingState.rayAngle.cosSign > 0
        ? spriteData.width - (this.sldRefs.spriteX % spriteData.width) - 1
        : this.sldRefs.spriteX % spriteData.width;
    this.sldRefs.index =
      this.sldRefs.fixedY * spriteData.width + this.sldRefs.fixedX;
  }

  public drawSpriteLineDynamic(
    props: DynamicSpriteLineProps,
    rayState: Ray,
    spriteData: SpriteData
  ): void {
    this.initRefs(props);

    this.dynamicAlpha.setDistance(props.y0);
    this.sldRefs.dist0 = this.dynamicAlpha.distance;
    this.sldRefs.side0 = rayState.sideX;
    this.sldRefs.factY = //props.scale * spriteData.height -> const, * fix -> once
      props.scale * spriteData.height * this.rayCastingState.rayAngle.fixSinAbs;
    this.sldRefs.factX =
      props.scale * spriteData.width * this.rayCastingState.rayAngle.fixCosAbs;

    this.sldRefs.diff = 0;

    const spriteIndexSetter =
      rayState.side === Axis.x
        ? this.setSpriteIndexBySideX
        : this.setSpriteIndexBySideY;

    while (this.refs.top <= this.refs.bottom) {
      this.dynamicAlpha.setDistanceAlpha(this.refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.sldRefs.diff = Math.abs(
        this.sldRefs.dist0 - this.dynamicAlpha.distance
      );

      spriteIndexSetter.call(this, spriteData);

      if (
        this.data[this.refs.dataIndex] !== 0 ||
        spriteData.data[this.sldRefs.index] === 0
      ) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] =
        (this.dynamicAlpha.alpha << 24) |
        (spriteData.data[this.sldRefs.index] & 0x00ffffff);

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
    }
  }
}

export default Painter;
