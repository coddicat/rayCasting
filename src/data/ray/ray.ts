import painter from '../render/painter';
import { RayAngle } from '../ray/rayAngle';
import RayAxis from '../ray/rayAxis';
import {
  Coordinates,
  RayAction,
  Axis,
  DynamicSpriteLineProps,
  Position,
} from '../types';

export default class Ray {
  private cellHandler: any;
  private action!: RayAction;

  public cellPosition!: Position;
  public fromPosition!: Position;
  public axisX: RayAxis;
  public axisY: RayAxis;
  public distance!: number;
  public fixedDistance!: number;
  public mirrorDistance!: number;
  public side!: Axis;
  public sideX!: number;
  public rayAngle: RayAngle;

  public spriteIndexSetter!: (props: DynamicSpriteLineProps) => void;

  constructor(coordinates: Coordinates, rayAngle: RayAngle, cellHandler: any) {
    this.cellHandler = cellHandler;

    this.rayAngle = rayAngle;
    this.axisX = new RayAxis(coordinates, rayAngle, Axis.x);
    this.axisY = new RayAxis(coordinates, rayAngle, Axis.y);
    this.init();
  }

  public init(): void {
    this.axisX.init();
    this.axisY.init();
    this.distance = 0;
    this.fixedDistance = 0;
    this.mirrorDistance = 0;
    this.side = this.axisX.distance > this.axisY.distance ? Axis.x : Axis.y;
    this.cellPosition = {
      x: this.axisX.cellIndex,
      y: this.axisY.cellIndex,
    };
    this.fromPosition = {
      x: this.axisX.from,
      y: this.axisY.from,
    };
    this.setSideX();
  }

  private setSideX(): void {
    this.sideX =
      this.side === Axis.x
        ? this.rayAngle.cos * (this.distance - this.mirrorDistance) +
          this.fromPosition.x
        : this.rayAngle.sin * (this.distance - this.mirrorDistance) +
          this.fromPosition.y;

    this.sideX -= this.sideX | 0;
  }

  private handleStep(last: boolean): boolean {
    this.cellPosition.x = this.axisX.cellIndex;
    this.cellPosition.y = this.axisY.cellIndex;
    this.action = this.cellHandler.handle(this, last);

    if (this.action === RayAction.stop) return true;

    if (this.action === RayAction.mirror) {
      if (this.side === Axis.x) {
        this.fromPosition.x = this.axisX.cellIndex + this.sideX;
        this.fromPosition.y =
          this.axisY.cellIndex + (this.axisY.sign < 0 ? 1 : 0);

        this.axisY.mirror();
        this.rayAngle.mirrorX();
      } else {
        this.fromPosition.x =
          this.axisX.cellIndex + (this.axisX.sign < 0 ? 1 : 0);
        this.fromPosition.y = this.axisY.cellIndex + this.sideX;

        this.axisX.mirror();
        this.rayAngle.mirrorY();
      }
      this.mirrorDistance = this.distance;
    }

    this.side = this.axisX.distance > this.axisY.distance ? Axis.x : Axis.y;

    if (this.side === Axis.x) {
      this.spriteIndexSetter =
        this.rayAngle.sinSign > 0
          ? painter.setSpriteIndexBySideX_positive
          : painter.setSpriteIndexBySideX_negative;
      this.distance = this.axisY.nextStep();
    } else {
      this.spriteIndexSetter =
        this.rayAngle.cosSign > 0
          ? painter.setSpriteIndexBySideY_positive
          : painter.setSpriteIndexBySideY_negative;
      this.distance = this.axisX.nextStep();
    }

    this.fixedDistance = this.distance * this.rayAngle.fixDistance;
    this.setSideX();

    return false;
  }

  public send(
    max: number,
    last = true
  ): { stopped: boolean; distance: number } {
    while (this.distance < max) {
      if (this.handleStep(false))
        return {
          stopped: true,
          distance: this.distance,
        };
    }

    if (last) this.handleStep(last);

    return {
      stopped: false,
      distance: this.distance,
    };
  }
}
