import consts from './consts';
import { Axis, Coordinates, RayAngle } from './types';
export default class RayAxis {
  private _step!: number;

  public cellIndex!: number;
  public distance!: number;
  public sign!: number;

  private coordinates: Coordinates;
  private rayAngle: RayAngle;
  private axis: Axis;

  constructor(coordinates: Coordinates, rayAngle: RayAngle, axis: Axis) {
    this.coordinates = coordinates;
    this.rayAngle = rayAngle;
    this.axis = axis;
  }

  public init(): void {
    const step =
      consts.cellSize /
      (this.axis === Axis.x ? this.rayAngle.cos : this.rayAngle.sin);
    this.sign = Math.sign(step);
    this._step = Math.abs(step);
    const from = this.axis === Axis.x ? this.coordinates.x : this.coordinates.y;
    this.cellIndex = (from / consts.cellSize) << 0;
    this.distance = (this._step * this.getShift(from)) / consts.cellSize;
  }

  private getShift(position: number): number {
    const rest = Math.abs(position % consts.cellSize);
    if (position < 0) {
      return this.sign < 0 ? consts.cellSize - rest : rest;
    }
    return this.sign < 0 ? rest : consts.cellSize - rest;
  }

  public step(): number {
    const distance = this.distance;
    this.cellIndex += this.sign;
    this.distance += this._step;
    return distance;
  }

  public mirror(): void {
    this.sign = -this.sign;
    this.distance -= this._step;
  }
}
