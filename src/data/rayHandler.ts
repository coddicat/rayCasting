import consts from './consts';
import { GameMap } from './gameMap';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import Render from './render';
import { SpriteAngle } from './spriteAngle';
import {
  MapItem,
  RayAction,
  Axis,
  SpriteObject,
  SpriteAngleState,
  SpriteData,
  PixelCounter,
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

  private spriteAngle: SpriteAngle;
  private spriteData: SpriteData;
  private spriteState: SpriteAngleState;
  private spriteObject: SpriteObject;

  constructor(
    data: Uint32Array,
    playerState: PlayerState,

    spriteData: SpriteData,
    spriteAngle: SpriteAngle,
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

    this.spriteData = spriteData;
    this.spriteObject = spriteObject;
    this.spriteAngle = spriteAngle;
    this.spriteState = spriteAngle.getState();

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

  public handle(rayState: Ray, last: boolean): RayAction {
    const found = this.gameMap.check({
      bx: rayState.axisX.cellIndex,
      by: rayState.axisY.cellIndex,
    });
    this.newItem = found ? this.gameMap.getItem(found) : null;
    this.newDistance =
      rayState.distance * this.rayCastingState.rayAngle.fixDistance;

    this.handleSprite(
      rayState,
      this.spriteState,
      this.spriteObject,
      this.newDistance
    );

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

  private getSpriteDistance(dx: number, dy: number, a: number): number {
    const tan = Math.tan(a + consts.rad * 90);
    return (dy - dx * tan) / (Math.sin(a) - Math.cos(a) * tan);
  }

  private getSpriteSideDistance(
    dx: number,
    rayDistance: number,
    a: number
  ): number {
    const res =
      (dx - Math.cos(a) * rayDistance) / Math.cos(a + consts.rad * 90);
    return ((res * 1000) << 0) / 1000;
  }

  private handleSprite(
    rayState: Ray,
    spriteState: SpriteAngleState,
    sprite: SpriteObject,
    newDistance: number
  ): void {
    const dx = sprite.x - rayState.axisX.from;
    const dy = sprite.y - rayState.axisY.from;
    const a = rayState.rayAngle.angle;
    const rayDistance = this.getSpriteDistance(dx, dy, a);
    if (rayDistance < 0.5) {
      return;
    }

    const sideDistance = this.getSpriteSideDistance(
      dx,
      rayDistance,
      rayState.rayAngle.angle
    );

    const distance =
      (rayState.mirrorDistance + rayDistance) *
      this.rayCastingState.rayAngle.fixDistance;

    const half = sprite.width / 2;
    if (
      distance > spriteState.lastDistance &&
      distance > 0 &&
      newDistance >= distance &&
      sideDistance <= half &&
      sideDistance >= -half
    ) {
      const wRate = this.spriteData.width / sprite.width;
      const spriteX = ((sideDistance + half) * wRate) << 0;

      const _params = {
        spriteX,
        displayX: this.rayCastingState.displayX,
        distance: distance,
        mirrorFact: this.mirrorFact,
        color: 0x0000ff,
        top: sprite.z + sprite.height,
        bottom: sprite.z,
      };

      this.emptyPixels =
        this.emptyPixels &&
        this.render.handleSprite(
          this.data,
          rayState,
          _params,
          this.playerState,
          this.pixelsCounter,
          this.spriteData
        );

      spriteState.lastDistance = distance;
    }
  }
}

export default RayHandler;
