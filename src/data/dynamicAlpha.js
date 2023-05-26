import settings from './settings';
import PlayerState from './player/playerState';
import { Level } from './types';

let _shift = 0;
let _lightRate = 0;
let _playerState;
let _rayHandlerState;

export const props = {
  distanceRate: 0,
  alpha: 0,
  distance: 0,
};

export default {
  init: (playerState, rayHandlerState) => {
    _playerState = playerState;
    _rayHandlerState = rayHandlerState;
  },

  start: (level) => {
    props.distanceRate =
      settings.resolution.width * (_playerState.lookZ - level.bottom);
    _lightRate = settings.maxLightFact * _rayHandlerState.mirrorFact;
  },

  setDistanceAlpha: (y) => {
    _shift = y - _playerState.halfLookVertical;
    if (!_shift) {
      props.alpha = 0;
      props.distance = settings.lookLength;
      return;
    }

    props.distance = props.distanceRate / _shift;
    props.alpha = (settings.lookLength - props.distance) * _lightRate;
  },
};
