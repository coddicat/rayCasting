import Texture from '@/data/texture/texture';
import { TextureType } from '@/data/texture/textureStore';
import { MapItem } from '@/data/types';
import { MapItemType } from '../mapItemType';
import { ceil } from './basic';

export default new Map<MapItemType, MapItem>([
  [
    MapItemType.WallBriks,
    {
      walls: [
        {
          color: 0xffffff,
          top: 5,
          bottom: 0,
          render: true,
          texture: new Texture(TextureType.WallBriks, 1),
        },
      ],
      levels: [ceil],
      stopRay: true,
    },
  ],
  [
    MapItemType.WallWood,
    {
      walls: [
        {
          color: 0xdcc8c8,
          top: 5,
          bottom: 0,
          render: true,
          texture: new Texture(TextureType.WallWood, 1),
        },
      ],
      levels: [],
      stopRay: true,
    },
  ],
]);
