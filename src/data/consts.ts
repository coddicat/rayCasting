const lookAngleDegrees = 60;
const resolution = {
  width: 600,
  height: 400,
};
const rad = Math.PI / 180;

export default {
  rad,
  resolution,
  cellSize: 1,
  moveSpeed: 0.015,
  turnSpeed: 0.002,
  lookLength: 80,
  lookAngle: lookAngleDegrees * rad,
  lookMapStep: (lookAngleDegrees * rad) / 20,
  playerHeight: 1.8,
  playerWidth: 0.9,
};
