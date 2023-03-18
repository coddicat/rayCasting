import consts, { mod } from '../consts';
import DynamicAlpha from '../dynamicAlpha';
import Painter from './painter';
import PlayerState from '../player/playerState';
import Ray from '../ray/ray';
import RayCasting from '../ray/rayCasting';
import RayHandler from '../ray/rayHandler';
import { TextureData } from '../texture/textureData';
import { Level, Wall, PixelCounter, SpriteProps, Axis } from '../types';
import { render as refs, rayHandler as rayHandlerRefs } from '../variables';

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

  private drawWall(rayState: Ray): void {
    refs.fact = consts.resolution.width / this.rayHandlerState.newDistance;
    refs.a =
      this.playerState.halfLookVertical + refs.fact * this.playerState.lookZ;
    refs.repeatX = refs.wall!.texture?.repeatX ?? 1;
    refs.startY = refs.wall!.texture?.startY ?? 0;
    refs.startX = refs.wall!.texture?.startX ?? 0;

    refs.s =
      rayState.side === Axis.y
        ? mod(rayState.axisY.cellIndex - refs.startY, refs.repeatX)
        : mod(rayState.axisX.cellIndex - refs.startX, refs.repeatX);

    refs.sideX = (rayState.sideX + refs.s) / refs.repeatX;

    refs.y0 = refs.a - refs.wall!.top * refs.fact;
    refs.y1 = refs.a - refs.wall!.bottom * refs.fact;

    if (refs.wall!.texture?.data) {
      this.painter.drawSpriteLine(
        {
          spriteX: refs.wall!.texture?.data
            ? (refs.sideX * refs.wall!.texture?.data.width) | 0
            : 0,
          repeatedHeight:
            ((refs.wall!.top - refs.wall!.bottom) *
              refs.wall!.texture.data.height) /
            refs.wall!.texture.repeat,
          checkAlpha: false,
          revert: refs.wall!.texture.revert,
        },
        refs.wall!.texture?.data
      );
    } else {
      this.painter.drawLineStatic({
        color: refs.wall!.color,
      });
    }
  }

  private drawSprite(props: SpriteProps, textureData: TextureData): void {
    refs.fact = consts.resolution.width / rayHandlerRefs.distance;
    refs.a =
      this.playerState.halfLookVertical + refs.fact * this.playerState.lookZ;
    refs.y0 = refs.a - props.top * refs.fact;
    refs.y1 = refs.a - props.bottom * refs.fact;

    this.painter.drawSpriteLine(
      {
        spriteX: rayHandlerRefs.spriteX,
        repeatedHeight: textureData.height,
        checkAlpha: true,
      },
      textureData
    );
  }

  public handleLevel(rayState: Ray, level: Level): void {
    this.dynamicAlpha.init(level);
    refs.y0 =
      this.playerState.halfLookVertical +
      this.dynamicAlpha.distanceRate / this.rayHandlerState.newDistance;
    refs.y1 =
      this.playerState.halfLookVertical +
      this.dynamicAlpha.distanceRate / this.rayHandlerState.prevDistance;

    if (level.texture?.data) {
      this.painter.drawSpriteLineDynamic({
        rayState,
        textureData: level.texture?.data,
      });
    } else {
      this.painter.drawLineDynamic({
        color: level.color,
      });
    }
  }

  public handleSprite(props: SpriteProps): void {
    if (rayHandlerRefs.distance <= 0) return;

    refs.light =
      maxFact *
      (consts.lookLength - rayHandlerRefs.distance) *
      this.rayHandlerState.mirrorFact;

    if (refs.light < 1) return;

    this.drawSprite(props, props.textureData);
  }

  public handleWalls(rayState: Ray): void {
    if (!this.rayHandlerState.newItem || this.rayHandlerState.newDistance <= 0)
      return;

    refs.light =
      ((maxLight * (consts.lookLength - this.rayHandlerState.newDistance)) /
        consts.lookLength) *
      this.rayHandlerState.mirrorFact;

    if (refs.light < 1) return;

    for (refs.wall of this.rayHandlerState.newItem.walls) {
      if (refs.wall.render) this.drawWall(rayState);
      if (!this.pixelCounter.empty) return;
    }
  }
}

export default Render;
