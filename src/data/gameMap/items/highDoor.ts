import Texture from '../../texture/texture';
import TextureSet from '../../texture/textureSet';
import { TextureType } from '../../texture/textureStore';
import { ItemSet, MovingItem, MovingItemProps, Wall } from '../../types';

const _top = 5;
const _bottom = 1;
const _middle = 3;

const getDoorLevelTop = () => ({
  color: 0x02f00,
  bottom: _middle,
  texture: new Texture(TextureType.FloorMetal, 1),
});

const getDoorLevelBottom = () => ({
  color: 0x002f00,
  bottom: _middle,
  texture: new Texture(TextureType.FloorMetal, 1),
});

const getDoorWallTop = (
  repeatX: number,
  startX: number,
  startY: number
): Wall => ({
  color: 0x0000ff,
  top: _top,
  bottom: _middle,
  render: true,
  texture: new TextureSet(TextureType.Door, 2, startX, startY, repeatX, true),
});
const getDoorWallBottom = (
  repeatX: number,
  startX: number,
  startY: number
): Wall => ({
  color: 0x0000ff,
  top: _middle,
  bottom: _bottom,
  render: true,
  texture: new TextureSet(TextureType.Door, 2, startX, startY, repeatX, false),
});

const initMovingItem = (set: ItemSet, props: MovingItemProps): MovingItem => ({
  props,
  set,
  timestamp: 0,
  state: true,
});
const speed = 0.003;
export const doorMovingItemProps: MovingItemProps = {
  initMovingItem,
  tick: (t: number, item: MovingItem) => {
    let s = speed * t;
    let finish = false;
    if (s >= 2) {
      s = 2;
      finish = true;
    }
    const top = item.state ? _top - s : _middle + s;
    const bottom = item.state ? s + 1 : 3 - s;

    const mapItem = item.set.mapItem;
    const topWall = mapItem.walls.find((w) => w.top === _top);
    const bottomWall = mapItem.walls.find((w) => w.bottom === _bottom);
    const topLevel = mapItem.levels[0];
    const bottomLevel = mapItem.levels[1];
    bottomWall!.top = bottom;
    bottomLevel.bottom = bottom;
    topWall!.bottom = top;
    topLevel.bottom = top;

    return finish;
  },
};

export default (repeatX: number, startX: number, startY: number) => ({
  walls: [
    {
      color: 0xc8c8dc,
      top: _bottom,
      bottom: 0,
      render: true,
      texture: new Texture(TextureType.WallWood, 1),
    },
    getDoorWallBottom(repeatX, startX, startY),
    getDoorWallTop(repeatX, startX, startY),
  ],
  levels: [getDoorLevelBottom(), getDoorLevelTop()],
  stopRay: false,
});
