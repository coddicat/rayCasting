import consts from './consts';
import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import Render from './render';
import {
  MapItem,
  RayAction,
  Axis,
  Sprite,
  SpriteAngleState,
  SpriteData,
  PixelCounter,
} from './types';

export interface CellHandler {
  handle(
    rayState: Ray,
    last: boolean
    /*spriteState: SpriteAngleState,
    sprite: Sprite*/
  ): RayAction;
}

class RayHandler implements CellHandler {
  public data: Uint32Array;
  public prevItem: MapItem | null;
  public newItem: MapItem | null;
  public prevDistance: number;
  public newDistance: number;
  public mirrorFact: number;
  public gameMap: GameMap;

  private pixelsCounter: PixelCounter;
  private playerState: PlayerState;
  private emptyPixels: boolean;
  private rayCastingState: RayCasting;
  private render: Render;

  constructor(
    data: Uint32Array,
    playerState: PlayerState,
    spriteData: SpriteData,
    rayCastingState: RayCasting,
    gameMap: GameMap
  ) {
    this.data = data;
    this.rayCastingState = rayCastingState;
    this.prevItem = null;
    this.newItem = null;
    this.prevDistance = 0.2;
    this.newDistance = 0.2;
    this.mirrorFact = 1;
    this.emptyPixels = true;
    this.pixelsCounter = { count: 0 };
    this.playerState = playerState;
    this.gameMap = gameMap;
    this.render = new Render(
      data,
      this.rayCastingState,
      this,
      this.playerState,
      this.pixelsCounter
    );
  }

  public reset(): void {
    this.prevItem = null;
    this.newItem = null;
    this.prevDistance = 0.2;
    this.newDistance = 0.2;
    this.mirrorFact = 1;
    this.emptyPixels = true;
    this.pixelsCounter.count = 0;
  }

  public handle(
    rayState: Ray,
    last: boolean
    /*spriteState: SpriteAngleState,
    sprite: Sprite*/
  ): RayAction {
    const found = this.gameMap.check({
      bx: rayState.axisX.cellIndex,
      by: rayState.axisY.cellIndex,
    });
    this.newItem = found ? this.gameMap.getItem(found) : null;
    this.newDistance = rayState.distance * this.rayCastingState.fixDistance;

    //this.handleSprite(this.spriteState, this.sprite, newDistance);

    if (this.newItem !== this.prevItem || last) {
      this.emptyPixels = this.emptyPixels && this.render.handleLevels(rayState);

      this.emptyPixels = this.emptyPixels && this.render.handleWalls(rayState);

      this.prevItem = this.newItem;
      this.prevDistance = this.newDistance < 0.2 ? 0.2 : this.newDistance;
    }

    if (this.newItem && this.newItem.mirror) {
      this.mirrorFact *= 0.75;
      return RayAction.mirror;
    }

    return !this.emptyPixels || (this.newItem && this.newItem.stopRay)
      ? RayAction.stop
      : RayAction.continue;
  }

  // private handleSprite(
  //   spriteState: SpriteAngleState,
  //   sprite: Sprite,
  //   newDistance: number
  // ): void {
  //   if (
  //     !spriteState.status &&
  //     spriteState.distance > 1 &&
  //     newDistance >= spriteState.distance &&
  //     this.rayCastingState.displayX >= spriteState.x0 &&
  //     this.rayCastingState.displayX <= spriteState.x1
  //   ) {
  //     const wRate =
  //       this.spriteData.width / (spriteState.x1 - spriteState.x0 + 1);
  //     const _params = {
  //       spriteX:
  //         ((this.rayCastingState.displayX - spriteState.x0) * wRate) << 0,
  //       displayX: this.rayCastingState.displayX,
  //       distance: spriteState.distance,
  //       mirrorFact: this.mirrorFact,
  //       color: 0x0000ff,
  //       top: sprite.z + sprite.height,
  //       bottom: sprite.z,
  //     };

  //     this.emptyPixels =
  //       this.emptyPixels &&
  //       Render.handleSprite(
  //         this.data,
  //         _params,
  //         this.playerState,
  //         this.pixelsCounter,
  //         this.spriteData
  //       );

  //     spriteState.status = true;
  //   }
  // }

  // public complete(spriteState: SpriteAngleState, sprite: Sprite, angle: number): void {
  //   if (!this.emptyPixels) return;

  //   this.handleSprite(spriteState, sprite, consts.lookLength);

  //   Render.handleLevels(
  //     this.data,
  //     this.item,
  //     {
  //       displayX: this.params.displayX,
  //       distance: this.distance,
  //       distance1: Infinity,
  //       mirrorFact: this.mirrorFact,
  //       sideX: this.params.displayX,
  //       angle: angle,
  //       fixDistance: this.params.fixDistance,
  //       side: Side.y,
  //     },
  //     this.playerState,
  //     this.pixelsCounter,
  //     this.floor1SpriteDate
  //   );
  // }
}

export default RayHandler;
