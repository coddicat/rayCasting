import consts from "./consts";
import { PlayerState } from "./playerState";
import Ray, { BlockHandler } from "./ray";
import RayAxis from "./rayAxis";
import RayHandler from "./rayHandler";
import { SpriteAngle } from "./spriteAngle";
import { Side, Sprite, SpriteData, Vector } from "./types";

const angleStep = consts.lookAngle / consts.lookWidth;
const halfLookAngle = consts.lookAngle / 2;
const buf = new ArrayBuffer(consts.lookHeight * consts.lookWidth * 4);
const buf8 = new Uint8ClampedArray(buf);
const data = new Uint32Array(buf);

class RayCasting {
  private imageData: ImageData;
  private playerState: PlayerState;
  private rayHandler: RayHandler;
  private sprite: Sprite;
  private spriteAngle: SpriteAngle;
  private params: { angle: number; fixDistance: number; displayX: number };
  //private sptCtx: CanvasRenderingContext2D;

  constructor(
    imageData: ImageData,
    playerState: PlayerState,
    sprite: Sprite,
    spriteData: SpriteData
  ) {
    this.imageData = imageData;
    this.playerState = playerState;
    this.params = { angle: 0, fixDistance: 1, displayX: 0 };
    this.spriteAngle = new SpriteAngle(sprite, this.playerState, this.params);
    this.sprite = sprite;
    //this.sptCtx = sptCtx;
    data.fill(0);
    this.rayHandler = new RayHandler(
      data,
      playerState,
      this.params,
      spriteData
    );
  }

  public reset(): void {
    data.fill(0);
  }

  // private findIntersection(point: {x: number, y: number}, angle: number, cycleCenter: {x: number, y: number}, cycleRadius: number): number | null {
  //     // Find the intersection of the line defined by the point and angle with the circle defined by the cycle
  //     const dx = Math.cos(angle);
  //     const dy = Math.sin(angle);
  //     const a = dx * dx + dy * dy;
  //     const b = 2 * (dx * (point.x - cycleCenter.x) + dy * (point.y - cycleCenter.y));
  //     const c = (point.x - cycleCenter.x) * (point.x - cycleCenter.x) +
  //               (point.y - cycleCenter.y) * (point.y - cycleCenter.y) -
  //               cycleRadius * cycleRadius;
  //     const discriminant = b * b - 4 * a * c;
  //     if (discriminant < 0) {
  //       // No intersection
  //       return null;
  //     } else {
  //       const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  //       const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
  //       if (t1 >= 0 && t2 >= 0) {
  //         // Both intersections are in the positive t direction, return the distance to the closer one
  //         const d1 = t1 * t1;
  //         const d2 = t2 * t2;
  //         return Math.sqrt(d1 < d2 ? d1 : d2);
  //       } else if (t1 >= 0) {
  //         // Only intersection at t1 is in the positive t direction
  //         return Math.sqrt(t1 * t1);
  //       } else if (t2 >= 0) {
  //         // Only intersection at t2 is in the positive t direction
  //         return Math.sqrt(t2 * t2);
  //       } else {
  //         // No intersection in the positive t direction
  //         return null;
  //       }
  //     }
  //   }

  private handleAngle(): void {
    const rayVector: Vector = {
      x: this.playerState.x,
      y: this.playerState.y,
      angle: this.params.angle,
    };
    const spriteAngleState = this.spriteAngle.getState();
    const handler: BlockHandler = (p) =>
      this.rayHandler.handle(p, spriteAngleState, this.sprite);
    const mirrorHandle = (side: Side, rayX: RayAxis, rayY: RayAxis) => {
      this.spriteAngle.mirrorHandler(side, rayX, rayY);
    };
    const maxDistance = consts.deep / this.params.fixDistance;
    const ray = new Ray(rayVector, handler, mirrorHandle);
    const completed = ray.send(maxDistance);

    if (completed) return;
    this.rayHandler.complete(spriteAngleState, this.sprite);
  }

  public draw3D(): void {
    this.params.angle = this.playerState.angle - halfLookAngle;
    this.params.displayX = 0;
    const to = this.playerState.angle + halfLookAngle;
    this.spriteAngle.initState();

    while (this.params.angle < to) {
      this.params.fixDistance = Math.cos(
        this.playerState.angle - this.params.angle
      );

      this.handleAngle();

      this.params.displayX++;
      this.params.angle += angleStep;

      this.spriteAngle.reset();
      this.rayHandler.reset();
    }

    this.imageData.data.set(buf8);
  }
}

export default RayCasting;
