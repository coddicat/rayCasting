import { mod } from '../exts';
import settings from '../settings';
import dynamicAlpha from '../dynamicAlpha';
import { props as dynamicAlphaProps } from '../dynamicAlpha';

import painter from './painter';
import { Axis } from '../types';
import { render as refs, rayHandler as rayHandlerRefs } from '../variables';

let _rayHandlerState;
let _playerState;
let _pixelCounter;

function _drawWall(rayState) {
  refs.fact = settings.resolution.width / _rayHandlerState.newDistance;
  refs.a = _playerState.halfLookVertical + refs.fact * _playerState.lookZ;
  refs.repeatX = refs.wall.texture?.repeatX ?? 1;
  refs.startY = refs.wall.texture?.startY ?? 0;
  refs.startX = refs.wall.texture?.startX ?? 0;

  refs.s =
    rayState.side === Axis.y
      ? mod(rayState.axisY.cellIndex - refs.startY, refs.repeatX)
      : mod(rayState.axisX.cellIndex - refs.startX, refs.repeatX);

  refs.sideX = (rayState.sideX + refs.s) / refs.repeatX;

  refs.y0 = refs.a - refs.wall.top * refs.fact;
  refs.y1 = refs.a - refs.wall.bottom * refs.fact;

  if (settings.wallTexture && refs.wall.texture?.data) {
    painter.drawSpriteLine(
      {
        spriteX: refs.wall.texture?.data
          ? (refs.sideX * refs.wall.texture?.data.width) | 0
          : 0,
        repeatedHeight:
          ((refs.wall.top - refs.wall.bottom) * refs.wall.texture.data.height) /
          refs.wall.texture.repeat,
        checkAlpha: false,
        revert: refs.wall.texture.revert,
      },
      refs.wall.texture?.data
    );
  } else {
    painter.drawLineStatic(refs.wall);
  }
}

function _drawSprite(props, textureData) {
  refs.fact = settings.resolution.width / rayHandlerRefs.distance;
  refs.a = _playerState.halfLookVertical + refs.fact * _playerState.lookZ;
  refs.y0 = refs.a - props.top * refs.fact;
  refs.y1 = refs.a - props.bottom * refs.fact;

  painter.drawSpriteLine(
    {
      spriteX: rayHandlerRefs.spriteX,
      repeatedHeight: textureData.height,
      checkAlpha: true,
    },
    textureData
  );
}

export default {
  init: (rayCastingState, rayHandlerState, playerState, pixelCounter) => {
    _rayHandlerState = rayHandlerState;
    _playerState = playerState;
    _pixelCounter = pixelCounter;
    dynamicAlpha.init(playerState, rayHandlerState);
    painter.init(pixelCounter, rayCastingState);
  },

  handleLevel: (rayState, level) => {
    dynamicAlpha.start(level);
    refs.y0 =
      _playerState.halfLookVertical +
      dynamicAlphaProps.distanceRate / _rayHandlerState.newDistance;
    refs.y1 =
      _playerState.halfLookVertical +
      dynamicAlphaProps.distanceRate / _rayHandlerState.prevDistance;

    if (settings.levelTexture && level.texture?.data) {
      painter.drawSpriteLineDynamic({
        rayState,
        textureData: level.texture?.data,
      });
    } else {
      painter.drawLineDynamic(level);
    }
  },

  handleSprite: (props) => {
    if (rayHandlerRefs.distance <= 0) return;

    refs.light =
      settings.maxLightFact *
      (settings.lookLength - rayHandlerRefs.distance) *
      _rayHandlerState.mirrorFact;

    if (refs.light < 1) return;

    _drawSprite(props, props.textureData);
  },

  handleWalls: (rayState) => {
    if (!_rayHandlerState.newItem || _rayHandlerState.newDistance <= 0) return;

    refs.light =
      ((255 * (settings.lookLength - _rayHandlerState.newDistance)) /
        settings.lookLength) *
      _rayHandlerState.mirrorFact;

    if (refs.light < 1) return;

    for (refs.wall of _rayHandlerState.newItem.walls) {
      if (refs.wall.render) _drawWall(rayState);
      if (!_pixelCounter.empty) return;
    }
  },
};
