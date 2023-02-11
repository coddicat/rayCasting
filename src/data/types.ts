import consts from './consts';
import Ray from './ray/ray';
import Texture from './texture/texture';
import { TextureData } from './texture/textureData';
import { TextureType } from './texture/textureStore';

export interface Position {
  x: number;
  y: number;
}

export interface Coordinates extends Position {
  z: number;
  angle: number;
}

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

export type SpriteAngleState = {
  lastDistance: number;
};

export type StaticLineProps = {
  color: number;
};

export type SpriteLineProps = {
  spriteX: number;
  repeatedHeight: number;
  checkAlpha: boolean;
  revert?: boolean;
};

export type SpriteProps = {
  top: number;
  bottom: number;
  textureData: TextureData;
};

export type DynamicLineProps = {
  color: number;
};

export type DynamicSpriteLineProps = {
  rayState: Ray;
  textureData: TextureData;
};

export class PixelCounter {
  private count = 0;
  public empty = true;

  public reset(): void {
    this.count = 0;
    this.empty = true;
  }
  public increse(): boolean {
    return (this.empty = ++this.count < consts.resolution.height);
  }
}
