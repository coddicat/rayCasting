import consts from '../consts';
import SpriteObject from '../sprite/spriteObject';
import { TextureType } from '../texture/textureStore';
import { Coordinates } from '../types';

const halfHeight = consts.resolution.height / 2;

export default class PlayerState extends SpriteObject {
  //object props
  public timestamp = 0;
  public halfWidth: number = consts.playerWidth / 2;
  public width: number = consts.playerWidth;
  public height: number = consts.playerHeight;
  public lookHeight: number = consts.playerHeight * 0.9;
  public lookZ = consts.playerHeight * 0.9;
  public top = consts.playerHeight;

  constructor(
    position: Coordinates,
    size: { width: number; height: number },
    textureTypes: TextureType[],
    repeat: number
  ) {
    super(position, size, textureTypes, repeat);
  }

  public lookVertical = 0;
  public halfLookVertical = halfHeight;

  //player props
  public jumpingTimestamp: number | null = null;
  public jumpingFloor: number | null = null;
  public jumpingSpeed: number | null = null;

  public movingTimestamp: number | null = null;
  public turningTimestamp: number | null = null;
}
