import consts from "./consts";
import Painter from "./painter";
import { PlayerState } from "./playerState";
import { Level, MapItem, Axis, SpriteData, Wall, RayCastingState } from "./types";

const maxLight = 255;
const halfHeight = consts.resolution.height / 2;

class Render {
  private static drawWall(
    data: Uint32Array,
    params: { displayX: number; distance: number, sideX: number },
    light: number,
    wall: Wall,
    playerState: PlayerState,
    pixelCounter: { count: number },
    spriteData: SpriteData
  ): void {
    const fact = consts.resolution.width / params.distance;
    const a =
      halfHeight +
      playerState.lookVertical +
      fact * (playerState.z + playerState.lookHeight);

    const _params = {
      y0: a - wall.top * fact,
      y1: a - wall.bottom * fact,
      x: params.displayX,
      color: wall.color,
      alpha: light,
      spriteX: params.sideX * spriteData.width << 0,
      scale: wall.top - wall.bottom,
      checkAlpha: false,
    };

    Painter.drawLineStatic(data, _params, pixelCounter);
    //Painter.drawSpriteLine(data, _params, pixelCounter, spriteData);
  }

  private static drawSprite(
    data: Uint32Array,
    params: { displayX: number; spriteX: number; distance: number },
    light: number,
    wall: Wall,
    playerState: PlayerState,
    pixelCounter: { count: number },
    spriteData: SpriteData
  ): void {
    const fact = consts.resolution.width / params.distance;
    const a =
      halfHeight +
      playerState.lookVertical +
      fact * (playerState.z + playerState.lookHeight);

    const _params = {
      y0: a - wall.top * fact,
      y1: a - wall.bottom * fact,
      x: params.displayX,
      spriteX: params.spriteX,
      color: wall.color,
      alpha: light,
      scale: 1,
      checkAlpha: true
    };

    Painter.drawSpriteLine(data, _params, pixelCounter, spriteData);
  }

  private static drawLevel(
    data: Uint32Array,
    params: {
      displayX: number;
      distance: number;
      distance1: number;
      mirrorFact: number;
      sideX: number;
      side: number;
      angle: number;
      fixDistance: number
    },
    level: Level,
    playerState: PlayerState,
    pixelCounter: { count: number },
    spriteData: SpriteData,
    rayCastingState: RayCastingState
  ): void {
    const d =
      consts.resolution.width *
      (playerState.z + playerState.lookHeight - level.bottom);

    const _params = {
      y0: halfHeight + playerState.lookVertical + d / params.distance,
      y1: halfHeight + playerState.lookVertical + d / params.distance1,
      shift: playerState.lookVertical,
      x: params.displayX,
      color: level.color,
      angle: params.angle,
      distance: params.distance1,
      sideX: params.sideX,
      side: params.side,
      fixDistance: params.fixDistance
    };

    Painter.InitDynamicAlpha(playerState, level, params);
    Painter.drawLineDynamic(data, _params, pixelCounter);
    //Painter.drawSpriteLineDynamic(data, _params, pixelCounter, spriteData, rayCastingState);
  }

  public static handleSprite(
    data: Uint32Array,
    params: {
      displayX: number;
      spriteX: number;
      distance: number;
      mirrorFact: number;
      color: number;
      top: number;
      bottom: number;
    },
    playerState: PlayerState,
    pixelCounter: { count: number },
    spriteData: SpriteData
  ): boolean {
    if (params.distance <= 0) return true;
    const light =
      ((maxLight * (consts.lookLength - params.distance)) / consts.lookLength) *
      params.mirrorFact;
    if (light < 1) return true;

    this.drawSprite(
      data,
      params,
      light,
      {
        color: params.color,
        top: params.top,
        bottom: params.bottom,
        render: true,
      },
      playerState,
      pixelCounter,
      spriteData
    );

    return pixelCounter.count < consts.resolution.height;
  }

  public static handleWalls(
    data: Uint32Array,
    item: MapItem | null,
    params: { displayX: number; distance: number; mirrorFact: number, sideX: number },
    playerState: PlayerState,
    pixelCounter: { count: number },
    wallSpriteData: SpriteData,
  ): boolean {
    if (!item || params.distance <= 0) return true;
    const light =
      ((maxLight * (consts.lookLength - params.distance)) / consts.lookLength) *
      params.mirrorFact;
    if (light < 1) return true;

    let i = 0;
    while (i < item.walls.length) {
      const wall = item.walls[i];
      if (wall.render) {
        this.drawWall(
          data,
          params,
          light,
          item.walls[i],
          playerState,
          pixelCounter,
          wallSpriteData
        );
      }
      if (pixelCounter.count >= consts.resolution.height) return false;
      i++;
    }

    return true;
  }

  public static handleLevels(
    data: Uint32Array,
    item: MapItem | null,
    params: {
      displayX: number;
      distance: number;
      distance1: number;
      mirrorFact: number;
      sideX: number;
      side: Axis;
      angle: number;
      fixDistance: number
    },
    playerState: PlayerState,
    pixelCounter: { count: number },
    levelSpriteData: SpriteData,
    rayCastingState: RayCastingState
  ): boolean {
    if (!item || params.distance1 < 0.2) return true;

    const h = playerState.z + playerState.lookHeight;
    const topLevels = item.levels.filter(x => x.bottom > h);
    const bottomLevels = item.levels.filter(x => x.bottom < h);

    let i = 0;
    while (i < bottomLevels.length) {
      this.drawLevel(data, params, bottomLevels[i], playerState, pixelCounter, levelSpriteData, rayCastingState);
      if (pixelCounter.count >= consts.resolution.height) return false;
      i++;
    }

    i = topLevels.length - 1;
    while (i >= 0) {
      this.drawLevel(data, params, topLevels[i], playerState, pixelCounter, levelSpriteData, rayCastingState);
      if (pixelCounter.count >= consts.resolution.height) return false;
      i--;
    }

    return true;
  }
}

export default Render;
