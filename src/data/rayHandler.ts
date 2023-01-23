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

  private spriteObjects: SpriteObject[];
  private spriteState: SpriteAngleState;

  constructor(
    data: Uint32Array,
    playerState: PlayerState,

    spriteObjects: SpriteObject[],
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

    this.spriteObjects = spriteObjects;
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
    this.newItem = this.gameMap.check(
      rayState.axisX.cellIndex,
      rayState.axisY.cellIndex
    );
    this.newDistance =
      rayState.distance * this.rayCastingState.rayAngle.fixDistance;

    if (this.newItem !== this.prevItem || last) {
      const aboveObjects = this.spriteObjects.filter(
        (o) => o.z > this.playerState.lookZ
      );
      const belowObjects = this.spriteObjects.filter(
        (o) => o.z <= this.playerState.lookZ
      );

      for (const spriteObject of belowObjects)
        this.emptyPixels =
          this.emptyPixels && this.handleSprite(rayState, spriteObject);

      this.emptyPixels = this.emptyPixels && this.render.handleLevels(rayState);

      for (const spriteObject of aboveObjects)
        this.emptyPixels =
          this.emptyPixels && this.handleSprite(rayState, spriteObject);

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

  private handleSprite(rayState: Ray, sprite: SpriteObject): boolean {
    if (sprite.timestamp === rayState.rayAngle.timestamp) return true;

    const dx = sprite.x - rayState.axisX.from;
    const dy = sprite.y - rayState.axisY.from;

    const rayDistance =
      (dy - dx * rayState.rayAngle.tan90) / rayState.rayAngle.spriteFact;

    if (rayDistance < 0.2) return true;

    const distance =
      (rayState.mirrorDistance + rayDistance) *
      this.rayCastingState.rayAngle.fixDistance;

    if (this.newDistance < distance) return true;

    const sideDistance =
      (rayState.rayAngle.sin * rayDistance - dy) / rayState.rayAngle.cos;

    if (Math.abs(sideDistance) > sprite.halfWidth) return true;

    //move calculation
    const wRate = sprite.texture.textureData!.width / sprite.width;
    const spriteX = ((sideDistance + sprite.halfWidth) * wRate) << 0;

    sprite.timestamp = this.rayCastingState.rayAngle.timestamp;

    return this.render.handleSprite({
      spriteX,
      distance,
      top: sprite.z + sprite.height,
      bottom: sprite.z,
      textureData: sprite.texture.textureData!,
    });
  }
}

export default RayHandler;
