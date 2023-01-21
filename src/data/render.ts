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
const maxFact = maxLight / consts.lookLength;

class Render {
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
    this.rayCastingState = rayCastingState;
    this.rayHandlerState = rayHandlerState;
    this.playerState = playerState;
    this.pixelCounter = pixelCounter;
    this.dynamicAlpha = new DynamicAlpha(playerState, rayHandlerState);
    this.painter = new Painter(
      pixelCounter,
      this.dynamicAlpha,
      data,
      rayCastingState
    );
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
        light,
        spriteX: wall.texture?.spriteData
          ? (rayState.sideX * wall.texture?.spriteData.width) << 0
          : 0,
        scale: wall.top - wall.bottom,
        checkAlpha: false,
      };
      this.painter.drawSpriteLine(props, wall.texture?.spriteData);
    } else {
      const props: StaticLineProps = {
        y0: a - wall.top * fact,
        y1: a - wall.bottom * fact,
        color: wall.color,
        light,
      };
      this.painter.drawLineStatic(props);
    }
  }

  private drawSprite(
    params: { spriteX: number; distance: number },
    light: number,
    spriteProps: SpriteProps,
    spriteData: SpriteData
  ): void {
    const fact = consts.resolution.width / params.distance;
    const a =
      halfHeight +
      this.playerState.lookVertical +
      fact * (this.playerState.z + this.playerState.lookHeight);

    const _params = {
      y0: a - spriteProps.top * fact,
      y1: a - spriteProps.bottom * fact,
      x: this.rayCastingState.displayX,
      spriteX: params.spriteX,
      light,
      scale: spriteProps.texture!.scale,
      checkAlpha: true,
    };

    this.painter.drawSpriteLine(_params, spriteData);
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
        scale: level.texture?.scale,
      };

      this.painter.drawSpriteLineDynamic(
        props,
        rayState,
        level.texture?.spriteData
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
        color: level.color,
      };

      this.painter.drawLineDynamic(props);
    }
  }

  public handleSprite(
    params: {
      spriteX: number;
      distance: number;
      top: number;
      bottom: number;
    },
    spriteData: SpriteData
  ): boolean {
    if (params.distance <= 0) return true;
    const light =
      maxFact *
      (consts.lookLength - params.distance) *
      this.rayHandlerState.mirrorFact;
    if (light < 1) return true;

    this.drawSprite(
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
      spriteData
    );

    return this.pixelCounter.count < consts.resolution.height;
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

    //move h to playerState
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
