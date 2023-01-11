import consts from "./consts";
import Painter from "./painter";
import { Level, MapItem, PlayerState, Wall } from "./types";

const maxLight = 255;
const halfHeight = consts.lookHeight / 2;
class Render {
    private static drawWall(data: Uint32Array, params: { displayX: number, distance: number}, light: number, wall: Wall, playerState: PlayerState, pixelCounter: { count: number }): void {
        const fact = consts.lookWidth / params.distance;
        const a = halfHeight + fact * playerState.z;

        const _params = { 
            y0: (a - wall.top * fact),
            y1: (a - wall.bottom * fact),
            x: params.displayX,
            color: wall.color
        }
        
        Painter.drawLineStatic(data, _params, pixelCounter, light);
    }
    
    private static drawLevel(data: Uint32Array, params: { displayX: number, distance: number, distance1: number, mirrorFact: number }, level: Level, playerState: PlayerState, pixelCounter: { count: number }): void {        
        const d = consts.lookWidth * (playerState.z - level.bottom);
        const _params = { 
            y0: halfHeight + d / params.distance,
            y1: halfHeight + d / params.distance1,
            x: params.displayX,
            color: level.color
        }

        const b = consts.lookWidth * (playerState.z - level.bottom);
        const f = maxLight / consts.deep * params.mirrorFact;
        const getAlpha = (y: number) => {
            const a = y - halfHeight;
            if (a === 0) return 0; 
            return (consts.deep - b / a) * f;
        }
        
        Painter.drawLine(data, _params, pixelCounter, getAlpha);
    }

    // public handleObject(distance: number | null, mirrorFact: number): boolean {
    //     if (!distance || distance <= 0) return true;
    //     const light = this.getLight({ distance, mirrorFact });
    //     if (light <= 0) return true;
    //     this.drawWall(distance, {
    //         color: 0xFF0000,
    //         top: this.playerState.z - consts.playerHeight + 2.1,
    //         bottom: this.playerState.z - consts.playerHeight
    //     }, light);
    //     return this.pixelCounter < this.height;
    // }

    public static handleWalls(data: Uint32Array, item: MapItem | null, params: { displayX: number, distance: number, mirrorFact: number }, playerState: PlayerState, pixelCounter: { count: number }): boolean {
        if (!item || params.distance <= 0) return true;
        const light =  maxLight * (consts.deep - params.distance) / consts.deep * params.mirrorFact;
        if (light < 1) return true;

        let i = 0;
        while(i < item.walls.length) {
            this.drawWall(data, params, light, item.walls[i], playerState, pixelCounter);
            if (pixelCounter.count >= consts.lookHeight) return false;
            i++;
        }

        return true;
    }

    public static handleLevels(data: Uint32Array, item: MapItem | null, params: { displayX: number, distance: number, distance1: number, mirrorFact: number }, playerState: PlayerState, pixelCounter: { count: number }) : boolean {
        if (!item || params.distance1 < 0.5) return true;
        const light =  maxLight * (consts.deep - params.distance) / consts.deep * params.mirrorFact;       
        if (light < 1) return true;

        let i = 0;
        while(i < item.levels.length) {
            this.drawLevel(data, params, item.levels[i], playerState, pixelCounter);
            if (pixelCounter.count >= consts.lookHeight) return false;
            i++;
        }

        return true;
    }
}

export default Render;