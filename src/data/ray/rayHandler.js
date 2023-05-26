import { angle, norm } from '../exts';
import render from '../render/render';
import { RayAction, PixelCounter } from '../types';
import { rayHandler as refs } from '../variables';

const rad45 = Math.PI / 4;
const rad180 = Math.PI;
const rad360 = Math.PI * 2;

let _pixelsCounter;
let _playerState;
let _rayCastingState;
let _spriteObjects;
let _spriteState;

const _refs = {
  playerStateTimestamp: null,
  aboveObjects: [],
  belowObjects: [],
};

export const rayHandlerState = {
  prevItem: null,
  newItem: null,
  prevDistance: 0,
  newDistance: 0,
  mirrorFact: 0,
  gameMap: undefined,
};

function _handleLevels(ray) {
  if (!rayHandlerState.prevItem || rayHandlerState.prevDistance < 0.2) return;

  if (_refs.playerStateTimestamp !== _playerState.timestamp) {
    _refs.aboveObjects = _spriteObjects.filter(
      (o) => o.position.z > _playerState.lookZ
    );
    _refs.belowObjects = _spriteObjects.filter(
      (o) => o.position.z <= _playerState.lookZ
    );
    _refs.playerStateTimestamp = _playerState.timestamp;
  }

  if (
    rayHandlerState.prevItem.playerStateTimestamp !== _playerState.timestamp
  ) {
    rayHandlerState.prevItem.aboveLevels =
      rayHandlerState.prevItem.levels.filter(
        (x) => x.bottom > _playerState.lookZ
      );
    rayHandlerState.prevItem.belowLevels = rayHandlerState.prevItem.levels
      .filter((x) => x.bottom < _playerState.lookZ)
      .reverse();
    rayHandlerState.prevItem.playerStateTimestamp = _playerState.timestamp;
  }

  for (const level of rayHandlerState.prevItem.belowLevels) {
    for (const obj of _refs.belowObjects) {
      if (obj.position.z < level.bottom) continue;
      _handleSprite(ray, obj);
      if (!_pixelsCounter.empty) return;
    }

    render.handleLevel(ray, level);
    if (!_pixelsCounter.empty) return;
  }

  for (const level of rayHandlerState.prevItem.aboveLevels) {
    render.handleLevel(ray, level);
    if (!_pixelsCounter.empty) return;

    for (const obj of _refs.aboveObjects) {
      if (obj.position.z > level.bottom) continue;
      _handleSprite(ray, obj);
      if (!_pixelsCounter.empty) return;
    }
  }

  for (const obj of _spriteObjects) {
    _handleSprite(ray, obj);
    if (!_pixelsCounter.empty) return;
  }
}

function _handleSprite(ray, sprite) {
  if (sprite.timestamp === ray.rayAngle.timestamp) return;

  refs.dx = sprite.position.x - ray.fromPosition.x;
  refs.dy = sprite.position.y - ray.fromPosition.y;

  refs.rayDistance =
    (refs.dy - refs.dx * ray.rayAngle.tan90) / ray.rayAngle.spriteFact;

  if (refs.rayDistance < 0.2) return;

  refs.distance =
    (ray.mirrorDistance + refs.rayDistance) *
    _rayCastingState.rayAngle.fixDistance;

  if (rayHandlerState.newDistance < refs.distance) return;

  refs.sideDistance =
    (ray.rayAngle.sin * refs.rayDistance - refs.dy) / ray.rayAngle.cos;

  let texture;
  let side = 1;
  if (sprite.textures.length > 2 && sprite !== _playerState) {
    const a0 = angle(
      sprite.position,
      //todo should be due to user coordinates but with mirror fact
      ray.fromPosition
    );
    const a = norm(a0 + norm(sprite.position.angle));

    if (a < rad45 || a > rad360 - rad45) {
      texture = sprite.textures[1];
    } else if (a < rad180 + rad45 && a > rad180 - rad45) {
      texture = sprite.textures[0];
    } else {
      texture = sprite.textures[2];
      side = a < rad180 ? 1 : -1;
    }
  } else {
    texture = sprite.textures[0];
  }
  if (Math.abs(refs.sideDistance) > sprite.halfWidth) return;

  refs.spriteX =
    ((side * refs.sideDistance + sprite.halfWidth) * sprite.wRate) | 0;

  sprite.timestamp = _rayCastingState.rayAngle.timestamp;

  render.handleSprite({
    top: sprite.top,
    bottom: sprite.position.z,
    textureData: texture.data,
  });
}

export default {
  init: (playerState, spriteObjects, rayCastingState, gameMap) => {
    _rayCastingState = rayCastingState;
    rayHandlerState.prevItem = null;
    rayHandlerState.newItem = null;
    rayHandlerState.prevDistance = 0.2;
    rayHandlerState.newDistance = 0.2;
    rayHandlerState.mirrorFact = 1;
    _pixelsCounter = new PixelCounter();
    _playerState = playerState;
    rayHandlerState.gameMap = gameMap;

    _spriteObjects = spriteObjects;
    _spriteState = {
      lastDistance: 0.6,
    };

    render.init(
      _rayCastingState,
      rayHandlerState,
      _playerState,
      _pixelsCounter
    );
  },

  reset: () => {
    rayHandlerState.prevItem = null;
    rayHandlerState.newItem = null;
    rayHandlerState.prevDistance = 0.2;
    rayHandlerState.newDistance = 0.2;
    rayHandlerState.mirrorFact = 1;
    _pixelsCounter.reset();
    _spriteState.lastDistance = 0.6;
  },

  handle: (ray, last) => {
    rayHandlerState.newItem = rayHandlerState.gameMap.check(ray.cellPosition);
    rayHandlerState.newDistance =
      ray.distance * _rayCastingState.rayAngle.fixDistance;

    if (rayHandlerState.newItem !== rayHandlerState.prevItem || last) {
      _handleLevels(ray);
      if (!_pixelsCounter.empty) return RayAction.stop;
      render.handleWalls(ray);

      rayHandlerState.prevItem = rayHandlerState.newItem;
      rayHandlerState.prevDistance =
        rayHandlerState.newDistance < 0.2 ? 0.2 : rayHandlerState.newDistance;
    }

    if (rayHandlerState.newItem && rayHandlerState.newItem.mirror) {
      rayHandlerState.mirrorFact *= 0.75;
      return RayAction.mirror;
    }

    return !_pixelsCounter.empty ||
      (rayHandlerState.newItem && rayHandlerState.newItem.stopRay)
      ? RayAction.stop
      : RayAction.continue;
  },
};
