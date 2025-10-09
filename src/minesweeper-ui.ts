import type { MineSweeper, Point, TileObserver } from "./minesweeper";

export function init(height: number, width: number, root:HTMLElement, game: MineSweeper) {
  buildGrid(height, width, root, game);
  styleRoot(height, width, root);
}

function buildGrid(height: number, width: number, root: HTMLElement, game: MineSweeper) {
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const button = MineButton.createButton(j, i, game);
      root.appendChild(button.button);
    }
  }
}

function styleRoot(height: number, width: number, root: HTMLElement) {
  root.style.display = "grid";
  root.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  root.style.gridTemplateRows = `repeat(${height}, 1fr)`;
}

class MineButton implements TileObserver {
  button: HTMLButtonElement;
  private game: MineSweeper;
  private x: number;
  private y: number;

  private constructor(button: HTMLButtonElement, x: number, y: number, game: MineSweeper) {
    this.button = button;
    this.x = x;
    this.y = y;
    this.button.innerText = "";
    this.button.id =  `b-${x}-${y}`;
    this.game = game;

    this.button.addEventListener("click", (ev: MouseEvent) => {
      this.game.action(this.x, this.y, "CHECK");
    })

    this.button.addEventListener("contextmenu", (ev: MouseEvent) => {
      ev.preventDefault();
      this.game.action(this.x, this.y, "FLAG");
    })

    this.game.register(this);
  }
  
  static createButton(x: number, y: number, game: MineSweeper) {
    const htmlButton = document.createElement("button");
    const button = new MineButton(htmlButton, x, y, game);
    return button;
  }

  update(tileType: string) {
    this.button.innerText = tileType;
  }

  coords(): Point {
    return {x: this.x, y: this.y};
  }
}