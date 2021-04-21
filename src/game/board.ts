import Sprite from '../graphics/sprite';
import { IGameObject } from '../interfaces/game';
import Game from './game';

import * as PANEL_SPRITE from '../data/panels.json';
import Panel from './panel';

const BOARD_WIDTH = 6;
const BOARD_HEIGHT = 12;
const BOARD_AREA = BOARD_WIDTH * BOARD_HEIGHT;
const NUM_PANEL_TYPES = 5;

class Board implements IGameObject {
  private _board: Array<Panel>;
  private _basePanelSprite: Sprite;

  constructor(game: Game) {
    this._basePanelSprite = Sprite.loadSheet(
      PANEL_SPRITE,
      game.getWindow(),
      game.getCanvas()
    );
    this.resetBoard();
  }

  private resetBoard() {
    // create a dummy board
    const board: Array<boolean> = Array.apply(null, new Array(BOARD_AREA))
      .map(() => false);

    // fill half the board with randomly placed placeholders
    for (let i = 0, count = BOARD_AREA / 2; i < count; i++) {
      let position = Math.floor(Math.random() * BOARD_AREA);
      while (board[position]) {
        position = Math.floor(Math.random() * BOARD_AREA);
      }
      board[position] = true;
    }

    // apply gravity to the random placeholders
    // note: this is hella lazy,taking multiple passes
    // of the whole board to let the gravity settle out,
    // but fewer LoC and not _really_ a concern for performance
    let dirty = true;
    while (dirty) {
      dirty = false;
      for (let x = 0; x < BOARD_WIDTH; x++) {
        for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
          const index = y * BOARD_WIDTH + x;
          if (board[index] && !board[index + BOARD_WIDTH]) {
            board[index] = false;
            board[index + BOARD_WIDTH] = true;
            dirty = true;
          }
        }
      }
    }

    // give the blocks types such that no block can touch one
    // of the same type
    const panelTypes: Array<number> = [];
    board.forEach((hasTile, index) => {
      if (hasTile) {
        let type = Math.floor(Math.random() * NUM_PANEL_TYPES);
        let previousPanel = index - 1;
        let abovePanel = index - BOARD_WIDTH;
        while (
          (previousPanel > -1 && panelTypes[previousPanel] === type) ||
          (abovePanel > -1 && panelTypes[abovePanel] === type)
        ) {
          type = Math.floor(Math.random() * NUM_PANEL_TYPES);
        }
        panelTypes.push(type);
      } else {
        panelTypes.push(null);
      }
    });

    this._board = panelTypes.map((type, index) => {
      if (type !== null) {
        const y = Math.floor(index / BOARD_WIDTH);
        const x = index % BOARD_WIDTH;
        return new Panel(x, y, type, this._basePanelSprite);
      }

      return null;
    });
  }

  update(td: number) {

  }

  draw() {
    this._board.forEach(panel => {
      if (panel) {
        panel.draw();
      }
    });
  }
}

export default Board;