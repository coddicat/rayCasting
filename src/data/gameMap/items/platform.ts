import {
  ItemSet,
  Level,
  MapItem,
  MovingItem,
  MovingItemProps,
} from '@/data/types';
import Texture from '../../texture/texture';
import { TextureType } from '../../texture/textureStore';

const getLevelTop = (): Level => ({
  color: 0x02f00,
  bottom: 0.3,
  texture: null,
});

const getLevelBottom = (): Level => ({
  color: 0x002f00,
  bottom: 0,
  texture: null,
});

const getLevelFloor = (): Level => ({
  color: 0,
  bottom: 0,
  texture: new Texture(TextureType.FloorNumber, 1),
  name: 'floor',
});

export default (): MapItem => ({
  walls: [
    {
      color: 0xc8c8dc,
      top: 0.3,
      bottom: 0,
      render: true,
      texture: new Texture(TextureType.WallBriks, 1),
    },
  ],
  levels: [getLevelBottom(), getLevelTop(), getLevelFloor()],
  stopRay: false,
});

const initMovingItem = (set: ItemSet, props: MovingItemProps): MovingItem => ({
  props,
  set,
  timestamp: 0,
  state: false,
});

const height = 5;
const speed = 0.01;

export const platformMovingItemProps: MovingItemProps = {
  initMovingItem,
  tick: (t: number, item: MovingItem) => {
    let dist = speed * t;
    let finish = false;
    if (dist >= height) {
      dist = height;
      finish = true;
    }
    const top = item.state ? dist : height - dist;

    const mapItem = item.set.mapItem;
    const wall = mapItem.walls[0];
    const notFloor = mapItem.levels.filter((x) => !x.name);
    const topLevel = notFloor[0];
    const bottomLevel = notFloor[1];

    wall.bottom = bottomLevel.bottom = top;
    wall.top = topLevel.bottom = top + 0.3;
    topLevel.speed = bottomLevel.speed = finish
      ? 0
      : item.state
      ? -speed
      : speed;

    return finish;
  },
};
