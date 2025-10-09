import './style.css'

import { MineSweeper } from './minesweeper.ts'
import { init } from './minesweeper-ui.ts';

const app = document.getElementById("app")!;
const m = new MineSweeper(10, 10, 30);
init(10, 10, app, m);

// m.check(Math.floor(m.width / 2), Math.floor(m.width / 2));
// m.printGrid();
// console.log("========Shown:=========");
// m.printVisibleGrid();