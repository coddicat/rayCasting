import { MapItem } from '@/data/types';
import { MapItemType } from '../mapItemType';
import { floor } from './basic';
import Texture from '@/data/texture/texture';
import { TextureType } from '@/data/texture/textureStore';

export default new Map<MapItemType, MapItem>([
  [
    MapItemType.TowerLedge,
    {
      walls: [
        {
          color: 0xffffff,
          top: 10,
          bottom: 4,
          render: true,
          texture: new Texture(TextureType.WallBriks, 1),
        },
      ],
      levels: [
        {
          color: 0x969696,
          bottom: 4,
          texture: new Texture(TextureType.FloorMetal, 1),
        },
        floor,
      ],
      stopRay: false,
    },
  ],
  // [
  //   MapItemType.ColoredLedge,
  //   {
  //     walls: [
  //       {
  //         color: 0xdcc8c8,
  //         top: 5,
  //         bottom: 4,
  //         render: true,
  //         texture: null,
  //       },
  //     ],
  //     levels: [
  //       {
  //         color: 0x969696,
  //         bottom: 4,
  //         texture: null,
  //       },
  //       floor,
  //     ],
  //     stopRay: false,
  //   },
  // ],
  // [
  //   MapItemType.LowLedge,
  //   {
  //     walls: [
  //       {
  //         color: 0xf4c8c8,
  //         top: 5,
  //         bottom: 2,
  //         render: true,
  //         texture: null,
  //       },
  //     ],
  //     levels: [
  //       {
  //         color: 0x96f906,
  //         bottom: 2,
  //         texture: null,
  //       },
  //       floor,
  //     ],
  //     stopRay: false,
  //   },
  // ],
]);
