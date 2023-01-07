import { Color } from "./color";

class Painter {
    private imageData: ImageData;
    private width: number;
    private height: number;
    private dataWidth: number;
    
    constructor(imageData: ImageData) {
        this.imageData = imageData;
        this.width = imageData.width;
        this.height = imageData.height;
        this.dataWidth = this.width * 4;
    }
    
    private limit(x: number, max: number): number {
        if (x < 0) return 0;
        if (x >= max) x = max;
        return x;
    }
    
    private drawPoint(index: number, color: Color, alpha: number): void {
        if (this.imageData.data[index + 3]) {
            return;
        }
        this.imageData.data[index] = color.r;
        this.imageData.data[index + 1] = color.g;
        this.imageData.data[index + 2] = color.b;
        this.imageData.data[index + 3] = alpha;
    }

    private getIndex(x: number, y: number): number {
        return y * this.dataWidth + x * 4;
    }

    private getTopBottom(y0: number, y1: number): { top: number, bottom: number} {
        y0 = this.limit(y0, this.height);
        y1 = this.limit(y1, this.height);
        return y1 > y0 ? { top: y0, bottom: y1 } : { top: y1, bottom: y0 };
    }    

    public drawLine(x: number, y0: number, y1: number, color: Color, getAlpha: (y: number) => number): void {
        x = this.limit(x, this.width);
        const { top, bottom } = this.getTopBottom(y0, y1);
        const max = this.getIndex(x, bottom);
        let index = this.getIndex(x, top);
        let y = top;
        while (index < max) {
            const alpha = getAlpha(y); 
            this.drawPoint(index, color, alpha);
            y++;
            index += this.dataWidth;
        }
    }    
}

export default Painter;