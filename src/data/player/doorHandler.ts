import { GameMap, MovingItem } from '../gameMap';
import Ray from '../ray/ray';
import { CellHandler } from '../ray/rayHandler';
import { RayAction } from '../types';

export default class DoorHandler implements CellHandler {
  public door?: MovingItem;
  public platform?: MovingItem;
  private gameMap: GameMap;

  constructor(gameMap: GameMap) {
    this.gameMap = gameMap;
  }

  public handle(ray: Ray): RayAction {
    this.door = this.gameMap.doors.find((d) =>
      d.set.find(
        (s) => s.x === ray.cellPosition.x && s.y === ray.cellPosition.y
      )
    );
    if (this.door) {
      return RayAction.stop;
    }
    this.platform = this.gameMap.platforms.find((d) =>
      d.set.find(
        (s) => s.x === ray.cellPosition.x && s.y === ray.cellPosition.y
      )
    );
    return this.platform ? RayAction.stop : RayAction.continue;
  }
}
