import { RayAngle } from './rayAngle';
import { Axis, Coordinates } from './types';
export default class RayAxis {
  private step!: number;

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

  private _step!: number;
  public init(): void {
    if (this.axis === Axis.x) {
      this._step = 1 / this.rayAngle.cos;
      this.from = this.coordinates.x;
    } else {
      this._step = 1 / this.rayAngle.sin;
      this.from = this.coordinates.y;
    }

    this.sign = Math.sign(this._step);
    this.step = Math.abs(this._step);
    this.cellIndex = this.from << 0;
    this.distance = this.step * this.getShift(this.from);
  }

  private _shift = 0;
  private getShift(position: number): number {
    this._shift = Math.abs(position % 1);
    if (position < 0) {
      return this.sign < 0 ? 1 - this._shift : this._shift;
    }
    return this.sign < 0 ? this._shift : 1 - this._shift;
  }

  private prevDistance!: number;
  public nextStep(): number {
    this.prevDistance = this.distance;
    this.cellIndex += this.sign;
    this.distance += this.step;
    return this.prevDistance;
  }

  public mirror(): void {
    this.sign = -this.sign;
    this.distance -= this.step;
  }
}
