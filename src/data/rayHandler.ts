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

    let i = 0;
    while (i < this.spriteObjects.length) {
      this.handleSprite(rayState, this.spriteState, this.spriteObjects[i]);
      i++;
    }

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
    if (rayState.axisX.cellIndex < sprite.x - sprite.width / 2 - 1.6) return;
    if (rayState.axisX.cellIndex > sprite.x + sprite.width / 2 + 1.6) return;
    if (rayState.axisY.cellIndex < sprite.y - sprite.width / 2 - 1.6) return;
    if (rayState.axisY.cellIndex > sprite.y + sprite.width / 2 + 1.6) return;

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

    //const d2 = dx ** 2 + dy ** 2;
    // const sideDistance = Math.sqrt(d2 - rayDistance ** 2);
    //if (Math.sqrt(d2 - rayDistance ** 2) < 0.01) {
    //  sideDistance = 0;
    //} else {

    const sideDistance =
      (rayState.rayAngle.sin * rayDistance - dy) / rayState.rayAngle.cos;

    const half = sprite.width / 2;
    if (sideDistance > half || sideDistance < -half) return;

    const wRate = sprite.texture.textureData!.width / sprite.width;
    const spriteX = ((sideDistance + half) * wRate) << 0;

    const props: SpriteProps = {
      spriteX,
      distance,
      top: sprite.z + sprite.height,
      bottom: sprite.z,
    };

    this.emptyPixels =
      this.emptyPixels &&
      this.render.handleSprite(props, sprite.texture.textureData!);

    //spriteState.lastDistance = distance;
  }
}

export default RayHandler;
