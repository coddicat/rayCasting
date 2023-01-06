import consts from "./consts";
import rayAxis from "./rayAxis";
import { RayAction, Side, Vector } from "./types";


function goto(v: Vector, stepX: number, stepY: number, max: number, blockHandler: (x: number, y: number, distance: number) => RayAction): boolean {
    const axisX = new rayAxis(0, v.x, stepX);
    const axisY = new rayAxis(0, v.y, stepY);
    let distance = 0;
    const getSide = (): Side => {
        const dx = axisX.getDistance();
        const dy = axisY.getDistance();
        return dx == dy ? Side.corner : dx > dy ? Side.x : Side.y;
    };
    let side = getSide();
    let mirrors = 0;
    while(distance + (mirrors * consts.blockSize) < max) {
        const action = blockHandler(axisX.getBlock(), axisY.getBlock(), distance);
        if (action == RayAction.stop) {
            return true;
        }

        if (action == RayAction.mirror) {
            if (side == Side.corner || side == Side.x) {
                mirrors += 1;//Math.abs(stepY);
                axisY.mirror();
            }
            if (side == Side.corner || side == Side.y) {
                mirrors += 1; //Math.abs(stepX);
                axisX.mirror();
            }
        }

        side = getSide();
        if (side == Side.corner || side == Side.x) {
            distance = axisY.step();
        }
        if (side == Side.corner || side == Side.y) {
            distance = axisX.step();
        }
    }
    
    return false;
}

export default {
    goto    
}