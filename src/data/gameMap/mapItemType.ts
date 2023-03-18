export enum MapItemType {
  Empty,
  RoomSpace,
  OpenCeil,
  WallBriks,
  WallWood,
  Stair1,
  Stair2,
  Stair3,
  Stair4,
  Stair5,
  Stair6,
  Stair7,
  Stair8,
  Stair9,
  Stair10,
  Stair11,
  Stair12,
  Stair13,
  Stair14,
  Stair15,
  Stair16,
  Shelfs,
  Ledge,
  ColoredLedge,
  Mirror,
  LowLedge,
  Door,
  Platform,
}

//export const movingItemTypes = [MapItemType.Door, MapItemType.Platform];

export const mapItemTypeKeys = new Map<string, MapItemType>([
  ['.', MapItemType.RoomSpace],
  ['_', MapItemType.OpenCeil],
  ['#', MapItemType.WallBriks],
  ['@', MapItemType.WallWood],
  ['1', MapItemType.Stair1],
  ['2', MapItemType.Stair2],
  ['3', MapItemType.Stair3],
  ['4', MapItemType.Stair4],
  ['5', MapItemType.Stair5],
  ['6', MapItemType.Stair6],
  ['7', MapItemType.Stair7],
  ['8', MapItemType.Stair8],
  ['9', MapItemType.Stair9],
  ['0', MapItemType.Stair10],
  ['~', MapItemType.Stair11],
  ['!', MapItemType.Stair12],
  ['%', MapItemType.Stair13],
  ['*', MapItemType.Stair14],
  ['(', MapItemType.Stair15],
  [')', MapItemType.Stair16],

  ['Y', MapItemType.Ledge],
  ['&', MapItemType.ColoredLedge],
  ['^', MapItemType.LowLedge],
  ['M', MapItemType.Mirror],
  ['S', MapItemType.Shelfs],

  ['D', MapItemType.Door],
  ['P', MapItemType.Platform],
]);