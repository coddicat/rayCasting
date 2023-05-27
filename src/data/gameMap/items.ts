import { MapItem, MovingItemProps } from '../types';
import { MapItemType } from './mapItemType';
import Door, { doorMovingItemProps } from './items/door';
import HighDoor, {
  doorMovingItemProps as highDoorMovingItemProps,
} from './items/highDoor';
import WelcomeWall from './items/welcome';
import Platform, { platformMovingItemProps } from './items/platform';
import Stairs from './items/stairs';
import Shelfs from './items/shelfs';
import { floor, roomItem, numberItem, towerFloor } from './items/basic';
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
      levels: [towerFloor],
      stopRay: false,
    },
  ],
  [MapItemType.Number, numberItem],
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
  [MapItemType.WelcomeWall, WelcomeWall],
  [MapItemType.Door, Door],
  [MapItemType.HighDoor, HighDoor],
  [MapItemType.Platform, Platform],
]);

export const movingTypes = new Map<MapItemType, MovingItemProps>([
  [MapItemType.Door, doorMovingItemProps],
  [MapItemType.HighDoor, highDoorMovingItemProps],
  [MapItemType.Platform, platformMovingItemProps],
]);
