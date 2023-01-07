import consts from "./consts";
import player from "./player";
import Ray, { BlockHandler } from "./ray";
import RayHandler from "./rayHandler";
import Render from "./render";
import { Vector } from "./types";

class RayCasting {
    private imageData: ImageData;
    private vector: Vector;
    private halfLookAngle: number;

    constructor(imageData: ImageData) {
        this.imageData = imageData;
        this.vector = player.getVector();
        this.halfLookAngle = consts.lookAngle / 2;
    }

    private handleAngle(angle: number, displayX: number): void {
        const render = new Render(this.imageData, displayX, consts.deep);
        const fixDistance = Math.cos(this.vector.angle - angle);
        const rayHandler = new RayHandler(render, fixDistance);
        const rayVector: Vector = {
            x: this.vector.x,
            y: this.vector.y,
            angle: angle,
        }
        const handler: BlockHandler = (x, y, d) => rayHandler.handle(x, y, d);
        const maxDistance = consts.deep / fixDistance;
        const ray = new Ray(rayVector, handler);
        const completed = ray.send(maxDistance);
        
        if (completed) return;
        rayHandler.complete();
    }

    public draw3D(): void {
        const from = this.vector.angle - this.halfLookAngle;
        const to = this.vector.angle + this.halfLookAngle;
        let displayX = 0;
        const step = consts.lookAngle / consts.lookWidth;
        let angle = from;

        while(angle < to) {
            this.handleAngle(angle, displayX);
            angle += step;
            displayX += 1;
        }
    }
}

export default RayCasting;