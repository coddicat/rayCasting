import { Position } from './types';

const rad360 = Math.PI * 2;

export const sign = (n: number): number => {
  return n < 0 ? -1 : 1;
};
export const mod = (x: number, y: number) => x - ((x / y) | 0) * y;
export const angle = (pos0: Position, pos1: Position): number => {
  const Vx = pos1.x - pos0.x;
  const Vy = pos1.y - pos0.y;
  return Math.PI + (Vx || Vy ? Math.atan2(Vy, Vx) : 0);
};
export const norm = (a: number): number => {
  if (a < 0) {
    return rad360 + a;
  } else if (a > rad360) {
    return a % rad360;
  }
  return a;
};
