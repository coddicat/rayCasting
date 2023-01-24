import consts from './consts';
import { TextureType } from './textureStore';
import { Coordinates, SpriteObject, Texture } from './types';

const halfHeight = consts.resolution.height / 2;

export class PlayerState implements SpriteObject, Coordinates {
  public texture: Texture = {
    type: TextureType.DukeFront,
    repeat: 1,
  };

  public x = 10;
  public y = 3;
  public z = 0;
  public timestamp = 0;
  public halfWidth: number = consts.playerWidth / 2;
  public width: number = consts.playerWidth;
  public height: number = consts.playerHeight;
  public lookHeight: number = consts.playerHeight * 0.9;
  public lookZ = consts.playerHeight * 0.9;
  public top = consts.playerHeight;

  public angle = 0; //-Math.PI / 2;
  public lookVertical = 0;
  public halfLookVertical = halfHeight;
  public jumping: number | null = null;
  public jumpingFloor: number | null = null;
  public jumpingSpeed: number | null = null;
  public movingForward: number | null = null;
  public movingRight: number | null = null;
  public moveSpeed = 0;
  public turning: number | null = null;
  public turnSpeed = 0;
}
