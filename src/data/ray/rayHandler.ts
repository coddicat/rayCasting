import { angle, norm } from '../exts';
import { GameMap } from '../gameMap/gameMap';
import PlayerState from '../player/playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import Render from '../render/render';
import SpriteObject from '../sprite/spriteObject';
import { MapItem, RayAction, SpriteAngleState, PixelCounter } from '../types';
import { rayHandler as refs } from '../variables';

export interface CellHandler {
  handle(rayState: Ray, last: boolean): RayAction;
}

const rad45 = Math.PI / 4;
const rad180 = Math.PI;
const rad360 = Math.PI * 2;

class RayHandler implements CellHandler {
  public prevItem: MapItem | null;
  public newItem: MapItem | null;
  public prevDistance: number;
  public newDistance: number;
  public mirrorFact: number;
  public gameMap: GameMap;

  private pixelsCounter: PixelCounter;
  private playerState: PlayerState;
  private rayCastingState: RayCasting;
  private render: Render;

  private spriteObjects: SpriteObject[];
  private spriteState: SpriteAngleState;

  constructor(
    playerState: PlayerState,

    spriteObjects: SpriteObject[],
    rayCastingState: RayCasting,
    gameMap: GameMap
  ) {
    this.rayCastingState = rayCastingState;
    this.prevItem = null;
    this.newItem = null;
    this.prevDistance = 0.2;
    this.newDistance = 0.2;
    this.mirrorFact = 1;
    this.pixelsCounter = new PixelCounter();
    this.playerState = playerState;
    this.gameMap = gameMap;

    this.spriteObjects = spriteObjects;
    this.spriteState = {
      lastDistance: 0.6,
    };

    this.render = new Render(
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
    this.pixelsCounter.reset();
    this.spriteState.lastDistance = 0.6;
  }

  public handle(ray: Ray, last: boolean): RayAction {
    this.newItem = this.gameMap.check(ray.cellPosition);
    this.newDistance = ray.distance * this.rayCastingState.rayAngle.fixDistance;

    if (this.newItem !== this.prevItem || last) {
      this.handleLevels(ray);
      if (!this.pixelsCounter.empty) return RayAction.stop;
      this.render.handleWalls(ray);

      this.prevItem = this.newItem;
      this.prevDistance = this.newDistance < 0.2 ? 0.2 : this.newDistance;
    }

    if (this.newItem && this.newItem.mirror) {
      this.mirrorFact *= 0.75;
      return RayAction.mirror;
    }

    return !this.pixelsCounter.empty || (this.newItem && this.newItem.stopRay)
      ? RayAction.stop
      : RayAction.continue;
  }

  private refs = {
    playerStateTimestamp: null as null | number,
    aboveObjects: [] as SpriteObject[],
    belowObjects: [] as SpriteObject[],
  };

  private handleLevels(ray: Ray): void {
    if (!this.prevItem || this.prevDistance < 0.2) return;

    if (this.refs.playerStateTimestamp !== this.playerState.timestamp) {
      this.refs.aboveObjects = this.spriteObjects.filter(
        (o) => o.position.z > this.playerState.lookZ
      );
      this.refs.belowObjects = this.spriteObjects.filter(
        (o) => o.position.z <= this.playerState.lookZ
      );
      this.refs.playerStateTimestamp = this.playerState.timestamp;
    }

    if (this.prevItem.playerStateTimestamp !== this.playerState.timestamp) {
      this.prevItem.aboveLevels = this.prevItem.levels.filter(
        (x) => x.bottom > this.playerState.lookZ
      );
      this.prevItem.belowLevels = this.prevItem.levels
        .filter((x) => x.bottom < this.playerState.lookZ)
        .reverse();
      this.prevItem.playerStateTimestamp = this.playerState.timestamp;
    }

    for (const level of this.prevItem.belowLevels!) {
      for (const obj of this.refs.belowObjects) {
        if (obj.position.z < level.bottom) continue;
        this.handleSprite(ray, obj);
        if (!this.pixelsCounter.empty) return;
      }

      this.render.handleLevel(ray, level);
      if (!this.pixelsCounter.empty) return;
    }

    for (const level of this.prevItem.aboveLevels!) {
      this.render.handleLevel(ray, level);
      if (!this.pixelsCounter.empty) return;

      for (const obj of this.refs.aboveObjects) {
        if (obj.position.z > level.bottom) continue;
        this.handleSprite(ray, obj);
        if (!this.pixelsCounter.empty) return;
      }
    }

    for (const obj of this.spriteObjects) {
      this.handleSprite(ray, obj);
      if (!this.pixelsCounter.empty) return;
    }
  }

  private handleSprite(ray: Ray, sprite: SpriteObject): void {
    if (sprite.timestamp === ray.rayAngle.timestamp) return;

    refs.dx = sprite.position.x - ray.fromPosition.x;
    refs.dy = sprite.position.y - ray.fromPosition.y;

    refs.rayDistance =
      (refs.dy - refs.dx * ray.rayAngle.tan90) / ray.rayAngle.spriteFact;

    if (refs.rayDistance < 0.2) return;

    refs.distance =
      (ray.mirrorDistance + refs.rayDistance) *
      this.rayCastingState.rayAngle.fixDistance;

    if (this.newDistance < refs.distance) return;

    refs.sideDistance =
      (ray.rayAngle.sin * refs.rayDistance - refs.dy) / ray.rayAngle.cos;

    let texture;
    let side = 1;
    if (sprite.textures.length > 2 && sprite !== this.playerState) {
      const a0 = angle(
        sprite.position,
        //todo should be due to user coordinates but with mirror fact
        ray.fromPosition
      );
      const a = norm(a0 + norm(sprite.position.angle));

      if (a < rad45 || a > rad360 - rad45) {
        texture = sprite.textures[1];
      } else if (a < rad180 + rad45 && a > rad180 - rad45) {
        texture = sprite.textures[0];
      } else {
        texture = sprite.textures[2];
        side = a < rad180 ? 1 : -1;
      }
    } else {
      texture = sprite.textures[0];
    }
    if (Math.abs(refs.sideDistance) > sprite.halfWidth) return;

    refs.spriteX =
      ((side * refs.sideDistance + sprite.halfWidth) * sprite.wRate) | 0;

    sprite.timestamp = this.rayCastingState.rayAngle.timestamp;

    this.render.handleSprite({
      top: sprite.top,
      bottom: sprite.position.z,
      textureData: texture.data!,
    });
  }
}

export default RayHandler;
