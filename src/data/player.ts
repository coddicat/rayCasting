import consts from "./consts";
import map from "./map";
import ray from "./ray";
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
        const stepX = consts.blockSize / Math.cos(angle);
        const stepY = consts.blockSize / Math.sin(angle);
        const fix = Math.cos(player.angle - angle);
        
        const found = ray.goto({
            x: player.x,
            y: player.y,
            angle: angle
        }, stepX, stepY, consts.deep / fix, (x,y,d) => blockHandler(angle, x, y, d));
        
        if (!found) drawLookRay(scale, ctx, angle, consts.deep / fix);
    }
    return;

    function blockHandler(angle: number, blockX: number, blockY: number, distance: number): RayAction {
        const found = map.check(blockX, blockY);
        if (found == '#') drawLookRay(scale, ctx, angle, distance);
        return  found == '#' ? RayAction.stop : RayAction.continue;
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

function moveForward(moving: boolean, now: number, direction: number): boolean {    
    if (!moving) {
        player.moving = null;
        return false;
    }
    if (player.moving) {
        const t = (now - player.moving);
        const nx = player.x + Math.cos(player.angle) * consts.moveSpeed * t * direction;
        const ny = player.y + Math.sin(player.angle) * consts.moveSpeed * t * direction;
        if (checkNewPos(nx, ny)) {
            player.x = nx;
            player.y = ny;
        } else if(checkNewPos(nx, player.y)) {
            player.x = nx;
        } else if(checkNewPos(player.x, ny)) {
            player.y = ny;
        }
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
function checkNewPos(x: number, y: number): boolean {
    const collision = ['#','@', 'M'];

    const c = [0, 0.5, -0.5];
    for(let i = 0; i < c.length; i++)
        for(let j = 0; j < c.length; j++) {
            const mx = Math.floor((x+c[i]) / consts.blockSize);
            const my = Math.floor((y+c[i]) / consts.blockSize);
            const found = map.check(mx, my);
            if (found) {
                if(collision.includes(found)) {
                    return false;
                }
                const item = map.getItem(found);
                const fw = item.walls.find(w => w.bottom < player.z && w.top > player.z - consts.playerHeight + 0.01);
                if(fw) {
                    return false;
                }
                const fl = item.levels.find(w => player.z > w.bottom && player.z - consts.playerHeight + 0.01 < w.bottom);
                if(fl) {
                    return false;
                }
            }
        }
    return true;
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


// function turn(direction: number) {
//     player.angle += direction * consts.playerTurn;
// }

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