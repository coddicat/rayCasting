import consts from './consts';
import { PlayerState } from './playerState';
import RayHandler from './rayHandler';
import { Level } from './types';

const maxLight = 255;
const lightFact = maxLight / consts.lookLength;
export class DynamicAlpha {
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
      consts.resolution.width * (this.playerState.lookZ - level.bottom);
    this.lightRate = lightFact * this.rayHandlerState.mirrorFact;
  }

  public alpha = 0;
  public distance = 0;

  public setDistanceAlpha(y: number): void {
    this.shift = y - this.playerState.halfLookVertical;
    if (this.shift === 0) {
      this.alpha = 0;
      this.distance = consts.lookLength;
      return;
    }

    this.distance = this.distanceRate / this.shift;
    this.alpha = (consts.lookLength - this.distance) * this.lightRate;
  }
}

export default DynamicAlpha;
