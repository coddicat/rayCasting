import settings from './settings';
import { GameMap } from './gameMap/gameMap';
import PlayerState from './player/playerState';
import rayCasting from './ray/rayCasting';
import SpriteStore from './sprite/spriteStore';

export class Main3D {
  private interCtx!: CanvasRenderingContext2D;
  private interCanvas!: HTMLCanvasElement;
  private imageData!: ImageData;
  private context!: CanvasRenderingContext2D;
  // private rayCasting!: RayCasting;
  private playerState: PlayerState;
  private gameMap: GameMap;
  private spriteStore: SpriteStore;

  constructor(
    playerState: PlayerState,
    gameMap: GameMap,
    spriteStore: SpriteStore
  ) {
    this.playerState = playerState;
    this.gameMap = gameMap;
    this.spriteStore = spriteStore;
  }

  public init(mainCanvas: HTMLCanvasElement): void {
    this.interCanvas = document.createElement('canvas') as HTMLCanvasElement;
    this.interCanvas.width = settings.resolution.width;
    this.interCanvas.height = settings.resolution.height;
    const interCtx = this.interCanvas.getContext('2d', {
      alpha: true,
      willReadFrequently: true,
    });
    if (!interCtx) throw 'Cannot get context';
    this.interCtx = interCtx;
    this.imageData = interCtx.createImageData(
      settings.resolution.width,
      settings.resolution.height
    );

    const ctx = mainCanvas.getContext('2d', {
      alpha: false,
      willReadFrequently: true,
    });
    if (!ctx) throw 'cannot get context';
    this.context = ctx;

    rayCasting.init(
      this.imageData,
      this.playerState,
      this.spriteStore.spriteObjects,
      this.gameMap
    );
  }

  public renderMain() {
    rayCasting.reset();
    rayCasting.draw3D();
    this.interCtx.putImageData(this.imageData, 0, 0);
    this.context.save();
    this.context.clearRect(
      0,
      0,
      this.context.canvas.width,
      this.context.canvas.height
    );
    this.context.scale(
      this.context.canvas.width / settings.resolution.width,
      this.context.canvas.height / settings.resolution.height
    );
    this.context.drawImage(this.interCanvas, 0, 0);
    this.context.restore();
  }
}
