import Ray from './ray';
import { TextureType } from './textureStore';

export type Coordinates = {
  x: number;
  y: number;
};

export type Texture = {
  type: TextureType;
  textureData?: TextureData | null;
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
  texture: Texture;
  timestamp: number;
  halfWidth: number;
  constructor(
    pos: { x: number; y: number; z: number },
    size: { width: number; height: number },
    textureType: TextureType
  ) {
    this.x = pos.x;
    this.y = pos.y;
    this.z = pos.z;
    this.width = size.width;
    this.height = size.height;
    this.texture = {
      type: textureType,
    };
    this.timestamp = 0;
    this.halfWidth = size.width / 2;
  }
}

export type TextureData = {
  width: number;
  height: number;
  maxX: number;
  maxY: number;
  data: Uint32Array;
};

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
  repeat: number;
  checkAlpha: boolean;
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
