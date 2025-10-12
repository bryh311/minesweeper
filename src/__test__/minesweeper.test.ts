import { beforeEach, describe, expect, it, vitest } from "vitest";
import {
  MineSweeper,
  ObserverList,
  PointQueue,
  VisibilityGrid,
  type TileObserver,
} from "../minesweeper";

describe("minesweeper", () => {
  describe("basics", () => {
    it("initializes correctly", () => {
      let width = 20;
      let height = 20;
      let num_mines = 20;
      const m = new MineSweeper(width, height, num_mines);
      expect(m.getHeight()).eq(height);
      expect(m.getWidth()).eq(width);
      expect(m.getNumMines()).eq(num_mines);
    });
  });
});

describe("VisibilityGrid", () => {
  let grid: VisibilityGrid;
  const width = 10;
  const height = 10;
  const maxFlags = 10;
  beforeEach(() => {
    grid = new VisibilityGrid(width, height, maxFlags);
  });

  it("initializes", () => {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        expect(grid.getVisibilityAt({ x: i, y: j })).eq("HIDDEN");
      }
    }
  });

  it("sets a tile to a flag", () => {
    let p = { x: 5, y: 5 };
    grid.setVisibilityAt(p, "FLAG");
    expect(grid.getFlaggedTiles()).eq(1);
    expect(grid.getShownTiles()).eq(0);
  });

  it("makes a tile visibile", () => {
    let p = { x: 5, y: 5 };
    grid.setVisibilityAt(p, "SHOWN");
    expect(grid.getShownTiles()).eq(1);
    expect(grid.getFlaggedTiles()).eq(0);
  });

  it("updates num flags when they're removed", () => {
    let p = { x: 5, y: 5 };
    grid.setVisibilityAt(p, "FLAG");
    grid.setVisibilityAt(p, "HIDDEN");
    expect(grid.getFlaggedTiles()).eq(0);
  });

  it("toggles a flag", () => {
    let p = { x: 5, y: 5 };
    grid.toggleFlag(p);
    expect(grid.getFlaggedTiles()).eq(1);
    expect(grid.getVisibilityAt(p)).eq("FLAG");
    grid.toggleFlag(p);
    expect(grid.getFlaggedTiles()).eq(0);
    expect(grid.getVisibilityAt(p)).eq("HIDDEN");
  });
});

describe("PointQueue", () => {
  let queue: PointQueue;

  beforeEach(() => {
    queue = new PointQueue();
  });

  it("enqueues", () => {
    let p = { x: 1, y: 1 };
    queue.enqueue(p);
    expect(queue.length()).eq(1);
  });

  it("dequeues", () => {
    let p = { x: 1, y: 1 };
    queue.enqueue(p);
    expect(queue.length()).eq(1);
    let q = queue.dequeue();
    expect(q).eq(p);
  });

  it("doesn't enqueue the same thing twice", () => {
    let p = { x: 1, y: 1 };
    queue.enqueue(p);
    queue.enqueue(p);
    expect(queue.length()).eq(1);
  });
});

describe("ObserverList", () => {
  let list: ObserverList;
  let height = 10;
  let width = 10;

  const createStubTileObserver = (x: number, y: number): TileObserver => {
    return {
      coords: () => {
        return { x: x, y: y };
      },
      update: (s: string) => {
        return s;
      },
    };
  };

  beforeEach(() => {
    list = new ObserverList(width, height);
  });

  it("adds an observer", () => {
    const stubObserver = createStubTileObserver(1, 1);
    list.addObserver(stubObserver);
    expect(list.getObserver(stubObserver.coords())).eq(stubObserver);
  });

  describe("observer calling", () => {
    let stubObserver: TileObserver;
    let mockUpdateFunc = vitest.fn();

    beforeEach(() => {
      mockUpdateFunc.mockReset();
      stubObserver = createStubTileObserver(1, 1);
      stubObserver.update = mockUpdateFunc;
      list.addObserver(stubObserver);
    });

    it("calls an observer", () => {
      const args = "aaaa";
      list.updateObserver(stubObserver.coords(), args);
      expect(mockUpdateFunc).toBeCalledWith(args);
    });

    it("resets all observers", () => {
      list.reset();
      expect(mockUpdateFunc).toBeCalledWith("");
    });
  });
});
