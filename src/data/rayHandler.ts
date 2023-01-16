import consts from "./consts";
import map from "./map";
import { PlayerState } from "./playerState";
import Render from "./render";
import {
  MapItem,
  RayAction,
  Sprite,
  SpriteAngleState,
  SpriteData,
} from "./types";
class RayHandler {
  private item: MapItem | null;
  private distance: number;
  private mirrorFact: number;
  private emptyPixels: boolean;
  private pixelsCounter: { count: number };
  private data: Uint32Array;
  private playerState: PlayerState;
  private params: { fixDistance: number; displayX: number };
  private spriteData: SpriteData;
  private wallSpriteData: SpriteData;

  constructor(
    data: Uint32Array,
    playerState: PlayerState,
    params: { fixDistance: number; displayX: number },
    spriteData: SpriteData,
    wallSpriteData: SpriteData,
  ) {
    this.data = data;

    this.item = null;
    this.distance = 0.2;
    this.mirrorFact = 1;
    this.emptyPixels = true;
    this.pixelsCounter = { count: 0 };
    this.params = params;
    this.playerState = playerState;
    this.spriteData = spriteData;
    this.wallSpriteData = wallSpriteData;
  }

  public reset(): void {
    this.item = null;
    this.distance = 0.2;
    this.mirrorFact = 1;
    this.emptyPixels = true;
    this.pixelsCounter = {
      count: 0,
    };
  }

  public handle(
    params: { bx: number; by: number; distance: number, sideX: number },
    spriteState: SpriteAngleState,
    sprite: Sprite
  ): RayAction {
    const found = map.check(params);
    const newItem = found ? map.getItem(found) : null;
    const newDistance = params.distance * this.params.fixDistance;

    this.handleSprite(spriteState, sprite, newDistance);

    if (newItem !== this.item) {
      const _params = {
        displayX: this.params.displayX,
        distance: newDistance,
        distance1: this.distance,
        mirrorFact: this.mirrorFact,
        sideX: params.sideX
      };

      this.emptyPixels =
        this.emptyPixels &&
        Render.handleLevels(
          this.data,
          this.item,
          _params,
          this.playerState,
          this.pixelsCounter
        );

      this.emptyPixels =
        this.emptyPixels &&
        Render.handleWalls(
          this.data,
          newItem,
          _params,
          this.playerState,
          this.pixelsCounter,
          this.wallSpriteData
        );

      this.item = newItem;
      this.distance = newDistance < 0.2 ? 0.2 : newDistance;
    }

    if (newItem && newItem.mirror) {
      this.mirrorFact *= 0.75;
      return RayAction.mirror;
    }

    return !this.emptyPixels || (newItem && newItem.stopRay)
      ? RayAction.stop
      : RayAction.continue;
  }

  private handleSprite(
    spriteState: SpriteAngleState,
    sprite: Sprite,
    newDistance: number
  ): void {
    if (
      !spriteState.status &&
      spriteState.distance > 1 &&
      newDistance >= spriteState.distance &&
      this.params.displayX >= spriteState.x0 &&
      this.params.displayX <= spriteState.x1
    ) {
      const wRate =
        this.spriteData.width / (spriteState.x1 - spriteState.x0 + 1);
      const _params = {
        spriteX: (this.params.displayX - spriteState.x0) * wRate << 0,
        displayX: this.params.displayX,
        distance: spriteState.distance,
        mirrorFact: this.mirrorFact,
        color: 0x0000ff,
        top: sprite.z + sprite.height,
        bottom: sprite.z,
      };

      this.emptyPixels =
        this.emptyPixels &&
        Render.handleSprite(
          this.data,
          _params,
          this.playerState,
          this.pixelsCounter,
          this.spriteData
        );

      spriteState.status = true;
    }
  }

  public complete(spriteState: SpriteAngleState, sprite: Sprite): void {
    if (!this.emptyPixels) return;

    this.handleSprite(spriteState, sprite, consts.deep);

    Render.handleLevels(
      this.data,
      this.item,
      {
        displayX: this.params.displayX,
        distance: this.distance,
        distance1: consts.deep,
        mirrorFact: this.mirrorFact,
      },
      this.playerState,
      this.pixelsCounter
    );
  }
}

export default RayHandler;
