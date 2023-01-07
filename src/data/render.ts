import Painter from "./painter";
import player from "./player";
import { Level, MapItem, Wall } from "./types";

class Render {
    private displayX: number;
    private painter: Painter;
    private lightDeep: number;
    private width: number;
    private height: number;

    constructor(imageData: ImageData, displayX: number, lightDeep: number) {
        this.displayX = displayX;
        this.lightDeep = lightDeep;
        this.width = imageData.width;
        this.height = imageData.height;
        this.painter = new Painter(imageData);
    }
    private getDistance(y: number, bottom: number): number {
        const a = y - this.height / 2;
        const b = this.width * (player.getHeight() - bottom);
        if (a == 0) return Infinity;//consts.deep; 
        const d = b / a;
        return d;
    }
    private getY(distance: number, bottom: number): number {
        if (distance == 0) {
            return -1;
        }
    
        const fact = this.width / distance;
        const y = this.height / 2 + fact * (player.getHeight() - bottom);
        
        return Math.round(y);
    }
    private getLight(distance: number, fact: number): number {
        const max = 255;
        const light = distance <= 0 
            ? max : distance >= this.lightDeep 
            ? 0 : max - max / this.lightDeep * distance;
        return Math.round(light * fact);
    }
    private drawWall(distance: number, wall: Wall, light: number) {
        const y0 = this.getY(distance, wall.top);
        const y1 = this.getY(distance, wall.bottom);
        this.painter.drawLine(this.displayX, y0, y1, wall.color, () => light);
    }
    private getDistanceLight(y: number, bottom: number, fact: number): number {
        const distance = this.getDistance(y, bottom);
        return this.getLight(distance, fact);
    }
    private drawLevel(distance1: number, distance2: number, level: Level, mirrorFact: number) {
        const y0 = this.getY(distance1, level.bottom);
        const y1 = this.getY(distance2, level.bottom);
        const getAlpha = (y: number) => this.getDistanceLight(y, level.bottom, mirrorFact);
        this.painter.drawLine(this.displayX, y0, y1, level.color, getAlpha);
    }

    public handleWalls(item: MapItem | null, distance: number, mirrorFact: number): void {
        if (!item || distance <= 0) return;
        const light = this.getLight(distance, mirrorFact);
        if (light <= 0) return;
        item.walls.forEach(wall => {
            this.drawWall(distance, wall, light);
        });
    }

    public handleLevels(item: MapItem | null, distanceFrom: number, distanceTo: number, mirrorFact: number) {
        if (!item || distanceTo < 0.5) return;
        const light = this.getLight(distanceFrom, mirrorFact);
        if (light <= 0) return;
        item.levels.forEach(level => {
            this.drawLevel(distanceTo, distanceFrom, level, mirrorFact); 
        });
    }
}

export default Render;