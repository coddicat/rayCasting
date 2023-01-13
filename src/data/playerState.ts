import consts from "./consts";
import { Sprite } from "./types";

export class PlayerState implements Sprite {
    public x: number = consts.blockSize * 40;
    public y: number = consts.blockSize * 1.5;
    public z = 0;

    public width: number = consts.playerHeight
    public height: number = consts.playerHeight;
    public lookHeight: number = consts.playerHeight * 0.9;
    
    public angle = Math.PI;
    public jumping: number | null = null;
    public jumpingFloor: number | null = null;
    public jumpingSpeed: number | null= null;
    public moving: number | null = null;
    public moveSpeed = 0;
    public turning: number | null = null;
    public turnSpeed = 0;
}