export type Coordinates = {
  x: number;
  y: number;
};

export type Level = {
  color: number;
  bottom: number;
  texture: null | {
    scale: number;
    getUrl: () => string;
    spriteData?: SpriteData;
  };
};
export type Wall = {
  color: number;
  top: number;
  bottom: number;
  render: boolean;
  texture: null | {
    scale: number;
    getUrl: () => string;
    spriteData?: SpriteData;
  };
};

export type SpriteProps = {
  top: number;
  bottom: number;
  texture: null | {
    scale: number;
    getUrl: () => string;
    spriteData?: SpriteData;
  };
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

export interface SpriteObject {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
}

export class SpriteData {
  width: number;
  height: number;
  data: Uint32Array;

  constructor(data: Uint32Array, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
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
  scale: number;
  checkAlpha: boolean;
};

export type DynamicLineProps = {
  y0: number;
  y1: number;
  color: number;
};

export type DynamicSpriteLineProps = {
  y0: number;
  y1: number;
  scale: number;
};

export type PixelCounter = {
  count: number;
};
