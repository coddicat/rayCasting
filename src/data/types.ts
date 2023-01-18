export type Coordinates = {
  x: number;
  y: number;
}

// export type Vector = {
//   x: number;
//   y: number;
//   angle: number;
// };

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

//-----------------------------

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

  constructor(angle: number) {
    this.setAngle(angle);
  }
}

export type RayCastingState = {
  rayAngle: RayAngle,
  fixDistance: number,
  displayX: number,
  fixCos: number,
  fixSin: number,
  fixCosAbs: number,
  fixSinAbs: number,
}