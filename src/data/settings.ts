const rad = Math.PI / 180;
const lookAngleDegrees = 60;

const settings = {
  resolution: {
    width: 640,
    height: 480,
  },
  moveSpeed: 0.015,
  turnSpeed: 0.002,
  playerHeight: 1.8,
  playerWidth: 1.34,
  levelTexture: true,
  wallTexture: true,
  fixFact: 1,

  lookLength: 0,
  lookAngleDegrees: 0,
  lookAngle: 0,
  lookMapStep: 0,
  halfHeight: 0,
  maxLightFact: 0,
  maxBottom: 0,
  halfLookAngle: 0,
  buf8: new Uint8ClampedArray(),
  data: new Uint32Array(),
  angleStep: 0,
};

export function setLookLength(length: number): void {
  settings.lookLength = length;
  settings.maxLightFact = 255 / length;
}

export function setResolution(width: number, height: number): void {
  settings.resolution.width = width;
  settings.resolution.height = height;
  settings.halfHeight = height / 2;
  settings.maxBottom = height - 1;
  const buf = new ArrayBuffer(height * width * 4);
  settings.buf8 = new Uint8ClampedArray(buf);
  settings.data = new Uint32Array(buf);
  settings.angleStep = settings.lookAngle / width;
}

export function setLookAngle(degrees: number): void {
  settings.lookAngleDegrees = degrees;
  settings.lookAngle = lookAngleDegrees * rad;
  settings.lookMapStep = (lookAngleDegrees * rad) / 20;
  settings.halfLookAngle = settings.lookAngle / 2;
  settings.angleStep = settings.lookAngle / settings.resolution.width;
}

setLookLength(80);
setLookAngle(60);
setResolution(640, 480);

export default settings;
