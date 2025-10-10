type Visibility = "HIDDEN" | "SHOWN" | "FLAG";
type Action = "CHECK" | "FLAG";
type GameState = "ONGOING" | "WON" | "LOST" | "NOT_STARTED";
export type Point = {x: number, y: number}
const MINE = -1;

// TODO: needs a lot of refactoring


function createGrid<T>(width: number, height: number, base: T): Array<Array<T>> {
  const ret = new Array<Array<T>>();
  for (let i = 0; i < height; i++) {
    ret.push(new Array<T>());
    for (let j = 0; j < width; j++) {
      ret[i].push(base);
    }
  }

  return ret;
}

class MineGrid {
  private grid: number[][];
  private width: number;
  private height: number;
  private numMines: number;

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  getNumMines() {
    return this.numMines;
  }

  constructor(width: number, height: number, numMines: number) {
    this.width = width;
    this.height = height;
    this.numMines = numMines;

    this.grid = createGrid(width, height, 0);
  }

  getMineValueAt(point: Point) {
    return this.grid[point.y][point.x];
  }

  generateMines(startingPoint: Point) {
    const xSlack = 3;
    const ySlack = 3;

    for (let i = 0; i < this.numMines; i++) {
      let found = false;
      while (!found) {
        found = true;
        let randX = Math.floor(Math.random() * this.width);
        let randY = Math.floor(Math.random() * this.height);
        // let area within ~3 of starting be clear
        if (Math.abs(randX - startingPoint.x) <= xSlack && Math.abs(randY - startingPoint.y) <= ySlack) {
          found = false;
        }

        if (this.grid[randY][randX] === MINE) {
          found = false;
        }

        if (found) {
          // place mine and increment tiles
          this.placeMine({x: randX, y: randY});
        }
      }
    }
  }

  private placeMine(point: Point) {
    this.grid[point.y][point.x] = MINE;
    if (point.x !== 0) {
      this.incrementIfNotMine(point.x - 1, point.y);
      if (point.y !== 0) {
        this.incrementIfNotMine(point.x - 1, point.y - 1);
      }
      if (point.y !== this.height - 1) {
        this.incrementIfNotMine(point.x - 1, point.y + 1);
      }
    }
    if (point.x !== this.width - 1) {
      this.incrementIfNotMine(point.x + 1, point.y);
      if (point.y !== 0) {
        this.incrementIfNotMine(point.x+1, point.y -1);
      }
      if (point.y !== this.height - 1) {
        this.incrementIfNotMine(point.x + 1, point.y + 1);
      }
    }
    if (point.y !== 0) {
      this.incrementIfNotMine(point.x, point.y - 1);
    }
    if (point.y !== this.height - 1) {
      this.incrementIfNotMine(point.x, point.y + 1);
    }
  }

  private incrementIfNotMine(x: number, y: number) {
    if (this.grid[y][x] !== MINE) {
      this.grid[y][x] += 1;
    }
  }

  reset() {
    this.grid = createGrid(this.width, this.height, 0);
  }
}

class VisibilityGrid {
  private grid: Visibility[][];
  private width: number;
  private height: number;
  private shownTiles: number

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  getShownTiles() {
    return this.shownTiles;
  }

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.shownTiles = 0;

    this.grid = createGrid(width, height, "HIDDEN");
  }

  setVisibilityAt(point: Point, vis: Visibility): void {
    const previousVisibilty = this.grid[point.y][point.x];
    if (vis === "SHOWN" && previousVisibilty !== "SHOWN") {
      this.shownTiles++;
    }
    this.grid[point.y][point.x] = vis;
  }

  getVisibilityAt(point: Point): Visibility {
    return this.grid[point.y][point.x];
  }

  reset() {
    this.grid = createGrid(this.width, this.height, "HIDDEN");
    this.shownTiles = 0;
  }
}

// class should handle grid ops?
// what class should handle telling the UI to update?
// need a better api for the game

// Minesweeper
// game is won when shown tiles == width*height - num mines
// game is lost when mine is shown
// player can
// 1. reveal tile
// 2. place flag on hidden space
// 3. click area with flags and reveal hidden tiles (do this later)
// need 3 functions for this.

export interface TileObserver {
  update(s: string): void;
  coords(): Point;
}

class ObserverList {
  private observers: (TileObserver|undefined)[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.observers = createGrid(width, height, undefined);
  }

  addObserver(t: TileObserver) {
    const coords = t.coords();
    this.observers[coords.y][coords.x] = t;
  }

  getObserver(p: Point) {
    return this.observers[p.y][p.x];
  }

  updateObserver(p: Point, args: string) {
    const observer = this.observers[p.y][p.x];
    if (observer !== undefined) {
      observer.update(args);
    }
  }
}

class CombinedGrid {
  private mineGrid: MineGrid;
  private visibilityGrid: VisibilityGrid;
  private observers: ObserverList;

  getWidth() {
    return this.mineGrid.getWidth();
  }

  getHeight() {
    return this.mineGrid.getHeight();
  }

  getNumMines() {
    return this.mineGrid.getNumMines();
  }

  getNumTiles() {
    return this.mineGrid.getWidth() * this.mineGrid.getHeight();
  }

  getShownTiles() {
    return this.visibilityGrid.getShownTiles();
  }

  constructor(width: number, height: number, numMines: number) {
    this.mineGrid = new MineGrid(width, height, numMines);
    this.visibilityGrid = new VisibilityGrid(width, height);
    this.observers = new ObserverList(width, height);
  }
  
  updateVisibility(point: Point) {
    if (this.mineGrid.getMineValueAt(point) === MINE) {
      this.visibilityGrid.setVisibilityAt(point, "SHOWN");
      const mineValue = this.mineGrid.getMineValueAt(point).toString();
      this.observers.updateObserver(point, mineValue);
      return;
    }

    const queue = new Array<Point>();
    queue.push(point);
    while (queue.length > 0) {
      const currentPoint = queue.shift()!;
      if (this.mineGrid.getMineValueAt(currentPoint) === 0) {
        this.enqueueSurroundings(queue, currentPoint);
      }

      this.visibilityGrid.setVisibilityAt(currentPoint, "SHOWN");
      const mineValue = this.mineGrid.getMineValueAt(currentPoint).toString();
      this.observers.updateObserver(currentPoint, mineValue);
    }
  }

  private enqueueSurroundings(queue: Array<Point>, p: Point) {
    const checkInBoundsAndPushBound = this.checkInBoundsAndPush.bind(this, queue);
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y});
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y + 1});
    checkInBoundsAndPushBound({x: p.x, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x, y: p.y + 1});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y + 1});
  }

  private checkInBoundsAndPush(queue: Array<Point>, p: Point) {
    if (this.isInBounds(p) && this.visibilityGrid.getVisibilityAt(p) === "HIDDEN") {
      queue.push({x: p.x, y: p.y});
    }
  }

  isInBounds(point: Point): boolean {
    // this might need to be refactored into MineGrid?
    return !(point.x < 0 || point.x >= this.getWidth() || point.y < 0 || point.y >= this.getHeight());
  }

  register(t: TileObserver) {
    this.observers.addObserver(t);
  }

  reset() {
    this.mineGrid.reset();
    this.visibilityGrid.reset();
  }
}

export class MineSweeper {
  width: number;
  height: number;
  grid: number[][];
  visibleGrid: Visibility[][];
  numVisibleTiles: number;
  numMines: number;
  xSlack: number;
  ySlack: number;
  gameState: GameState;
  observers: (TileObserver|undefined)[][]


  constructor(width: number, height:number, numMines:number) {
    this.width = width
    this.height = height;
    this.numMines = numMines;
    this.visibleGrid = createGrid(width, height, "HIDDEN");
    this.grid = createGrid(width, height, 0);
    this.xSlack = 2;
    this.ySlack = 2;
    this.numVisibleTiles = 0;
    this.gameState = "NOT_STARTED";
    this.observers = createGrid(width, height, undefined);
  }

  reset() {
    this.visibleGrid = createGrid(this.width, this.height, "HIDDEN");
    this.grid = createGrid(this.width, this.height, 0);
    this.numVisibleTiles = 0;
    this.gameState = "NOT_STARTED";
  }

  register(t: TileObserver) {
    const coords = t.coords();
    this.observers[coords.y][coords.x] = t;
  }

  private incrementIfNotMine(x: number, y: number) {
    if (this.grid[y][x] !== MINE) {
      this.grid[y][x] += 1;
    }
  }

  private placeMine(mineX: number, mineY: number) {
    this.grid[mineY][mineX] = MINE;
    if (mineX !== 0) {
      this.incrementIfNotMine(mineX - 1, mineY);
      if (mineY !== 0) {
        this.incrementIfNotMine(mineX - 1, mineY - 1);
      }
      if (mineY !== this.height - 1) {
        this.incrementIfNotMine(mineX - 1, mineY + 1);
      }
    }
    if (mineX !== this.width - 1) {
      this.incrementIfNotMine(mineX + 1, mineY);
      if (mineY !== 0) {
        this.incrementIfNotMine(mineX+1, mineY -1);
      }
      if (mineY !== this.height - 1) {
        this.incrementIfNotMine(mineX + 1, mineY + 1);
      }
    }
    if (mineY !== 0) {
      this.incrementIfNotMine(mineX, mineY - 1);
    }
    if (mineY !== this.height - 1) {
      this.incrementIfNotMine(mineX, mineY + 1);
    }
  }

  private generateGrid(x: number, y: number) {
    for (let i = 0; i < this.numMines; i++) {
      let found = false;
      do {
        found = true;
        let randX = Math.floor(Math.random() * this.width);
        let randY = Math.floor(Math.random() * this.height);
        // let area within ~3 of starting be clear
        if (Math.abs(randX - x) <= this.xSlack && Math.abs(randY -y) <= this.ySlack) {
          found = false;
        }

        if (this.grid[randY][randX] === MINE) {
          found = false;
        }

        if (found) {
          // place mine and increment tiles
          this.placeMine(randX, randY);
        }
      } while (!found);
    }
  }

  private isInBounds(x: number, y:number): boolean {
    return !(x < 0 || x >= this.width || y < 0 || y >= this.height);
  }

  private getNumberOrOutOfBounds(x: number, y: number): number|undefined {
    if (!this.isInBounds(x,y)) {
      return undefined;
    }
    return this.grid[y][x];
  }

  private checkInBoundsAndPush(queue: Array<Point>, p: Point) {
    if (this.isInBounds(p.x, p.y) && this.visibleGrid[p.y][p.x] === "HIDDEN") {
      queue.push({x: p.x, y: p.y});
    }
  }

  private enqueueSurroundings(queue: Array<Point>, p: Point) {
    const checkInBoundsAndPushBound = this.checkInBoundsAndPush.bind(this, queue);
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y});
    checkInBoundsAndPushBound({x: p.x - 1, y: p.y + 1});
    checkInBoundsAndPushBound({x: p.x, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x, y: p.y + 1});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y - 1});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y});
    checkInBoundsAndPushBound({x: p.x + 1, y: p.y + 1});
  }

  private updateVisibility(x: number, y: number) {
    if (this.grid[y][x] === MINE) {
      this.visibleGrid[y][x] = "SHOWN";
      const tile = this.observers[y][x]
      tile?.update(this.grid[y][x].toString());
      return;
    }

    const queue = new Array<Point>();
    queue.push({x:x, y:y});
    while (queue.length > 0) {
      const p = queue.shift()!;
      if (this.grid[p.y][p.x] === 0) {
        this.enqueueSurroundings(queue, p);
      }

      this.visibleGrid[p.y][p.x] = "SHOWN";
      const tile = this.observers[p.y][p.x]
      tile?.update(this.grid[p.y][p.x].toString());
      this.numVisibleTiles += 1;
    }
  }

  private getGridCharacter(x: number, y: number): string {
    const c = this.grid[y][x];
    switch(c) {
      case MINE:
        return 'm';
      case 0:
        return '.'
      default:
        return c.toString();
    }
  }

  printGrid() {
    let str = '';
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        str += this.getGridCharacter(j, i);
      }
      str += '\n';
    }
    console.log(str);
  }

  printVisibleGrid() {
    let str = '';
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        const visibility = this.visibleGrid[i][j];
        if (visibility === "HIDDEN") {
          str += "#";
        }
        else if (visibility === "FLAG") {
          str += "F";
        }
        else {
          str += this.getGridCharacter(j, i);
        }
      }
      str += '\n';
    }

    console.log(str);
  }

  private placeFlag(x: number, y: number) {
    if (this.visibleGrid[y][x] === "FLAG") {
      this.visibleGrid[y][x] = "HIDDEN";
      const tile = this.observers[y][x];
      tile?.update(" ");
      return;
    }

    if (this.visibleGrid[y][x] === "HIDDEN") {
      this.visibleGrid[y][x] = "FLAG";
      const tile = this.observers[y][x]
      tile?.update("F")
    }

    // cannot place flag on a shown tile
  }

  action(x: number, y: number, action: Action) {
    if (action === "CHECK") {
      if (this.visibleGrid[y][x] === "FLAG") {
        return;
      }
      this.check(x, y);
    }

    if (action === "FLAG") {
      this.placeFlag(x,y);
    }
  }

  check(x: number, y: number) {
    if (this.gameState === "LOST") {
      return;
    }
    
    if (this.gameState === "NOT_STARTED") {
      this.gameState = "ONGOING";
      this.generateGrid(x, y);
    }

    this.updateVisibility(x, y);

    if (this.grid[y][x] === MINE) {
      this.gameState = "LOST";
      return;
    }

    if (this.numVisibleTiles === this.width * this.height - this.numMines) {
      this.gameState = "WON";
    }
  }

  hasLost(): boolean {
    return this.gameState === "LOST";
  }

  hasWon(): boolean {
    return this.gameState === "WON";
  }
}

const m = new MineSweeper(10, 10, 3);