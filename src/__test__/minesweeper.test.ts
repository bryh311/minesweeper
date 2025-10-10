import { beforeEach, describe, expect, it } from "vitest";
import { MineSweeper } from "../minesweeper";

describe("minesweeper", () => {
  describe("basics", () => {
    it("initializes correctly", () => {
      let width = 20;
      let height = 20;
      let num_mines = 20;
      const m = new MineSweeper(width, height, num_mines);
      expect(m.height).eq(height);
      expect(m.width).eq(width);
      expect(m.numMines).eq(num_mines);      
    })

    it("generates a correct random assortment of mines", () => {
      
    })
  })
})