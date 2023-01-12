//import { Color } from "./color"
import consts from "./consts"

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

export class PlayerState {
    public x: number = consts.blockSize * 40;
    public y: number = consts.blockSize * 1.5;
    public z: number = consts.playerHeight;
    public angle = Math.PI;
    public jumping: number | null = null;
    public jumpingFloor: number | null = null;
    public jumpingSpeed: number | null= null;
    public moving: number | null = null;
    public moveSpeed = 0;
    public turning: number | null = null;
    public turnSpeed = 0;
}



// export function getPlayerVector (state: PlayerState): Vector {
//     return {
//         x: state.x,
//         y: state.y,
//         angle: state.angle
//     }
// }
