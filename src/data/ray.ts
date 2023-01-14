import consts from "./consts";
import RayAxis from "./rayAxis";
import { RayAction, Side, Vector } from "./types";

export type BlockHandler = (params: {
  bx: number;
  by: number;
  distance: number;
}) => RayAction;
export type MirrorHandler = (side: Side, x: RayAxis, y: RayAxis) => void;
class Ray {
  private blockHandler: BlockHandler;
  private axisX: RayAxis;
  private axisY: RayAxis;
  private distance: number;
  private side: Side;
  private mirrors: number;
  private mirrorHandle?: MirrorHandler;

  constructor(
    vector: Vector,
    blockHandler: BlockHandler,
    mirrorHandle?: MirrorHandler
  ) {
    this.blockHandler = blockHandler;
    this.mirrorHandle = mirrorHandle;

    const stepX = consts.blockSize / Math.cos(vector.angle);
    const stepY = consts.blockSize / Math.sin(vector.angle);
    this.axisX = new RayAxis(0, vector.x, stepX);
    this.axisY = new RayAxis(0, vector.y, stepY);
    this.distance = 0;
    this.side = this.getSide();
    this.mirrors = 0;
  }

  private getSide(): Side {
    const dx = this.axisX.getDistance();
    const dy = this.axisY.getDistance();
    return dx === dy ? Side.corner : dx > dy ? Side.x : Side.y;
  }

  private handleStep(): boolean {
    const action = this.blockHandler({
      bx: this.axisX.getBlock(),
      by: this.axisY.getBlock(),
      distance: this.distance,
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
        this.mirrorHandle(this.side, this.axisX, this.axisY);
      }
    }
    this.side = this.getSide();
    if (this.side === Side.corner || this.side === Side.x) {
      this.distance = this.axisY.step();
    }
    if (this.side === Side.corner || this.side === Side.y) {
      this.distance = this.axisX.step();
    }

    return false;
  }

  public send(max: number): boolean {
    while (this.distance + this.mirrors * consts.blockSize < max) {
      const stop = this.handleStep();
      if (stop) return true;
    }
    return false;
  }
}

export default Ray;
