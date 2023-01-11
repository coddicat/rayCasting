import consts from "./consts";
import Ray, { BlockHandler } from "./ray";
import RayAxis from "./rayAxis";
import RayHandler from "./rayHandler";
import Render from "./render";
import { getPlayerVector, PlayerState, Side, Vector } from "./types";
const angleStep = consts.lookAngle / consts.lookWidth;
const halfLookAngle = consts.lookAngle / 2;
class RayCasting {
    private imageData: ImageData;
    private vector: Vector;
    private playerState: PlayerState;
    private data: Uint32Array;
    private buf8: Uint8ClampedArray;

    constructor(imageData: ImageData, playerState: PlayerState) {
        this.imageData = imageData;
        this.playerState = playerState;
        this.vector = getPlayerVector(playerState);
        
        const buf = new ArrayBuffer(imageData.data.length);
        this.buf8 = new Uint8ClampedArray(buf);
        this.data = new Uint32Array(buf);
    }


    private findIntersection(point: {x: number, y: number}, angle: number, cycleCenter: {x: number, y: number}, cycleRadius: number): number | null {
        // Find the intersection of the line defined by the point and angle with the circle defined by the cycle
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const a = dx * dx + dy * dy;
        const b = 2 * (dx * (point.x - cycleCenter.x) + dy * (point.y - cycleCenter.y));
        const c = (point.x - cycleCenter.x) * (point.x - cycleCenter.x) +
                  (point.y - cycleCenter.y) * (point.y - cycleCenter.y) -
                  cycleRadius * cycleRadius;
        const discriminant = b * b - 4 * a * c;
        if (discriminant < 0) {
          // No intersection
          return null;
        } else {
          const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
          const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);
          if (t1 >= 0 && t2 >= 0) {
            // Both intersections are in the positive t direction, return the distance to the closer one
            const d1 = t1 * t1;
            const d2 = t2 * t2;
            return Math.sqrt(d1 < d2 ? d1 : d2);
          } else if (t1 >= 0) {
            // Only intersection at t1 is in the positive t direction
            return Math.sqrt(t1 * t1);
          } else if (t2 >= 0) {
            // Only intersection at t2 is in the positive t direction
            return Math.sqrt(t2 * t2);
          } else {
            // No intersection in the positive t direction
            return null;
          }
        }
      }
      
    private handleAngle(angle: number, displayX: number): void {
        const fixDistance = Math.cos(this.vector.angle - angle);
        const rayHandler = new RayHandler(this.data, { fixDistance, displayX }, this.playerState);
        const rayVector: Vector = {
            x: this.vector.x,
            y: this.vector.y,
            angle: angle,
        }

        // const objDist = this.findIntersection(
        //     { x: this.vector.x, y: this.vector.y },
        //     angle,
        //     { x: this.playerState.x, y: this.playerState.y},
        //     0.5
        // );
        const obj = {
            x: this.playerState.x,
            y: this.playerState.y,
            distance: 0//objDist
        }

        const handler: BlockHandler = (p) => rayHandler.handle(p, obj);
        const mirrorHandle = (side: Side, rayX: RayAxis, rayY: RayAxis) => {
            // const blockX = rayX.getBlock() + (rayX.getSign() > 0 ? 1: 0);
            // const blockY = rayY.getBlock() + (rayY.getSign() > 0 ? 1: 0);
            // const x = blockX * consts.blockSize;
            // const y = blockY * consts.blockSize;
            
            // obj.x = side === Side.x ? obj.x : 2 * x - obj.x;
            // obj.y = side === Side.y ? obj.y : 2 * y - obj.y;
            // obj.distance = this.findIntersection(
            //     { x: this.vector.x, y: this.vector.y },
            //     angle,
            //     { x: obj.x, y: obj.y },
            //     0.5
            // );
        };
        const maxDistance = consts.deep / fixDistance;
        const ray = new Ray(rayVector, handler, mirrorHandle);
        const completed = ray.send(maxDistance);
        
        if (completed) return;
        rayHandler.complete();
    }

    public draw3D(): void {
        let from = this.vector.angle - halfLookAngle;
        const to = this.vector.angle + halfLookAngle;
        let displayX = 0;

        while(from < to) {
            this.handleAngle(from, displayX);
            from += angleStep;
            displayX ++;
        }

        this.imageData.data.set(this.buf8);
    }
}

export default RayCasting;