import consts from './consts';
import RayAxis from './rayAxis';
import { CellHandler } from './rayHandler';
import { Coordinates, RayAction, RayAngle, Axis } from './types';

export type MirrorHandler = (
  bx: number,
  by: number,
  side: Axis,
  x: RayAxis,
  y: RayAxis
) => void;

class Ray {
  private cellHandler: CellHandler;
  // private mirrorHandle?: MirrorHandler;
  private coordinates: Coordinates;

  public axisX: RayAxis;
  public axisY: RayAxis;
  public distance!: number;
  public mirrorDistance!: number;
  public side!: Axis;
  public sideX!: number;
  public rayAngle: RayAngle;
  private mirrorAxis!: Axis | null;

  constructor(
    coordinates: Coordinates,
    rayAngle: RayAngle,
    cellHandler: CellHandler
    // mirrorHandle?: MirrorHandler
  ) {
    this.cellHandler = cellHandler;
    // this.mirrorHandle = mirrorHandle;
    this.coordinates = coordinates;

    this.rayAngle = rayAngle;
    this.axisX = new RayAxis(coordinates, rayAngle, Axis.x);
    this.axisY = new RayAxis(coordinates, rayAngle, Axis.y);

    this.init();
  }

  public init(): void {
    this.axisX.init();
    this.axisY.init();
    this.distance = 0;
    this.mirrorDistance = 0;
    this.mirrorAxis = null;
    this.side = this.getSide();
    this.sideX = this.getSideX();
  }

  private getSide(): Axis {
    return this.axisX.distance > this.axisY.distance ? Axis.x : Axis.y;
  }

  private getSideX(): number {
    // if (this.side === Axis.x) {
    //   return (
    //     (this.rayAngle.cos * this.distance + this.coordinates.x) %
    //     consts.cellSize
    //   );
    // } else {
    //   return (
    //     (this.rayAngle.sin * this.distance + this.coordinates.y) %
    //     consts.cellSize
    //   );
    // }

    if (this.side === Axis.x) {
      return (
        (this.rayAngle.cos * (this.distance - this.mirrorDistance) +
          this.axisX.from) %
        consts.cellSize
      );
    } else {
      return (
        (this.rayAngle.sin * (this.distance - this.mirrorDistance) +
          this.axisY.from) %
        consts.cellSize
      );
    }
  }

  private handleStep(last: boolean): boolean {
    const action = this.cellHandler.handle(this, last);

    if (action === RayAction.stop) {
      return true;
    }

    if (action === RayAction.mirror) {
      if (this.side === Axis.x) {
        this.axisX.from = this.axisX.cellIndex + this.getSideX();
        // (this.mirrorAxis === Axis.y ? -this.getSideX() : this.getSideX());

        this.axisY.from = this.axisY.cellIndex + (this.axisY.sign < 0 ? 1 : 0);

        this.axisY.mirror();
        this.rayAngle.mirrorX();
        this.mirrorAxis = Axis.x;
      } else {
        this.axisY.from = this.axisY.cellIndex + this.getSideX();
        //(this.mirrorAxis === Axis.x ? -this.getSideX() : this.getSideX());

        // if (this.mirrorAxis === Axis.x) {
        //   this.axisX.from = this.axisX.cellIndex + 1;
        // } else {
        this.axisX.from = this.axisX.cellIndex + (this.axisX.sign < 0 ? 1 : 0);
        // }

        this.axisX.mirror();
        this.rayAngle.mirrorY();
        this.mirrorAxis = Axis.y;
      }
      this.mirrorDistance = this.distance;
    }
    this.side = this.getSide();
    if (this.side === Axis.x) {
      this.distance = this.axisY.step();
    } else {
      this.distance = this.axisX.step();
    }
    this.sideX = this.getSideX();

    return false;
  }

  public send(
    max: number,
    last = true
  ): { stopped: boolean; distance: number } {
    while (this.distance < max) {
      const stop = this.handleStep(false);
      if (stop)
        return {
          stopped: true,
          distance: this.distance,
        };
    }
    if (last) {
      this.handleStep(last);
    }
    return {
      stopped: false,
      distance: this.distance,
    };
  }
}

export default Ray;
