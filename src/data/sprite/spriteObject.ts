import Texture from '../texture/texture';
import { TextureType } from '../texture/textureStore';
import { Coordinates } from '../types';

export default class SpriteObject {
  position: Coordinates;
  width: number;
  height: number;
  textures: Texture[];
  timestamp: number;
  top: number;
  halfWidth: number;
  wRate!: number;

  constructor(
    position: Coordinates,
    size: { width: number; height: number },
    textureTypes: TextureType[],
    repeat: number
  ) {
    this.position = position;
    this.width = size.width;
    this.height = size.height;
    this.textures = textureTypes.map((t) => new Texture(t, repeat));
    this.timestamp = 0;
    this.top = position.z + size.height;
    this.halfWidth = this.width / 2;
  }

  public setWRate(type: TextureType, textureDataWidth: number): void {
    this.wRate = textureDataWidth / this.width;
  }
}
