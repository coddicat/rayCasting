const lookAngleDegrees = 60;
const lookWidth = 320;
const lookHeight = 240;
const rad = Math.PI / 180;
export default {
    rad,
    lookWidth,
    lookHeight,
    blockSize: 1,
    moveSpeed: 0.03,
    turnSpeed: 0.002,
    deep: 80,
    lookAngle: lookAngleDegrees * rad,
    lookMapStep: lookAngleDegrees * rad / 20,
    playerHeight: 1.8,
}