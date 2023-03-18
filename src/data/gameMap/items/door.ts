import Texture from '../../texture/texture';
import TextureSet from '../../texture/textureSet';
import { TextureType } from '../../texture/textureStore';
import { ItemSet, MovingItem, MovingItemProps, Wall } from '../../types';

const getDoorLevelTop = () => ({
  color: 0x02f00,
  bottom: 2.5,
  texture: null,
});

const getDoorLevelBottom = () => ({
  color: 0x002f00,
  bottom: 2.5,
  texture: null,
});

const getDoorWallTop = (
  repeatX: number,
  startX: number,
  startY: number
): Wall => ({
  color: 0x0000ff,
  top: 4,
  bottom: 2,
  render: true,
  texture: new TextureSet(TextureType.Door, 2, startX, startY, repeatX, true),
});
const getDoorWallBottom = (
  repeatX: number,
  startX: number,
  startY: number
): Wall => ({
  color: 0x0000ff,
  top: 2,
  bottom: 0,
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
    const top = item.state ? 4 - s : 2 + s;
    const bottom = item.state ? s : 2 - s;

    const mapItem = item.set.mapItem;
    const topWall = mapItem.walls.find((w) => w.top === 4);
    const bottomWall = mapItem.walls.find((w) => w.bottom === 0);
    const topLevel = mapItem.levels[0];
    const bottomLevel = mapItem.levels[1];
    bottomWall!.top = bottom;
    bottomLevel.bottom = bottom;
    topWall!.bottom = top;
    topLevel.bottom = top;

    //bottomLevel.speed = finish ? 0 : item.state ? -speed : speed;

    return finish;
  },
};

export default (repeatX: number, startX: number, startY: number) => ({
  walls: [
    {
      color: 0xc8c8dc,
      top: 5,
      bottom: 4,
      render: true,
      texture: new Texture(TextureType.WallWood, 1),
    },
    getDoorWallBottom(repeatX, startX, startY),
    getDoorWallTop(repeatX, startX, startY),
  ],
  levels: [getDoorLevelBottom(), getDoorLevelTop()],
  stopRay: false,
});
