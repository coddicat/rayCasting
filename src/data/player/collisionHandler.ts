import { GameMap } from '../gameMap/gameMap';
import Ray from '../ray/ray';
import { CellHandler } from '../ray/rayHandler';
import { Position, RayAction } from '../types';
import PlayerState from './playerState';

export default class CollisionHandler implements CellHandler {
  private state: PlayerState;
  private gameMap: GameMap;

  constructor(state: PlayerState, gameMap: GameMap) {
    this.state = state;
    this.gameMap = gameMap;
  }

  private checkMoveCollision(cellPos: Position): RayAction {
    const item = this.gameMap.check(cellPos);
    if (!item || !item.walls.length) return RayAction.continue;
    const top = this.state.position.z + this.state.height;
    const bottom = this.state.position.z;
    const collisions = item.walls.filter(
      (x) => top > x.bottom && bottom < x.top
    );

    if (collisions.length > 0) {
      const max = Math.max.apply(
        null,
        collisions.map((x) => x.top)
      );
      if (max <= bottom + 0.301) {
        this.state.position.z = max;
        this.state.lookZ = max + this.state.lookHeight;
        this.state.top = max + this.state.height;
        return RayAction.continue;
      }
    }

    return collisions.length > 0 ? RayAction.stop : RayAction.continue;
  }

  public handle(ray: Ray): RayAction {
    return ray.cellPosition.x <= 0 || ray.cellPosition.y <= 0
      ? RayAction.stop
      : this.checkMoveCollision(ray.cellPosition);
  }
}
