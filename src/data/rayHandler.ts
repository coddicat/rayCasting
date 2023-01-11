import consts from "./consts";
import map from "./map";
import Render from "./render";
import { MapItem, PlayerState, RayAction } from "./types";

class RayHandler {
    private item: MapItem | null;
    private distance: number;
    private mirrorFact: number;
    private emptyPixels: boolean;
    private pixelsCounter: { count: number};
    private data: Uint32Array;
    private playerState: PlayerState;
    private params: { fixDistance: number, displayX: number };

    constructor(data: Uint32Array, params: { fixDistance: number, displayX: number }, playerState: PlayerState) {
        this.item = null;
        this.distance = 0.5;
        this.mirrorFact = 1;
        this.emptyPixels = true;
        this.pixelsCounter = {
            count: 0
        }
        this.data = data;
        this.playerState = playerState;
        this.params = params;
    }

    public handle(params: { bx: number, by: number, distance: number }, obj: { distance: number | null }): RayAction {
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
        if (!this.emptyPixels) return;
        Render.handleLevels(this.data, this.item, { 
            displayX: this.params.displayX, 
            distance: this.distance, 
            distance1: consts.deep,
            mirrorFact: this.mirrorFact 
        }, this.playerState, this.pixelsCounter);
    }
}

export default RayHandler;