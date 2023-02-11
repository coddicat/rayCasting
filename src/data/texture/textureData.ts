export class TextureData {
  public width: number;
  public height: number;
  public maxX: number;
  public maxY: number;
  public data: Uint32Array;
  public rayTimestamp = null as null | number;
  public factX = 0;
  public factY = 0;

  constructor(width: number, height: number, data: Uint32Array) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.maxX = width - 1;
    this.maxY = height - 1;
  }
}
