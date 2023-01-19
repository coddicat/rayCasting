import consts from './consts';
import { PlayerState } from './playerState';
import RayHandler from './rayHandler';
import { Level } from './types';

const maxLight = 255;
const halfHeight = consts.resolution.height / 2;
export class DynamicAlpha {
  private b = 0;
  private f = 0;
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
  }

  public getAlpha(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return 0;
    return (consts.lookLength - this.b / a) * this.f;
  }

  public getDistance(y: number, shift: number): number {
    const a = y - halfHeight - shift;
    if (a === 0) return consts.lookLength;
    return this.b / a;
  }
}

export default DynamicAlpha;
