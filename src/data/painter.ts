import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import Ray from './ray';
import RayCasting from './rayCasting';
import {
  TextureData,
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
      this.dynamicAlpha.setDistanceAlpha(this.refs.top);

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

  public drawSpriteLine(
    props: SpriteLineProps,
    textureData: TextureData
  ): void {
    if (props.light < 1 || props.y1 === props.y0) return;
    this.refs.alphaMask = 0x00ffffff | (props.light << 24);
    this.initRefs(props);

    let y = this.refs.top - props.y0;
    this.slRefs.hRate = //height * repeat -> const
      (textureData.height * props.repeat) / (props.y1 - props.y0);

    while (this.refs.top <= this.refs.bottom) {
      this.slRefs.index =
        (((y * this.slRefs.hRate) << 0) % textureData.height) *
          textureData.width +
        props.spriteX;

      this.slRefs.pixel = textureData.data[this.slRefs.index];

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
    dist: 0,
    factY: 0,
    factX: 0,
    diff: 0,
    index: 0,
    sideX: 0,
    spriteX: 0,
    spriteY: 0,
    fixedX: 0,
  };

  private setSpriteIndexBySideX(textureData: TextureData, rayState: Ray): void {
    this.sldRefs.sideX =
      rayState.sideX - this.rayCastingState.rayAngle.fixCos * this.sldRefs.diff;

    //find better solution
    this.sldRefs.spriteX =
      ((this.sldRefs.sideX * textureData.width) << 0) % textureData.width;
    if (this.sldRefs.spriteX < 0)
      this.sldRefs.spriteX = this.sldRefs.spriteX + textureData.maxX;

    this.sldRefs.spriteY = (this.sldRefs.diff * this.sldRefs.factY) << 0;
    this.sldRefs.fixedX =
      //prepare per rayAngle what condition to use
      this.rayCastingState.rayAngle.sinSign > 0
        ? textureData.maxY - (this.sldRefs.spriteY % textureData.height)
        : this.sldRefs.spriteY % textureData.height;
    this.sldRefs.index =
      this.sldRefs.fixedX * textureData.width + this.sldRefs.spriteX;
  }

  private setSpriteIndexBySideY(textureData: TextureData, rayState: Ray): void {
    this.sldRefs.sideX =
      rayState.sideX - this.rayCastingState.rayAngle.fixSin * this.sldRefs.diff;

    this.sldRefs.spriteY =
      ((this.sldRefs.sideX * textureData.height) << 0) % textureData.height;
    if (this.sldRefs.spriteY < 0)
      this.sldRefs.spriteY = this.sldRefs.spriteY + textureData.maxY;

    this.sldRefs.spriteX = (this.sldRefs.diff * this.sldRefs.factX) << 0;
    this.sldRefs.fixedX =
      //prepare per rayAngle what condition to use
      this.rayCastingState.rayAngle.cosSign > 0
        ? textureData.maxX - (this.sldRefs.spriteX % textureData.width)
        : this.sldRefs.spriteX % textureData.width;
    this.sldRefs.index =
      this.sldRefs.spriteY * textureData.width + this.sldRefs.fixedX;
  }

  public drawSpriteLineDynamic(
    props: DynamicSpriteLineProps,
    rayState: Ray,
    textureData: TextureData
  ): void {
    this.initRefs(props);

    this.sldRefs.factY = //calculate per rayAngle
      textureData.height * this.rayCastingState.rayAngle.fixSinAbs;
    this.sldRefs.factX = //calculate per rayAngle
      textureData.width * this.rayCastingState.rayAngle.fixCosAbs;

    this.sldRefs.diff = 0;

    const spriteIndexSetter =
      rayState.side === Axis.x
        ? this.setSpriteIndexBySideX
        : this.setSpriteIndexBySideY;

    let pixel;

    while (this.refs.top <= this.refs.bottom) {
      this.dynamicAlpha.setDistanceAlpha(this.refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.sldRefs.diff = Math.abs(
        rayState.fixedDistance - this.dynamicAlpha.distance
      );

      spriteIndexSetter.call(this, textureData, rayState);
      pixel = textureData.data[this.sldRefs.index];
      if (this.data[this.refs.dataIndex] !== 0 || pixel === 0) {
        this.refs.top++;
        this.refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[this.refs.dataIndex] =
        (this.dynamicAlpha.alpha << 24) | (pixel & 0x00ffffff);

      this.pixelsCounter.count++;
      this.refs.top++;
      this.refs.dataIndex += consts.resolution.width;
      if (this.pixelsCounter.count >= consts.resolution.height) return;
    }
  }
}

export default Painter;
