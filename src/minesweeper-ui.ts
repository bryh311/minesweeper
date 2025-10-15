import type { MineSweeper, Point, TileObserver } from "./minesweeper";

export function init(root: HTMLElement, game: MineSweeper) {
  buildResetButton(root, game);
  buildGrid(root, game);
}

const bgColor: any = {
  "0": "white",
  "1": "silver",
  "2": "gray",
  "3": "brown",
  "4": "maroon",
  "5": "lightblue",
  "6": "blue",
  "7": "violet",
  "8": "purple",
  "-1": "red",
  F: "gold",
  get(tileVal: string): any {
    if (tileVal in this) {
      return this[tileVal];
    }

    return "pink";
  },
};

function buildGrid(root: HTMLElement, game: MineSweeper) {
  const grid = document.createElement("div");
  grid.id = "grid";
  styleRoot(game.getHeight(), game.getWidth(), grid);

  for (let i = 0; i < game.getHeight(); i++) {
    for (let j = 0; j < game.getWidth(); j++) {
      const button = MineButton.createButton(j, i, game);
      grid.appendChild(button.button);
    }
  }

  root.appendChild(grid);
}

function buildResetButton(root: HTMLElement, game: MineSweeper) {
  const htmlButton = document.createElement("button");
  htmlButton.innerText = "Reset";
  htmlButton.addEventListener("click", () => {
    game.reset();
  });
  root.appendChild(htmlButton);
}

function styleRoot(height: number, width: number, root: HTMLElement) {
  root.style.display = "grid";
  root.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  root.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  root.style.width = `calc(25px * ${width})`;
  root.style.height = `calc(25px * ${height})`;
}

class MineButton implements TileObserver {
  button: HTMLButtonElement;
  private game: MineSweeper;
  private point: Point;

  private constructor(
    button: HTMLButtonElement,
    x: number,
    y: number,
    game: MineSweeper
  ) {
    this.button = button;
    this.point = { x: x, y: y };
    this.button.innerText = "";
    this.button.id = `b-${x}-${y}`;
    this.button.className = "mineButton";
    this.game = game;

    this.button.addEventListener("click", (ev: MouseEvent) => {
      this.game.check(this.point);
    });

    this.button.addEventListener("contextmenu", (ev: MouseEvent) => {
      ev.preventDefault();
      this.game.flag(this.point);
    });

    this.game.register(this);
  }

  static createButton(x: number, y: number, game: MineSweeper) {
    const htmlButton = document.createElement("button");
    const button = new MineButton(htmlButton, x, y, game);
    return button;
  }

  update(tileType: string) {
    this.button.innerText = tileType;
    this.button.style.backgroundColor = bgColor.get(tileType);
  }

  coords(): Point {
    return this.point;
  }
}
