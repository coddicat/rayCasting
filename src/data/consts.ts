const lookAngleDegrees = 60;
const lookWidth = 640;
const lookHeight = 480;
const rad = Math.PI / 180;
export default {
    lookWidth,
    lookHeight,
    halfLookHeight: lookHeight / 2,
    blockSize: 1,
    moveSpeed: 0.03,
    turnSpeed: 0.002,
    deep: 80,
    lookAngle: lookAngleDegrees * rad,
    lookMapStep: lookAngleDegrees * rad / 20,
    playerHeight: 1.8,
    imageDataWidth: lookWidth * 4,
}