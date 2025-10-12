import "./resources/style.css";

import { MineSweeper } from "./minesweeper.ts";
import { init } from "./minesweeper-ui.ts";

const app = document.getElementById("app")!;
const m = new MineSweeper(10, 10, 25);
init(app, m);
