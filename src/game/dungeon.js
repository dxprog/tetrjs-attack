const Sprite = require('../graphics/sprite');
const Room = require('./room');

const TRANSITION_DURATION = 60;
const TRANSITION_SPEEDS = {
  east: { x: -1, y: 0 },
  west: { x: 1, y: 0 },
  north: { x: 0, y: 1 },
  south: { x: 0, y: -1 }
};

function Dungeon(data, game) {
  this._data = data;
  this._loadTiles(game.getWindow(), game.getCanvas());
  this._loadRooms();
}

Dungeon.prototype = {
  _loadRooms() {
    var self = this;
    var rooms = this._rooms = {};
    var tileset = this._tileset;
    var tileWidth = this._data.tileWidth;
    var tileHeight = this._data.tileHeight;
    Object.keys(self._data.rooms).forEach(function(roomName) {
      var data = require('../data/' + roomName);
      console.log(self._data.rooms);
      rooms[roomName] = new Room(data, self._data.rooms[roomName].exits, tileWidth, tileHeight, tileset);
    });
    this._currentRoom = rooms[self._data.startRoom];
  },

  _loadTiles(window, canvas) {
    var data = this._data;
    var tileset = this._tileset = new Sprite('./images/' + data.tileset, window, canvas);
    Object.keys(data.tiles).forEach(function(tileName) {
      var tile = data.tiles[tileName];
      tileset.registerAnimation(tileName, [{
        width: data.tileWidth,
        height: data.tileHeight,
        x: tile.x * data.tileWidth,
        y: tile.y * data.tileHeight
      }]);
    });
  },

  update() {
    if (!this._transitioning) {
      var transitionEdge = this._currentRoom.roomTransition();
      if (transitionEdge) {
        var nextRoom = this._currentRoom.getExitForDirection(transitionEdge);
        if (nextRoom) {
          var transitionSpeed = TRANSITION_SPEEDS[transitionEdge];
          this._transitioning = true;
          this._transitionCounter = 0;
          this._nextRoom = this._rooms[nextRoom];
          this._transitionX = 0;
          this._transitionY = 0;
          this._transitionSpeedX = this._currentRoom.getRoomWidthInPixels() / TRANSITION_DURATION;
          this._transitionSpeedX *= transitionSpeed.x;
          this._transitionSpeedY = this._currentRoom.getRoomHeightInPixels() / TRANSITION_DURATION;
          this._transitionSpeedY *= transitionSpeed.y;
        }
      }
    } else {
      this._transitionX += this._transitionSpeedX;
      this._transitionY += this._transitionSpeedY;
      this._transitionCounter++;
      if (this._transitionCounter >= TRANSITION_DURATION) {
        this._currentRoom = this._nextRoom;
        this._nextRoom = null;
        this._transitioning = false;
        this._transitionCounter = this._transitionX = this._transitionY = 0;
      }
    }
  },

  canPass(x, y, width, height) {
    return this._currentRoom.canPass(x, y, width, height);
  },

  draw() {
    this._currentRoom.draw(this._transitionX, this._transitionY);
    if (this._nextRoom) {
      this._nextRoom.draw(this._transitionX + 128, this._transitionY);
    }
  },

  isTransitioning() {
    return this._transitioning;
  }
};

module.exports = Dungeon;