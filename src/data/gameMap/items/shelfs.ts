import Texture from '@/data/texture/texture';
import { Level, Wall } from '../../types';
import { floor, ceil } from './basic';
import { TextureType } from '@/data/texture/textureStore';

function shelfLevels(bottom: number): Level[] {
  return [
    {
      color: 0xc8c8dc,
      bottom,
      texture: new Texture(TextureType.FloorMetal, 1),
    },
    {
      color: 0xc8c8dc,
      bottom: bottom - 0.2,
      texture: new Texture(TextureType.FloorMetal, 1),
    },
  ];
}

function shelfWall(bottom: number): Wall {
  return {
    color: 0xc0c0dc,
    top: bottom,
    bottom: bottom - 0.2,
    render: true,
    texture: new Texture(TextureType.WallWood, 1),
  };
}

export default {
  stopRay: false,
  walls: [shelfWall(0.6), shelfWall(1.2), shelfWall(1.8), shelfWall(2.4)],
  levels: [
    floor,
    ceil,
    ...shelfLevels(0.6),
    ...shelfLevels(1.2),
    ...shelfLevels(1.8),
    ...shelfLevels(2.4),
  ],
};
