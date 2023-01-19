import consts from './consts';
import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayHandler from './rayHandler';
import { SpriteAngle } from './spriteAngle';
import { Sprite, SpriteData, RayAngle } from './types';

const halfLookAngle = consts.lookAngle / 2;
const buf = new ArrayBuffer(
  consts.resolution.height * consts.resolution.width * 4
);
const buf8 = new Uint8ClampedArray(buf);
const data = new Uint32Array(buf);

class RayCasting {
  private imageData: ImageData;
  private playerState: PlayerState;
  private rayHandler: RayHandler;
  //private sprite: Sprite;
  private spriteAngle: SpriteAngle;
  private ray: Ray;

  public rayAngle: RayAngle;
  public fixDistance!: number;
  public displayX!: number;
  public fixCos!: number;
  public fixSin!: number;
  public fixCosAbs!: number;
  public fixSinAbs!: number;

  constructor(
    imageData: ImageData,
    playerState: PlayerState,
    sprite: Sprite,
    spriteData: SpriteData,
    gameMap: GameMap
  ) {
    this.imageData = imageData;
    this.playerState = playerState;

    this.rayAngle = new RayAngle(0);
    this.spriteAngle = new SpriteAngle(sprite, this.playerState, this);
    //this.sprite = sprite;
    data.fill(0);
    this.rayHandler = new RayHandler(
      data,
      playerState,
      spriteData,
      this,
      gameMap
    );
    this.ray = new Ray(this.playerState, this.rayAngle, this.rayHandler);
  }

  public reset(): void {
    data.fill(0);
  }

  private handleAngle(): void {
    // const spriteAngleState = this.spriteAngle.getState();
    // const mirrorHandle = (
    //   bx: number,
    //   by: number,
    //   side: Axis,
    //   rayX: RayAxis,
    //   rayY: RayAxis
    // ) => {
    //   this.spriteAngle.mirrorHandler(bx, by, side, rayX, rayY);
    // };

    this.ray.init();
    const completed = this.ray.send(consts.lookLength / this.fixDistance);

    if (completed) return;
    //this.rayHandler.complete(spriteAngleState, this.sprite, this.params.angle, completed);
  }

  private setStateVars(): void {
    this.fixDistance = Math.cos(this.playerState.angle - this.rayAngle.angle);
    this.fixCosAbs = this.rayAngle.cosAbs / this.fixDistance;
    this.fixSinAbs = this.rayAngle.sinAbs / this.fixDistance;
    this.fixCos = this.rayAngle.cos / this.fixDistance;
    this.fixSin = this.rayAngle.sin / this.fixDistance;
  }

  public draw3D(): void {
    this.rayAngle.setAngle(this.playerState.angle - halfLookAngle);
    this.displayX = 0;
    this.spriteAngle.initState();

    while (this.displayX < consts.resolution.width) {
      this.setStateVars();
      this.handleAngle();

      this.displayX++;
      this.rayAngle.nextDisplayAngle();
      this.spriteAngle.reset();
      this.rayHandler.reset();
    }

    this.imageData.data.set(buf8);
  }
}

export default RayCasting;
