import TextureSet from '@/data/texture/textureSet';
import { TextureType } from '../../texture/textureStore';

export default (repeatX: number, startX: number, startY: number) => ({
  walls: [
    {
      color: 0xc8c8dc,
      top: 5,
      bottom: 0,
      render: true,
      texture: new TextureSet(
        TextureType.WelcomeWall,
        5,
        startX,
        startY,
        repeatX,
        false
      ),
    },
  ],
  levels: [],
  stopRay: false,
});
