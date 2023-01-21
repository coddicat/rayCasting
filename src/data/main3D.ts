import consts from './consts';
import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import RayCasting from './rayCasting';
import { getDukeFrontSpriteData } from './spriteLoader';

export class Main3D {
  private tempCtx: CanvasRenderingContext2D;
  private tempCanvas: HTMLCanvasElement;
  private imageData: ImageData;
  private context!: CanvasRenderingContext2D;
  private rayCasting!: RayCasting;
  private playerState: PlayerState;
  private gameMap: GameMap;

  constructor(playerState: PlayerState, gameMap: GameMap) {
    this.tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this.tempCanvas.width = consts.resolution.width;
    this.tempCanvas.height = consts.resolution.height;
    const tempCtx = this.tempCanvas.getContext('2d', {
      willReadFrequently: true,
    });
    if (!tempCtx) throw 'Cannot get context';
    this.tempCtx = tempCtx;
    this.imageData = tempCtx.createImageData(
      consts.resolution.width,
      consts.resolution.height
    );
    this.playerState = playerState;
    this.gameMap = gameMap;
  }

  public async initAsync(mainCanvas: HTMLCanvasElement): Promise<void> {
    const ctx = mainCanvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
    });
    if (!ctx) throw 'cannot get context';
    this.context = ctx;

    const dukeFrontSpriteData = await getDukeFrontSpriteData();

    this.rayCasting = new RayCasting(
      this.imageData,
      this.playerState,
      this.playerState,
      // {
      //   x: 50.5,
      //   y: 70.5,
      //   z: 0.3,
      //   height: 1.8,
      //   width: 1,
      // },
      dukeFrontSpriteData,
      this.gameMap
    );
  }

  public renderMain() {
    this.rayCasting.reset();
    this.rayCasting.draw3D();
    this.tempCtx.putImageData(this.imageData, 0, 0);
    this.context.save();
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.context.scale(
      this.context.canvas.width / consts.resolution.width,
      this.context.canvas.height / consts.resolution.height
    );
    this.context.drawImage(this.tempCanvas, 0, 0);
    this.context.restore();
  }
}
