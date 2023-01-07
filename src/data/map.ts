import consts from "./consts";
import { Level, MapItem } from "./types";
import { Color } from './color';
import player from "./player";


const map = [
    "#####@@@@#####@@@@#################################",
    "#                   KK                            #",
    "#                  XKK                            #",
    "#                 LXKK                            #",
    "#                 LXKK                            #",
    "#                   KK                            #",
    "#                                                 #",
    "##################                                #",
    "#@@@@@@@@@@@@@@@@#                                #",
    "#                @                                #",
    "#                &                                #",
    "#                &                                #",
    "#                &                                #",
    "M                @                                #",
    "M                #                                #",
    "M                #                                #",
    "#                #                                #",
    "#@@@@@@@@@@@@@@@@#                                #",
    "####################                              #",
    "#                  #                              #",
    "#                  #                              #",
    "#                  #                              #",
    "#                  #                              #",
    "#                  #                              #",
    "#                  #                              #",
    "########YYY#########                              #",
    "#                                                 #",
    "#                  #YYYYY#                        #",
    "#              YYYY_______YYYY                    #",
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
    "###################################################",
];


function drawMap(ctx: CanvasRenderingContext2D) {
    const v = player.getVector();
    const sx = v.x - ctx.canvas.width / 2;
    const sy = v.y - ctx.canvas.height / 2;
    for(let row = 0; row < map.length; row++) {
        for(let col = 0; col < map[row].length; col++) {
            const key = fixedMap[row][col];
            if (!key || key == MapItemType.RoomSpace) continue;
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
    color: new Color(205, 155, 205),
    bottom: 6
};
const floor: Level = {
    color: new Color(200, 200, 220),
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
            color: new Color(255, 255, 255),
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    [MapItemType.ColoredWall, {
        walls: [{
            color: new Color(220, 200, 200),
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    [MapItemType.Stair1, {
        walls: [{
            color: new Color(200, 15, 255),
            top: 0.5,
            bottom: 0
        }], 
        levels: [{
            color: new Color(100, 150, 250),
            bottom:0.5
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Stair2, {
        walls: [{
            color: new Color(100, 55, 255),
            top: 1,
            bottom: 0
        }], 
        levels: [{
            color: new Color(100, 150, 50),
            bottom: 1
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Stair3, {
        walls: [{
            color: new Color(100, 155, 155),
            top: 2.2,
            bottom: 0
        }], 
        levels: [{
            color: new Color(10, 150, 50),
            bottom: 2.2
        }, ceil],
        stopRay: false
    }],
    [MapItemType.Ledge, {
        walls: [{
            color: new Color(255, 255, 255),
            top: 6,
            bottom: 5
        }], 
        levels: [{
            color: new Color(150, 150, 150),
            bottom: 5
        }, floor],
        stopRay: false
    }],
    [MapItemType.ColoredLedge, {
        walls: [{
            color: new Color(220, 200, 200),
            top: 6,
            bottom: 5
        }], 
        levels: [{
            color: new Color(150, 150, 150),
            bottom: 5
        }, floor],
        stopRay: false
    }],    
    [MapItemType.Mirror, {
        walls: [{
            color: new Color(255, 255, 255),
            top: 6,
            bottom: 4
        }, {
            color: new Color(255, 255, 255),
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
function check(x: number, y: number): MapItemType | null {
    if (y < 0 || y >= map.length || x < 0) {
        return null;
    }
    if (x >= map[y].length) {
        return null;
    }
    return fixedMap[y][x];
}
export default {
    drawMap,
    check,
    getItem,
}