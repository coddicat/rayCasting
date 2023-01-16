import consts from "./consts";
import { PlayerState } from "./playerState";
import { Level, MapItem } from "./types";

const map = [
  "#####@@@@#####@@@@########MMMMM#############MMMMMM#",
  "#                           1                     M",
  "#                               1234567           M",
  "#                               1234567           M",
  "#                               1234567          1M",
  "#                                                 M",
  "#                                                 #",
  "##################      ^^^^                      #",
  "#@@@@@@@@@@@@@@@@#      ^^^^                      #",
  "#                @                      ####YYY####",
  "#                &                      #         M",
  "#                &                      @         M",
  "#                &                      #         M",
  "#                @                      @         M",
  "#                #                      #         M",
  "#                #                      @         M",
  "#                #                      ####YYY####",
  "#@@@@@@@@@@@@@@@@#                      @         #",
  "####################                    #         #",
  "#                  #                    @         #",
  "#                  #                    #         #",
  "#                  #                    @         #",
  "#                  #                    ####YYY####",
  "#                  #                    #         #",
  "#                  #                    #         #",
  "########YYY#########                    #         #",
  "#                                       #         #",
  "#                  #YYYYY#              #         #",
  "#              YYYY_______YYYY          ####MMMM###",
  "#          YYYY_______________YYYY                #",
  "#         #_______________________#               #",
  "#         Y_______________________Y               #",
  "#         Y_______________________Y               #",
  "#         Y_______________________Y               #",
  "#         Y_______________________Y               #",
  "#         Y_______________________Y               #",
  "#         #_______________________#               #",
  "#          YYYY_______________YYYY                #",
  "#              YYYY_______YYYY                    #",
  "#                  #YYYYY#                        #",
  "#                                                 #",
  "###########################################MMMM####",
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

function drawMap(ctx: CanvasRenderingContext2D, playerState: PlayerState) {
  const sx = playerState.x - ctx.canvas.width / 2;
  const sy = playerState.y - ctx.canvas.height / 2;
  for (let row = 0; row < map.length; row++) {
    for (let col = 0; col < map[row].length; col++) {
      const key = fixedMap[row][col];
      if (!key || key === MapItemType.RoomSpace) continue;
      const item = getItem(key);
      const x = col * consts.blockSize - sx;
      const y = row * consts.blockSize - sy;
      const wh = consts.blockSize;
      ctx.fillStyle = item.stopRay
        ? "rgba(255, 255, 255, 1)"
        : "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(x, y, wh, wh);
    }
  }
}

const ceil: Level = {
  color: 0xcd9bcd,
  bottom: 5,
};

const floor: Level = {
  color: 0xc8c8dc,
  bottom: 0,
};

const defaultItem: MapItem = {
  walls: [],
  levels: [floor/*, ceil*/],
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
  [" ", MapItemType.RoomSpace],
  ["_", MapItemType.OpenCeil],
  ["#", MapItemType.Wall],
  ["@", MapItemType.ColoredWall],
  ["1", MapItemType.Stair1],
  ["2", MapItemType.Stair2],
  ["3", MapItemType.Stair3],
  ["4", MapItemType.Stair4],
  ["5", MapItemType.Stair5],
  ["6", MapItemType.Stair6],
  ["7", MapItemType.Stair7],
  ["Y", MapItemType.Ledge],
  ["&", MapItemType.ColoredLedge],
  ["^", MapItemType.LowLedge],
  ["M", MapItemType.Mirror],
]);

const mapItems = new Map<MapItemType, MapItem>([
  [MapItemType.RoomSpace, defaultItem],
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
        },
      ],
      levels: [
        {
          color: 0x6496fa,
          bottom: 0.3,
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
        },
      ],
      levels: [
        {
          color: 0x649632,
          bottom: 0.6,
        },
        {
          color: 0x649632,
          bottom: 0.3,
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
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 0.9,
        },
        {
          color: 0x0a9632,
          bottom: 0.6,
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
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.2,
        },
        {
          color: 0x0a9632,
          bottom: 0.9,
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
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.5,
        },
        {
          color: 0x0a9632,
          bottom: 1.2,
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
        },
      ],
      levels: [
        {
          color: 0x0a9632,
          bottom: 1.8,
        },
        {
          color: 0x0a9632,
          bottom: 1.5,
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
        },
      ],
      levels: [
        {
          color: 0x0000FF,
          bottom: 2.1,
        },
        {
          color: 0x0a9632,
          bottom: 1.8,
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
        },
      ],
      levels: [
        {
          color: 0x969696,
          bottom: 4,
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
        },
      ],
      levels: [
        {
          color: 0x969696,
          bottom: 4,
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
        },
      ],
      levels: [
        {
          color: 0x96f906,
          bottom: 2,
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
        },
        {
          color: 0xffffff,
          top: 0.25,
          bottom: 0,
          render: true,
        },
        //for collision
        {
          color: 0,
          top: 4,
          bottom: 0,
          render: false,
        },
      ],
      levels: [],
      stopRay: false,
      mirror: true,
    },
  ],
]);

const fixedMap = map.map((r) => [...r].map((c) => mapKeys.get(c) ?? null));

function getItem(type: MapItemType): MapItem {
  return mapItems.get(type) ?? defaultItem;
}
function check(params: { bx: number; by: number }): MapItemType | null {
  if (params.by < 0 || params.by >= map.length || params.bx < 0) {
    return null;
  }
  if (params.bx >= map[params.by].length) {
    return null;
  }
  return fixedMap[params.by][params.bx];
}
export default {
  drawMap,
  check,
  getItem,
};
