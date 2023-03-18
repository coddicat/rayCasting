import { Position } from './types';

const lookAngleDegrees = 60;
const resolution = {
  width: 640,
  height: 480,
};
const rad = Math.PI / 180;
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

export default {
  resolution,
  moveSpeed: 0.015,
  turnSpeed: 0.002,
  lookLength: 80,
  lookAngle: lookAngleDegrees * rad,
  lookMapStep: (lookAngleDegrees * rad) / 20,
  playerHeight: 1.8,
  playerWidth: 1.34,
};
