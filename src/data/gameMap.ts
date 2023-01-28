import textureStore, { TextureType } from './textureStore';
import { Level, MapItem, Wall } from './types';

type DoorSet = {
  x: number;
  y: number;
}[];

export type Door = {
  mapItem: MapItem;
  set: DoorSet;
  state: boolean;
  timestamp: number;
};

const gameMap = [
  '#####@@@@#####@@@@########MMMMM#############MMMMMM#',
  '#...........................S.....................M',
  '#...............................123456777.........M',
  '#...............................123456777.........M',
  '#...............................123456777.........M',
  '#.................................................#',
  '#.........................MMMMM...................#',
  '##################................................#',
  '#@@@@@@@@@@@@@@@@#................................#',
  '#................@......................####DDD####',
  '#................D......................#.........M',
  '#................D......................@.........M',
  '#................D......................#.........M',
  '#......^^^^......@......................@.........M',
  '#................#......................#.........M',
  '#................#......................@.........M',
  '#................#......................####YYY####',
  '#@@@@@@@@@@@@@@@@#......................@.........#',
  '####################....................#.........#',
  '#..................#....................@.........#',
  '#..................#....................#.........#',
  '#..................D....................@.........#',
  '#..................D....................####YYY####',
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
    repeat: 1,
  },
};

const floor: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: {
    type: TextureType.FloorNumber,
    repeat: 1,
  },
};

const floorEmpty: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: {
    type: TextureType.FloorNumber,
    repeat: 1,
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

const getDoorLevelTop = () => ({
  color: 0xc800dc,
  bottom: 2.5,
  texture: null,
});
const getDoorLevelBottom = () => ({
  color: 0xc800dc,
  bottom: 2.5,
  texture: null,
});
const getDoorWallTop = () => ({
  color: 0x0000ff,
  top: 4,
  bottom: 2,
  render: true,
  texture: null,
});
const getDoorWallBottom = () => ({
  color: 0x0000ff,
  top: 2,
  bottom: 0,
  render: true,
  texture: null,
});

const getDoorItem = (): MapItem => ({
  walls: [
    {
      color: 0xc8c8dc,
      top: 5,
      bottom: 4,
      render: true,
      texture: {
        type: TextureType.WallWood,
        repeat: 1,
      },
    },
    getDoorWallBottom(),
    getDoorWallTop(),
  ],
  levels: [getDoorLevelBottom(), getDoorLevelTop()],
  stopRay: false,
});

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
  Selfs,
  Ledge,
  ColoredLedge,
  Mirror,
  LowLedge,
  Door,
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
  ['S', MapItemType.Selfs],

  ['D', MapItemType.Door],
]);

function getStair(top: number, open = true): MapItem {
  const bottom = (((top - 0.3) * 1000) | 0) / 1000;

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

  const levels = !bottom
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

function getShelfLevels(bottom: number): Level[] {
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

function getShelfWall(bottom: number): Wall {
  return {
    color: 0xc0c0dc,
    top: bottom,
    bottom: bottom - 0.2,
    render: true,
    texture: null,
  };
}

const mapItems = new Map<MapItemType, MapItem>([
  [
    MapItemType.Selfs,
    {
      stopRay: false,
      walls: [
        getShelfWall(0.6),
        getShelfWall(1.2),
        getShelfWall(1.8),
        getShelfWall(2.4),
      ],
      levels: [
        floor,
        ...getShelfLevels(0.6),
        ...getShelfLevels(1.2),
        ...getShelfLevels(1.8),
        ...getShelfLevels(2.4),
      ],
    },
  ],
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
            repeat: 5,
          },
        },
      ],
      levels: [ceil],
      stopRay: true,
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
            repeat: 5,
          },
        },
      ],
      levels: [],
      stopRay: true,
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
  //[MapItemType.Door, () =>doorItem],
]);

export class GameMap {
  private mapData!: MapItem[][];

  private initTextures(arr: Level[] | Wall[]): void {
    arr
      .filter((l) => l.texture)
      .forEach((l) => {
        l.texture!.textureData = textureStore.getTextureData(l.texture!.type);
        l.texture!.repeatedHeight =
          l.texture!.textureData!.height * l.texture!.repeat;
      });
  }

  private getItem(strKey: string, x: number, y: number): MapItem {
    const key = mapKeys.get(strKey);
    let item;
    if (key === MapItemType.Door) {
      const door = this.doors.find((d) =>
        d.set.find((s) => s.x === x && s.y === y)
      );
      item = door?.mapItem ?? emptyItem;
    } else {
      item = (key && mapItems.get(key)) || emptyItem;
    }
    this.initTextures(item.levels);
    this.initTextures(item.walls);
    item.levels.sort((a, b) => a.bottom - b.bottom);
    item.walls.sort((a, b) => a.bottom - b.bottom);
    return item;
  }

  public init(): void {
    this.findDoors();
    this.mapData = gameMap.map((row: string, y: number) =>
      [...row].map((c: string, x: number) => this.getItem(c, x, y))
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

  private doorSet(arr: boolean[][], y: number, x: number): DoorSet | null {
    if (arr[y] && arr[y][x]) return null;
    let res = null as null | DoorSet;
    if (gameMap[y][x] === 'D') {
      res = [{ x, y }];
      //right
      if (x + 1 < gameMap[y].length - 1) {
        const right = this.doorSet(arr, y, x + 1);
        if (right) {
          res = [...res, ...right];
        }
      }
      //down
      if (y + 1 < gameMap.length - 1) {
        const down = this.doorSet(arr, y + 1, x);
        if (down) {
          res = [...res, ...down];
        }
      }
    }

    if (!arr[y]) arr[y] = [];
    arr[y][x] = true;

    return res;
  }

  public doors: Door[] = [];

  private findDoors(): void {
    const arr = [] as boolean[][];
    for (let r = 0; r < gameMap.length; r++) {
      const row = gameMap[r];
      for (let c = 0; c < row.length; c++) {
        const doorSet = this.doorSet(arr, r, c);
        if (doorSet) {
          this.doors.push({
            set: doorSet,
            mapItem: getDoorItem(),
            state: true, //closed
            timestamp: 0,
          });
        }
      }
    }
  }

  private door: Door | null = null;

  public tick(timestamp: number): boolean {
    if (!this.door) return false;

    const t = timestamp - this.door.timestamp;
    let s = 0.003 * t;
    let finish = false;
    if (s >= 2) {
      s = 2;
      finish = true;
    }
    const top = this.door.state ? 4 - s : 2 + s;
    const bottom = this.door.state ? s : 2 - s;

    const mapItem = this.door.mapItem;
    const topWall = mapItem.walls.find((w) => w.top === 4);
    const bottomWall = mapItem.walls.find((w) => w.bottom === 0);
    const topLevel = mapItem.levels[0];
    const bottomLevel = mapItem.levels[1];
    bottomWall!.top = bottom;
    bottomLevel.bottom = bottom;
    topWall!.bottom = top;
    topLevel.bottom = top;

    if (finish) {
      this.door = null;
    }

    return true;
  }

  public toggleDoor(door: Door, timestamp: number): void {
    if (this.door) return;
    this.door = door;
    this.door.timestamp = timestamp;
    this.door.state = !this.door.state;
  }
}
