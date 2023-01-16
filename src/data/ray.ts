import consts from "./consts";
import RayAxis from "./rayAxis";
import { RayAction, Side, Vector } from "./types";

export type BlockHandler = (params: {
  bx: number;
  by: number;
  distance: number;
  sideX: number;
  side: Side,
  angle: number;
  last: boolean
}) => RayAction;
export type MirrorHandler = (bx: number, by: number, side: Side, x: RayAxis, y: RayAxis) => void;
class Ray {
  private blockHandler: BlockHandler;
  private axisX: RayAxis;
  private axisY: RayAxis;
  private distance: number;
  private side: Side;
  private sideX: number;
  private mirrors: number;
  private mirrorHandle?: MirrorHandler;

  private cos: number;
  private sin: number;
  private vector: Vector;

  constructor(
    vector: Vector,
    blockHandler: BlockHandler,
    mirrorHandle?: MirrorHandler
  ) {
    this.blockHandler = blockHandler;
    this.mirrorHandle = mirrorHandle;

    this.vector = vector;
    this.cos = Math.cos(vector.angle);
    this.sin = Math.sin(vector.angle);

    const stepX = consts.blockSize / this.cos;
    const stepY = consts.blockSize / this.sin;
    this.axisX = new RayAxis(0, vector.x, stepX);
    this.axisY = new RayAxis(0, vector.y, stepY);
    this.distance = 0;
    this.side = this.getSide();
    this.mirrors = 0;
    this.sideX = this.getSideX();
  }

  private getSide(): Side {
    const dx = this.axisX.getDistance();
    const dy = this.axisY.getDistance();
    return dx === dy ? Side.corner : dx > dy ? Side.x : Side.y;
  }

  private getSideX(): number {
    if (this.side === Side.x) {
      return (this.cos * this.distance + this.vector.x) % consts.blockSize;
    } else {
      return (this.sin * this.distance + this.vector.y) % consts.blockSize;
    }
  }

  private handleStep(last: boolean): boolean {
    const bx = this.axisX.getBlock();
    const by = this.axisY.getBlock();

    const action = this.blockHandler({
      bx,
      by,
      distance: this.distance,
      sideX: this.sideX,
      angle: this.vector.angle,
      side: this.side,
      last: last
    });
    if (action === RayAction.stop) {
      return true;
    }

    if (action === RayAction.mirror) {
      this.mirrors++;
      if (this.side === Side.corner || this.side === Side.x) {
        this.axisY.mirror();
      }
      if (this.side === Side.corner || this.side === Side.y) {
        this.axisX.mirror();
      }
      if (this.mirrorHandle) {
        this.mirrorHandle(bx, by, this.side, this.axisX, this.axisY);
      }
    }
    this.side = this.getSide();
    if (this.side === Side.corner || this.side === Side.x) {
      this.distance = this.axisY.step();
    }
    if (this.side === Side.corner || this.side === Side.y) {
      this.distance = this.axisX.step();
    }
    this.sideX = this.getSideX();

    return false;
  }

  public send(max: number): boolean {
    while (this.distance + this.mirrors * consts.blockSize < max) {
      const stop = this.handleStep(false);
      if (stop) return true;
    }
    this.handleStep(true);
    return false;
  }
}

export default Ray;
