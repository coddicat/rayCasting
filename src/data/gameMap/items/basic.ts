import Texture from '../../texture/texture';
import { TextureType } from '../../texture/textureStore';
import { Level, MapItem } from '../../types';

export const ceil: Level = {
  color: 0xdcb9ac,
  bottom: 5,
  texture: new Texture(TextureType.FloorNumber, 1),
};

export const floor: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: new Texture(TextureType.FloorNumber, 1),
};

export const floorEmpty: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: new Texture(TextureType.FloorNumber, 1),
};

export const roomSpaceItem: MapItem = {
  walls: [],
  levels: [floor, ceil],
  stopRay: false,
};

export const emptyItem: MapItem = {
  walls: [],
  levels: [floorEmpty],
  stopRay: false,
};

export const roomItem: MapItem = {
  walls: [],
  levels: [floor, ceil],
  stopRay: false,
};
