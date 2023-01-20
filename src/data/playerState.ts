import consts from './consts';
import { Coordinates, SpriteObject } from './types';

export class PlayerState implements SpriteObject, Coordinates {
  public x = 48;
  public y = 45;
  public z = 0;

  public width: number = consts.playerWidth;
  public height: number = consts.playerHeight;
  public lookHeight: number = consts.playerHeight * 0.9;

  public angle = 0; // / 2;
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
