type Visibility = "HIDDEN" | "SHOWN" | "FLAG";
type GameState = "ONGOING" | "WON" | "LOST" | "NOT_STARTED";
export type Point = { x: number; y: number };
const MINE = -1;

// TODO: needs a lot of refactoring

function createGrid<T>(
  width: number,
  height: number,
  base: T
): Array<Array<T>> {
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
    const xSlack = Math.round(Math.random()) + 1;
    const ySlack = Math.round(Math.random()) + 1;

    for (let i = 0; i < this.numMines; i++) {
      let found = false;
      while (!found) {
        found = true;
        let randX = Math.floor(Math.random() * this.width);
        let randY = Math.floor(Math.random() * this.height);
        // let area within ~3 of starting be clear
        if (
          Math.abs(randX - startingPoint.x) <= xSlack &&
          Math.abs(randY - startingPoint.y) <= ySlack
        ) {
          found = false;
        }

        if (this.grid[randY][randX] === MINE) {
          found = false;
        }

        if (found) {
          // place mine and increment tiles
          this.placeMine({ x: randX, y: randY });
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
        this.incrementIfNotMine(point.x + 1, point.y - 1);
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

  getMineLocations(): Point[] {
    const ret = [];
    for (let i = 0; i < this.height; i++) {
      for (let j = 0; j < this.width; j++) {
        if (this.grid[i][j] === MINE) {
          ret.push({ x: j, y: i });
        }
      }
    }
    return ret;
  }

  reset() {
    this.grid = createGrid(this.width, this.height, 0);
  }
}

export class VisibilityGrid {
  private grid: Visibility[][];
  private width: number;
  private height: number;
  private shownTiles: number;
  private flaggedTiles: number;
  private maxFlaggedTiles: number;

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  getShownTiles() {
    return this.shownTiles;
  }

  getFlaggedTiles() {
    return this.flaggedTiles;
  }

  getMaxFlaggedTiles() {
    return this.maxFlaggedTiles;
  }

  constructor(width: number, height: number, maxFlaggedTiles: number) {
    this.width = width;
    this.height = height;
    this.shownTiles = 0;
    this.maxFlaggedTiles = maxFlaggedTiles;
    this.flaggedTiles = 0;

    this.grid = createGrid(width, height, "HIDDEN");
  }

  setVisibilityAt(point: Point, vis: Visibility): void {
    const previousVisibilty = this.grid[point.y][point.x];
    if (vis === "SHOWN" && previousVisibilty !== "SHOWN") {
      this.shownTiles++;
    }

    if (vis === "FLAG" && previousVisibilty !== "FLAG") {
      if (previousVisibilty === "SHOWN") {
        return;
      }
      if (this.flaggedTiles === this.maxFlaggedTiles) {
        return;
      }
      this.flaggedTiles++;
    }

    if (previousVisibilty === "FLAG") {
      this.flaggedTiles--;
    }

    this.grid[point.y][point.x] = vis;
  }

  getVisibilityAt(point: Point): Visibility {
    return this.grid[point.y][point.x];
  }

  toggleFlag(point: Point): Visibility {
    const flagVal = this.getVisibilityAt(point);
    if (flagVal === "HIDDEN") {
      this.setVisibilityAt(point, "FLAG");
      return "FLAG";
    }

    if (flagVal === "FLAG") {
      this.setVisibilityAt(point, "HIDDEN");
      return "HIDDEN";
    }

    return "SHOWN";
  }

  reset() {
    this.grid = createGrid(this.width, this.height, "HIDDEN");
    this.shownTiles = 0;
    this.flaggedTiles = 0;
  }
}

export interface TileObserver {
  update(s: string): void;
  coords(): Point;
}

export class ObserverList {
  private observers: (TileObserver | undefined)[][];

  constructor(width: number, height: number) {
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

  reset() {
    for (let i = 0; i < this.observers.length; i++) {
      for (let j = 0; j < this.observers[i].length; j++) {
        this.updateObserver({ x: j, y: i }, "");
      }
    }
  }
}

export class PointQueue {
  private queue: Point[];
  private seen: Set<string>;

  constructor() {
    this.queue = new Array();
    this.seen = new Set();
  }

  enqueue(point: Point) {
    const pointStr = `${point.x}-${point.y}`;
    if (!this.seen.has(pointStr)) {
      this.seen.add(pointStr);
      this.queue.push(point);
    }
  }

  dequeue() {
    return this.queue.shift();
  }

  length() {
    return this.queue.length;
  }

  isEmpty() {
    return this.length() === 0;
  }
}

export class GridLogic {
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

  updateObserver(p: Point, args: string) {
    this.observers.updateObserver(p, args);
  }

  constructor(width: number, height: number, numMines: number) {
    this.mineGrid = new MineGrid(width, height, numMines);
    this.visibilityGrid = new VisibilityGrid(width, height, numMines);
    this.observers = new ObserverList(width, height);
  }

  updateVisibility(point: Point) {
    if (this.mineGrid.getMineValueAt(point) === MINE) {
      this.visibilityGrid.setVisibilityAt(point, "SHOWN");
      const mineValue = this.mineGrid.getMineValueAt(point).toString();
      this.observers.updateObserver(point, mineValue);
      return;
    }

    const queue = new PointQueue();
    queue.enqueue(point);
    while (!queue.isEmpty()) {
      const currentPoint = queue.dequeue()!;
      if (this.mineGrid.getMineValueAt(currentPoint) === 0) {
        this.enqueueSurroundings(queue, currentPoint);
      }

      this.visibilityGrid.setVisibilityAt(currentPoint, "SHOWN");
      const mineValue = this.mineGrid.getMineValueAt(currentPoint).toString();
      this.observers.updateObserver(currentPoint, mineValue);
    }
  }

  private enqueueSurroundings(queue: PointQueue, p: Point) {
    const neighbors = this.getNeighbors(p);
    const hiddenNeighbors = neighbors.filter(
      (p) => this.visibilityGrid.getVisibilityAt(p) === "HIDDEN"
    );
    for (const hiddenNeighbor of hiddenNeighbors) {
      queue.enqueue(hiddenNeighbor);
    }
  }

  private checkInBoundsAndPush(arr: Point[], p: Point) {
    if (this.isInBounds(p)) {
      arr.push({ x: p.x, y: p.y });
    }
  }

  isInBounds(point: Point): boolean {
    // this might need to be refactored into MineGrid?
    return !(
      point.x < 0 ||
      point.x >= this.getWidth() ||
      point.y < 0 ||
      point.y >= this.getHeight()
    );
  }

  isMine(point: Point): boolean {
    return this.mineGrid.getMineValueAt(point) === MINE;
  }

  generateMines(point: Point) {
    this.mineGrid.generateMines(point);
  }

  toggleFlagAndSendSignal(point: Point) {
    const flagval = this.visibilityGrid.toggleFlag(point);
    if (flagval === "FLAG") {
      this.observers.updateObserver(point, "F");
    }
    if (flagval === "HIDDEN") {
      this.observers.updateObserver(point, "");
    }
  }

  isFlag(point: Point): boolean {
    return this.visibilityGrid.getVisibilityAt(point) === "FLAG";
  }

  isShown(point: Point): boolean {
    return this.visibilityGrid.getVisibilityAt(point) === "SHOWN";
  }

  isHidden(point: Point): boolean {
    return this.visibilityGrid.getVisibilityAt(point) === "HIDDEN";
  }

  register(t: TileObserver) {
    this.observers.addObserver(t);
  }

  showAllMines() {
    const mineLocations = this.mineGrid.getMineLocations();
    for (let mineLocation of mineLocations) {
      this.visibilityGrid.setVisibilityAt(mineLocation, "SHOWN");
      this.observers.updateObserver(mineLocation, "-1");
    }
  }

  getHiddenNeighborsIfFlagConstraintsMet(point: Point) {
    const neighbors = this.getNeighbors(point);
    const numMines = this.mineGrid.getMineValueAt(point);
    let neighborFlags = 0;
    for (const neighbor of neighbors) {
      if (this.visibilityGrid.getVisibilityAt(neighbor) === "FLAG") {
        neighborFlags++;
      }
    }
    if (neighborFlags < numMines) {
      return [];
    }

    return this.getHiddenNeighbors(point);
  }

  getHiddenNeighbors(p :Point) {
    const neighbors = this.getNeighbors(p);
    const ret: Point[] = [];
    for (const neighbor of neighbors) {
      if (this.visibilityGrid.getVisibilityAt(neighbor) === "HIDDEN") {
        ret.push(neighbor);
      }
    }
    return ret;
  }

  getNeighbors(p: Point): Point[] {
    const ret: Point[] = [];
    const checkInBoundsAndPushBound = this.checkInBoundsAndPush.bind(this, ret);
    checkInBoundsAndPushBound({ x: p.x - 1, y: p.y - 1 });
    checkInBoundsAndPushBound({ x: p.x - 1, y: p.y });
    checkInBoundsAndPushBound({ x: p.x - 1, y: p.y + 1 });
    checkInBoundsAndPushBound({ x: p.x, y: p.y - 1 });
    checkInBoundsAndPushBound({ x: p.x, y: p.y + 1 });
    checkInBoundsAndPushBound({ x: p.x + 1, y: p.y - 1 });
    checkInBoundsAndPushBound({ x: p.x + 1, y: p.y });
    checkInBoundsAndPushBound({ x: p.x + 1, y: p.y + 1 });
    return ret;
  }

  reset() {
    this.mineGrid.reset();
    this.visibilityGrid.reset();
    this.observers.reset();
  }
}

export class MineSweeper {
  private grid: GridLogic;
  private gameState: GameState;

  getGameState(): GameState {
    return this.gameState;
  }

  getHeight() {
    return this.grid.getHeight();
  }

  getWidth() {
    return this.grid.getWidth();
  }

  getNumMines() {
    return this.grid.getNumMines();
  }

  constructor(width: number, height: number, numMines: number) {
    this.grid = new GridLogic(width, height, numMines);
    this.gameState = "NOT_STARTED";
  }

  check(location: Point) {
    if (this.gameState === "LOST" || this.gameState === "WON") {
      return;
    }

    if (this.grid.isFlag(location)) {
      return;
    }

    if (this.gameState === "NOT_STARTED") {
      this.grid.generateMines(location);
      this.gameState = "ONGOING";
    }

    if (this.grid.isShown(location)) {
      const hiddenNeighbors =
        this.grid.getHiddenNeighborsIfFlagConstraintsMet(location);
      for (let hiddenNeighbor of hiddenNeighbors) {
        this.grid.updateVisibility(hiddenNeighbor);
        if (this.checkWinOrLose(hiddenNeighbor) === "LOST") {
          return;
        }
      }
    } else {
      this.grid.updateVisibility(location);
      this.checkWinOrLose(location);
    }
  }

  private checkWinOrLose(location: Point): GameState {
    if (this.grid.isMine(location)) {
      this.gameState = "LOST";
      this.grid.showAllMines();
    } else {
      const totalNonMineTiles =
        this.grid.getNumTiles() - this.grid.getNumMines();
      const totalShownTiles = this.grid.getShownTiles();
      if (totalNonMineTiles === totalShownTiles) {
        this.gameState = "WON";
      }
    }
    return this.gameState;
  }

  flag(location: Point) {
    if (this.gameState === "LOST" || this.gameState === "WON") {
      return;
    }
    this.grid.toggleFlagAndSendSignal(location);
  }

  handleButtonPressed(location: Point) {
    if (this.grid.isShown(location)) {
      const hiddenNeighbors = this.grid.getHiddenNeighbors(location);
      for (const neighbor of hiddenNeighbors) {
        this.grid.updateObserver(neighbor, "0");
      }
    }
    else if (this.grid.isHidden(location) && (this.gameState === "ONGOING" || this.gameState === "NOT_STARTED")) {
      this.grid.updateObserver(location, "0");
    }
  }

  handleButtonReleased(location: Point) {
    if (this.grid.isShown(location)) {
      const hiddenNeighbors = this.grid.getHiddenNeighbors(location);
      for (const neighbor of hiddenNeighbors) {
        this.grid.updateObserver(neighbor, "");
      }
    }
    else if (this.grid.isHidden(location)) {
      this.grid.updateObserver(location, "");
    }
  }

  register(t: TileObserver) {
    this.grid.register(t);
  }

  reset() {
    this.grid.reset();
    this.gameState = "NOT_STARTED";
  }
}
