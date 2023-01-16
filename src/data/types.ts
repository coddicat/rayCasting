export type Vector = {
  x: number;
  y: number;
  angle: number;
};

export type Level = {
  color: number;
  bottom: number;
};
export type Wall = {
  color: number;
  top: number;
  bottom: number;
  render: boolean;
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

export enum Side {
  x,
  y,
  corner,
}

export interface Sprite {
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
  distance: number;
  x0: number;
  x1: number;
  status: boolean;
  hidden: boolean;
};
