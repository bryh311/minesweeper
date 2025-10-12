import { beforeEach, describe, expect, it } from "vitest";
import { MineSweeper, VisibilityGrid } from "../minesweeper";

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
