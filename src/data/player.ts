import consts from './consts';
import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import Ray from './ray';
import { RayAngle } from './rayAngle';
import { CellHandler } from './rayHandler';
import { RayAction } from './types';

const collisionDistance = 0.6;
const quartPi = Math.PI / 4;
const Pi_34 = (Math.PI / 4) * 3;
const halfPi = Math.PI / 2;
const Pi1_5 = Math.PI * 1.5;
const acc = 0.0001;

class CollisionHandler implements CellHandler {
  private state: PlayerState;
  private gameMap: GameMap;

  constructor(state: PlayerState, gameMap: GameMap) {
    this.state = state;
    this.gameMap = gameMap;
  }

  private checkMoveCollision(bx: number, by: number): RayAction {
    const item = this.gameMap.check(bx, by);
    if (!item || item.walls.length === 0) return RayAction.continue;
    const top = this.state.z + this.state.height;
    const bottom = this.state.z;
    const collisions = item.walls.filter(
      (x) => top > x.bottom && bottom < x.top
    );

    if (collisions.length > 0) {
      const max = Math.max.apply(
        null,
        collisions.map((x) => x.top)
      );
      if (max <= bottom + 0.301) {
        this.state.z = max;
        return RayAction.continue;
      }
    }

    return collisions.length > 0 ? RayAction.stop : RayAction.continue;
  }

  public handle(rayState: Ray): RayAction {
    return this.checkMoveCollision(
      rayState.axisX.cellIndex,
      rayState.axisY.cellIndex
    );
  }
}

class Player {
  private state: PlayerState;
  private gameMap: GameMap;

  constructor(state: PlayerState, gameMap: GameMap) {
    this.state = state;
    this.gameMap = gameMap;
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

      const handle = new CollisionHandler(this.state, this.gameMap);

      const ray = new Ray(this.state, new RayAngle(userAngle), handle);
      const rayX = new Ray(this.state, new RayAngle(xAngle), handle);
      const rayY = new Ray(this.state, new RayAngle(yAngle), handle);

      const xres = rayX.send(Math.abs(xDistance) + collisionDistance, false);
      const yres = rayY.send(Math.abs(yDistance) + collisionDistance, false);
      if (xres.stopped) {
        const d = this.fixDistance(xres.distance);
        nx = this.state.x + d * xSign;
      }
      if (yres.stopped) {
        const d = this.fixDistance(yres.distance);
        ny = this.state.y + d * ySign;
      }

      const res =
        !xres.stopped &&
        !yres.stopped &&
        ray.send(distance + collisionDistance, false).stopped;
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
    const mx = this.state.x << 0;
    const my = this.state.y << 0;

    const item = this.gameMap.check(mx, my);
    if (!item) {
      this.fall();
      return;
    }
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

    const mx = this.state.x << 0;
    const my = this.state.y << 0;

    const t = now - this.state.jumping;
    const v0 = this.state.jumpingSpeed ?? 0;
    const newZ = (this.state.jumpingFloor ?? 0) + t * (v0 - acc * (t >> 1));

    const levels = this.gameMap.check(mx, my)?.levels ?? [];

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
