import consts from './consts';
import DynamicAlpha from './dynamicAlpha';
import Painter from './painter';
import { PlayerState } from './playerState';
import Ray from './ray';
import RayCasting from './rayCasting';
import RayHandler from './rayHandler';
import {
  Level,
  TextureData,
  Wall,
  PixelCounter,
  StaticLineProps,
  SpriteLineProps,
  SpriteProps,
} from './types';

const maxLight = 255;
const maxFact = maxLight / consts.lookLength;

class Render {
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

    const a = this.playerState.halfLookVertical + fact * this.playerState.lookZ;

    if (wall.texture?.textureData) {
      const props: SpriteLineProps = {
        y0: a - wall.top * fact,
        y1: a - wall.bottom * fact,
        light,
        spriteX: wall.texture?.textureData
          ? (rayState.sideX * wall.texture?.textureData.width) | 0
          : 0,
        //move to wall
        repeat: wall.top - wall.bottom,
        checkAlpha: false,
      };
      this.painter.drawSpriteLine(props, wall.texture?.textureData);
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
    props: SpriteProps,
    light: number,
    textureData: TextureData
  ): void {
    const fact = consts.resolution.width / props.distance;
    const a = this.playerState.halfLookVertical + fact * this.playerState.lookZ;

    const lineProps: SpriteLineProps = {
      y0: a - props.top * fact,
      y1: a - props.bottom * fact,
      spriteX: props.spriteX,
      light,
      repeat: 1,
      checkAlpha: true,
    };

    this.painter.drawSpriteLine(lineProps, textureData);
  }

  private drawLevel(rayState: Ray, level: Level): void {
    this.dynamicAlpha.init(level);

    if (level.texture?.textureData) {
      this.painter.drawSpriteLineDynamic({
        y0:
          this.playerState.halfLookVertical +
          this.dynamicAlpha.distanceRate / this.rayHandlerState.newDistance,
        y1:
          this.playerState.halfLookVertical +
          this.dynamicAlpha.distanceRate / this.rayHandlerState.prevDistance,
        rayState,
        textureData: level.texture?.textureData,
      });
    } else {
      this.painter.drawLineDynamic({
        y0:
          this.playerState.halfLookVertical +
          this.dynamicAlpha.distanceRate / this.rayHandlerState.newDistance,
        y1:
          this.playerState.halfLookVertical +
          this.dynamicAlpha.distanceRate / this.rayHandlerState.prevDistance,
        color: level.color,
      });
    }
  }

  public handleSprite(props: SpriteProps): boolean {
    if (props.distance <= 0) return true;
    const light =
      maxFact *
      (consts.lookLength - props.distance) *
      this.rayHandlerState.mirrorFact;
    if (light < 1) return true;

    this.drawSprite(props, light, props.textureData);

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

    for (const wall of this.rayHandlerState.newItem.walls) {
      if (wall.render) this.drawWall(rayState, light, wall);
      if (this.pixelCounter.count >= consts.resolution.height) return false;
    }

    return this.pixelCounter.count < consts.resolution.height;
  }

  public handleLevels(rayState: Ray): boolean {
    if (
      !this.rayHandlerState.prevItem ||
      this.rayHandlerState.prevDistance < 0.2
    )
      return true;

    //calculate once per this.playerState.lookZ changed
    const topLevels = this.rayHandlerState.prevItem.levels.filter(
      (x) => x.bottom > this.playerState.lookZ
    );
    const bottomLevels = this.rayHandlerState.prevItem.levels.filter(
      (x) => x.bottom < this.playerState.lookZ
    );

    //store reversed version in levels
    let i = bottomLevels.length - 1;
    while (i >= 0) {
      this.drawLevel(rayState, bottomLevels[i]);
      if (this.pixelCounter.count >= consts.resolution.height) return false;
      i--;
    }

    for (const level of topLevels) {
      this.drawLevel(rayState, level);
      if (this.pixelCounter.count >= consts.resolution.height) return false;
    }

    return this.pixelCounter.count < consts.resolution.height;
  }
}

export default Render;
