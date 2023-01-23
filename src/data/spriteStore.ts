import { PlayerState } from './playerState';
import textureStore, { TextureType } from './textureStore';
import { SpriteObject } from './types';

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
    TextureType.DukeFront
  ),
  new SpriteObject(
    {
      x: 39,
      y: 3.5,
      z: 2.1,
    },
    {
      height: 1,
      width: 1,
    },
    TextureType.Banan
  ),
];

export default class SpriteStore {
  private playerState: PlayerState;
  constructor(playerState: PlayerState) {
    this.playerState = playerState;
  }
  public async init(): Promise<void> {
    this.spriteObjects = [this.playerState, ...sprites];

    this.spriteObjects.forEach((sprite) => {
      sprite.texture.textureData = textureStore.getTextureData(
        sprite.texture.type
      );
    });
  }

  public spriteObjects!: SpriteObject[];
}
