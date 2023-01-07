import consts from "./consts";
import map from "./map";
import Render from "./render";
import { MapItem, RayAction } from "./types";

class RayHandler {
    private render: Render;
    private item: MapItem | null;
    private fixDistance: number;
    private distance: number;
    private mirrorFact: number;

    constructor(render: Render, fixDistance: number) {
        this.render = render;
        this.item = null;
        this.fixDistance = fixDistance;
        this.distance = 0.5;
        this.mirrorFact = 1;
    }

    public handle(bx: number, by: number, newDistance: number): RayAction {
        const found = map.check(bx, by);
        const newItem = found ? map.getItem(found) : null;
        newDistance *= this.fixDistance;
    
        if (newItem != this.item) {
            this.render.handleLevels(this.item, this.distance, newDistance, this.mirrorFact);
            this.render.handleWalls(newItem, newDistance, this.mirrorFact);
            this.item = newItem;
            this.distance = newDistance < 0.5 ? 0.5 : newDistance;
        }

        if (newItem?.mirror) {
            this.mirrorFact *= 0.75;
            return RayAction.mirror;
        }

        return newItem?.stopRay ? RayAction.stop : RayAction.continue;
    }
    public complete(): void {
        this.render.handleLevels(this.item, this.distance, consts.deep, this.mirrorFact);
    }
}

export default RayHandler;