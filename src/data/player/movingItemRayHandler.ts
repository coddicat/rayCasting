import { GameMap } from '../gameMap/gameMap';
import Ray from '../ray/ray';
//import { CellHandler } from '../ray/rayHandler';
import { MovingItem, RayAction } from '../types';

export default class MovingItemRayHandler {
  public item?: MovingItem;
  private gameMap: GameMap;

  constructor(gameMap: GameMap) {
    this.gameMap = gameMap;
  }

  public handle(ray: Ray): RayAction {
    this.item = this.gameMap.movingItems.find((d) =>
      d.set.set.find(
        (s) => s.x === ray.cellPosition.x && s.y === ray.cellPosition.y
      )
    );
    if (this.item) {
      return RayAction.stop;
    }
    return RayAction.continue;
  }
}
