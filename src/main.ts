import "./resources/style.css";

import { MineSweeper } from "./minesweeper.ts";
import { init } from "./minesweeper-ui.ts";

const app = document.getElementById("app")!;
const m = new MineSweeper(25, 25, 60);
init(m.getWidth(), m.getHeight(), app, m);

// m.check(Math.floor(m.width / 2), Math.floor(m.width / 2));
// m.printGrid();
// console.log("========Shown:=========");
// m.printVisibleGrid();
