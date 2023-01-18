import consts from "./consts";
export default class RayAxis {
  private _step: number;

  public cell: number;
  public distance: number;
  public sign: number;

  constructor(initDistance: number, from: number, step: number) {
    this.sign = Math.sign(step);
    this._step = Math.abs(step);
    const rest = this.getShift(from);
    this.cell = from / consts.cellSize << 0;
    this.distance = initDistance + (this._step * rest) / consts.cellSize;
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
    this.cell += this.sign;
    this.distance += this._step;
    return distance;
  }

  public mirror(): void {
    this.sign = -this.sign;
    this.distance -= this._step;
  }
}
