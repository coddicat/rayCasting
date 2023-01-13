import consts from "./consts";
import { PlayerState } from "./playerState";
import RayAxis from "./rayAxis";
import { Side, Sprite, SpriteAngleState } from "./types";

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
    private params: { fixDistance: number, displayX: number }

    constructor(sprite: Sprite, playerState: PlayerState, params: { fixDistance: number, displayX: number }) {
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
        this.params = params;
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

        this.state.distance = distance * this.params.fixDistance;
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