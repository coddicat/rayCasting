import { mod } from '../exts';
import settings from '../settings';
import { painter as refs, render as renderRefs } from '../variables';
import dynamicAlpha from '../dynamicAlpha';
import { props as dynamicAlphaProps } from '../dynamicAlpha';

let _pixelsCounter;
let _rayCastingState;

function _initRefs() {
  if (renderRefs.y0 > renderRefs.y1) {
    refs.top = renderRefs.y1 | 0;
    refs.bottom = renderRefs.y0 | 0;
  } else {
    refs.top = renderRefs.y0 | 0;
    refs.bottom = renderRefs.y1 | 0;
  }

  if (refs.top < 0) refs.top = 0;
  if (refs.bottom >= settings.resolution.height)
    refs.bottom = settings.maxBottom;

  refs.dataIndex =
    Math.imul(refs.top, settings.resolution.width) +
    (_rayCastingState.displayX | 0);
}

export default {
  init: (pixelsCounter, rayCastingState) => {
    _pixelsCounter = pixelsCounter;
    _rayCastingState = rayCastingState;
  },

  drawLineStatic: (props) => {
    if (renderRefs.light < 1) return;
    _initRefs();
    refs.alphaMask = renderRefs.light << 24;
    while (refs.top <= refs.bottom) {
      if (settings.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      settings.data[refs.dataIndex] = props.color | refs.alphaMask;
      // (color.b << 16) |
      // (color.g << 8) |
      // (color.r);

      if (!_pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += settings.resolution.width;
    }
  },

  drawLineDynamic: (props) => {
    _initRefs();

    while (refs.top <= refs.bottom) {
      if (settings.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      dynamicAlpha.setDistanceAlpha(refs.top);

      if (dynamicAlphaProps.alpha < 1) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      settings.data[refs.dataIndex] =
        props.color | (dynamicAlphaProps.alpha << 24);

      if (!_pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += settings.resolution.width;
    }
  },

  drawSpriteLine: (props, textureData) => {
    if (renderRefs.light < 1 || renderRefs.y1 === renderRefs.y0) return;
    refs.alphaMask = 0x00ffffff | (renderRefs.light << 24);
    _initRefs();

    refs.hRate = props.repeatedHeight / (renderRefs.y1 - renderRefs.y0);
    let y = props.revert
      ? refs.top -
        renderRefs.y0 +
        //todo
        (textureData.height - mod(props.repeatedHeight, textureData.height)) /
          refs.hRate
      : refs.top - renderRefs.y0;

    while (refs.top <= refs.bottom) {
      if (settings.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
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
        refs.dataIndex += settings.resolution.width;
        y++;
        continue;
      }

      settings.data[refs.dataIndex] = refs.pixel & refs.alphaMask;

      if (!_pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += settings.resolution.width;
      y++;
    }
  },

  setSpriteIndexBySideX_positive: (props) => {
    refs.fixCosDiff = _rayCastingState.rayAngle.fixCos * refs.diff;
    refs.sideX =
      props.rayState.sideX - refs.fixCosDiff + (refs.fixCosDiff | 0) + 1;
    refs.spriteX =
      ((refs.sideX - (refs.sideX | 0)) * props.textureData.width) | 0;
    refs.spriteY = (refs.diff * props.textureData.factY) | 0;
    refs.fixedX =
      props.textureData.maxY - mod(refs.spriteY, props.textureData.height);
    refs.index = Math.imul(refs.fixedX, props.textureData.width) + refs.spriteX;
  },
  setSpriteIndexBySideY_positive: (props) => {
    refs.fixSinDiff = _rayCastingState.rayAngle.fixSin * refs.diff;
    refs.side =
      props.rayState.sideX - refs.fixSinDiff + (refs.fixSinDiff | 0) + 1;
    refs.spriteY = (refs.side - (refs.side | 0)) * props.textureData.height;
    refs.spriteX = (refs.diff * props.textureData.factX) | 0;
    refs.fixedX =
      props.textureData.maxX - mod(refs.spriteX, props.textureData.width);
    refs.index = Math.imul(refs.spriteY, props.textureData.width) + refs.fixedX;
  },
  setSpriteIndexBySideX_negative: (props) => {
    refs.fixCosDiff = _rayCastingState.rayAngle.fixCos * refs.diff;
    refs.sideX =
      props.rayState.sideX - refs.fixCosDiff + (refs.fixCosDiff | 0) + 1;
    refs.spriteX =
      ((refs.sideX - (refs.sideX | 0)) * props.textureData.width) | 0;
    refs.spriteY = (refs.diff * props.textureData.factY) | 0;
    refs.fixedX = mod(refs.spriteY, props.textureData.height);
    refs.index = Math.imul(refs.fixedX, props.textureData.width) + refs.spriteX;
  },
  setSpriteIndexBySideY_negative: (props) => {
    refs.fixSinDiff = _rayCastingState.rayAngle.fixSin * refs.diff;
    refs.side =
      props.rayState.sideX - refs.fixSinDiff + (refs.fixSinDiff | 0) + 1;
    refs.spriteY = (refs.side - (refs.side | 0)) * props.textureData.height;
    refs.spriteX = (refs.diff * props.textureData.factX) | 0;
    refs.fixedX = mod(refs.spriteX, props.textureData.width);
    refs.index = Math.imul(refs.spriteY, props.textureData.width) + refs.fixedX;
  },

  drawSpriteLineDynamic: (props) => {
    _initRefs();

    if (props.textureData.rayTimestamp !== props.rayState.rayAngle.timestamp) {
      props.textureData.factX =
        props.textureData.width * _rayCastingState.rayAngle.fixCosAbs;
      props.textureData.factY =
        props.textureData.height * _rayCastingState.rayAngle.fixSinAbs;

      props.textureData.rayTimestamp = props.rayState.rayAngle.timestamp;
    }

    refs.diff = 0;
    while (refs.top <= refs.bottom) {
      if (settings.data[refs.dataIndex]) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      dynamicAlpha.setDistanceAlpha(refs.top);

      if (dynamicAlphaProps.alpha < 1) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      refs.diff = Math.abs(
        props.rayState.fixedDistance - dynamicAlphaProps.distance
      );

      props.rayState.spriteIndexSetter.call(this, props);

      refs.pixel = props.textureData.data[refs.index];

      if (!refs.pixel) {
        refs.top++;
        refs.dataIndex += settings.resolution.width;
        continue;
      }

      settings.data[refs.dataIndex] =
        (dynamicAlphaProps.alpha << 24) | (refs.pixel & 0x00ffffff);

      if (!_pixelsCounter.increse()) return;

      refs.top++;
      refs.dataIndex += settings.resolution.width;
    }
  },
};
