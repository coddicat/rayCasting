import textureStore from '../texture/textureStore';
import {
  ItemSet,
  ItemSetByKey,
  Level,
  MapItem,
  MovingItem,
  Wall,
} from '../types';
import gridMap from './grid';
import { MapItemType, mapItemTypeKeys } from './mapItemType';
import { emptyItem } from './items/basic';
import { singleItems, itemsInSet, movingTypes } from './items';

export class GameMap {
  private mapData!: MapItem[][];
  private setsByKey!: ItemSetByKey[];

  private initTextures(arr: Level[] | Wall[]): void {
    for (const item of arr) {
      if (!item.texture) continue;
      const data = textureStore.getTextureData(item.texture.type);
      if (!data) continue;
      item.texture.setData(data);
    }
  }

  private getItem(strKey: string, x: number, y: number): MapItem {
    const key = mapItemTypeKeys.get(strKey);
    let item;
    if (key && itemsInSet.has(key)) {
      const itemSet = this.setsByKey.find((x) => x.type === key);
      const set = itemSet?.sets.find((d) =>
        d.set.find((s) => s.x === x && s.y === y)
      );
      item = set?.mapItem;
    } else {
      item = key && singleItems.get(key);
    }
    if (!item) item = emptyItem;

    this.initTextures(item.levels);
    this.initTextures(item.walls);
    item.levels.sort((a, b) => a.bottom - b.bottom);
    item.walls.sort((a, b) => a.bottom - b.bottom);
    return item;
  }

  public async init(): Promise<void> {
    const types = [...itemsInSet.keys()];
    this.setsByKey = [];
    types.forEach((type) => {
      const sets = this.findItemSets(type);
      this.setsByKey.push({
        type,
        sets,
      });
      this.initMovingItems(type, sets);
    });

    this.mapData = gridMap.map((row: string, y: number) =>
      [...row].map((c: string, x: number) => this.getItem(c, x, y))
    );
  }

  public check(cellPos: { x: number; y: number }): MapItem {
    if (cellPos.y < 0 || cellPos.y >= this.mapData.length || cellPos.x < 0) {
      return emptyItem;
    }
    if (cellPos.x >= this.mapData[cellPos.y].length) {
      return emptyItem;
    }
    return this.mapData[cellPos.y][cellPos.x];
  }

  private getItemSet(
    arr: boolean[][],
    typeCode: string,
    y: number,
    x: number
  ): { x: number; y: number }[] | null {
    if (arr[y] && arr[y][x]) return null;
    let res = null as null | { x: number; y: number }[];
    if (gridMap[y][x] === typeCode) {
      res = [{ x, y }];
      //right
      if (x + 1 < gridMap[y].length - 1) {
        const right = this.getItemSet(arr, typeCode, y, x + 1);
        if (right) {
          res = [...res, ...right];
        }
      }
      //down
      if (y + 1 < gridMap.length - 1) {
        const down = this.getItemSet(arr, typeCode, y + 1, x);
        if (down) {
          res = [...res, ...down];
        }
      }
    }

    if (!arr[y]) arr[y] = [];
    arr[y][x] = true;

    return res;
  }

  private findItemSets(type: MapItemType): ItemSet[] {
    const keyStr = [...mapItemTypeKeys.entries()].find(
      (x) => x[1] === type
    )?.[0];

    if (!keyStr) return [];

    const itemGenerator = itemsInSet.get(type);
    if (!itemGenerator) return [];

    const arr = [] as boolean[][];
    const res: ItemSet[] = [];

    for (let r = 0; r < gridMap.length; r++) {
      const row = gridMap[r];
      for (let c = 0; c < row.length; c++) {
        const set = this.getItemSet(arr, keyStr, r, c);
        if (set) {
          const item = itemGenerator(set.length, c, r);
          res.push({
            set: set,
            mapItem: item,
          });
        }
      }
    }

    // if (type === MapItemType.Door) {
    //   res.forEach((s) => {
    //     this.movingItems.push({
    //       set: s,
    //       timestamp: 0,
    //       state: true,
    //     });
    //   });
    // }

    return res;
  }

  private initMovingItems(type: MapItemType, sets: ItemSet[]): void {
    const props = movingTypes.get(type);
    if (!props) return;

    sets.forEach((s) => {
      this.movingItems.push(props.initMovingItem(s, props));
    });
  }

  public movingItems: MovingItem[] = [];
  private movingItem: MovingItem | null = null;

  public tickMovingItem(timestamp: number): boolean {
    if (!this.movingItem) return false;

    const t = timestamp - this.movingItem.timestamp;
    const finish = this.movingItem.props.tick(t, this.movingItem);

    if (finish) {
      this.movingItem = null;
    }

    return true;
  }

  public toggleMovingItem(item: MovingItem, timestamp: number): void {
    if (this.movingItem) return;
    this.movingItem = item;
    this.movingItem.timestamp = timestamp;
    this.movingItem.state = !this.movingItem.state;
  }
}
