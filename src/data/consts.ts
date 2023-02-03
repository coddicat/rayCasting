const lookAngleDegrees = 60;
const resolution = {
  width: 320,
  height: 240,
};
const rad = Math.PI / 180;

export const mod = (x: number, y: number) => x - ((x / y) | 0) * y;
export const angle = (x0: number, y0: number, x: number, y: number): number => {
  const Vx = x - x0;
  const Vy = y - y0;
  return Math.PI + (Vx || Vy ? Math.atan2(Vy, Vx) : 0);
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
