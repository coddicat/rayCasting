import { RayAngle } from './rayAngle';
import { Axis, Coordinates } from '../types';
import { sign } from '../exts';

export default class RayAxis {
  public cellIndex!: number;
  public distance!: number;
  public sign!: number;
  public from!: number;

  private coordinates: Coordinates;
  private rayAngle: RayAngle;
  private axis: Axis;
  private step!: number;
  private tempStep!: number;
  private shift = 0;
  private prevDistance!: number;

  constructor(coordinates: Coordinates, rayAngle: RayAngle, axis: Axis) {
    this.coordinates = coordinates;
    this.rayAngle = rayAngle;
    this.axis = axis;
  }

  public init(): void {
    if (this.axis === Axis.x) {
      this.tempStep = 1 / this.rayAngle.cos;
      this.from = this.coordinates.x;
    } else {
      this.tempStep = 1 / this.rayAngle.sin;
      this.from = this.coordinates.y;
    }

    this.sign = sign(this.tempStep);
    this.step = Math.abs(this.tempStep);
    this.cellIndex = this.from | 0;
    this.shift = this.from - (this.from | 0);
    if (this.sign >= 0) {
      this.shift = 1 - this.shift;
    }
    this.distance = this.step * this.shift;
  }

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
