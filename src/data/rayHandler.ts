import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import Render from './render';
import {
  MapItem,
  RayAction,
  SpriteObject,
  SpriteAngleState,
  TextureData,
  PixelCounter,
  SpriteProps,
} from './types';

export interface CellHandler {
  handle(rayState: Ray, last: boolean): RayAction;
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

  private textureData: TextureData;
  private spriteState: SpriteAngleState;
  private spriteObject: SpriteObject;

  constructor(
    data: Uint32Array,
    playerState: PlayerState,

    textureData: TextureData,
    spriteObject: SpriteObject,

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

    this.textureData = textureData;
    this.spriteObject = spriteObject;
    this.spriteState = {
      lastDistance: 0.6,
    };

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
    this.spriteState.lastDistance = 0.6;
  }

  public handle(rayState: Ray, last: boolean): RayAction {
    // const found = this.gameMap.check({
    //   bx: rayState.axisX.cellIndex,
    //   by: rayState.axisY.cellIndex,
    // });
    // this.newItem = found ? this.gameMap.getItem(found) : null;

    this.newItem = this.gameMap.check(
      rayState.axisX.cellIndex,
      rayState.axisY.cellIndex
    );
    this.newDistance =
      rayState.distance * this.rayCastingState.rayAngle.fixDistance;

    this.handleSprite(rayState, this.spriteState, this.spriteObject);

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

  private handleSprite(
    rayState: Ray,
    spriteState: SpriteAngleState,
    sprite: SpriteObject
  ): void {
    const dx = sprite.x - rayState.axisX.from;
    const dy = sprite.y - rayState.axisY.from;

    const rayDistance =
      (dy - dx * rayState.rayAngle.tan90) /
      (rayState.rayAngle.sin - rayState.rayAngle.cos * rayState.rayAngle.tan90);

    if (rayDistance < 0.5) {
      return;
    }
    const distance =
      (rayState.mirrorDistance + rayDistance) *
      this.rayCastingState.rayAngle.fixDistance;

    if (distance <= spriteState.lastDistance || this.newDistance < distance) {
      return;
    }

    const sideDistance =
      rayState.rayAngle.sinAbs < 0.001
        ? 0
        : (dx - rayState.rayAngle.cos * rayDistance) / -rayState.rayAngle.sin;

    const half = sprite.width / 2;
    if (sideDistance > half || sideDistance < -half) return;

    const wRate = this.textureData.width / sprite.width;
    const spriteX = ((sideDistance + half) * wRate) << 0;

    const props: SpriteProps = {
      spriteX,
      distance,
      top: sprite.z + sprite.height,
      bottom: sprite.z,
    };

    this.emptyPixels =
      this.emptyPixels && this.render.handleSprite(props, this.textureData);

    spriteState.lastDistance = distance;
  }
}

export default RayHandler;
