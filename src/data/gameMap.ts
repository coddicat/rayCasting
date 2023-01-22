import textureStore, { TextureType } from './textureStore';
import { Level, MapItem, Wall } from './types';

const gameMap = [
  '#####@@@@#####@@@@########MMMMM#############MMMMMM#',
  '#...........................1.....................M',
  '#...............................123456777.........M',
  '#...............................123456777.........M',
  '#...............................123456777.........M',
  '#.................................................#',
  '#.................................................#',
  '##################......^^^^......................#',
  '#@@@@@@@@@@@@@@@@#......^^^^......................#',
  '#................@......................####YYY####',
  '#................&......................#.........M',
  '#................&......................@.........M',
  '#................&......................#.........M',
  '#................@......................@.........M',
  '#................#......................#.........M',
  '#................#......................@.........M',
  '#................#......................####YYY####',
  '#@@@@@@@@@@@@@@@@#......................@.........#',
  '####################....................#.........#',
  '#..................#....................@.........#',
  '#..................#....................#.........#',
  '#..................#....................@.........#',
  '#..................#....................####YYY####',
  '#..................#....................#.........#',
  '#..................#....................#.........#',
  '########YYY#########....................#.........#',
  '#.......................................#.........#',
  '#..................#YYYYY#..............#.........#',
  '#..............YYYY       YYYY..........####MMMM#########################',
  '#..........YYYY               YYYY......',
  '#.........#                       #.....',
  '#.........Y                       Y.....',
  '#.........Y                       Y.....',
  '#.........Y                       Y.....',
  '#.........Y                       Y.....',
  '#.........Y                       Y.....',
  '#.........#                       #.....',
  '#..........YYYY               YYYY......',
  '#..............YYYY       YYYY..........',
  '#..................#YYYYY#..............                     12345678900',
  '#.......................................                     12345678900',
  '###########..........##############################....MMMMMMMMMMMMMM#00',
  '#                                     ##............................##~~',
  '#                                     ## .........1.................##!!',
  '#                                     ##............................##%%',
  '#                                     ##............................##**',
  '#                                     ##............................##((',
  '#                                     ##............     ...........##))',
  '#                                      M............     ...........##',
  '#                                      M............     ...........##',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      M.............................M',
  '#                                      MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM',
];

const ceil: Level = {
  color: 0xdcb9ac,
  bottom: 5,
  texture: {
    type: TextureType.FloorNumber,
  },
};

const floor: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: {
    type: TextureType.FloorNumber,
  },
};

const floorEmpty: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: {
    type: TextureType.Ground,
  },
};

const roomItem: MapItem = {
  walls: [],
  levels: [floor, ceil],
  stopRay: false,
};

const emptyItem: MapItem = {
  walls: [],
  levels: [floorEmpty],
  stopRay: false,
};

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

  Ledge,
  ColoredLedge,
  Mirror,
  LowLedge,
}

const mapKeys = new Map<string, MapItemType>([
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
]);

function getStair(top: number, open = true): MapItem {
  const bottom = (((top - 0.3) * 1000) << 0) / 1000;

  const walls = [
    {
      color: 0xc80fff,
      top,
      bottom,
      render: true,
      texture: null,
    },
  ];

  const levelTop = {
    color: 0x6496fa,
    bottom: top,
    texture: null,
  };

  const levelBottom = {
    color: 0x6496fa,
    bottom: bottom,
    texture: null,
  };

  const levels =
    bottom === 0
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

const mapItems = new Map<MapItemType, MapItem>([
  [MapItemType.RoomSpace, roomItem],
  [
    MapItemType.OpenCeil,
    {
      walls: [],
      levels: [floor],
      stopRay: false,
    },
  ],
  [
    MapItemType.WallBriks,
    {
      walls: [
        {
          color: 0xffffff,
          top: 5,
          bottom: 0,
          render: true,
          texture: {
            type: TextureType.WallBriks,
          },
        },
      ],
      levels: [ceil],
      stopRay: false,
    },
  ],
  [
    MapItemType.WallWood,
    {
      walls: [
        {
          color: 0xdcc8c8,
          top: 5,
          bottom: 0,
          render: true,
          texture: {
            type: TextureType.WallWood,
          },
        },
      ],
      levels: [],
      stopRay: false,
    },
  ],
  [MapItemType.Stair1, getStair(0.3)],
  [MapItemType.Stair2, getStair(0.6)],
  [MapItemType.Stair3, getStair(0.9)],
  [MapItemType.Stair4, getStair(1.2)],
  [MapItemType.Stair5, getStair(1.5)],
  [MapItemType.Stair6, getStair(1.8)],
  [MapItemType.Stair7, getStair(2.1)],
  [MapItemType.Stair8, getStair(2.4)],
  [MapItemType.Stair9, getStair(2.7)],
  [MapItemType.Stair10, getStair(3)],
  [MapItemType.Stair11, getStair(3.3)],
  [MapItemType.Stair12, getStair(3.6)],
  [MapItemType.Stair13, getStair(3.9)],
  [MapItemType.Stair14, getStair(4.2)],
  [MapItemType.Stair15, getStair(4.5)],
  [MapItemType.Stair16, getStair(4.8)],

  [
    MapItemType.Ledge,
    {
      walls: [
        {
          color: 0xffffff,
          top: 5,
          bottom: 4,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x969696,
          bottom: 4,
          texture: null,
        },
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.ColoredLedge,
    {
      walls: [
        {
          color: 0xdcc8c8,
          top: 5,
          bottom: 4,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x969696,
          bottom: 4,
          texture: null,
        },
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.LowLedge,
    {
      walls: [
        {
          color: 0xf4c8c8,
          top: 5,
          bottom: 2,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x96f906,
          bottom: 2,
          texture: null,
        },
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Mirror,
    {
      walls: [
        {
          color: 0xffffff,
          top: 5,
          bottom: 4,
          render: true,
          texture: null,
        },
        {
          color: 0xffffff,
          top: 0.25,
          bottom: 0,
          render: true,
          texture: null,
        },
        //for collision
        {
          color: 0,
          top: 4,
          bottom: 0,
          render: false,
          texture: null,
        },
      ],
      levels: [],
      stopRay: false,
      mirror: true,
    },
  ],
]);

export class GameMap {
  private mapData!: MapItem[][];

  private initTextures(arr: Level[] | Wall[]): void {
    arr
      .filter((l) => l.texture)
      .forEach(
        (l) =>
          (l.texture!.textureData = textureStore.getTextureData(
            l.texture!.type
          ))
      );
  }

  private getItem(strKey: string): MapItem {
    const key = mapKeys.get(strKey);
    const item = (key && mapItems.get(key)) || emptyItem;
    this.initTextures(item.levels);
    this.initTextures(item.walls);
    item.levels.sort((a, b) => a.bottom - b.bottom);
    item.walls.sort((a, b) => a.bottom - b.bottom);
    return item;
  }

  public init(): void {
    this.mapData = gameMap.map((row: string) =>
      [...row].map((c: string) => this.getItem(c))
    );
  }

  public check(bx: number, by: number): MapItem {
    if (by < 0 || by >= this.mapData.length || bx < 0) {
      return emptyItem;
    }
    if (bx >= this.mapData[by].length) {
      return emptyItem;
    }
    return this.mapData[by][bx];
  }
}
