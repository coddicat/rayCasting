import { RayAngle } from './rayAngle';
import { Axis, Coordinates } from './types';
export default class RayAxis {
  private _step!: number;

  public cellIndex!: number;
  public distance!: number;
  public sign!: number;
  public from!: number;

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
      1 / (this.axis === Axis.x ? this.rayAngle.cos : this.rayAngle.sin);
    this.sign = Math.sign(step);
    this._step = Math.abs(step);
    this.from = this.axis === Axis.x ? this.coordinates.x : this.coordinates.y;
    this.cellIndex = this.from << 0;
    this.distance = this._step * this.getShift(this.from);
  }

  private getShift(position: number): number {
    const rest = Math.abs(position % 1);
    if (position < 0) {
      return this.sign < 0 ? 1 - rest : rest;
    }
    return this.sign < 0 ? rest : 1 - rest;
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
