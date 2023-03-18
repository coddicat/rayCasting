import consts from '../consts';
import { GameMap } from '../gameMap/gameMap';
import PlayerState from '../player/playerState';
import Ray from './ray';
import { RayAngle } from './rayAngle';
import RayHandler from './rayHandler';
import SpriteObject from '../sprite/spriteObject';

const halfLookAngle = consts.lookAngle / 2;
const buf = new ArrayBuffer(
  consts.resolution.height * consts.resolution.width * 4
);
const buf8 = new Uint8ClampedArray(buf);
const data = new Uint32Array(buf);
const angleStep = consts.lookAngle / consts.resolution.width;

class RayCasting {
  private imageData: ImageData;
  private playerState: PlayerState;
  private rayHandler: RayHandler;
  private ray: Ray;

  public rayAngle: RayAngle;
  public displayX!: number;

  constructor(
    imageData: ImageData,
    playerState: PlayerState,
    spriteObjects: SpriteObject[],
    gameMap: GameMap
  ) {
    this.imageData = imageData;
    this.playerState = playerState;

    this.rayAngle = new RayAngle();
    data.fill(0);
    this.rayHandler = new RayHandler(
      data,
      playerState,
      spriteObjects,
      this,
      gameMap
    );

    this.ray = new Ray(
      this.playerState.position,
      this.rayAngle,
      this.rayHandler
    );
  }

  public reset(): void {
    data.fill(0);
  }

  private handleAngle(): void {
    this.ray.init();
    this.ray.send(consts.lookLength / this.rayAngle.fixDistance);
  }

  public draw3D(): void {
    this.displayX = 0;
    let angle = this.playerState.position.angle - halfLookAngle;
    do {
      this.rayAngle.setAngle({
        angle,
        fixDistance: Math.cos(this.playerState.position.angle - angle),
      });

      this.handleAngle();

      this.displayX++;
      angle += angleStep;
      this.rayHandler.reset();
    } while (this.displayX < consts.resolution.width);

    this.imageData.data.set(buf8);
  }
}

export default RayCasting;