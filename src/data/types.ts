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
  distance: number;
  x0: number;
  x1: number;
  lastDistance: number;
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
  //angle: number;
  distance: number;
  //fixDistance: number;
  scale: number;
};

//-----------------------------
const rad180 = consts.rad * 180;

export class RayAngle {
  //public angle0!: number;
  public angle!: number;
  public cos!: number;
  public sin!: number;
  public cosSign!: number;
  public sinSign!: number;
  public cosAbs!: number;
  public sinAbs!: number;

  public fixCos!: number;
  public fixSin!: number;
  public fixCosAbs!: number;
  public fixSinAbs!: number;

  public fixDistance!: number;

  constructor(angle?: number) {
    this.setAngle({ angle: angle ?? 0, fixDistance: 1 });
  }

  public setAngle(props: {
    angle: number;
    fixDistance: number | undefined;
  }): void {
    //this.angle0 = props.angle;
    this.angle = props.angle;
    this.fixDistance = props.fixDistance ?? 1;
    this.setAngleProps();
  }

  private setAngleProps(): void {
    this.cos = Math.cos(this.angle);
    this.sin = Math.sin(this.angle);
    this.cosSign = Math.sign(this.cos);
    this.sinSign = Math.sign(this.sin);
    this.cosAbs = this.cos * this.cosSign;
    this.sinAbs = Math.abs(this.sin);

    this.fixCosAbs = this.cosAbs / this.fixDistance;
    this.fixSinAbs = this.sinAbs / this.fixDistance;
    this.fixCos = this.cos / this.fixDistance;
    this.fixSin = this.sin / this.fixDistance;
  }

  // public nextDisplayAngle(fixDistance: number) {
  //   this.setAngle(this.angle0 + angleStep);
  // }

  public mirrorX() {
    this.angle *= -1;
    this.setAngleProps();
  }

  public mirrorY() {
    this.angle = rad180 - this.angle;
    this.setAngleProps();
  }
}
export type PixelCounter = {
  count: number;
};
