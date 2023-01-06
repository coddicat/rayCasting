import consts from "./consts";
import { Level, MapItem } from "./types";
import { Color } from './color';
import player from "./player";


const map = [
    "#####@@@@#####@@@@#################################",
    "#                                                 #",
    "#                                                 #",
    "#                                                 #",
    "#                                                 #",
    "#                                                 #",
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


function drawMap(scale: number, ctx: CanvasRenderingContext2D) {
    const v = player.getVector();
    const sx = v.x * scale - ctx.canvas.width / 2;
    const sy = v.y * scale - ctx.canvas.height / 2;
    for(let row = 0; row < map.length; row++) {
        for(let col = 0; col < map[row].length; col++) {
            if (map[row][col] == ' ') continue;
            const x = col * consts.blockSize * scale - sx;
            const y = row * consts.blockSize * scale - sy;
            const wh = consts.blockSize * scale;
            ctx.fillRect(x, y, wh, wh);
        }
    }
} 

function check(x: number, y: number): string | null {
    if (y < 0 || y >= map.length || x < 0) {
        return null;
    }
    if (x >= map[y].length) {
        return null;
    }
    return map[y][x];
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


const mapItems = new Map<string, MapItem>([
    [' ', defaultItem],
    ['_', {
        walls: [],
        levels: [floor],
        stopRay: false
    }],
    ['#', {
        walls: [{
            color: new Color(255, 255, 255),
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    ['@', {
        walls: [{
            color: new Color(220, 200, 200),
            top: 6,
            bottom: 0
        }], 
        levels: [],
        stopRay: true
    }],
    ['L', {
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
    ['X', {
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
    ['K', {
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
    ['Y', {
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
    ['&', {
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
    ['Z', {
        walls: [{
            color: new Color(0, 50, 255),
            top: 4,
            bottom: 2
        }], 
        levels: [{
            color: new Color(100, 150, 150),
            bottom: 2
        }, {
            color: new Color(100, 150, 150),
            bottom: 4
        }, ceil, floor],
        stopRay: false
    }],
    ['M', {
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

export default {
    drawMap,
    check,
    getItem(key: string): MapItem {
        return mapItems.get(key) ?? defaultItem;
    },
}