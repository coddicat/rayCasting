import consts from "./consts";
import map from "./map";
import Render from "./render";
import { MapItem, PlayerState, RayAction } from "./types";


const obj = {
    x: 30,
    y: 5,
    w: 2
}

class RayHandler {
    private item: MapItem | null;
    private distance: number;
    private mirrorFact: number;
    private emptyPixels: boolean;
    private pixelsCounter: { count: number};
    private data: Uint32Array;
    private playerState: PlayerState;
    private params: { fixDistance: number, displayX: number } | null;

    constructor(data: Uint32Array, playerState: PlayerState) {
        this.data = data;

        this.item = null;
        this.distance = 0.5;
        this.mirrorFact = 1;
        this.emptyPixels = true;
        this.pixelsCounter = { count: 0 }        
        this.params = null;
        this.playerState = playerState;
    }

    public init(params: { fixDistance: number, displayX: number }): void {
        this.item = null;
        this.distance = 0.5;
        this.mirrorFact = 1;
        this.emptyPixels = true;
        this.pixelsCounter = {
            count: 0
        }        
        this.params = params;
    }


    public handle(params: { bx: number, by: number, distance: number }/*, obj: { distance: number | null }*/): RayAction {
        if (!this.params) throw 'Not init';
        
        const found = map.check(params);
        const newItem = found ? map.getItem(found) : null;
        const newDistance = params.distance * this.params.fixDistance;

        
        // if (obj.distance) {
        //     const distance = obj.distance * this.fixDistance;
        //     if (distance <= newDistance && distance > 0.6) {
        //         this.emptyPixels = this.emptyPixels 
        //             && this.render.handleObject(distance, this.mirrorFact);
        //     }
        // }

        const dx = obj.x - this.playerState.x;
        const dy = obj.y - this.playerState.y;
        const sign = Math.sign(dx);
        const d = Math.sqrt(dx ** 2 + dy ** 2);
        const angle = Math.atan(dy/dx) * sign;


        function fixAngle(a: number) {
            a = a % (Math.PI * 2);
            if (a > Math.PI) {
                a = -Math.PI + a % Math.PI
            } else if (a < -Math.PI) {
                a = Math.PI + a % Math.PI
            }   
            return a;
        }

        const angle0 = Math.sign(dx) < 0 ? Math.PI - this.playerState.angle : this.playerState.angle;
        const diff = (angle - fixAngle(angle0)) * Math.sign(dx);
        const x = (consts.lookWidth / consts.lookAngle * (diff + consts.lookAngle/2)) << 0;
        const xf = consts.lookWidth / d;
        if (newDistance >= d && this.params.displayX >= x - obj.w / 2 * xf && this.params.displayX <= x + obj.w / 2 * xf) {
            const _params = {
                displayX: this.params.displayX, 
                distance: d, // / this.params.fixDistance,
                mirrorFact: this.mirrorFact 
            }

            this.emptyPixels = this.emptyPixels &&
                Render.handleObject(this.data, _params, this.playerState, this.pixelsCounter);
        }


        if (newItem !== this.item) {
            const _params = {
                displayX: this.params.displayX, 
                distance: newDistance,
                distance1: this.distance, 
                mirrorFact: this.mirrorFact 
            }
    
            this.emptyPixels = this.emptyPixels && 
                Render.handleLevels(this.data, this.item, _params, this.playerState, this.pixelsCounter);
            
            this.emptyPixels = this.emptyPixels &&
                Render.handleWalls(this.data, newItem, _params, this.playerState, this.pixelsCounter)

            this.item = newItem;
            this.distance = newDistance < 0.5 ? 0.5 : newDistance;
        }

        if (newItem && newItem.mirror) {
            this.mirrorFact *= 0.75;
            return RayAction.mirror;
        }

        return (!this.emptyPixels || (newItem && newItem.stopRay)) 
            ? RayAction.stop 
            : RayAction.continue;
    }
    
    public complete(): void {
        if (!this.emptyPixels || !this.params) return;
        Render.handleLevels(this.data, this.item, { 
            displayX: this.params.displayX, 
            distance: this.distance, 
            distance1: consts.deep,
            mirrorFact: this.mirrorFact 
        }, this.playerState, this.pixelsCounter);
    }
}

export default RayHandler;