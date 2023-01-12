//import { Color } from "./color"
import consts from "./consts"
import RayAxis from "./rayAxis"

export type Vector = {
    x: number,
    y: number,
    angle: number
}

export type Level = {
    color: number,
    bottom: number
}
export type Wall = {
    color: number,
    top: number,
    bottom: number
}

export type MapItem = {
    walls: Wall[],
    levels: Level[],
    stopRay: boolean,
    mirror?: boolean
}

export enum RayAction {
    stop,
    mirror,
    continue
}

export enum Side {
    x,
    y,
    corner
}

export interface Sprite {
    x: number;
    y: number,
    z: number,
    width: number,
    height: number,
}
export class PlayerState implements Sprite {
    public x: number = consts.blockSize * 40;
    public y: number = consts.blockSize * 1.5;
    public z = 0;

    public width: number = consts.playerHeight
    public height: number = consts.playerHeight;
    
    
    public angle = Math.PI;
    public jumping: number | null = null;
    public jumpingFloor: number | null = null;
    public jumpingSpeed: number | null= null;
    public moving: number | null = null;
    public moveSpeed = 0;
    public turning: number | null = null;
    public turnSpeed = 0;
}



export type SpriteAngleState = {
    distance: number,
    x0: number,
    x1: number,
    status: boolean
}

const halfLookAngle = consts.lookAngle / 2;
const angleRatio = consts.lookWidth / consts.lookAngle;
const pi2 = Math.PI * 2;
export class SpriteAngle {
    private state: SpriteAngleState;
    private playerState: PlayerState;
    private sprite: Sprite;
    private currentX: number;
    private currentY: number;
    private mirrored: boolean;

    constructor(sprite: Sprite, playerState: PlayerState) {
        this.playerState = playerState;
        this.sprite = sprite;
        this.currentX = sprite.x;
        this.currentY = sprite.y;
        this.state = {
            distance: 0,
            x0: 0,
            x1: 0,
            status: false,
        }
        this.mirrored = false;
        this.initState();
    }
    private fixAngle(a: number) {
        a = a % (pi2);
        if (a > Math.PI) {
            return -Math.PI + a % Math.PI
        } 
        if (a < -Math.PI) {
            return Math.PI + a % Math.PI
        }
        return a;
    }
    public initState() {
        const dx = this.currentX - this.playerState.x;
        const dy = this.currentY - this.playerState.y;
        const sign = Math.sign(dx);
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        const angle = Math.atan(dy/dx) * sign;

        const angle0 = sign < 0 ? Math.PI - this.playerState.angle : this.playerState.angle;
        const diff = (angle - this.fixAngle(angle0)) * sign;
        const x = (angleRatio * (diff + halfLookAngle)) << 0;
        const xf = this.sprite.width / 2 * consts.lookWidth / distance;

        this.state.distance = distance;
        this.state.x0 = x - xf;
        this.state.x1 = x + xf;
    }
    public getState(): SpriteAngleState {
        return this.state;
    }    
    public mirrorHandler(side: Side, rayX: RayAxis, rayY: RayAxis): void {
        const blockX = rayX.getBlock() + (rayX.getSign() > 0 ? 1: 0);
        const blockY = rayY.getBlock() + (rayY.getSign() > 0 ? 1: 0);
        const x = blockX * consts.blockSize;
        const y = blockY * consts.blockSize;
        
        this.currentX = side === Side.x ? this.currentX : 2 * x - this.currentX;
        this.currentY = side === Side.y ? this.currentY : 2 * y - this.currentY;   
        this.initState();
        this.mirrored = true;
    }
    public reset() {
        this.state.status = false;
        if (!this.mirrored && this.currentX === this.sprite.x && this.currentY === this.sprite.y) return;
        this.currentX = this.sprite.x;
        this.currentY = this.sprite.y;
        this.initState();
        this.mirrored = false;
    }
}