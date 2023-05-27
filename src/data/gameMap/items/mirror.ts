import Texture from '@/data/texture/texture';
import { TextureType } from '@/data/texture/textureStore';
import { MapItem } from '@/data/types';

export default {
  walls: [
    {
      color: 0xffffff,
      top: 5,
      bottom: 4,
      render: true,
      texture: new Texture(TextureType.WallWood, 1),
    },
    {
      color: 0xffffff,
      top: 0.25,
      bottom: 0,
      render: true,
      texture: new Texture(TextureType.WallWood, 1),
    },
    //for collision
    {
      color: 0,
      top: 4,
      bottom: 0,
      render: false,
      texture: null,
    },
  ],
  levels: [],
  stopRay: false,
  mirror: true,
} as MapItem;
