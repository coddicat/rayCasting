export class Color {
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    private padToTwo(str: string) {
        return str.padStart(2, '0');
    }

    public getColor(light: number): string {
        const r = Math.round(this.r * light).toString(16);
        const g = Math.round(this.g * light).toString(16);
        const b = Math.round(this.b * light).toString(16);
        return `#${this.padToTwo(r)}${this.padToTwo(g)}${this.padToTwo(b)}`;
    }
}