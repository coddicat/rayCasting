import { SpriteData } from "./types";

const getDukeFrontUrl = () => require("../assets/duke_front.png");
const getWallBriksUrl = () => require("../assets/wall_briks.png");
const getFloor1Url = () => require("../assets/floor1.png");

function loadSprite(url: string): Promise<SpriteData> {
  const canvas = document.createElement("canvas") as HTMLCanvasElement;
  const img = new Image();
  img.src = url;
  return new Promise<SpriteData>((resolve) => {
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        throw "Unable to get context";
      }

      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = new Uint32Array(imageData.data.buffer);
      resolve({
        data,
        width: img.width,
        height: img.height,
      });
    };
  });
}

export const getDukeFrontSpriteData = () => loadSprite(getDukeFrontUrl());
export const getWallBriksSpriteData = () => loadSprite(getWallBriksUrl());
export const getFloor1SpriteData = () => loadSprite(getFloor1Url());
