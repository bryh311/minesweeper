import "./resources/style.css";

import { MineSweeper } from "./minesweeper.ts";
import { init } from "./minesweeper-ui.ts";

const app = document.getElementById("app")!;
const m = new MineSweeper(20, 20, 10);
init(20, 20, app, m);

// m.check(Math.floor(m.width / 2), Math.floor(m.width / 2));
// m.printGrid();
// console.log("========Shown:=========");
// m.printVisibleGrid();
