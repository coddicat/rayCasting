const lookAngleDegrees = 60;
const resolution = {
  width: 300,
  height: 200,
};
const rad = Math.PI / 180;

export default {
  resolution,
  moveSpeed: 0.015,
  turnSpeed: 0.002,
  lookLength: 80,
  lookAngle: lookAngleDegrees * rad,
  lookMapStep: (lookAngleDegrees * rad) / 20,
  playerHeight: 1.8,
  playerWidth: 0.9,
};
