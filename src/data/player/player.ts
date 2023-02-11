import consts, { sign } from '../consts';
import { MovingItem, GameMap } from '../gameMap';
import PlayerState from '../player/playerState';
import Ray from '../ray/ray';
import { RayAngle } from '../ray/rayAngle';
import { Position } from '../types';
import CollisionHandler from './collisionHandler';
import DoorHandler from './doorHandler';

const collisionDistance = 0.6;
const quartPi = Math.PI / 4;
const Pi_34 = (Math.PI / 4) * 3;
const halfPi = Math.PI / 2;
const Pi1_5 = Math.PI * 1.5;
const acc = 0.0001;

export default class Player {
  private state: PlayerState;
  private gameMap: GameMap;
  private collisionHandler: CollisionHandler;

  constructor(state: PlayerState, gameMap: GameMap) {
    this.state = state;
    this.gameMap = gameMap;
    this.collisionHandler = new CollisionHandler(state, gameMap);
  }
  private fixDistance(d: number): number {
    d -= collisionDistance;
    if (d < 0) d = 0;
    return d;
  }

  public move(timestamp: number, forward: number, right: number): void {
    if (!forward && !right) {
      this.state.movingTimestamp = null;
    }
    if (this.state.movingTimestamp) {
      const t = timestamp - this.state.movingTimestamp;
      let userAngle = this.state.position.angle;

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

      let nx = this.state.position.x + xDistance;
      let ny = this.state.position.y + yDistance;

      const xSign = sign(cos);
      const ySign = sign(sin);
      const xAngle = xSign < 0 ? Math.PI : 0;
      const yAngle = ySign < 0 ? Pi1_5 : halfPi;

      const ray = new Ray(
        this.state.position,
        new RayAngle(userAngle),
        this.collisionHandler
      );
      const rayX = new Ray(
        this.state.position,
        new RayAngle(xAngle),
        this.collisionHandler
      );
      const rayY = new Ray(
        this.state.position,
        new RayAngle(yAngle),
        this.collisionHandler
      );

      const xres = rayX.send(Math.abs(xDistance) + collisionDistance, false);
      const yres = rayY.send(Math.abs(yDistance) + collisionDistance, false);
      if (xres.stopped) {
        const d = this.fixDistance(xres.distance);
        nx = this.state.position.x + d * xSign;
      }
      if (yres.stopped) {
        const d = this.fixDistance(yres.distance);
        ny = this.state.position.y + d * ySign;
      }

      const res =
        !xres.stopped &&
        !yres.stopped &&
        ray.send(distance + collisionDistance, false).stopped;
      if (res) {
        nx = this.state.position.x;
        ny = this.state.position.y;
      }

      this.state.position.x = nx;
      this.state.position.y = ny;
    }

    this.checkFloor(this.state.position, timestamp);
    this.state.movingTimestamp = timestamp;
  }

  private checkFloor(pos: Position, timestamp: number): void {
    const newPos = { x: pos.x | 0, y: pos.y | 0 };

    const item = this.gameMap.check(newPos);
    if (!item) {
      this.fall(timestamp);
      return;
    }
    const fl = item.levels.find(
      (level) =>
        this.state.position.z <= level.bottom + 0.1 &&
        this.state.position.z >= level.bottom - 0.1
    );
    const cl = item.levels.find(
      (level) =>
        this.state.position.z + this.state.height > level.bottom &&
        this.state.position.z < level.bottom &&
        level != fl
    );
    if (fl) {
      if (fl && cl) {
        //dead;
        alert('dead');
        this.state.position.x = 3;
        this.state.position.y = 3;
        return;
      }
      this.state.position.z = fl.bottom;
      this.state.lookZ = this.state.position.z + this.state.lookHeight;
      this.state.top = this.state.position.z + this.state.height;
      this.state.jumpingFloor = this.state.position.z;
      return;
    }
    this.fall(timestamp);
  }

  private fall(timestamp: number): void {
    this.state.jumpingTimestamp = this.state.jumpingTimestamp ?? timestamp;
  }

  public turn(turning: boolean, timestamp: number, direction: number): void {
    if (!turning) {
      this.state.turningTimestamp = null;
      return;
    }
    if (this.state.turningTimestamp) {
      const t = timestamp - this.state.turningTimestamp;
      this.state.position.angle += consts.turnSpeed * t * direction;
    }
    this.state.turningTimestamp = timestamp;
  }

  public jump(timestamp: number): void {
    if (this.state.jumpingTimestamp) {
      return;
    }
    this.state.jumpingTimestamp = timestamp;
    this.state.jumpingFloor = this.state.position.z;
    this.state.jumpingSpeed = 0.02;
  }

  public checkDoor(): { door: MovingItem | null; platform: MovingItem | null } {
    const doorHandler = new DoorHandler(this.gameMap);
    const ray = new Ray(
      this.state.position,
      new RayAngle(this.state.position.angle),
      doorHandler
    );
    ray.send(5, false);

    return {
      door: doorHandler.door ?? null,
      platform: doorHandler.platform ?? null,
    };
  }

  public tick(timestamp: number): void {
    if (!this.state.jumpingTimestamp) {
      return;
    }

    const newPos = {
      x: this.state.position.x | 0,
      y: this.state.position.y | 0,
    };

    const t = timestamp - this.state.jumpingTimestamp;
    const v0 = this.state.jumpingSpeed ?? 0;
    const newZ = (this.state.jumpingFloor ?? 0) + t * (v0 - acc * (t >> 1));

    if (newZ === this.state.position.z) return;

    this.state.timestamp++;
    const levels = this.gameMap.check(newPos)?.levels ?? [];

    const topLevels = levels
      .filter(
        (x) =>
          this.state.position.z + this.state.height <= x.bottom &&
          newZ + this.state.height >= x.bottom
      )
      .map((x) => x.bottom);

    const topLevel = Math.min.apply(null, topLevels);
    if (topLevels.length > 0) {
      this.state.jumpingSpeed = 0;
      this.state.position.z = topLevel - this.state.height;
      this.state.lookZ = this.state.position.z + this.state.lookHeight;
      this.state.top = this.state.position.z + this.state.height;
      this.state.jumpingFloor = this.state.position.z;
      return;
    }

    const bottomLevels = levels
      .filter((x) => this.state.position.z >= x.bottom && newZ < x.bottom)
      .map((x) => x.bottom);
    const bottomLevel = Math.max.apply(null, bottomLevels);

    if (bottomLevels.length > 0) {
      this.state.jumpingTimestamp = null;
      this.state.jumpingSpeed = 0;
      this.state.position.z = bottomLevel;
      this.state.jumpingFloor = this.state.position.z;
    } else {
      this.state.position.z = newZ;
    }
    this.state.lookZ = this.state.position.z + this.state.lookHeight;
    this.state.top = this.state.position.z + this.state.height;
  }
}
