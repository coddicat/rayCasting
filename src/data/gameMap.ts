import consts from './consts';
import { PlayerState } from './playerState';
import { loadSprite } from './spriteLoader';
import { Level, MapItem, SpriteData } from './types';

const map = [
  '#####@@@@#####@@@@########MMMMM#############MMMMMM#',
  '#                           1                     M',
  '#                               1234567           M',
  '#                               1234567           M',
  '#                               1234567          1M',
  '#                                                 M',
  '#                                                 #',
  '##################      ^^^^                      #',
  '#@@@@@@@@@@@@@@@@#      ^^^^                      #',
  '#                @                      ####YYY####',
  '#                &                      #         M',
  '#                &                      @         M',
  '#                &                      #         M',
  '#                @                      @         M',
  '#                #                      #         M',
  '#                #                      @         M',
  '#                #                      ####YYY####',
  '#@@@@@@@@@@@@@@@@#                      @         #',
  '####################                    #         #',
  '#                  #                    @         #',
  '#                  #                    #         #',
  '#                  #                    @         #',
  '#                  #                    ####YYY####',
  '#                  #                    #         #',
  '#                  #                    #         #',
  '########YYY#########                    #         #',
  '#                                       #         #',
  '#                  #YYYYY#              #         #',
  '#              YYYY_______YYYY          ####MMMM#############################################################################',
  '#          YYYY_______________YYYY                                                                                           ',
  '#         #_______________________#                                                                                          ',
  '#         Y_______________________Y                                                                                          ',
  '#         Y_______________________Y                                                                                          ',
  '#         Y_______________________Y                                                                                          ',
  '#         Y_______________________Y                                                                                          ',
  '#         Y_______________________Y                                                                                          ',
  '#         #_______________________#                                                                                          ',
  '#          YYYY_______________YYYY                                                                                           ',
  '#              YYYY_______YYYY                                                                                               ',
  '#                  #YYYYY#                                                                                                   ',
  '#                                                                                                                            ',
  '###########          ##################MMMMMMMMMMMM    MMMMMMMMMMMMMMM                                                                                               ',
  '#                                      M                             M                                                          ',
  '#                                      M          1                  M                                                           ',
  '#                                      M                             M                                                       ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                      ',
  '#                                      M                             M                                                       ',
  '#                                      MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM                                                 ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                    ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
  '#                                                                                                                            ',
];

// const map = [
//   "###################################################",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                ##############                   #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "#                                                 #",
//   "###################################################",
// ];

// function drawMap(ctx: CanvasRenderingContext2D, playerState: PlayerState) {
//   const sx = playerState.x - ctx.canvas.width / 2;
//   const sy = playerState.y - ctx.canvas.height / 2;
//   for (let row = 0; row < map.length; row++) {
//     for (let col = 0; col < map[row].length; col++) {
//       const key = fixedMap[row][col];
//       if (!key || key === MapItemType.RoomSpace) continue;
//       const item = getItem(key);
//       const x = col * consts.cellSize - sx;
//       const y = row * consts.cellSize - sy;
//       const wh = consts.cellSize;
//       ctx.fillStyle = item.stopRay
//         ? 'rgba(255, 255, 255, 1)'
//         : 'rgba(255, 255, 255, 0.3)';
//       ctx.fillRect(x, y, wh, wh);
//     }
//   }
// }

const ceil: Level = {
  color: 0xcd9bcd,
  bottom: 5,
  texture: null,
};

const floor: Level = {
  color: 0xc8c8dc,
  bottom: 0,
  texture: {
    scale: 1,
    getUrl: () => require('../assets/floor1.png'),
  },
};

const roomItem: MapItem = {
  walls: [],
  levels: [floor /*, ceil*/],
  stopRay: false,
};

const emptyItem: MapItem = {
  walls: [],
  levels: [floor /*, ceil*/],
  stopRay: false,
};

export enum MapItemType {
  Empty,
  RoomSpace,
  OpenCeil,
  Wall,
  ColoredWall,
  Stair1,
  Stair2,
  Stair3,
  Stair4,
  Stair5,
  Stair6,
  Stair7,
  Ledge,
  ColoredLedge,
  Mirror,
  LowLedge,
}

const mapKeys = new Map<string, MapItemType>([
  [' ', MapItemType.RoomSpace],
  ['_', MapItemType.OpenCeil],
  ['#', MapItemType.Wall],
  ['@', MapItemType.ColoredWall],
  ['1', MapItemType.Stair1],
  ['2', MapItemType.Stair2],
  ['3', MapItemType.Stair3],
  ['4', MapItemType.Stair4],
  ['5', MapItemType.Stair5],
  ['6', MapItemType.Stair6],
  ['7', MapItemType.Stair7],
  ['Y', MapItemType.Ledge],
  ['&', MapItemType.ColoredLedge],
  ['^', MapItemType.LowLedge],
  ['M', MapItemType.Mirror],
]);

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
    MapItemType.Wall,
    {
      walls: [
        {
          color: 0xffffff,
          top: 5,
          bottom: 0,
          render: true,
          texture: {
            scale: 1,
            getUrl: () => require('../assets/wall_briks.png'),
          },
        },
      ],
      levels: [],
      stopRay: true,
    },
  ],
  [
    MapItemType.ColoredWall,
    {
      walls: [
        {
          color: 0xdcc8c8,
          top: 5,
          bottom: 0,
          render: true,
          texture: null,
        },
      ],
      levels: [],
      stopRay: true,
    },
  ],
  [
    MapItemType.Stair1,
    {
      walls: [
        {
          color: 0xc80fff,
          top: 0.3,
          bottom: 0,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x6496fa,
          bottom: 0.3,
          texture: null,
        },
        ceil,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair2,
    {
      walls: [
        {
          color: 0x6437ff,
          top: 0.6,
          bottom: 0.3,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x649632,
          bottom: 0.6,
          texture: null,
        },
        {
          color: 0x649632,
          bottom: 0.3,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair3,
    {
      walls: [
        {
          color: 0x649b9b,
          top: 0.9,
          bottom: 0.6,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 0.9,
          texture: null,
        },
        {
          color: 0x0a9632,
          bottom: 0.6,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair4,
    {
      walls: [
        {
          color: 0x649b9b,
          top: 1.2,
          bottom: 0.9,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.2,
          texture: null,
        },
        {
          color: 0x0a9632,
          bottom: 0.9,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair5,
    {
      walls: [
        {
          color: 0x649b9b,
          top: 1.5,
          bottom: 1.2,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.5,
          texture: null,
        },
        {
          color: 0x0a9632,
          bottom: 1.2,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair6,
    {
      walls: [
        {
          color: 0x649b9b,
          top: 1.8,
          bottom: 1.5,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.8,
          texture: null,
        },
        {
          color: 0x0a9632,
          bottom: 1.5,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
  [
    MapItemType.Stair7,
    {
      walls: [
        {
          color: 0x649b9b,
          top: 2.1,
          bottom: 1.8,
          render: true,
          texture: null,
        },
      ],
      levels: [
        {
          color: 0x0000ff,
          bottom: 2.1,
          texture: null,
        },
        {
          color: 0x0a9632,
          bottom: 1.8,
          texture: null,
        },
        ceil,
        floor,
      ],
      stopRay: false,
    },
  ],
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
  private mapData!: (MapItemType | null)[][];
  public async init(): Promise<void> {
    this.mapData = map.map((r) => [...r].map((c) => mapKeys.get(c) ?? null));
    const items = [...mapItems.values()];
    const promises = items.map(async (item) => {
      const wallsPromises = item.walls
        .filter((wall) => !!wall.texture)
        .map(async (wall) => {
          const url = wall.texture!.getUrl();
          wall.texture!.spriteData = await loadSprite(url);
        });
      const levelsPromises = item.levels
        .filter((level) => !!level.texture)
        .map(async (level) => {
          const url = level.texture!.getUrl();
          level.texture!.spriteData = await loadSprite(url);
        });

      await Promise.all([...wallsPromises, levelsPromises]);
    });
    await Promise.all(promises);
  }

  public check(params: { bx: number; by: number }): MapItemType | null {
    if (params.by < 0 || params.by >= map.length || params.bx < 0) {
      return null;
    }
    if (params.bx >= map[params.by].length) {
      return null;
    }
    return this.mapData[params.by][params.bx];
  }
  public getItem(type: MapItemType): MapItem {
    return mapItems.get(type) ?? emptyItem;
  }
}
