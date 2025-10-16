import './style.css';
import { MineSweeper } from "./minesweeper.ts";
import { init } from "./minesweeper-ui.ts";

const app = document.getElementById("app")!;
const m = new MineSweeper(18, 14, 40);
init(app, m);
