import consts from "./consts";
import map, { MapItemType } from "./map";
import Ray from "./ray";
import { BlockHandler } from "./ray";
import RayHandler from "./rayHandler";
import { RayAction, Vector } from "./types";

const player = {
    x: consts.blockSize * 2,
    y: consts.blockSize * 1.5,
    z: consts.playerHeight,
    angle: 0,
    jumping: null as number | null,
    jumpingFloor: null as number | null,
    jumpingSpeed: null as number | null,

    moving: null as number | null,
    moveSpeed: 0,
    turning: null as number | null,
    turnSpeed: 0
}


function drawLook(scale: number, ctx: CanvasRenderingContext2D) {
    const from = player.angle - consts.lookAngle / 2;
    const to = player.angle + consts.lookAngle / 2;
    for (let angle = from; angle < to; angle += consts.lookMapStep) {
        const fixDistance = Math.cos(player.angle - angle);
        const rayVector: Vector = {
            x: player.x,
            y: player.y,
            angle: angle
        }
        const handler: BlockHandler = (x, y, d) => blockHandler(angle, x, y, d);
        const maxDistance = consts.deep / fixDistance;
        const ray = new Ray(rayVector, handler);
        const completed = ray.send(maxDistance);    
        
        if (!completed) drawLookRay(scale, ctx, angle, consts.deep / fixDistance);
    }
    return;

    function blockHandler(angle: number, blockX: number, blockY: number, distance: number): RayAction {
        const found = map.check(blockX, blockY);
        if (!found) return RayAction.continue;
        const item = map.getItem(found);
        if (!item.stopRay) return RayAction.continue;

        drawLookRay(scale, ctx, angle, distance)
        return RayAction.stop;
    }
}

function drawLookRay(scale: number, ctx: CanvasRenderingContext2D, angle: number, distance: number) {
    const toX = ctx.canvas.width / 2 + Math.cos(angle) * distance * scale;
    const toY = ctx.canvas.height / 2 + Math.sin(angle) * distance * scale;
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.lineWidth = 2;
    ctx.setLineDash([2,2]);
    ctx.lineTo(toX, toY);
    ctx.stroke();        
}

function drawOnMap(scale: number, ctx: CanvasRenderingContext2D) {
    drawLook(scale, ctx);
}

function checkMoveCollision(bx: number, by: number): RayAction {
    const collision = [MapItemType.Wall, MapItemType.ColoredWall, MapItemType.Mirror];
    const found = map.check(bx, by);
    if (found && collision.includes(found)) {
        return RayAction.stop
    } 
    return RayAction.continue;
}
const collisionDistance = 0.5;
function fixDistance(d: number): number {
    d -= collisionDistance;
    if (d < 0) d = 0;
    return d;
}
function moveForward(moving: boolean, now: number, direction: number): boolean {    
    if (!moving) {
        player.moving = null;
        return false;
    }
    if (player.moving) {
        const t = (now - player.moving);
        const cos = Math.cos(player.angle);
        const sin = Math.sin(player.angle);
        const distance = consts.moveSpeed * t;
        const xDistance = cos * distance;
        const yDistance = sin * distance;

        let nx = player.x + xDistance * direction;
        let ny = player.y + yDistance * direction;

        const xSign = Math.sign(cos * direction);
        const ySign = Math.sign(sin * direction);
        const xAngle = xSign < 0 ? Math.PI : 0;
        const yAngle = ySign < 0 ? Math.PI * 1.5 : Math.PI / 2;
        const vx: Vector = {
            x: player.x,
            y: player.y,
            angle: xAngle
        };
        const vy: Vector = {
            x: player.x,
            y: player.y,
            angle: yAngle
        };
        const handleX: BlockHandler = (bx, by, d) => {
            const rayAction = checkMoveCollision(bx, by);
            if (rayAction == RayAction.stop) {
                d = fixDistance(d);
                nx = player.x + d * xSign;
            }
            return rayAction;
        };
        const handleY: BlockHandler = (bx, by, d) => {
            const rayAction = checkMoveCollision(bx, by);
            if (rayAction == RayAction.stop) {
                d = fixDistance(d);
                ny = player.y + d * ySign;
            }
            return rayAction;
        };
        const rayX = new Ray(vx, handleX);
        const rayY = new Ray(vy, handleY);

        rayX.send(Math.abs(xDistance) + collisionDistance);
        rayY.send(Math.abs(yDistance) + collisionDistance);

        player.x = nx;
        player.y = ny;
        checkFloor();
    }
    player.moving = now;
    return true;
}

function checkFloor() {
    const mx = Math.floor(player.x / consts.blockSize);
    const my = Math.floor(player.y / consts.blockSize);
    const found = map.check(mx, my);
    if (!found) {
        fall();
        return;
    }
    const item = map.getItem(found);
    const fl = item.levels.find(w => player.z > w.bottom + consts.playerHeight + 0.01);
    if (!fl) return;
    fall();
}
function fall() {
    player.jumping = player.jumping ?? new Date().getTime();
}

function turn(turning: boolean, now: number, direction: number): boolean {
    if (!turning) {
        player.turning = null;
        return false;
    }
    if (player.turning) {
        const t = (now - player.turning);
        player.angle += consts.turnSpeed * t * direction;
    }
    player.turning = now;
    return true;
}

function jump(now: number): void {
    if (player.jumping) {
        return;
    }
    player.jumping = now;
    player.jumpingFloor = player.z;
    player.jumpingSpeed = 0.02;
}

export default {
    drawOnMap,
    moveForward,
    turn,
    jump,
    getHeight(): number {
        return player.z;
    },
    getVector(): Vector {
        return {
            x: player.x,
            y: player.y,
            angle: player.angle
        }
    },
    tick(now: number): boolean {
        if(!player.jumping) {
            return false;
        }
        const mx = Math.floor(player.x / consts.blockSize);
        const my = Math.floor(player.y / consts.blockSize);
        const m = map.check(mx, my);
        const levels = m ? map.getItem(m).levels : [];
        const collisionLevels = levels
            .filter(x => player.z < consts.playerHeight + x.bottom && player.z > consts.playerHeight + x.bottom - 1)
            .map(x => x.bottom);
        const level = Math.max(...collisionLevels);
        if (collisionLevels.length > 0) {
            player.jumping = null;
            player.jumpingSpeed = 0;
            player.z = consts.playerHeight + level;
            player.jumpingFloor = player.z;
        } else {
            const t = now - player.jumping;
            const v0 = player.jumpingSpeed ?? 0;//0.02;
            const a = 0.0001;
            player.z = (player.jumpingFloor ?? 0) + v0 * t - a * t * t / 2;
        }
        return true;
    }
}