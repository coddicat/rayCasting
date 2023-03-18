import { MapItem, MovingItemProps } from '../types';
import { MapItemType } from './mapItemType';
import Door, { doorMovingItemProps } from './items/door';
import Platform, { platformMovingItemProps } from './items/platform';
import Stairs from './items/stairs';
import Shelfs from './items/shelfs';
import { floor, roomItem } from './items/basic';
import Walls from './items/walls';
import Ledges from './items/ledges';
import Mirror from './items/mirror';

export const singleItems = new Map<MapItemType, MapItem>([
  [MapItemType.Shelfs, Shelfs],
  [MapItemType.RoomSpace, roomItem],
  [
    MapItemType.OpenCeil,
    {
      walls: [],
      levels: [floor],
      stopRay: false,
    },
  ],

  ...Walls.entries(),
  ...Stairs.entries(),
  ...Ledges.entries(),

  [MapItemType.Mirror, Mirror],
]);

export type ItemSetGetter = (
  repeatX: number,
  startX: number,
  startY: number
) => MapItem;

export const itemsInSet = new Map<MapItemType, ItemSetGetter>([
  [MapItemType.Door, Door],
  [MapItemType.Platform, Platform],
]);

export const movingTypes = new Map<MapItemType, MovingItemProps>([
  [MapItemType.Door, doorMovingItemProps],
  [MapItemType.Platform, platformMovingItemProps],
]);
