"use strict";

const settings = {
  rowsCount: 21,
  colsCount: 21,
  speed: 2,
  winFoodCount: 50,
  scoreForFood: 50,
};

const config = {
  settings,
  init(userSettings) {
    Object.assign(this.settings, userSettings);
  },

  getRowsCount() {
    return this.settings.rowsCount;
  },

  getColsCount() {
    return this.settings.colsCount;
  },

  getSpeed() {
    return this.settings.speed;
  },

  getWinFoodCount() {
    return this.settings.winFoodCount;
  },

  getScoreForFood() {
    return this.settings.scoreForFood;
  },

  validate() {
    const result = {
      isValid: true,
      errors: [],
    };

    if (this.settings.rowsCount < 10 || this.settings.rowsCount > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение rowsCount должно быть в диапазоне [10, 30].');
    }

    if (this.settings.colsCount < 10 || this.settings.colsCount > 30) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение colsCount должно быть в диапазоне [10, 30].');
    }

    if (this.settings.speed < 1 || this.settings.speed > 10) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение speed должно быть в диапазоне [1, 10].');
    }

    if (this.settings.winFoodCount < 5 || this.settings.winFoodCount > 50) {
      result.isValid = false;
      result.errors.push('Неверные настройки, значение winFoodCount должно быть в диапазоне [5, 50].');
    }

    return result;
  },
};

const map = {
  cells: null,
  usedCells: null,

  init(rowsCount, colsCount) {
    const table = document.getElementById('game');
    table.innerHTML = '';

    this.cells = {}; // {x1_y1: td, x1_y2: td}
    this.usedCells = [];

    for (let row = 0; row < rowsCount; row++) {
      const tr = document.createElement('tr');
      tr.classList.add('row');
      table.appendChild(tr);

      for (let col = 0; col < colsCount; col++) {
        const td = document.createElement('td');
        td.classList.add('cell');

        this.cells[`x${col.toString()}_y${row.toString()}`] = td;
        tr.appendChild(td);
      }
    }
  },

  render(snakePointsArray, foodPoint) {
    for (const cell of this.usedCells) {
      cell.className = 'cell';
    }

    this.usedCells = [];

    snakePointsArray.forEach((point, idx) => {
      const snakeCell = this.cells[`x${point.x}_y${point.y}`];
      snakeCell.classList.add(idx === 0 ? 'snakeHead' : 'snakeBody');
      this.usedCells.push(snakeCell);
    });

    const foodCell = this.cells[`x${foodPoint.x}_y${foodPoint.y}`];
    foodCell.classList.add('food');
    this.usedCells.push(foodCell);
  },
};

const snake = {
  body: null,
  direction: null,
  lastStepDirection: null,

  init(startBody, direction) {
    this.body = startBody;
    this.direction = direction;
    this.lastStepDirection = direction;
  },

  getBody() {
    return this.body;
  },

  getLastStepDirection() {
    return this.lastStepDirection;
  },

  isOnPoint(point) {
    return this.body.some(snakePoint => snakePoint.x === point.x && snakePoint.y === point.y);
  },

  makeStep() {
    this.lastStepDirection = this.direction;
    this.body.unshift(this.getNextStepHeadPoint()); // [p3, p2, p1] // [p4, p3, p2]
    this.body.pop();
  },

  growUp() {
    const lastBodyIdx = this.body.length - 1;
    const lastBodyPoint = this.body[lastBodyIdx];
    const lastBodyPointClone = Object.assign({}, lastBodyPoint);
    this.body.push(lastBodyPoint);
  },

  getNextStepHeadPoint() {
    const firstPoint = this.body[0];

    switch(this.direction) {
      case 'up':
        let yUp = firstPoint.y - 1 < 0 ? config.getColsCount() - 1 : firstPoint.y - 1;
        return {x: firstPoint.x, y: yUp};
      case 'right':
        let xR = firstPoint.x + 1 > config.getRowsCount() - 1 ?  0 : firstPoint.x + 1;
        return {x: xR, y: firstPoint.y};
      case 'down':
         let yD = firstPoint.y + 1 > config.getColsCount() - 1 ?  0 : firstPoint.y + 1;
        return {x: firstPoint.x, y: yD};
      case 'left':
         let xL = firstPoint.x - 1 < 0 ? config.getRowsCount() - 1 : firstPoint.x - 1;
        return {x: xL, y: firstPoint.y};
    }
  },

  setDirection(direction) {
    this.direction = direction;
  },
};

const food = {
  x: null,
  y: null,

  getCoordinates() {
    return {
      x: this.x,
      y: this.y,
    };
  },

  setCoordinates(point) {
    this.x = point.x;
    this.y = point.y;
  },

  isOnPoint(point) {
    return this.x === point.x && this.y === point.y;
  },
};

const status = {
  condition: null,

  setPlaying() {
    this.condition = 'playing';
  },

  setStopped() {
    this.condition = 'stopped';
  },

  setFinished() {
    this.condition = 'finished';
  },

  isPlaying() {
    return this.condition === 'playing';
  },

  isStopped() {
    return this.condition === 'stopped';
  },
};

const game = {
  config,
  map,
  snake,
  food,
  status,
  tickInterval: null,
  score: null,

  init(userSettings) {
    this.config.init(userSettings);
    const validation = this.config.validate();

    if (!validation.isValid) {
      for (const err of validation.errors) {
        console.error(err);
      }
      return;
    }

    this.map.init(this.config.getRowsCount(), this.config.getColsCount());
    this.setEventHandlers();
    this.reset();
  },

  initScore() {
    const scoreShow = document.getElementById('score');
    scoreShow.innerHTML = `Вы набрали ${this.score} баллов.`;
  },

  reset() {
    this.stop();
    this.snake.init(this.getStartSnakeBody(), 'up');
    this.food.setCoordinates(this.getRandomFreeCoordinates());
    this.render();
    this.score = 0;
    this.initScore();
  },

  play() {
    this.status.setPlaying();
    this.tickInterval = setInterval(() => this.tickHandler(), 1000 / this.config.getSpeed());
    this.setPlayButton('Стоп');
    this.initScore();
  },

  stop() {
    this.status.setStopped();
    clearInterval(this.tickInterval);
    this.setPlayButton('Старт');
  },

  finish() {
    this.status.setFinished();
    clearInterval(this.tickInterval);
    this.setPlayButton('Игра закончена', true);
  },

  tickHandler() {
    if (!this.canMakeStep()) {
      return this.finish();
    }

    if (this.food.isOnPoint(this.snake.getNextStepHeadPoint())) {
      this.snake.growUp();
      this.scoreUp();
      this.food.setCoordinates(this.getRandomFreeCoordinates());

      if (this.isGameWon()) {
        this.finish();
      }
    }

    this.snake.makeStep();
    this.render();
  },

  scoreUp() {
    this.score += this.config.getScoreForFood();
    this.initScore();
  },


  setPlayButton(textContents, isDisabled = false) {
    const playButton = document.getElementById('playButton');

    playButton.textContent = textContents;
    isDisabled ? playButton.classList.add('disabled') : playButton.classList.remove('disabled');
  },

  getStartSnakeBody() {
    return [
      {
        x: Math.floor(this.config.getColsCount() / 2),
        y: Math.floor(this.config.getRowsCount() / 2),
      }
    ];
  },

  setEventHandlers() {
    document.getElementById('playButton').addEventListener('click', () => {
      this.playClickHandler();
    });
    document.getElementById('newGameButton').addEventListener('click', () => {
      this.newGameClickHandler();
    });
    document.addEventListener('keydown', event => this.keyDownHandler(event));
  },

  render() {
    this.map.render(this.snake.getBody(), this.food.getCoordinates());
  },

  getRandomFreeCoordinates() {
    const exclude = [this.food.getCoordinates(), ...this.snake.getBody()];

    while (true) {
      const rndPoint = {
        x: Math.floor(Math.random() * this.config.getColsCount()),
        y: Math.floor(Math.random() * this.config.getRowsCount()),
      };

      if (!exclude.some(exPoint => rndPoint.x === exPoint.x && rndPoint.y === exPoint.y)) {
        return rndPoint;
      }
    }
  },

  playClickHandler() {
    if (this.status.isPlaying()) {
      this.stop();
    } else if (this.status.isStopped()) {
      this.play();
    }
  },

  newGameClickHandler() {
    this.reset();
  },

  keyDownHandler(event) {
    if (!this.status.isPlaying()) return;

    const direction = this.getDirectionByCode(event.code);

    if (this.canSetDirection(direction)) {
      this.snake.setDirection(direction);
    }
  },

  getDirectionByCode(code) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 'up';
      case 'KeyD':
      case 'ArrowRight':
        return 'right';
      case 'KeyS':
      case 'ArrowDown':
        return 'down';
      case 'KeyA':
      case 'ArrowLeft':
        return 'left';
      default:
        return '';
    }
  },

  canSetDirection(direction) {
    const lastStepDirection = this.snake.getLastStepDirection();

    return direction === 'up' && lastStepDirection !== 'down' ||
      direction === 'right' && lastStepDirection !== 'left' ||
      direction === 'down' && lastStepDirection !== 'up' ||
      direction === 'left' && lastStepDirection !== 'right';
  },

  isGameWon() {
    return this.snake.getBody().length > this.config.getWinFoodCount();
  },

  canMakeStep() {
    const nextHeadPoint = this.snake.getNextStepHeadPoint();

    return !this.snake.isOnPoint(nextHeadPoint) &&
      nextHeadPoint.x < this.config.getColsCount() &&
      nextHeadPoint.y < this.config.getRowsCount() &&
      nextHeadPoint.x >= 0 &&
      nextHeadPoint.y >= 0;
  },
};

window.addEventListener('load', () => game.init({speed: 5}));
