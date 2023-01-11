import consts from "./consts";
import { Level, MapItem, PlayerState } from "./types";

const map = [
    "#####@@@@#####@@@@########MMMMM#############MMMMMM#",
    "#                   KK      L                     M",
    "#                  XKK                            M",
    "#                 LXKK                            M",
    "#                 LXKK                           LM",
    "#                   KK                            M",
    "#                                                 #",
    "##################                                #",
    "#@@@@@@@@@@@@@@@@#                                #",
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


function drawMap(ctx: CanvasRenderingContext2D, playerState: PlayerState) {
    const sx = playerState.x - ctx.canvas.width / 2;
    const sy = playerState.y - ctx.canvas.height / 2;
    for(let row = 0; row < map.length; row++) {
        for(let col = 0; col < map[row].length; col++) {
            const key = fixedMap[row][col];
            if (!key || key === MapItemType.RoomSpace) continue;
            const item = getItem(key);
            const x = col * consts.blockSize - sx;
            const y = row * consts.blockSize - sy;
            const wh = consts.blockSize;
            ctx.fillStyle = item.stopRay ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.3)";
            ctx.fillRect(x, y, wh, wh);
        }
    }
} 

const ceil: Level = {
    color: 0xCD9BCD,
    bottom: 6
};

const floor: Level = {
    color: 0xC8C8DC,
    bottom: 0
};

const defaultItem: MapItem = {
    walls: [],
    levels: [floor, ceil],
    stopRay: false
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
    Ledge,
    ColoredLedge,
    Mirror
}

const mapKeys = new Map<string, MapItemType>([
    [' ', MapItemType.RoomSpace],
    ['_', MapItemType.OpenCeil],
    ['#', MapItemType.Wall],
    ['@', MapItemType.ColoredWall],
    ['L', MapItemType.Stair1],
    ['X', MapItemType.Stair2],
    ['K', MapItemType.Stair3],
    ['Y', MapItemType.Ledge],
    ['&', MapItemType.ColoredLedge],
    ['M', MapItemType.Mirror],
])

const mapItems = new Map<MapItemType, MapItem>([
    [MapItemType.RoomSpace, defaultItem],
    [MapItemType.OpenCeil, {
        walls: [],
        levels: [floor],
        stopRay: false
    }],
    [MapItemType.Wall, {
        walls: [{
            color: 0xFFFFFF,
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    [MapItemType.ColoredWall, {
        walls: [{
            color: 0xDCC8C8,
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    [MapItemType.Stair1, {
        walls: [{
            color: 0xC80FFF, 
            top: 0.5,
            bottom: 0
        }], 
        levels: [{
            color: 0x6496FA,
            bottom:0.5
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Stair2, {
        walls: [{
            color: 0x6437FF, 
            top: 1,
            bottom: 0
        }], 
        levels: [{
            color: 0x649632, 
            bottom: 1
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Stair3, {
        walls: [{
            color: 0x649B9B, 
            top: 2.2,
            bottom: 0
        }], 
        levels: [{
            color: 0x0A9632, 
            bottom: 2.2
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Ledge, {
        walls: [{
            color: 0xFFFFFF,
            top: 6,
            bottom: 5
        }], 
        levels: [{
            color: 0x969696,
            bottom: 5
        }, floor],
        stopRay: false
    }],
    [MapItemType.ColoredLedge, {
        walls: [{
            color: 0xDCC8C8, 
            top: 6,
            bottom: 5
        }], 
        levels: [{
            color: 0x969696, 
            bottom: 5
        }, floor],
        stopRay: false
    }],    
    [MapItemType.Mirror, {
        walls: [{
            color: 0xFFFFFF, 
            top: 6,
            bottom: 4
        }, {
            color: 0xFFFFFF, 
            top: 0.25,
            bottom: 0
        }], 
        levels: [],
        stopRay: false,
        mirror: true
    }]    
]);

const fixedMap = map.map(r => [...r].map(c => mapKeys.get(c) ?? null));


function getItem(type: MapItemType): MapItem {
    return mapItems.get(type) ?? defaultItem;
}
function check(params: { bx: number, by: number }): MapItemType | null {
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
}