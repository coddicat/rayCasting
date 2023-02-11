import consts, { mod } from '../consts';
import DynamicAlpha from '../dynamicAlpha';
import RayCasting from '../ray/rayCasting';
import { TextureData } from '../texture/textureData';
import {
  PixelCounter,
  StaticLineProps,
  SpriteLineProps,
  DynamicLineProps,
  DynamicSpriteLineProps,
} from '../types';
import { painter as refs, render as renderRefs } from '../variables';

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

  private initRefs() {
    if (renderRefs.y0 > renderRefs.y1) {
      refs.top = renderRefs.y1 | 0;
      refs.bottom = renderRefs.y0 | 0;
    } else {
      refs.top = renderRefs.y0 | 0;
      refs.bottom = renderRefs.y1 | 0;
    }

    if (refs.top < 0) refs.top = 0;
    if (refs.bottom >= consts.resolution.height) refs.bottom = maxBottom;

    refs.dataIndex =
      Math.imul(refs.top, consts.resolution.width) +
      (this.rayCastingState.displayX | 0);
  }

  public drawLineStatic(props: StaticLineProps): void {
    if (renderRefs.light < 1) return;
    this.initRefs();
    refs.alphaMask = renderRefs.light << 24;
    while (refs.top <= refs.bottom) {
      if (this.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[refs.dataIndex] = props.color | refs.alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      if (!this.pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += consts.resolution.width;
    }
  }

  public drawLineDynamic(props: DynamicLineProps): void {
    this.initRefs();

    while (refs.top <= refs.bottom) {
      if (this.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.dynamicAlpha.setDistanceAlpha(refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[refs.dataIndex] = props.color | (this.dynamicAlpha.alpha << 24);

      if (!this.pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += consts.resolution.width;
    }
  }

  public drawSpriteLine(
    props: SpriteLineProps,
    textureData: TextureData
  ): void {
    if (renderRefs.light < 1 || renderRefs.y1 === renderRefs.y0) return;
    refs.alphaMask = 0x00ffffff | (renderRefs.light << 24);
    this.initRefs();

    refs.hRate = props.repeatedHeight / (renderRefs.y1 - renderRefs.y0);
    let y = props.revert
      ? refs.top -
        renderRefs.y0 +
        (textureData.height - mod(props.repeatedHeight, textureData.height)) /
          refs.hRate
      : refs.top - renderRefs.y0;

    while (refs.top <= refs.bottom) {
      if (this.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      refs.index =
        Math.imul(
          mod((y * refs.hRate) | 0, textureData.height),
          textureData.width
        ) + props.spriteX;

      refs.pixel = textureData.data[refs.index];

      if (props.checkAlpha && !refs.pixel) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        y++;
        continue;
      }

      this.data[refs.dataIndex] = refs.pixel & refs.alphaMask;

      if (!this.pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += consts.resolution.width;
      y++;
    }
  }

  public setSpriteIndexBySideX_positive(props: DynamicSpriteLineProps): void {
    refs.fixCosDiff = this.rayCastingState.rayAngle.fixCos * refs.diff;
    refs.sideX =
      props.rayState.sideX - refs.fixCosDiff + (refs.fixCosDiff | 0) + 1;
    refs.spriteX =
      ((refs.sideX - (refs.sideX | 0)) * props.textureData.width) | 0;
    refs.spriteY = (refs.diff * props.textureData.factY) | 0;
    refs.fixedX =
      props.textureData.maxY - mod(refs.spriteY, props.textureData.height);
    refs.index = Math.imul(refs.fixedX, props.textureData.width) + refs.spriteX;
  }
  public setSpriteIndexBySideY_positive(props: DynamicSpriteLineProps): void {
    refs.fixSinDiff = this.rayCastingState.rayAngle.fixSin * refs.diff;
    refs.side =
      props.rayState.sideX - refs.fixSinDiff + (refs.fixSinDiff | 0) + 1;
    refs.spriteY = (refs.side - (refs.side | 0)) * props.textureData.height;
    refs.spriteX = (refs.diff * props.textureData.factX) | 0;
    refs.fixedX =
      props.textureData.maxX - mod(refs.spriteX, props.textureData.width);
    refs.index = Math.imul(refs.spriteY, props.textureData.width) + refs.fixedX;
  }
  public setSpriteIndexBySideX_negative(props: DynamicSpriteLineProps): void {
    refs.fixCosDiff = this.rayCastingState.rayAngle.fixCos * refs.diff;
    refs.sideX =
      props.rayState.sideX - refs.fixCosDiff + (refs.fixCosDiff | 0) + 1;
    refs.spriteX =
      ((refs.sideX - (refs.sideX | 0)) * props.textureData.width) | 0;
    refs.spriteY = (refs.diff * props.textureData.factY) | 0;
    refs.fixedX = mod(refs.spriteY, props.textureData.height);
    refs.index = Math.imul(refs.fixedX, props.textureData.width) + refs.spriteX;
  }
  public setSpriteIndexBySideY_negative(props: DynamicSpriteLineProps): void {
    refs.fixSinDiff = this.rayCastingState.rayAngle.fixSin * refs.diff;
    refs.side =
      props.rayState.sideX - refs.fixSinDiff + (refs.fixSinDiff | 0) + 1;
    refs.spriteY = (refs.side - (refs.side | 0)) * props.textureData.height;
    refs.spriteX = (refs.diff * props.textureData.factX) | 0;
    refs.fixedX = mod(refs.spriteX, props.textureData.width);
    refs.index = Math.imul(refs.spriteY, props.textureData.width) + refs.fixedX;
  }

  public drawSpriteLineDynamic(props: DynamicSpriteLineProps): void {
    this.initRefs();

    if (props.textureData.rayTimestamp !== props.rayState.rayAngle.timestamp) {
      props.textureData.factX =
        props.textureData.width * this.rayCastingState.rayAngle.fixCosAbs;
      props.textureData.factY =
        props.textureData.height * this.rayCastingState.rayAngle.fixSinAbs;

      props.textureData.rayTimestamp = props.rayState.rayAngle.timestamp;
    }

    refs.diff = 0;
    while (refs.top <= refs.bottom) {
      if (this.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.dynamicAlpha.setDistanceAlpha(refs.top);

      if (this.dynamicAlpha.alpha < 1) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      refs.diff = Math.abs(
        props.rayState.fixedDistance - this.dynamicAlpha.distance
      );

      props.rayState.spriteIndexSetter.call(this, props);

      refs.pixel = props.textureData.data[refs.index];

      if (!refs.pixel) {
        refs.top++;
        refs.dataIndex += consts.resolution.width;
        continue;
      }

      this.data[refs.dataIndex] =
        (this.dynamicAlpha.alpha << 24) | (refs.pixel & 0x00ffffff);

      if (!this.pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += consts.resolution.width;
    }
  }
}

export default Painter;
