import { TextureType } from '@/data/texture/textureStore';
import { MapItem } from '../../types';
import { MapItemType } from '../mapItemType';
import { ceil, floor, floorEmpty } from './basic';
import Texture from '@/data/texture/texture';

function stair(top: number, open = true): MapItem {
  const bottom = (((top - 0.3) * 1000) | 0) / 1000;

  const walls = [
    {
      color: 0xc80fff,
      top,
      bottom,
      render: true,
      texture: new Texture(TextureType.WallBriks, 1),
    },
    {
      color: 0xc80fff,
      top: 6,
      bottom: 5,
      render: true,
      texture: new Texture(TextureType.WallBriks, 1),
    },
  ];

  const levelTop = {
    color: 0x6496fa,
    bottom: top,
    texture: new Texture(TextureType.Parquet, 1),
  };

  const levelBottom = {
    color: 0x6496fa,
    bottom: bottom,
    texture: null,
  };

  const levels = !bottom
    ? [levelTop, ...(open ? [] : [ceil])]
    : [
        ...(open ? [floorEmpty] : [floor]),
        levelBottom,
        levelTop,
        ...(open ? [] : [ceil]),
      ];
  const item = {
    walls,
    levels,
    stopRay: false,
  };
  return item;
}

export default new Map<MapItemType, MapItem>([
  [MapItemType.Stair1, stair(0.3, false)],
  [MapItemType.Stair2, stair(0.6, false)],
  [MapItemType.Stair3, stair(0.9, false)],
  [MapItemType.Stair4, stair(1.2)],
  [MapItemType.Stair5, stair(1.5)],
  [MapItemType.Stair6, stair(1.8)],
  [MapItemType.Stair7, stair(3)],
  [MapItemType.Stair8, stair(2.4)],
  [MapItemType.Stair9, stair(2.7)],
  [MapItemType.Stair10, stair(3)],
  [MapItemType.Stair11, stair(3.3)],
  [MapItemType.Stair12, stair(3.6)],
  [MapItemType.Stair13, stair(3.9)],
  [MapItemType.Stair14, stair(4.2)],
  [MapItemType.Stair15, stair(4.5)],
  [MapItemType.Stair16, stair(4.8)],
]);
