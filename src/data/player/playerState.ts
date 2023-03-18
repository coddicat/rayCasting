import settings from '../settings';
import SpriteObject from '../sprite/spriteObject';
import { TextureType } from '../texture/textureStore';
import { Coordinates } from '../types';

export default class PlayerState extends SpriteObject {
  //object props
  public timestamp = 0;
  public halfWidth: number = settings.playerWidth / 2;
  public width: number = settings.playerWidth;
  public height: number = settings.playerHeight;
  public halfHeight: number = settings.playerHeight / 2;
  public lookHeight: number = settings.playerHeight * 0.9;
  public lookZ = settings.playerHeight * 0.9;
  public top = settings.playerHeight;

  constructor(
    position: Coordinates,
    size: { width: number; height: number },
    textureTypes: TextureType[],
    repeat: number
  ) {
    super(position, size, textureTypes, repeat);
  }

  public lookVertical = 0;
  public halfLookVertical = settings.halfHeight;

  //player props
  public jumpingTimestamp: number | null = null;
  public jumpingFloor: number | null = null;
  public jumpingSpeed: number | null = null;

  public movingTimestamp: number | null = null;
  public turningTimestamp: number | null = null;

  public setZ(value: number, jump: boolean): void {
    this.position.z = value;
    this.lookZ = this.position.z + this.lookHeight;
    this.top = this.position.z + this.height;
    if (jump) {
      this.jumpingFloor = this.position.z;
    }
  }
}
