const lookAngleDegrees = 60;
const lookWidth = 800;
const lookHeight = 600;
const rad = Math.PI / 180;
export default {
  rad,
  lookWidth,
  lookHeight,
  blockSize: 1,
  moveSpeed: 0.02,
  turnSpeed: 0.002,
  deep: 80,
  lookAngle: lookAngleDegrees * rad,
  lookMapStep: (lookAngleDegrees * rad) / 20,
  playerHeight: 1.8,
  playerWidth: 0.9,
};
