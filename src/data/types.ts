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

export type SpriteData = {
  width: number;
  height: number;
  data: Uint32Array;
};

export type SpriteAngleState = {
  lastDistance: number;
};

export type StaticLineProps = {
  x: number;
  y0: number;
  y1: number;
  color: number;
  light: number;
};

export type SpriteLineProps = {
  x: number;
  spriteX: number;
  y0: number;
  y1: number;
  light: number;
  scale: number;
  checkAlpha: boolean;
};

export type DynamicLineProps = {
  x: number;
  y0: number;
  y1: number;
  yShift: number;
  color: number;
};

export type DynamicSpriteLineProps = {
  x: number;
  side: Axis;
  sideX: number;
  y0: number;
  y1: number;
  yShift: number;
  distance: number;
  scale: number;
};

export type PixelCounter = {
  count: number;
};
