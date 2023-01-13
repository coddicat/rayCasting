import consts from "./consts";
import { PlayerState } from "./playerState";
import RayCasting from "./rayCasting";
import { getDukeFrontSpriteData } from "./spriteLoader";

export class Main3D {
    private tempCtx: CanvasRenderingContext2D;
    private tempCanvas: HTMLCanvasElement;
    private imageData: ImageData;
    private context?: CanvasRenderingContext2D;
    private rayCasting?: RayCasting;
    private playerState: PlayerState;

    constructor(playerState: PlayerState) {
        this.tempCanvas = document.createElement('canvas') as HTMLCanvasElement;
        this.tempCanvas.width = consts.lookWidth;
        this.tempCanvas.height = consts.lookHeight;
        const tempCtx = this.tempCanvas.getContext("2d", { willReadFrequently: true });
        if (!tempCtx) throw "Cannot get context";        
        this.tempCtx = tempCtx;
        this.imageData = tempCtx.createImageData(consts.lookWidth, consts.lookHeight);
        this.playerState = playerState;
    }


    public async initAsync(mainCanvas: HTMLCanvasElement): Promise<void> {
        const ctx = mainCanvas.getContext("2d", { alpha: false, willReadFrequently: true });
        if (!ctx) throw "cannot get context";
        this.context = ctx;

        const dukeFrontSpriteData = await getDukeFrontSpriteData();

        this.rayCasting = new RayCasting(this.imageData, this.playerState, this.playerState, dukeFrontSpriteData);
    }

    public renderMain() {
        if (!this.rayCasting || !this.context) throw "No init";

        this.rayCasting.reset();
        this.rayCasting.draw3D();    
        this.tempCtx.putImageData(this.imageData, 0, 0);

        this.context.save();
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        this.context.scale(this.context.canvas.width / consts.lookWidth, this.context.canvas.height / consts.lookHeight);
        this.context.drawImage(this.tempCanvas, 0, 0);      
        this.context.restore();
      }    
}