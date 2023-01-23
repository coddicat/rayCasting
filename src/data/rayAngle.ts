const rad90 = Math.PI / 2;

export class RayAngle {
  public angle!: number;
  public cos!: number;
  public sin!: number;
  public tan90!: number;
  public spriteFact!: number;
  public cosSign!: number;
  public sinSign!: number;
  public cosAbs!: number;
  public sinAbs!: number;

  public fixCos!: number;
  public fixSin!: number;
  public fixCosAbs!: number;
  public fixSinAbs!: number;

  public fixDistance!: number;
  public timestamp: number;

  constructor(angle?: number) {
    this.timestamp = 0;
    this.setAngle({ angle: angle ?? 0, fixDistance: 1 });
  }

  public setAngle(props: {
    angle: number;
    fixDistance: number | undefined;
  }): void {
    this.angle = props.angle;
    this.fixDistance = props.fixDistance ?? 1;
    this.setAngleProps();
  }

  private setAngleProps(): void {
    this.cos = Math.cos(this.angle);
    this.sin = Math.sin(this.angle);
    this.tan90 = Math.tan(this.angle + rad90);
    this.cosSign = Math.sign(this.cos);
    this.sinSign = Math.sign(this.sin);
    this.cosAbs = this.cos * this.cosSign;
    this.sinAbs = Math.abs(this.sin);
    this.spriteFact = this.sin - this.cos * this.tan90;

    this.fixCosAbs = this.cosAbs / this.fixDistance;
    this.fixSinAbs = this.sinAbs / this.fixDistance;
    this.fixCos = this.cos / this.fixDistance;
    this.fixSin = this.sin / this.fixDistance;

    this.timestamp++;
  }

  public mirrorX() {
    this.angle *= -1;
    this.setAngleProps();
  }

  public mirrorY() {
    this.angle = Math.PI - this.angle;
    this.setAngleProps();
  }
}
