//import { Color } from "./color";
import consts from "./consts";
class Painter {
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


    public static drawLine(data: Uint32Array, params: { x: number, y0: number, y1: number, color: number}, pixelsCounter: { count: number}, getAlpha: (y: number) => number): void {
        const topBottom = this.getTopBottom(params);
        //let counter = 0;
        let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
        while(topBottom.top <= topBottom.bottom) {
            const alpha = getAlpha(topBottom.top);
            if (alpha < 1) break;
            
            if(data[index] !== 0) {
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
        //return counter;
    }

    public static drawLineStatic(data: Uint32Array, params: { x: number, y0: number, y1: number, color: number}, pixelsCounter: { count: number}, alpha: number): void {
        if (alpha < 1) return;
        const topBottom = this.getTopBottom(params);
        let index = topBottom.top * consts.lookWidth + this.limitX(params.x);
        while(topBottom.top <= topBottom.bottom) {
            if(data[index] !== 0) {
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
}

export default Painter;