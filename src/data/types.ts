import { Color } from "./color"

export type Vector = {
    x: number,
    y: number,
    angle: number
}

export type Level = {
    color: Color,
    bottom: number
}
export type Wall = {
    color: Color,
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