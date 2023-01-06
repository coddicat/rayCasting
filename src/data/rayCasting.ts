import { Color } from "./color";
import consts from "./consts";
import map from "./map";
import player from "./player";
import ray from "./ray";
import { Level, MapItem, RayAction, Wall } from "./types";

function draw3D(imageData: ImageData): void {
    const vector = player.getVector();
    const playerHeight = player.getHeight();
    const from = vector.angle - consts.lookAngle / 2;
    const to = vector.angle + consts.lookAngle / 2;
    let canvasX = 0;
    const step = consts.lookAngle / consts.lookWidth;
    for (let angle = from; angle < to; angle += step) {
        //let startLevelDistance = 1;
        let prevItem = null as null | MapItem;
        let prevDistance = 1;
        const fix = Math.cos(vector.angle - angle);
        const stepX = consts.blockSize / Math.cos(angle);
        const stepY = consts.blockSize / Math.sin(angle);
        let mirrorFact = 1;

        const result = ray.goto({
            x: vector.x,
            y: vector.y,
            angle: angle,
        }, 
        stepX, 
        stepY, 
        consts.deep / fix, 
        (x,y,d) => {
            const found = map.check(x, y);
            const item = found ? map.getItem(found) : null;
            const distance = d * fix;
    
            if (prevItem && item != prevItem && d > 0.5) {
                const light = getLight(prevDistance, mirrorFact);
                if (light > 0) {
                    prevItem.levels.forEach(level => {
                        drawLevel(imageData, canvasX, distance, prevDistance, playerHeight, level, mirrorFact); 
                    });
                }
            }

            if (item && item != prevItem && d > 0) {
                const light = getLight(distance, mirrorFact);
                if (light > 0) {
                    item.walls.forEach(wall => {
                        drawWall(imageData, canvasX, distance, playerHeight, wall, light);
                    });
                }
                if (item.stopRay) {
                    return RayAction.stop;
                }
            }

            if (item?.mirror) {
                mirrorFact *= 0.75;
                return RayAction.mirror;
            }

            if (item != prevItem) {
                prevItem = item;
                prevDistance = distance < 0.5 ? 0.5 : distance;
            }
            return item?.stopRay ? RayAction.stop : RayAction.continue;
        });

//----- finish ------
        if (!result) {
            const distance = consts.deep;
            if (prevItem && distance > 0.5) {
                const light = getLight(prevDistance, mirrorFact);
                if (light > 0) {
                    prevItem.levels.forEach(level => {
                        drawLevel(imageData, canvasX, distance, prevDistance, playerHeight, level, mirrorFact); 
                    });
                }
            }

        }

//-------------------

        canvasX += 1;
    }
    return;
}
function getDistance(y: number, bottom: number, playerHeight: number): number {
    const a = y - consts.lookHeight / 2;
    const b = consts.lookWidth * (playerHeight - bottom);
    if (a == 0) return consts.deep; 
    const d = b / a;
    return d;
}
function getY(distance: number, bottom: number, playerHeight: number): number {
    if (distance == 0) {
        return -1;
    }

    const fact = consts.lookWidth / distance;
    const y = consts.halfLookHeight + fact * (playerHeight - bottom);
    
    return Math.round(y);
}

function getLight(distance: number, fact: number): number {
    const max = 255;
    const light = distance <= 0 
        ? max : distance >= consts.deep 
        ? 0 : max - max / consts.deep * distance;
    return Math.round(light * fact);
}

function limitY(y: number): number {
    if (y <= 0) return 0;
    if (y >= consts.lookHeight) y = consts.lookHeight;
    return y;
}

function limitX(x: number): number {
    if (x < 0) return 0;
    if (x >= consts.lookWidth) x = consts.lookWidth;
    return x;
}

function drawWall(imageData: ImageData, x: number, distance: number, playerHeight: number, wall: Wall, light: number) {
    const y0 = getY(distance, wall.top , playerHeight);
    const y1 = getY(distance, wall.bottom, playerHeight);
    drawLine(imageData, x, y0, y1, wall.color, light);
}

function getImageDataIndex(x: number, y: number): number {
    return y * consts.imageDataWidth + x * 4;
}
function getTopBottom(y0: number, y1: number): { top: number, bottom: number} {
    y0 = limitY(y0);
    y1 = limitY(y1);
    return y1 > y0 ? { top: y0, bottom: y1 } : { top: y1, bottom: y0 };
}

function drawLineDynamicAlpha(imageData: ImageData, x: number, y0: number, y1: number, color: Color, getAlpha: (y: number) => number) {
    x = limitX(x);
    const { top, bottom } = getTopBottom(y0, y1);
    const max = getImageDataIndex(x, bottom);
    let index = getImageDataIndex(x, top);
    let y = top;
    while (index < max) {
        if (imageData.data[index + 3]) {
            index += consts.imageDataWidth;
            y ++;
            continue;
        }
        const alpha = getAlpha(y); 
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = alpha;
        y ++;
        index += consts.imageDataWidth;
    }
}
function drawLine(imageData: ImageData, x: number, y0: number, y1: number, color: Color, alpha: number) {
    const { top, bottom } = getTopBottom(y0, y1);
    const max = getImageDataIndex(x, bottom);
    let index = getImageDataIndex(x, top);
    while (index < max) {
        if (imageData.data[index + 3]) {
            index += consts.imageDataWidth;
            continue;
        }
        imageData.data[index] = color.r;
        imageData.data[index + 1] = color.g;
        imageData.data[index + 2] = color.b;
        imageData.data[index + 3] = alpha;
        index += consts.imageDataWidth;
    }
}

function getDistanceLight(y: number, bottom: number, playerHeight: number, fact: number): number {
    const distance = getDistance(y, bottom, playerHeight);
    return getLight(distance, fact);
}

function drawLevel(imageData: ImageData, x: number, distance1: number, distance2: number, playerHeight: number, level: Level, mirrorFact: number) {
    const y0 = getY(distance1, level.bottom, playerHeight);
    const y1 = getY(distance2, level.bottom, playerHeight);
    const h = player.getHeight();
    drawLineDynamicAlpha(imageData, x, y0, y1, level.color, (y: number) => getDistanceLight(y, level.bottom, h, mirrorFact));
}

export default {
    draw3D
}