import Ray from './ray/ray';
import { Wall } from './types';

export const painter = {
  top: 0,
  bottom: 0,
  dataIndex: 0,
  alphaMask: 0,

  hRate: 0,
  index: 0,
  pixel: 0,

  dist: 0,
  diff: 0,
  sideX: 0,
  spriteX: 0,
  spriteY: 0,
  fixedX: 0,

  fixSinDiff: 0,
  fixCosDiff: 0,

  side: 0,
};

export const render = {
  light: 0,
  fact: 0,
  a: 0,
  s: 0,
  repeatX: 0,
  startY: 0,
  startX: 0,
  sideX: 0,

  y0: 0,
  y1: 0,
};

export const rayHandler = {
  dx: 0,
  dy: 0,
  rayDistance: 0,
  distance: 0,
  sideDistance: 0,
  spriteX: 0,
};
