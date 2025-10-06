type Visibility = "HIDDEN" | "SHOWN" | "FLAG";
type Action = "CHECK" | "FLAG";
type GameState = "ONGOING" | "WON" | "LOST" | "NOT_STARTED";
type Point = {x: number, y: number}
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
  }

  reset() {
    this.visibleGrid = createGrid(this.width, this.height, "HIDDEN");
    this.grid = createGrid(this.width, this.height, 0);
    this.numVisibleTiles = 0;
    this.gameState = "NOT_STARTED";
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
    }

    if (this.visibleGrid[y][x] === "HIDDEN") {
      this.visibleGrid[y][x] = "FLAG";
    }

    // cannot place flag on a shown tile
  }

  action(x: number, y: number, action: Action) {
    if (action === "CHECK") {
      if (this.visibleGrid[x][y] === "FLAG") {
        return;
      }
      this.check(x, y);
    }

    if (action === "FLAG") {
      this.placeFlag(x,y);
    }
  }

  check(x: number, y: number) {
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