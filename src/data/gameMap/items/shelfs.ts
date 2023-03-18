import { Level, Wall } from '../../types';
import { floor } from './basic';

function shelfLevels(bottom: number): Level[] {
  return [
    {
      color: 0xc8c8dc,
      bottom,
      texture: null,
    },
    {
      color: 0xc8c8dc,
      bottom: bottom - 0.2,
      texture: null,
    },
  ];
}

function shelfWall(bottom: number): Wall {
  return {
    color: 0xc0c0dc,
    top: bottom,
    bottom: bottom - 0.2,
    render: true,
    texture: null,
  };
}

export default {
  stopRay: false,
  walls: [shelfWall(0.6), shelfWall(1.2), shelfWall(1.8), shelfWall(2.4)],
  levels: [
    floor,
    ...shelfLevels(0.6),
    ...shelfLevels(1.2),
    ...shelfLevels(1.8),
    ...shelfLevels(2.4),
  ],
};
