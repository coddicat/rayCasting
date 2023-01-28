import { PlayerState } from './playerState';
import textureStore, { TextureType } from './textureStore';
import { SpriteObject } from './types';

function getBanan(x: number, y: number, z: number): SpriteObject {
  return new SpriteObject(
    {
      x,
      y,
      z,
    },
    {
      height: 0.5,
      width: 0.5,
    },
    TextureType.Banan,
    1
  );
}

const sprites = [
  new SpriteObject(
    {
      x: 50.5,
      y: 43.5,
      z: 0.3,
    },
    {
      height: 1.8,
      width: 1,
    },
    TextureType.DukeFront,
    1
  ),
  getBanan(39, 3.5, 3.1),
  getBanan(28.5, 1.5, 0.6),
  getBanan(28.5, 1.5, 1.2),
  getBanan(28.5, 1.5, 1.8),
  getBanan(28.5, 1.5, 2.4),
];

export default class SpriteStore {
  private playerState: PlayerState;
  constructor(playerState: PlayerState) {
    this.playerState = playerState;
  }
  public async init(): Promise<void> {
    this.spriteObjects = [this.playerState, ...sprites];

    this.spriteObjects.forEach((sprite) => {
      const textureData = textureStore.getTextureData(sprite.texture.type);
      if (textureData) {
        sprite.setTextureData(textureData);
        sprite.texture.repeatedHeight =
          sprite.texture.textureData!.height * sprite.texture.repeat;
      }
    });
  }

  public spriteObjects!: SpriteObject[];
}
