import consts from './consts';
import { PlayerState } from './playerState';
import RayAxis from './rayAxis';
import RayCasting from './rayCasting';
import { Axis, Sprite, SpriteAngleState } from './types';

const halfLookAngle = consts.lookAngle / 2;
const angleRatio = consts.resolution.width / consts.lookAngle;
const pi2 = Math.PI * 2;

export class SpriteAngle {
  private state: SpriteAngleState;
  private playerState: PlayerState;
  private sprite: Sprite;
  private currentX: number;
  private currentY: number;
  private mirroredX: number;
  private mirroredY: number;
  private rayCastingState: RayCasting;
  private initDistance: number;

  constructor(
    sprite: Sprite,
    playerState: PlayerState,
    rayCastingState: RayCasting
  ) {
    this.playerState = playerState;
    this.sprite = sprite;
    this.currentX = sprite.x;
    this.currentY = sprite.y;
    this.state = {
      distance: 0,
      x0: 0,
      x1: 0,
      status: false,
      hidden: false,
    };
    this.mirroredX = 0;
    this.mirroredY = 0;
    this.rayCastingState = rayCastingState;
    this.initDistance = 0;
    this.initState();
  }
  private fixAngle(a: number) {
    a = a % pi2;
    if (a > Math.PI) {
      return -Math.PI + (a % Math.PI);
    }
    if (a < -Math.PI) {
      return Math.PI + (a % Math.PI);
    }
    return a;
  }
  public initState() {
    const dx = this.currentX - this.playerState.x;
    const dy = this.currentY - this.playerState.y;
    const sign = Math.sign(dx);
    const angle = Math.atan(dy / dx) * sign;
    const angle0 =
      sign < 0 ? Math.PI - this.playerState.angle : this.playerState.angle;
    const diff = (angle - this.fixAngle(angle0)) * sign;
    const x = (angleRatio * (diff + halfLookAngle)) << 0;
    this.initDistance = Math.sqrt(dx ** 2 + dy ** 2);
    const xf =
      ((this.sprite.width / 2) * consts.resolution.width) / this.initDistance;

    this.state.distance = this.initDistance * this.rayCastingState.fixDistance;
    this.state.x0 = x - xf;
    this.state.x1 = x + xf;
  }
  public getState(): SpriteAngleState {
    return this.state;
  }
  public mirrorHandler(
    bx: number,
    by: number,
    axis: Axis,
    rayX: RayAxis,
    rayY: RayAxis
  ): void {
    const cellX = rayX.cellIndex + (rayX.sign > 0 ? 1 : 0);
    const cellY = rayY.cellIndex + (rayY.sign > 0 ? 1 : 0);
    const x = cellX * consts.cellSize;
    const y = cellY * consts.cellSize;

    if (this.state.hidden) {
      return;
    }

    if (this.mirroredY == 0) {
      if (axis === Axis.x && this.playerState.y < y && this.sprite.y > y) {
        this.state.status = true;
        this.state.hidden = true;
        return;
      }
      if (axis === Axis.x && this.playerState.y > y && this.sprite.y < y) {
        this.state.status = true;
        this.state.hidden = true;
        return;
      }
    }

    if (this.mirroredX === 0) {
      if (axis === Axis.y && this.playerState.x < x && this.sprite.x > x) {
        this.state.status = true;
        this.state.hidden = true;
        return;
      }
      if (axis === Axis.y && this.playerState.x > x && this.sprite.x < x) {
        this.state.status = true;
        this.state.hidden = true;
        return;
      }
    }

    this.state.status = false;

    if (axis === Axis.y) {
      if (this.mirroredX % 2 === 0) {
        this.currentX += 2 * (x - this.sprite.x);
      } else {
        this.currentX += 2 * (this.sprite.x - x);
      }
      this.mirroredX++;
    }

    if (axis === Axis.x) {
      if (this.mirroredY % 2 === 0) {
        this.currentY += 2 * (y - this.sprite.y);
      } else {
        this.currentY += 2 * (this.sprite.y - y);
      }
      this.mirroredY++;
    }
    this.initState();
  }
  public reset() {
    this.state.status = false;
    this.state.hidden = false;
    this.state.distance = this.initDistance * this.rayCastingState.fixDistance;
    this.mirroredX = 0;
    this.mirroredY = 0;

    if (this.currentX === this.sprite.x && this.currentY === this.sprite.y)
      return;
    this.currentX = this.sprite.x;
    this.currentY = this.sprite.y;
    this.initState();
  }
}
