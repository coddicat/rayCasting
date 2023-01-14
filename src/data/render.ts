import consts from "./consts";
import Painter from "./painter";
import { PlayerState } from "./playerState";
import { Level, MapItem, SpriteData, Wall } from "./types";

const maxLight = 255;
const halfHeight = consts.lookHeight / 2;

class Render {
  private static drawWall(
    data: Uint32Array,
    params: { displayX: number; distance: number },
    light: number,
    wall: Wall,
    playerState: PlayerState,
    pixelCounter: { count: number }
  ): void {
    const fact = consts.lookWidth / params.distance;
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
    };

    Painter.drawLineStatic(data, _params, pixelCounter);
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
    const fact = consts.lookWidth / params.distance;
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
    },
    level: Level,
    playerState: PlayerState,
    pixelCounter: { count: number }
  ): void {
    const d =
      consts.lookWidth *
      (playerState.z + playerState.lookHeight - level.bottom);

    const _params = {
      y0: halfHeight + playerState.lookVertical + d / params.distance,
      y1: halfHeight + playerState.lookVertical + d / params.distance1,
      shift: playerState.lookVertical,
      x: params.displayX,
      color: level.color,
    };

    Painter.InitDynamicAlpha(playerState, level, params);
    Painter.drawLineDynamic(data, _params, pixelCounter);
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
      ((maxLight * (consts.deep - params.distance)) / consts.deep) *
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

    return pixelCounter.count < consts.lookHeight;
  }

  public static handleWalls(
    data: Uint32Array,
    item: MapItem | null,
    params: { displayX: number; distance: number; mirrorFact: number },
    playerState: PlayerState,
    pixelCounter: { count: number }
  ): boolean {
    if (!item || params.distance <= 0) return true;
    const light =
      ((maxLight * (consts.deep - params.distance)) / consts.deep) *
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
          pixelCounter
        );
      }
      if (pixelCounter.count >= consts.lookHeight) return false;
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
    },
    playerState: PlayerState,
    pixelCounter: { count: number }
  ): boolean {
    if (!item || params.distance1 < 0.5) return true;
    // const light =  maxLight * (consts.deep - params.distance1) / consts.deep * params.mirrorFact;
    // if (light < 1) return true;

    let i = 0;
    while (i < item.levels.length) {
      this.drawLevel(data, params, item.levels[i], playerState, pixelCounter);
      if (pixelCounter.count >= consts.lookHeight) return false;
      i++;
    }

    return true;
  }
}

export default Render;
