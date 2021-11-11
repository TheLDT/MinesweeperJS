var size = 5;
var bombs = 5;
var sizeX = 5;
var sizeY = 10;
var pressedCells = 0;
var timePassed = 0;
var bombsLeftMessage, timer;
var timerInterval = null;
var transitionDelayBasis = 50;
var transitionDelay = transitionDelayBasis;
var revealMode = true;

class Cell {
  constructor() {
    this.isBomb = false;
    this.isPressed = false;
    this.isFlag = false;
    this.neighbours = 0;
  }

  get isEmpty() {
    return this.neighbours == 0;
  }

  setBomb() {
    this.isBomb = true;
    this.neighbours = -100;
  }

  addNeighbour() {
    this.neighbours += 1;
  }
}

var minefield = new Array(sizeX);
var table;

function makeBoardArray() {
  for (let i = 0; i < sizeX; i++) {
    minefield[i] = new Array(sizeY);
    for (let j = 0; j < sizeY; j++) {
      minefield[i][j] = new Cell();
    }
  }
}

function revealCell(cell, x, y) {
  if (minefield[x][y].isFlag || minefield[x][y].isPressed) return;
  minefield[x][y].isPressed = true;
  pressedCells++;
  if (minefield[x][y].isBomb) {
    cell.className = "bomb";
    showOtherBombs(false);
    gameOver(false);
  } else if (minefield[x][y].isEmpty) {
    cell.className = "empty";
    find_other_empty(x, y, 0);
  } else {
    cell.textContent = minefield[x][y].neighbours;
    cell.className = "pressed";
    cell.classList.add("c" + minefield[x][y].neighbours);
  }
}

function flagCell(cell, x, y) {
  let toInt = parseInt(bombsLeftMessage.innerText);
  if (!minefield[x][y].isPressed) {
    if (minefield[x][y].isFlag) {
      minefield[x][y].isFlag = false;
      cell.className = "question";
      bombsLeftMessage.innerText = toInt + 1;
      if (toInt + 1 == 0 && toInt < 0) {
        bombsLeftMessage.classList.toggle("thinking");
        bombsLeftMessage.classList.toggle("bombs-left");
      }
    } else {
      if (cell.className == "question") {
        cell.className = "";
      } else {
        minefield[x][y].isFlag = true;
        cell.className = "flag";
        bombsLeftMessage.innerText = toInt - 1;
        if (toInt - 1 < 0 && toInt == 0) {
          bombsLeftMessage.classList.toggle("thinking");
          bombsLeftMessage.classList.toggle("bombs-left");
        }
      }
    }
  }
}

function toggleMode() {
  let button = document.getElementById("modeSelector");
  revealMode = !revealMode;
  if (revealMode) button.textContent = "🔍";
  else button.textContent = "🚩";
  button.classList.toggle("revealMode");
  button.classList.toggle("flagMode");
}

function makeBoard() {
  makeBoardArray();
  setupBombsAndNeighbours();
  bombsLeftMessage = document.getElementById("bombs-left");
  timer = document.getElementById("timer");
  startTimer();
  bombsLeftMessage.className = "bombs-left";
  bombsLeftMessage.innerText = bombs;
  let board = document.getElementById("board");
  if (board.contains(table)) board.removeChild(table);
  table = document.createElement("table");
  table.classList.toggle("started");
  board.appendChild(table);
  for (var i = 0; i < sizeX; i++) {
    let row = document.createElement("tr");
    table.appendChild(row);
    for (var j = 0; j < sizeY; j++) {
      let cell = document.createElement("td");
      cell.id = `${i}-${j}`;

      cell.addEventListener("mousedown", (e) => {
        let x = parseInt(cell.id.split("-")[0]);
        let y = parseInt(cell.id.split("-")[1]);
        transitionDelay = transitionDelayBasis;

        if (e.button === 0) {
          if (revealMode) revealCell(cell, x, y);
          else flagCell(cell, x, y);
        } else if (e.button === 2) {
          flagCell(cell, x, y);
        }

        if (pressedCells >= sizeX * sizeY - bombs) {
          gameOver(true);
        }
      });
      row.appendChild(cell);
    }
  }
}

function updateValues(replay, data) {
  pressedCells = 0;
  timePassed = 0;
  clearInterval(timerInterval);
  if (!replay) {
    sizeX = Math.min(data.x.value, 50);
    sizeY = Math.min(data.y.value, 50);
    bombs = Math.ceil((data.bombCount.value / 100) * (sizeX * sizeY));
  }

  makeBoard();
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed++;
    let seconds =
      timePassed % 60 > 9 ? "" + (timePassed % 60) : "0" + (timePassed % 60);
    document.getElementById("timer").innerHTML = `${Math.floor(
      timePassed / 60
    )}:${seconds}`;
  }, 1000);
}

function showOtherBombs(win) {
  for (let i = 0; i < sizeX; i++) {
    for (let j = 0; j < sizeY; j++) {
      if (minefield[i][j].isBomb)
        if (win) document.getElementById(`${i}-${j}`).className = "defused";
        else document.getElementById(`${i}-${j}`).className = "bomb";
    }
  }
}

function findNeighborCoordinates(bombX, bombY, cell) {
  switch (cell) {
    case 0: //upleft
      x = bombX - 1;
      y = bombY - 1;
      break;
    case 1: //up
      x = bombX - 1;
      y = bombY;
      break;
    case 2: //upright
      x = bombX - 1;
      y = bombY + 1;
      break;
    case 3: //left
      x = bombX;
      y = bombY - 1;
      break;
    case 4: //this
      x = bombX;
      y = bombY;
      break;
    case 5: //right
      x = bombX;
      y = bombY + 1;
      break;
    case 6: //downleft
      x = bombX + 1;
      y = bombY - 1;
      break;
    case 7: //down
      x = bombX + 1;
      y = bombY;
      break;
    case 8: //downright
      x = bombX + 1;
      y = bombY + 1;
      break;
    default:
      x = -1;
      y = -1;
  }
  return [x, y];
}

function outOfBounds(x, y) {
  return x >= 0 && y >= 0 && x < sizeX && y < sizeY;
}

function increaseNeighboursOfNeighbours(bombX, bombY, cell) {
  if (cell > 8) return;

  let arr = findNeighborCoordinates(bombX, bombY, cell);
  let x = arr[0],
    y = arr[1];
  if (outOfBounds(x, y)) minefield[x][y].addNeighbour();

  increaseNeighboursOfNeighbours(bombX, bombY, cell + 1);
}

function find_other_empty(bombX, bombY, cell) {
  if (cell > 8) return;
  let arr = findNeighborCoordinates(bombX, bombY, cell);
  let x = arr[0],
    y = arr[1];
  let curCell = document.getElementById(`${x}-${y}`);
  if (outOfBounds(x, y)) {
    if (!minefield[x][y].isBomb && !minefield[x][y].isPressed) {
      minefield[x][y].isPressed = true;
      pressedCells++;
      if(minefield[x][y].isFlag) {
        let toInt = parseInt(bombsLeftMessage.innerText);
        bombsLeftMessage.innerText = toInt + 1;
      }
      if (minefield[x][y].isEmpty) {
        curCell.className = "empty";
        curCell.style.transitionDelay = `${transitionDelay}ms`;
        transitionDelay += transitionDelayBasis;
        find_other_empty(x, y, 0);
      } else {
        curCell.className = "pressed";
        curCell.classList.add("c" + minefield[x][y].neighbours);
        curCell.textContent = minefield[x][y].neighbours;
      }
    }
  }

  find_other_empty(bombX, bombY, cell + 1);
}

function setupBombsAndNeighbours() {
  let bombX,
    bombY,
    bombsPlaced = 0;
  //place bombs
  while (bombsPlaced < bombs) {
    bombX = Math.floor(Math.random() * sizeX);
    bombY = Math.floor(Math.random() * sizeY);
    if (!minefield[bombX][bombY].isBomb) {
      minefield[bombX][bombY].setBomb();
      bombsPlaced += 1;
      increaseNeighboursOfNeighbours(bombX, bombY, 0);
    }
  }
}

function gameOver(win) {
  pressedCells = 0; // fixes the win if the player presses the last bomb
  let popup = document.getElementById("popup");
  let popupContent = document.getElementById("popupContent");
  let popupClose = document.getElementById("popupClose");
  let popupReplay = document.getElementById("popupReplay");
  let popupBox = document.getElementById("popupBox");
  popup.classList.add("target");
  popupClose.addEventListener("mousedown", (e) =>
    popup.classList.remove("target")
  );

  popupReplay.addEventListener("mousedown", (e) => {
    popup.classList.remove("target");
    updateValues(true);
  });
  popupReplay.onclick = "updateValues(true)";
  clearInterval(timerInterval);
  if (win) {
    popupContent.classList.add("victory");
    popupContent.classList.remove("defeat");
    popupBox.classList.add("victory");
    popupBox.classList.remove("defeat");
    popupContent.textContent = "You WON!!!🎉";
  } else {
    popupContent.classList.add("defeat");
    popupContent.classList.remove("victory");
    popupBox.classList.add("defeat");
    popupBox.classList.remove("victory");
    popupContent.textContent = "You LOST...😭";
  }
  showOtherBombs(win);
  table.classList.toggle("started");
  table.classList.add("unselectable");
}
