import consts from "./consts";
import map from "./map";
import Ray, { BlockHandler } from "./ray";
import { PlayerState, RayAction, Vector } from "./types";

function drawLook(playerState: PlayerState, ctx: CanvasRenderingContext2D) {
    const from = playerState.angle - consts.lookAngle / 2;
    const to = playerState.angle + consts.lookAngle / 2;
    for (let angle = from; angle < to; angle += consts.lookMapStep) {
        const fixDistance = Math.cos(playerState.angle - angle);
        const rayVector: Vector = {
            x: playerState.x,
            y: playerState.y,
            angle: angle
        }
        const handler: BlockHandler = (p) => blockHandler(angle, p);
        const maxDistance = consts.deep / fixDistance;
        const ray = new Ray(rayVector, handler, () => { 
            //
        });
        const completed = ray.send(maxDistance);    
        
        if (!completed) drawLookRay(ctx, angle, consts.deep / fixDistance);
    }
    return;

    function blockHandler(angle: number, params: {bx: number, by: number, distance: number}): RayAction {
        const found = map.check(params);
        if (!found) return RayAction.continue;
        const item = map.getItem(found);
        if (!item.stopRay) return RayAction.continue;

        drawLookRay(ctx, angle, params.distance)
        return RayAction.stop;
    }
}

function drawLookRay(ctx: CanvasRenderingContext2D, angle: number, distance: number) {
    const toX = ctx.canvas.width / 2 + Math.cos(angle) * distance;
    const toY = ctx.canvas.height / 2 + Math.sin(angle) * distance;
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.lineWidth = 2;
    ctx.setLineDash([2,2]);
    ctx.lineTo(toX, toY);
    ctx.stroke();        
}

function drawOnMap(playerState: PlayerState, ctx: CanvasRenderingContext2D) {
    drawLook(playerState, ctx);
}

export default {
    drawOnMap
}