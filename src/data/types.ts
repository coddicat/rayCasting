import consts from './consts';
import { PlayerState } from './playerState';

export type Coordinates = {
  x: number;
  y: number;
};

// export type Vector = {
//   x: number;
//   y: number;
//   angle: number;
// };

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
  angle: number;
  distance: number;
  fixDistance: number;
  scale: number;
};

//-----------------------------
const angleStep = consts.lookAngle / consts.resolution.width;

export class RayAngle {
  public angle!: number;
  public cos!: number;
  public sin!: number;
  public cosSign!: number;
  public sinSign!: number;
  public cosAbs!: number;
  public sinAbs!: number;

  public setAngle(angle: number): void {
    this.angle = angle;
    this.cos = Math.cos(angle);
    this.sin = Math.sin(angle);
    this.cosSign = Math.sign(this.cos);
    this.sinSign = Math.sign(this.sin);
    this.cosAbs = this.cos * this.cosSign;
    this.sinAbs = Math.abs(this.sin);
  }

  public nextDisplayAngle() {
    this.setAngle(this.angle + angleStep);
  }

  constructor(angle: number) {
    this.setAngle(angle);
  }
}
export type PixelCounter = {
  count: number;
};
