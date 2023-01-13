import consts from "./consts";
import map, { MapItemType } from "./map";
import { PlayerState } from "./playerState";
import Ray from "./ray";
import { BlockHandler } from "./ray";
import { RayAction, Vector } from "./types";

const collisionDistance = 0.6;
const halfPi = Math.PI / 2;
const Pi1_5 = Math.PI * 1.5;
const acc  = 0.0001;
class Player {
    private state: PlayerState;
    constructor(state: PlayerState) {
        this.state = state;
    }    
    private checkMoveCollision(params: { bx: number, by: number }): RayAction {
        const collision = [MapItemType.Wall, MapItemType.ColoredWall, MapItemType.Mirror];
        const found = map.check(params);
        if (found && collision.includes(found)) {
            return RayAction.stop
        } 
        return RayAction.continue;
    }
    private fixDistance(d: number): number {
        d -= collisionDistance;
        if (d < 0) d = 0;
        return d;
    }
    public moveForward(moving: boolean, now: number, direction: number): boolean {    
        if (!moving) {
            this.state.moving = null;
            return false;
        }
        if (this.state.moving) {
            const t = (now - this.state.moving);
            const cos = Math.cos(this.state.angle);
            const sin = Math.sin(this.state.angle);
            const distance = consts.moveSpeed * t;
            const xDistance = cos * distance;
            const yDistance = sin * distance;
    
            let nx = this.state.x + xDistance * direction;
            let ny = this.state.y + yDistance * direction;
    
            const xSign = Math.sign(cos * direction);
            const ySign = Math.sign(sin * direction);
            const xAngle = xSign < 0 ? Math.PI : 0;
            const yAngle = ySign < 0 ? Pi1_5 : halfPi;
            const vx: Vector = {
                x: this.state.x,
                y: this.state.y,
                angle: xAngle
            };
            const vy: Vector = {
                x: this.state.x,
                y: this.state.y,
                angle: yAngle
            };
            const v: Vector = {
                x: this.state.x,
                y: this.state.y,
                angle: this.state.angle + (direction < 0 ? Math.PI : 0)
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
    
            const xres = rayX.send(Math.abs(xDistance) + collisionDistance);
            const yres = rayY.send(Math.abs(yDistance) + collisionDistance);
            const res = !xres && !yres && ray.send(distance + collisionDistance);
            if (res) {
                nx = this.state.x;
                ny = this.state.y
            }

            this.state.x = nx;
            this.state.y = ny;
            this.checkFloor();
        }
        this.state.moving = now;
        return true;
    }
    
    private checkFloor() {
        const mx = (this.state.x / consts.blockSize) << 0;
        const my = (this.state.y / consts.blockSize) << 0;

        const found = map.check({ bx: mx, by: my });
        if (!found) {
            this.fall();
            return;
        }
        const item = map.getItem(found);
        const fl = item.levels.find(w => this.state.z > w.bottom + 0.01);
        if (!fl) return;
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
            const t = (now - this.state.turning);
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
        if(!this.state.jumping) {
            return false;
        }
        const mx = (this.state.x / consts.blockSize) << 0;
        const my = (this.state.y / consts.blockSize) << 0;

        const m = map.check({ bx: mx, by: my });
        const levels = m ? map.getItem(m).levels : [];
        const collisionLevels = levels
            .filter(x => this.state.z < x.bottom && this.state.z > x.bottom - 1)
            .map(x => x.bottom);
        const level = Math.max.apply(null, collisionLevels);
        if (collisionLevels.length > 0) {
            this.state.jumping = null;
            this.state.jumpingSpeed = 0;
            this.state.z = level;
            this.state.jumpingFloor = this.state.z;
        } else {
            const t = now - this.state.jumping;
            const v0 = this.state.jumpingSpeed ?? 0;
            this.state.z = (this.state.jumpingFloor ?? 0) + v0 * t - acc * t * (t >> 1);
        }
        return true;
    }    
}

export default Player;