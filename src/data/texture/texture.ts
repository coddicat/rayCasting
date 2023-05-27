import { TextureData } from './textureData';
import { TextureType } from './textureStore';

export default class Texture {
  constructor(type: TextureType, repeat: number, transparent = false) {
    this.type = type;
    this.repeat = repeat;
    this.transparent = transparent;
  }

  public type: TextureType;
  public repeat: number;
  public revert?: boolean;
  public repeatX?: number;
  public startX?: number;
  public startY?: number;
  public data?: TextureData;
  public transparent: boolean;

  public setData(data: TextureData): void {
    this.data = data;
  }
}
