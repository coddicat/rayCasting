import settings from './settings';
import PlayerState from './player/playerState';
import RayHandler from './ray/rayHandler';
import { Level } from './types';

// const maxLight = 255;
// const lightFact = maxLight / consts.lookLength;
export default class DynamicAlpha {
  private shift = 0;
  public distanceRate = 0;
  private lightRate = 0;
  private playerState: PlayerState;
  private rayHandlerState: RayHandler;

  constructor(playerState: PlayerState, rayHandlerState: RayHandler) {
    this.playerState = playerState;
    this.rayHandlerState = rayHandlerState;
  }

  public init(level: Level): void {
    this.distanceRate =
      settings.resolution.width * (this.playerState.lookZ - level.bottom);
    this.lightRate = settings.maxLightFact * this.rayHandlerState.mirrorFact;
  }

  public alpha = 0;
  public distance = 0;

  public setDistanceAlpha(y: number): void {
    this.shift = y - this.playerState.halfLookVertical;
    if (!this.shift) {
      this.alpha = 0;
      this.distance = settings.lookLength;
      return;
    }

    this.distance = this.distanceRate / this.shift;
    this.alpha = (settings.lookLength - this.distance) * this.lightRate;
  }
}
