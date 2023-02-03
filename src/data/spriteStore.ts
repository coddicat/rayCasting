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
    [TextureType.Banan],
    1
  );
}
const rad45 = Math.PI / 4;
const rad90 = Math.PI / 2;

const sprites = [
  new SpriteObject(
    {
      x: 50.5,
      y: 43.5,
      z: 0.3,
    },
    {
      height: 1.8,
      width: 1.34,
    },
    [TextureType.DukeFront, TextureType.DukeBack, TextureType.DukeSide],
    1,
    -rad90,
    true
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
  public tick(timestamp: number): void {
    this.spriteObjects
      .filter((x) => x.rotate)
      .forEach((x) => x.tick(timestamp));
  }
  public async init(): Promise<void> {
    this.spriteObjects = [this.playerState, ...sprites];

    this.spriteObjects.forEach((sprite) => {
      sprite.textures.forEach((texture) => {
        const textureData = textureStore.getTextureData(texture.type);
        if (textureData) {
          sprite.setTextureData(texture.type, textureData);
          texture.repeatedHeight = texture.textureData!.height * texture.repeat;
        }
      });
    });
  }

  public spriteObjects!: SpriteObject[];
}
