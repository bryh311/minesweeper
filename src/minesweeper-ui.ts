import type { MineSweeper, Point, TileObserver } from "./minesweeper";

export function init(root: HTMLElement, game: MineSweeper) {
  buildResetButton(root, game);
  buildGrid(root, game);
}

const tile: any = {
  "0": "TileEmpty.png",
  "1": "Tile1.png",
  "2": "Tile2.png",
  "3": "Tile3.png",
  "4": "Tile4.png",
  "5": "Tile5.png",
  "6": "Tile6.png",
  "7": "Tile7.png",
  "8": "Tile8.png",
  "-1": "TileMine.png",
  F: "TileFlag.png",
  get(tileVal: string): any {
    if (tileVal in this) {
      return this[tileVal];
    }

    return "TileUnknown.png";
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
  htmlButton.id = "reset-button";
  htmlButton.addEventListener("click", () => {
    game.reset();
  });
  root.appendChild(htmlButton);
}

function styleRoot(height: number, width: number, root: HTMLElement) {
  root.style.display = "grid";
  root.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  root.style.gridTemplateRows = `repeat(${height}, 1fr)`;
  root.style.width = `calc(2rem * ${width})`;
  root.style.height = `calc(2rem * ${height})`;
}

class MineButton implements TileObserver {
  button: HTMLButtonElement;
  image: HTMLImageElement;
  private game: MineSweeper;
  private point: Point;

  private constructor(
    button: HTMLButtonElement,
    image: HTMLImageElement,
    x: number,
    y: number,
    game: MineSweeper
  ) {
    this.button = button;
    this.image = image
    this.point = { x: x, y: y };
    //this.button.innerText = "";
    this.image.src = `./resources/tiles/TileUnknown.png`
    this.image.width = 16;
    this.image.height = 16;
    this.image.draggable = false;
    this.image.className = "tileImage";
    this.button.id = `b-${x}-${y}`;
    this.button.className = "mineButton";
    this.game = game;

    this.button.addEventListener("click", (_ev: MouseEvent) => {
      this.game.check(this.point);
    });

    this.button.addEventListener("mousedown", (_ev: MouseEvent) => {
      this.game.handleButtonPressed(this.point);
    })

    this.button.addEventListener("mouseleave", () => {
      this.game.handleButtonReleased(this.point);
    })

    this.button.addEventListener("mouseup", () => {
      this.game.handleButtonReleased(this.point);
    })

    this.button.addEventListener("contextmenu", (ev: MouseEvent) => {
      ev.preventDefault();
      this.game.flag(this.point);
    });

    this.game.register(this);
  }

  static createButton(x: number, y: number, game: MineSweeper) {
    const htmlButton = document.createElement("button");
    let img = document.createElement("img");
    img = htmlButton.appendChild(img);
    const button = new MineButton(htmlButton, img, x, y, game);
    return button;
  }

  update(tileType: string) {
    const newImage = tile.get(tileType);
    this.image.src = `./resources/tiles/${newImage}`
  }

  coords(): Point {
    return this.point;
  }
}
