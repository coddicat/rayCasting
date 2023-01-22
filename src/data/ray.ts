import { RayAngle } from './rayAngle';
import RayAxis from './rayAxis';
import { CellHandler } from './rayHandler';
import { Coordinates, RayAction, Axis } from './types';

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

  private handleStep(last: boolean): boolean {
    const action = this.cellHandler.handle(this, last);

    if (action === RayAction.stop) {
      return true;
    }

    if (action === RayAction.mirror) {
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
    this.distance =
      this.side === Axis.x ? this.axisY.step() : this.axisX.step();
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
