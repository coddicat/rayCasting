import settings from '../settings';
import Ray from './ray';
import { RayAngle } from './rayAngle';
import rayHandler from './rayHandler';

let _imageData;
let _playerState;
let _ray;

export const rayCastingState = {
  rayAngle: undefined,
  displayX: 0,
};

function _handleAngle() {
  _ray.init();
  _ray.send(settings.lookLength / rayCastingState.rayAngle.fixDistance);
}

export default {
  init: (imageData, playerState, spriteObjects, gameMap) => {
    _imageData = imageData;
    _playerState = playerState;

    rayCastingState.rayAngle = new RayAngle();
    settings.data.fill(0);
    rayHandler.init(playerState, spriteObjects, rayCastingState, gameMap);

    _ray = new Ray(_playerState.position, rayCastingState.rayAngle, rayHandler);
  },

  reset: () => {
    settings.data.fill(0);
  },

  draw3D: () => {
    rayCastingState.displayX = 0;
    let angle = _playerState.position.angle - settings.halfLookAngle;
    do {
      rayCastingState.rayAngle.setAngle({
        angle,
        fixDistance: Math.cos(
          (_playerState.position.angle - angle) * settings.fixFact
        ),
      });

      _handleAngle();

      rayCastingState.displayX++;
      angle += settings.angleStep;
      rayHandler.reset();
    } while (rayCastingState.displayX < settings.resolution.width);

    _imageData.data.set(settings.buf8);
  },
};
