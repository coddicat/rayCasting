import consts from "./consts";
import RayAxis from "./rayAxis";
import { CellHandler } from './rayHandler';
import { Coordinates, RayAction, RayAngle, Axis } from "./types";

export type MirrorHandler = (bx: number, by: number, side: Axis, x: RayAxis, y: RayAxis) => void;

export type RayState = {
  bx: number; by: number; distance: number, sideX: number, side: Axis, angle: number, last: boolean
}

class Ray {
  private cellHandler: CellHandler;
  private axisX: RayAxis;
  private axisY: RayAxis;
  private distance: number;
  private side: Axis;
  private sideX: number;
  private mirrorHandle?: MirrorHandler;

  private coordinates: Coordinates;
  private rayAngle: RayAngle;

  constructor(
    coordinates: Coordinates,
    rayAngle: RayAngle,
    cellHandler: CellHandler,
    mirrorHandle?: MirrorHandler
  ) {
    this.cellHandler = cellHandler;
    this.mirrorHandle = mirrorHandle;

    this.rayAngle = rayAngle;
    this.coordinates = coordinates;

    const stepX = consts.cellSize / this.rayAngle.cos;
    const stepY = consts.cellSize / this.rayAngle.sin;
    this.axisX = new RayAxis(0, coordinates.x, stepX);
    this.axisY = new RayAxis(0, coordinates.y, stepY);
    this.distance = 0;
    this.side = this.getSide();
    this.sideX = this.getSideX();
  }

  private getSide(): Axis {
    const dx = this.axisX.distance;
    const dy = this.axisY.distance;
    return dx > dy ? Axis.x : Axis.y;
  }

  private getSideX(): number {
    if (this.side === Axis.x) {
      return (this.rayAngle.cos * this.distance + this.coordinates.x) % consts.cellSize;
    } else {
      return (this.rayAngle.sin * this.distance + this.coordinates.y) % consts.cellSize;
    }
  }

  private handleStep(last: boolean): boolean {
    const bx = this.axisX.cell;
    const by = this.axisY.cell;

    const rayState: RayState = {
      bx,
      by,
      distance: this.distance,
      sideX: this.sideX,
      angle: this.rayAngle.angle,
      side: this.side,
      last: last
    }

    const action = this.cellHandler.handle(rayState);

    if (action === RayAction.stop) {
      return true;
    }

    if (action === RayAction.mirror) {
      if (this.side === Axis.x) {
        this.axisY.mirror();
      } else {
        this.axisX.mirror();
      }

      if (this.mirrorHandle) {
        this.mirrorHandle(bx, by, this.side, this.axisX, this.axisY);
      }
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

  public send(max: number, last = true): { stopped: boolean, distance: number } {
    while (this.distance < max) {
      const stop = this.handleStep(false);
      if (stop) return {
        stopped: true,
        distance: this.distance
      };
    }
    if (last) {
      this.handleStep(last);
    }
    return {
      stopped: false,
      distance: this.distance
    };
  }
}

export default Ray;
