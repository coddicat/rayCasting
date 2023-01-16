import consts from "./consts";
import { Sprite } from "./types";

export class PlayerState implements Sprite {
  public x: number = consts.blockSize * 30;
  public y: number = consts.blockSize * 15;
  public z = 0;

  public width: number = consts.playerWidth;
  public height: number = consts.playerHeight;
  public lookHeight: number = consts.playerHeight * 0.9;

  public angle = 0; //Math.PI / 2;
  public lookVertical = 0;
  public jumping: number | null = null;
  public jumpingFloor: number | null = null;
  public jumpingSpeed: number | null = null;
  public movingForward: number | null = null;
  public movingRight: number | null = null;
  public moveSpeed = 0;
  public turning: number | null = null;
  public turnSpeed = 0;
}
