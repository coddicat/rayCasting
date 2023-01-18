import consts from "./consts";
import { PlayerState } from "./playerState";
import Ray from "./ray";
import RayAxis from "./rayAxis";
import RayHandler from "./rayHandler";
import { SpriteAngle } from "./spriteAngle";
import { RayCastingState, Axis, Sprite, SpriteData, RayAngle } from "./types";

const angleStep = consts.lookAngle / consts.resolution.width;
const halfLookAngle = consts.lookAngle / 2;
const buf = new ArrayBuffer(consts.resolution.height * consts.resolution.width * 4);
const buf8 = new Uint8ClampedArray(buf);
const data = new Uint32Array(buf);

class RayCasting {
  private imageData: ImageData;
  private playerState: PlayerState;
  private rayHandler: RayHandler;
  private sprite: Sprite;
  private spriteAngle: SpriteAngle;
  private state: RayCastingState;

  constructor(
    imageData: ImageData,
    playerState: PlayerState,
    sprite: Sprite,
    spriteData: SpriteData,
    wallSpriteData: SpriteData,
    floor1SpriteData: SpriteData
  ) {
    this.imageData = imageData;
    this.playerState = playerState;
    this.state = {
      rayAngle: new RayAngle(0),
      fixDistance: 1,
      displayX: 0,
      fixCos: 1,
      fixSin: 1,
      fixCosAbs: 1,
      fixSinAbs: 1,
    };
    this.spriteAngle = new SpriteAngle(sprite, this.playerState, this.state);
    this.sprite = sprite;
    data.fill(0);
    this.rayHandler = new RayHandler(
      data,
      playerState,
      this.state,
      spriteData,
      wallSpriteData,
      floor1SpriteData,
      this.state
    );
  }

  public reset(): void {
    data.fill(0);
  }


  private handleAngle(): void {
    const spriteAngleState = this.spriteAngle.getState();
    // const handler: cellHandler = (p) =>
    //   this.rayHandler.handle(p, spriteAngleState, this.sprite);
    const mirrorHandle = (bx: number, by: number, side: Axis, rayX: RayAxis, rayY: RayAxis) => {
      this.spriteAngle.mirrorHandler(bx, by, side, rayX, rayY);
    };

    const ray = new Ray(this.playerState, this.state.rayAngle, this.rayHandler, mirrorHandle);
    const completed = ray.send(consts.lookLength / this.state.fixDistance);

    if (completed) return;
    //this.rayHandler.complete(spriteAngleState, this.sprite, this.params.angle, completed);
  }

  public draw3D(): void {
    this.state.rayAngle.setAngle(this.playerState.angle - halfLookAngle);
    this.state.displayX = 0;
    this.spriteAngle.initState();

    while (this.state.rayAngle.angle < this.playerState.angle + halfLookAngle) {
      this.state.fixDistance =
        Math.cos(this.playerState.angle - this.state.rayAngle.angle);
      this.state.fixCosAbs = this.state.rayAngle.cosAbs / this.state.fixDistance;
      this.state.fixSinAbs = this.state.rayAngle.sinAbs / this.state.fixDistance;
      this.state.fixCos = this.state.rayAngle.cos / this.state.fixDistance;
      this.state.fixSin = this.state.rayAngle.sin / this.state.fixDistance;

      this.handleAngle();

      this.state.displayX++;
      this.state.rayAngle.setAngle(this.state.rayAngle.angle + angleStep);
      this.spriteAngle.reset();
      this.rayHandler.reset();
    }

    this.imageData.data.set(buf8);
  }
}

export default RayCasting;
