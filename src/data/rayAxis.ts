import consts from "./consts";
export default class {
    private _sign: number;
    private _step: number;
    private _block: number;
    private _distance: number;

    private getRest(position: number): number {
        const rest = Math.abs(position % consts.blockSize);
        if (position < 0) {
            return this._sign < 0 ? consts.blockSize - rest : rest; 
        }
        return this._sign < 0 ? rest : consts.blockSize - rest; 
    }

    constructor(initDistance: number, from: number, step: number) {
        this._sign = Math.sign(step);
        this._step = Math.abs(step);
        const rest = this.getRest(from);
        this._block = Math.floor(from / consts.blockSize);
        this._distance = initDistance + this._step * rest / consts.blockSize
    }

    public step(): number {
        const distance = this._distance;
        this._block += this._sign;
        this._distance += this._step;
        return distance;
    }

    public getBlock = () => this._block;
    public getDistance = () => this._distance;

    public mirror(): void {
        this._sign = -this._sign;
        this._distance -= this._step;
    }
}
