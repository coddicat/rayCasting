import Painter from './painter';
import { RayAngle } from './rayAngle';
import RayAxis from './rayAxis';
import { CellHandler } from './rayHandler';
import { Coordinates, RayAction, Axis, DynamicSpriteLineProps } from './types';

export type MirrorHandler = (
  bx: number,
  by: number,
  side: Axis,
  x: RayAxis,
  y: RayAxis
) => void;

class Ray {
  private cellHandler: CellHandler;

  public axisX: RayAxis;
  public axisY: RayAxis;
  public distance!: number;
  public fixedDistance!: number;
  public mirrorDistance!: number;
  public side!: Axis;
  public sideX!: number;
  public rayAngle: RayAngle;

  public spriteIndexSetter!: (props: DynamicSpriteLineProps) => void;

  constructor(
    coordinates: Coordinates,
    rayAngle: RayAngle,
    cellHandler: CellHandler
  ) {
    this.cellHandler = cellHandler;

    this.rayAngle = rayAngle;
    this.axisX = new RayAxis(coordinates, rayAngle, Axis.x);
    this.axisY = new RayAxis(coordinates, rayAngle, Axis.y);

    this.init();
  }

  public init(): void {
    this.axisX.init();
    this.axisY.init();
    this.distance = 0;
    this.fixedDistance = 0;
    this.mirrorDistance = 0;
    this.side = this.getSide();
    this.sideX = this.getSideX();
  }

  private getSide(): Axis {
    return this.axisX.distance > this.axisY.distance ? Axis.x : Axis.y;
  }

  private getSideX(): number {
    return this.side === Axis.x
      ? (this.rayAngle.cos * (this.distance - this.mirrorDistance) +
          this.axisX.from) %
          1
      : (this.rayAngle.sin * (this.distance - this.mirrorDistance) +
          this.axisY.from) %
          1;
  }

  private action!: RayAction;
  private handleStep(last: boolean): boolean {
    this.action = this.cellHandler.handle(this, last);

    if (this.action === RayAction.stop) return true;

    if (this.action === RayAction.mirror) {
      if (this.side === Axis.x) {
        this.axisX.from = this.axisX.cellIndex + this.getSideX();
        this.axisY.from = this.axisY.cellIndex + (this.axisY.sign < 0 ? 1 : 0);

        this.axisY.mirror();
        this.rayAngle.mirrorX();
      } else {
        this.axisY.from = this.axisY.cellIndex + this.getSideX();
        this.axisX.from = this.axisX.cellIndex + (this.axisX.sign < 0 ? 1 : 0);

        this.axisX.mirror();
        this.rayAngle.mirrorY();
      }
      this.mirrorDistance = this.distance;
    }
    this.side = this.getSide();

    if (this.side === Axis.x) {
      this.spriteIndexSetter = Painter.prototype.setSpriteIndexBySideX;
      this.distance = this.axisY.nextStep();
    } else {
      this.spriteIndexSetter = Painter.prototype.setSpriteIndexBySideY;
      this.distance = this.axisX.nextStep();
    }

    // this.distance =
    //   this.side === Axis.x ? this.axisY.nextStep() : this.axisX.nextStep();
    this.fixedDistance = this.distance * this.rayAngle.fixDistance;
    this.sideX = this.getSideX();

    return false;
  }

  public send(
    max: number,
    last = true
  ): { stopped: boolean; distance: number } {
    while (this.distance < max) {
      if (this.handleStep(false))
        return {
          stopped: true,
          distance: this.distance,
        };
    }
    if (last) this.handleStep(last);
    return {
      stopped: false,
      distance: this.distance,
    };
  }
}

export default Ray;
