let ship = document.querySelector('.ship');
let counter = document.querySelector('.score');
let asteroidsContainer = document.querySelector('.asteroids');
let bestScore = document.querySelector('.best-score');
let asteroidElements = [];

let config = {
  shipSize: {
    width: 60,
    height: 100,
  },
  levelUpScore: [10, 30, 60, 100, 150],
  levels: [
    {speed: 3, count: 10},
    {speed: 3, count: 15},
    {speed: 4, count: 15},
    {speed: 4, count: 20},
    {speed: 5, count: 20},
    {speed: 5, count: 25},
  ],
};

let state = {
  gameId: null,
  ship: {
    left: (window.innerWidth - ship.offsetWidth) / 2,
    bottom: 40,
  },
  score: 0,
  level: 0,
  asteroids: [],
  pressedKey: null,
};

startGame();

function startGame() {
  setArrowListeners();
  bestScore.innerHTML = localStorage.getItem('bestScore') || 0;
  state.gameId = startGameLoop();

  setTimeout(() => {
    document.querySelector('.content').style.display = 'block';
  }, 100);
}

function stopGame() {
  clearInterval(state.gameId);
  removeArrowListeners();
  localStorage.setItem('bestScore', String(Math.max(Number(localStorage.getItem('bestScore')), state.score)));
}

function startGameLoop() {
  return setInterval(() => {
    renderShip();
    renderAsteroids();
    renderScore();
    checkCollision();
  }, 10);

  function renderShip() {
    let STEP_SIZE = 10;

    switch (state.pressedKey) {
      case 'ArrowLeft':
        state.ship.left = Math.max(state.ship.left - STEP_SIZE, 0);
        break;
      case 'ArrowRight':
        state.ship.left = Math.min(state.ship.left + STEP_SIZE, window.innerWidth - config.shipSize.width);
        break;
      case 'ArrowUp':
        state.ship.bottom = Math.min(state.ship.bottom + STEP_SIZE, window.innerHeight - config.shipSize.height);
        break;
      case 'ArrowDown':
        state.ship.bottom = Math.max(state.ship.bottom - STEP_SIZE, 0);
        break;
    }

    ship.style.left = `${state.ship.left}px`;
    ship.style.bottom = `${state.ship.bottom}px`;
  }

  function renderAsteroids() {
    let asteroidSize = 45;
    let currentAsteroidsAmount = state.asteroids.length;
    let missingAsteroidsAmount = config.levels[state.level].count - currentAsteroidsAmount;

    new Array(missingAsteroidsAmount).fill('').forEach((_, i) => {
      let asteroid = document.createElement('li');
      asteroid.classList.add('asteroid');
      asteroidElements.push(asteroid);
      asteroidsContainer.appendChild(asteroid);

      state.asteroids[currentAsteroidsAmount + i] = getNewPositionForAsteroid();
    });

    state.asteroids.forEach((asteroid, i) => {
      asteroid.bottom -= config.levels[state.level].speed;

      if (asteroid.bottom + asteroidSize < 0) {
        state.score++;

        if (config.levelUpScore.includes(state.score) && config.levels[state.level + 1]) {
          state.level++;
        }

        state.asteroids[i] = getNewPositionForAsteroid();
      }
    });

    state.asteroids.forEach(({left, bottom}, i) => {
      let {style} = asteroidElements[i];
      style.left = `${left}px`;
      style.bottom = `${bottom}px`;
    });

    function getNewPositionForAsteroid() {
      // Reference: https://stackoverflow.com/a/1527820/4449154
      function getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      return {
        left: getRandomInt(0, window.innerWidth),
        bottom: getRandomInt(window.innerHeight, window.innerHeight * 2),
      };
    }
  }

  function renderScore() {
    counter.innerHTML = state.score || 0;
  }

  function checkCollision() {
    const shipRectangle = ship.getBoundingClientRect();
    const hasCollision = asteroidElements.some((asteroidElement) => {
      const {left, right, top, bottom, height, width} = asteroidElement.getBoundingClientRect();
      if (top + height > shipRectangle.top
        && left + width > shipRectangle.left
        && bottom - height < shipRectangle.bottom
        && right - width < shipRectangle.right) {
        return true;
      }
    });

    if (hasCollision) {
      stopGame();
    }
  }
}

function setArrowListeners() {
  document.addEventListener('keyup', onKeyUp, false);
  document.addEventListener('keydown', onKeyDown, false);
}

function removeArrowListeners() {
  document.removeEventListener('keyup', onKeyUp, false);
  document.removeEventListener('keydown', onKeyDown, false);
}

function onKeyUp() {
  state.pressedKey = null;
}

function onKeyDown({key}) {
  state.pressedKey = key;
}
