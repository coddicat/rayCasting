import { TextureData } from './types';

export enum TextureType {
  FloorNumber,
  WallBriks,
  DukeFront,
  DukeBack,
  DukeSide,
  Banan,
  WallWood,
  Parquet,
  Ground,
  Door,
}

const textureFiles = new Map<TextureType, string>([
  [TextureType.DukeFront, require('../assets/duke_front.png')],
  [TextureType.DukeBack, require('../assets/duke_back.png')],
  [TextureType.DukeSide, require('../assets/duke_side.png')],
  [TextureType.WallBriks, require('../assets/wall_briks.png')],
  [TextureType.WallWood, require('../assets/wall_wood.png')],
  [TextureType.FloorNumber, require('../assets/floor1.png')],
  [TextureType.Banan, require('../assets/banan.png')],
  [TextureType.Parquet, require('../assets/parquet.png')],
  [TextureType.Ground, require('../assets/ground.png')],
  [TextureType.Door, require('../assets/door.png')],
]);

const store = {
  map: null as null | Map<TextureType, TextureData>,
};

async function loadTexture(url: string): Promise<TextureData> {
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  const img = new Image();
  img.src = url;
  return new Promise<TextureData>((resolve) => {
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        throw 'Unable to get context';
      }

      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = new Uint32Array(imageData.data.buffer);
      resolve(new TextureData(img.width, img.height, data));
    };
  });
}

async function loadTextures(): Promise<Map<TextureType, TextureData>> {
  const items = [...textureFiles.entries()];
  const promises = items.map(async (x) => {
    const data = await loadTexture(x[1]);
    return { type: x[0], data };
  });
  const res = await Promise.all(promises);
  return new Map<TextureType, TextureData>(res.map((x) => [x.type, x.data]));
}

export default {
  async init(): Promise<void> {
    store.map = await loadTextures();
  },
  getTextureData(type: TextureType): TextureData | null {
    return store.map?.get(type) ?? null;
  },
};
