import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import Painter from './painter';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import RayHandler from './rayHandler';
import {
  Level,
  SpriteData,
  Wall,
  PixelCounter,
  StaticLineProps,
  SpriteLineProps,
  DynamicLineProps,
  DynamicSpriteLineProps,
  SpriteProps,
} from './types';

const maxLight = 255;
const halfHeight = consts.resolution.height / 2;

class Render {
  private data: Uint32Array;
  private rayCastingState: RayCasting;
  private rayHandlerState: RayHandler;
  private playerState: PlayerState;
  private pixelCounter: PixelCounter;
  private painter: Painter;
  private dynamicAlpha: DynamicAlpha;

  constructor(
    data: Uint32Array,
    rayCastingState: RayCasting,
    rayHandlerState: RayHandler,
    playerState: PlayerState,
    pixelCounter: PixelCounter
  ) {
    this.data = data;
    this.rayCastingState = rayCastingState;
    this.rayHandlerState = rayHandlerState;
    this.playerState = playerState;
    this.pixelCounter = pixelCounter;
    this.dynamicAlpha = new DynamicAlpha(playerState, rayHandlerState);
    this.painter = new Painter(pixelCounter, this.dynamicAlpha);
  }

  private drawWall(rayState: Ray, light: number, wall: Wall): void {
    const fact = consts.resolution.width / this.rayHandlerState.newDistance;
    const a =
      halfHeight +
      this.playerState.lookVertical +
      fact * (this.playerState.z + this.playerState.lookHeight);

    if (wall.texture?.spriteData) {
      const props: SpriteLineProps = {
        y0: a - wall.top * fact,
        y1: a - wall.bottom * fact,
        x: this.rayCastingState.displayX,
        light,
        spriteX: wall.texture?.spriteData
          ? (rayState.sideX * wall.texture?.spriteData.width) << 0
          : 0,
        scale: wall.top - wall.bottom,
        checkAlpha: false,
      };
      this.painter.drawSpriteLine(
        this.data,
        props,
        this.pixelCounter,
        wall.texture?.spriteData
      );
    } else {
      const props: StaticLineProps = {
        y0: a - wall.top * fact,
        y1: a - wall.bottom * fact,
        x: this.rayCastingState.displayX,
        color: wall.color,
        light,
      };
      this.painter.drawLineStatic(this.data, props);
    }
  }

  private drawSprite(
    data: Uint32Array,
    params: { spriteX: number; distance: number },
    light: number,
    spriteProps: SpriteProps,
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
      y0: a - spriteProps.top * fact,
      y1: a - spriteProps.bottom * fact,
      x: this.rayCastingState.displayX,
      spriteX: params.spriteX,
      light,
      scale: spriteProps.texture!.scale,
      checkAlpha: true,
    };

    this.painter.drawSpriteLine(data, _params, pixelCounter, spriteData);
  }

  private drawLevel(rayState: Ray, level: Level): void {
    const d =
      consts.resolution.width *
      (this.playerState.z + this.playerState.lookHeight - level.bottom);

    this.dynamicAlpha.init(level);

    if (level.texture?.spriteData) {
      const props: DynamicSpriteLineProps = {
        y0:
          halfHeight +
          this.playerState.lookVertical +
          d / this.rayHandlerState.newDistance,
        y1:
          halfHeight +
          this.playerState.lookVertical +
          d / this.rayHandlerState.prevDistance,
        yShift: this.playerState.lookVertical,
        x: this.rayCastingState.displayX,
        distance: this.rayHandlerState.prevDistance,
        sideX: rayState.sideX,
        side: rayState.side,
        scale: level.texture?.scale,
      };

      this.painter.drawSpriteLineDynamic(
        this.data,
        props,
        this.pixelCounter,
        level.texture?.spriteData,
        this.rayCastingState
      );
    } else {
      const props: DynamicLineProps = {
        y0:
          halfHeight +
          this.playerState.lookVertical +
          d / this.rayHandlerState.newDistance,
        y1:
          halfHeight +
          this.playerState.lookVertical +
          d / this.rayHandlerState.prevDistance,
        x: this.rayCastingState.displayX,
        color: level.color,
        yShift: this.playerState.lookVertical,
      };

      this.painter.drawLineDynamic(this.data, props, this.pixelCounter);
    }
  }

  public handleSprite(
    data: Uint32Array,
    params: {
      spriteX: number;
      distance: number;
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
      this.rayHandlerState.mirrorFact;
    if (light < 1) return true;

    this.drawSprite(
      data,
      params,
      light,
      {
        top: params.top,
        bottom: params.bottom,
        texture: {
          scale: 1,
          getUrl: () => '',
          spriteData,
        },
      },
      playerState,
      pixelCounter,
      spriteData
    );

    return pixelCounter.count < consts.resolution.height;
  }

  public handleWalls(rayState: Ray): boolean {
    if (!this.rayHandlerState.newItem || this.rayHandlerState.newDistance <= 0)
      return true;
    const light =
      ((maxLight * (consts.lookLength - this.rayHandlerState.newDistance)) /
        consts.lookLength) *
      this.rayHandlerState.mirrorFact;
    if (light < 1) return true;

    let i = 0;
    while (i < this.rayHandlerState.newItem.walls.length) {
      const wall = this.rayHandlerState.newItem.walls[i];
      if (wall.render) {
        this.drawWall(rayState, light, this.rayHandlerState.newItem.walls[i]);
      }
      if (this.pixelCounter.count >= consts.resolution.height) return false;
      i++;
    }

    return true;
  }

  public handleLevels(rayState: Ray): boolean {
    if (
      !this.rayHandlerState.prevItem ||
      this.rayHandlerState.prevDistance < 0.2
    )
      return true;

    const h = this.playerState.z + this.playerState.lookHeight;
    const topLevels = this.rayHandlerState.prevItem.levels.filter(
      (x) => x.bottom > h
    );
    const bottomLevels = this.rayHandlerState.prevItem.levels.filter(
      (x) => x.bottom < h
    );

    let i = 0;
    while (i < bottomLevels.length) {
      this.drawLevel(rayState, bottomLevels[i]);
      if (this.pixelCounter.count >= consts.resolution.height) return false;
      i++;
    }

    i = topLevels.length - 1;
    while (i >= 0) {
      this.drawLevel(rayState, topLevels[i]);
      if (this.pixelCounter.count >= consts.resolution.height) return false;
      i--;
    }

    return true;
  }
}

export default Render;
