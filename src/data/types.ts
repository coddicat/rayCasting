import Ray from './ray';
import { TextureType } from './textureStore';

export type Coordinates = {
  x: number;
  y: number;
};

export type Texture = {
  type: TextureType;
  repeat: number;
  repeatedHeight?: number;
  textureData?: TextureData | null;
  revert?: boolean;
  repeatX?: number;
  startX?: number;
  startY?: number;
};

export type Level = {
  color: number;
  bottom: number;
  texture: null | Texture;
};

export type Wall = {
  color: number;
  top: number;
  bottom: number;
  render: boolean;
  texture: null | Texture;
};

export type MapItem = {
  walls: Wall[];
  levels: Level[];
  stopRay: boolean;
  mirror?: boolean;

  //runtime
  aboveLevels?: Level[];
  belowLevels?: Level[];
  playerStateTimestamp?: number;
};

export enum RayAction {
  stop,
  mirror,
  continue,
}

export enum Axis {
  x = 0,
  y = 1,
}

export class SpriteObject {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  textures: Texture[];
  timestamp: number;
  //halfWidth: number;
  top: number;
  //wRate = 1;
  angle = 0;
  public rotate = false;
  rotateTimestamp = null as null | number;

  constructor(
    pos: { x: number; y: number; z: number },
    size: { width: number; height: number },
    textureTypes: TextureType[],
    repeat: number,
    angle = 0,
    rotate = false
  ) {
    this.x = pos.x;
    this.y = pos.y;
    this.z = pos.z;
    this.width = size.width;
    this.height = size.height;
    this.textures = textureTypes.map((t) => ({
      type: t,
      repeat,
    }));
    this.timestamp = 0;
    //this.halfWidth = size.width / 2;
    this.top = pos.z + size.height;
    this.angle = angle;
    this.rotate = rotate;
  }

  public setTextureData(type: TextureType, data: TextureData): void {
    const texture = this.textures.find((t) => t.type === type);
    if (!texture) return;
    texture.textureData = data;
    //this.wRate = data.width / this.width;
  }

  public tick(timestamp: number): void {
    if (this.rotateTimestamp === null) this.rotateTimestamp = timestamp;
    this.angle = (timestamp - this.rotateTimestamp) * 0.01;
  }
}

export class TextureData {
  public width: number;
  public height: number;
  public maxX: number;
  public maxY: number;
  public data: Uint32Array;
  public rayTimestamp = null as null | number;
  public factX = 0;
  public factY = 0;

  constructor(width: number, height: number, data: Uint32Array) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.maxX = width - 1;
    this.maxY = height - 1;
  }
}

export type SpriteAngleState = {
  lastDistance: number;
};

export type StaticLineProps = {
  y0: number;
  y1: number;
  color: number;
  light: number;
};

export type SpriteLineProps = {
  spriteX: number;
  y0: number;
  y1: number;
  light: number;
  repeatedHeight: number;
  checkAlpha: boolean;
  revert?: boolean;
};

export type SpriteProps = {
  spriteX: number;
  distance: number;
  top: number;
  bottom: number;
  textureData: TextureData;
};

export type DynamicLineProps = {
  y0: number;
  y1: number;
  color: number;
};

export type DynamicSpriteLineProps = {
  y0: number;
  y1: number;
  rayState: Ray;
  textureData: TextureData;
};

export type PixelCounter = {
  count: number;
};
