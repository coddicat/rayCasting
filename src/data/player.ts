import consts from "./consts";
import map, { MapItemType } from "./map";
import { PlayerState } from "./playerState";
import Ray from "./ray";
import { BlockHandler } from "./ray";
import { RayAction, Vector } from "./types";

const collisionDistance = 2;
const quartPi = Math.PI / 4;
const Pi_34 = (Math.PI / 4) * 3;
const halfPi = Math.PI / 2;
const Pi1_5 = Math.PI * 1.5;
const acc = 0.0001;
class Player {
  private state: PlayerState;
  constructor(state: PlayerState) {
    this.state = state;
  }
  private checkMoveCollision(params: { bx: number; by: number }): RayAction {
    const found = map.check(params);
    if (!found) return RayAction.continue;
    const item = map.getItem(found);
    if (!item || item.walls.length === 0) return RayAction.continue;
    const top = this.state.z + this.state.height;
    const bottom = this.state.z;
    const collisions = item.walls.filter((x) =>
      top > x.bottom && bottom < x.top
    );

    if (collisions.length > 0) {
      const max = Math.max.apply(null, collisions.map(x => x.top));
      if (max <= bottom + 0.301) {
        this.state.z = max;
        return RayAction.continue;
      }
    }

    return collisions.length > 0 ? RayAction.stop : RayAction.continue;
  }
  private fixDistance(d: number): number {
    d -= collisionDistance;
    if (d < 0) d = 0;
    return d;
  }

  public move(now: number, forward: number, right: number): boolean {
    if (forward === 0 && right === 0) {
      this.state.movingRight = null;
      return false;
    }
    if (this.state.movingRight) {
      const t = now - this.state.movingRight;
      let userAngle = this.state.angle;

      if (right > 0 && forward > 0) userAngle += quartPi;
      else if (right < 0 && forward > 0) userAngle -= quartPi;
      else if (right > 0 && forward < 0) userAngle += Pi_34;
      else if (right < 0 && forward < 0) userAngle -= Pi_34;
      else if (right != 0) userAngle += halfPi * right;
      else if (forward < 0) userAngle += Math.PI;

      const cos = Math.cos(userAngle);
      const sin = Math.sin(userAngle);
      const distance = consts.moveSpeed * t;
      const xDistance = cos * distance;
      const yDistance = sin * distance;

      let nx = this.state.x + xDistance;
      let ny = this.state.y + yDistance;

      const xSign = Math.sign(cos);
      const ySign = Math.sign(sin);
      const xAngle = xSign < 0 ? Math.PI : 0;
      const yAngle = ySign < 0 ? Pi1_5 : halfPi;
      const vx: Vector = {
        x: this.state.x,
        y: this.state.y,
        angle: xAngle,
      };
      const vy: Vector = {
        x: this.state.x,
        y: this.state.y,
        angle: yAngle,
      };
      const v: Vector = {
        x: this.state.x,
        y: this.state.y,
        angle: userAngle,
      };

      const handleX: BlockHandler = (params) => {
        const rayAction = this.checkMoveCollision(params);
        if (rayAction === RayAction.stop) {
          const d = this.fixDistance(params.distance);
          nx = this.state.x + d * xSign;
        }
        return rayAction;
      };
      const handleY: BlockHandler = (params) => {
        const rayAction = this.checkMoveCollision(params);
        if (rayAction === RayAction.stop) {
          const d = this.fixDistance(params.distance);
          ny = this.state.y + d * ySign;
        }
        return rayAction;
      };
      const handle: BlockHandler = (param) => {
        const rayAction = this.checkMoveCollision(param);
        return rayAction;
      };
      const ray = new Ray(v, handle);
      const rayX = new Ray(vx, handleX);
      const rayY = new Ray(vy, handleY);

      const xres = rayX.send(Math.abs(xDistance) + collisionDistance, false);
      const yres = rayY.send(Math.abs(yDistance) + collisionDistance, false);
      const res = !xres && !yres && ray.send(distance + collisionDistance, false);
      if (res) {
        nx = this.state.x;
        ny = this.state.y;
      }

      this.state.x = nx;
      this.state.y = ny;
      this.checkFloor();
    }
    this.state.movingRight = now;
    return true;
  }

  private checkFloor() {
    const mx = this.state.x / consts.blockSize << 0;
    const my = this.state.y / consts.blockSize << 0;

    const found = map.check({ bx: mx, by: my });
    if (!found) {
      this.fall();
      return;
    }
    const item = map.getItem(found);
    const fl = item.levels.find((w) => this.state.z === w.bottom);
    if (fl) {
      return;
    }
    this.fall();
  }
  private fall() {
    this.state.jumping = this.state.jumping ?? new Date().getTime();
  }

  public turn(turning: boolean, now: number, direction: number): boolean {
    if (!turning) {
      this.state.turning = null;
      return false;
    }
    if (this.state.turning) {
      const t = now - this.state.turning;
      this.state.angle += consts.turnSpeed * t * direction;
    }
    this.state.turning = now;
    return true;
  }

  public jump(now: number): void {
    if (this.state.jumping) {
      return;
    }
    this.state.jumping = now;
    this.state.jumpingFloor = this.state.z;
    this.state.jumpingSpeed = 0.02;
  }

  public tick(now: number): boolean {
    if (!this.state.jumping) {
      return false;
    }

    const mx = this.state.x / consts.blockSize << 0;
    const my = this.state.y / consts.blockSize << 0;

    const t = now - this.state.jumping;
    const v0 = this.state.jumpingSpeed ?? 0;
    const newZ = (this.state.jumpingFloor ?? 0) + t * (v0 - acc * (t >> 1));

    const m = map.check({ bx: mx, by: my });
    const levels = m ? map.getItem(m).levels : [];

    const topLevels = levels
      .filter(
        (x) =>
          this.state.z + this.state.height <= x.bottom &&
          newZ + this.state.height >= x.bottom
      )
      .map((x) => x.bottom);

    const topLevel = Math.min.apply(null, topLevels);
    if (topLevels.length > 0) {
      this.state.jumpingSpeed = 0;
      this.state.z = topLevel - this.state.height;
      this.state.jumpingFloor = this.state.z;
      return true;
    }

    const bottomLevels = levels
      .filter((x) => this.state.z >= x.bottom && newZ < x.bottom)
      .map((x) => x.bottom);
    const bottomLevel = Math.max.apply(null, bottomLevels);

    if (bottomLevels.length > 0) {
      this.state.jumping = null;
      this.state.jumpingSpeed = 0;
      this.state.z = bottomLevel;
      this.state.jumpingFloor = this.state.z;
    } else {
      this.state.z = newZ;
    }
    return true;
  }
}

export default Player;
