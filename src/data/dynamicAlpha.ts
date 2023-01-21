import consts from './consts';
import { PlayerState } from './playerState';
import RayHandler from './rayHandler';
import { Level } from './types';

const maxLight = 255;
const halfHeight = consts.resolution.height / 2;
export class DynamicAlpha {
  private a = 0;
  private b = 0;
  private f = 0;
  private s = 0;
  private playerState: PlayerState;
  private rayHandlerState: RayHandler;

  constructor(playerState: PlayerState, rayHandlerState: RayHandler) {
    this.playerState = playerState;
    this.rayHandlerState = rayHandlerState;
  }

  public init(level: Level): void {
    this.b =
      consts.resolution.width *
      (this.playerState.z + this.playerState.lookHeight - level.bottom);
    this.f = (maxLight / consts.lookLength) * this.rayHandlerState.mirrorFact;
    this.s = halfHeight + this.playerState.lookVertical;
  }

  public alpha = 0;
  public distance = 0;

  public setDistanceAlpha(y: number): void {
    this.a = y - this.s;
    if (this.a === 0) {
      this.alpha = 0;
      this.distance = consts.lookLength;
      return;
    }

    this.distance = this.b / this.a;
    this.alpha = (consts.lookLength - this.b / this.a) * this.f;
  }

  public setAlpha(y: number): void {
    this.a = y - this.s;
    if (this.a === 0) {
      this.alpha = 0;
      return;
    }
    this.alpha = (consts.lookLength - this.b / this.a) * this.f;
  }

  public setDistance(y: number): void {
    this.a = y - this.s;
    if (this.a === 0) {
      this.distance = consts.lookLength;
      return;
    }
    this.distance = this.b / this.a;
  }
}

export default DynamicAlpha;
