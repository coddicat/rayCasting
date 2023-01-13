import consts from "./consts";
import { PlayerState } from "./playerState";
import { Level, SpriteData } from "./types";

const maxLight = 255;
const halfHeight = consts.lookHeight / 2;

export class DynamicAlpha {
    private b = 0;
    private f = 0

    public init(playerState: PlayerState, level: Level, params: { mirrorFact: number }): void {
        this.b = consts.lookWidth * (playerState.z + playerState.lookHeight - level.bottom);
        this.f = maxLight / consts.deep * params.mirrorFact;
    }
    public getAlpha(y: number): number {
        const a = y - halfHeight;
        if (a === 0) return 0; 
        return (consts.deep - this.b / a) * this.f;
    }
}

class Painter {
    private static dynamicAlpha = new DynamicAlpha();

    public static InitDynamicAlpha(playerState: PlayerState, level: Level, params: { mirrorFact: number }): void {
        this.dynamicAlpha.init(playerState, level, params);
    }

    private static limitX(x: number ): number {
        if (x < 0) return 0;
        if (x >= consts.lookWidth) return consts.lookWidth - 1;
        return x << 0;
    }

    private static limitY(y: number ): number {
        if (y < 0) return 0;
        if (y >= consts.lookHeight) return consts.lookHeight - 1;
        return y << 0;
    }

    private static getTopBottom(params: { y0: number, y1: number }): { top: number, bottom: number} {
        return params.y1 > params.y0 
            ? { top: this.limitY(params.y0), bottom: this.limitY(params.y1) } 
            : { top: this.limitY(params.y1), bottom: this.limitY(params.y0) };
    }    


    public static drawLineDynamic(data: Uint32Array, params: { x: number, y0: number, y1: number, color: number}, pixelsCounter: { count: number}): void {
        const topBottom = this.getTopBottom(params);
        let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
        while(topBottom.top <= topBottom.bottom) {
            const alpha = this.dynamicAlpha.getAlpha(topBottom.top);
            //if (alpha < 1) break;
            
            if(data[index] !== 0 || alpha < 1) {
                topBottom.top++;
                index += consts.lookWidth;
                continue;
            }

            data[index] =
                (alpha << 24) |
                params.color
                // (color.b << 16) |
                // (color.g << 8) |
                // (color.r);

            pixelsCounter.count ++;
            topBottom.top ++;
            index += consts.lookWidth;
        }
    }

    public static drawLineStatic(data: Uint32Array, 
        params: { x: number, y0: number, y1: number, color: number, alpha: number}, 
        pixelsCounter: { count: number}): void {
        if (params.alpha < 1) return;
        const topBottom = this.getTopBottom(params);
        let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
        while(topBottom.top <= topBottom.bottom) {
            if(data[index] !== 0) {
                topBottom.top++;
                index += consts.lookWidth;
                continue;
            }

            data[index] =
                (params.alpha << 24) |
                params.color
                // (color.b << 16) |
                // (color.g << 8) |
                // (color.r);

            pixelsCounter.count ++;
            topBottom.top ++;
            index += consts.lookWidth;
        }
    }

    public static drawSpriteLine(data: Uint32Array, 
        params: { x: number, spriteX: number, y0: number, y1: number, color: number, alpha: number}, 
        pixelsCounter: { count: number}, 
        spriteData: SpriteData): void {
        
        if (params.alpha < 1) return;
        const topBottom = this.getTopBottom(params);
        let index = topBottom.top * consts.lookWidth + this.limitX(params.x);

        let y = 0;
        const hRate = spriteData.height / (Math.abs(params.y1 - params.y0) + 1);

        while(topBottom.top <= topBottom.bottom) { 
            const spriteIndex = ((y * hRate) << 0) * spriteData.width + params.spriteX;
            if(data[index] !== 0 || spriteData.data[spriteIndex] === 0) {
                topBottom.top++;
                index += consts.lookWidth;
                y++;
                continue;
            }
            
            data[index] = 
                (params.alpha << 24) |
                (spriteData.data[spriteIndex] & 0x00FFFFFF );

            pixelsCounter.count ++;
            topBottom.top ++;
            index += consts.lookWidth;
            y++;
        }
    }    
}

export default Painter;