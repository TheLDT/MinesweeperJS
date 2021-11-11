var rows = 10,
  columns = 10,
  bombs = 10,
  slider = 0.2;

document.querySelector(".formRows").oninput = function () {
  rows = this.value;
  updateBombCounter();
};

document.querySelector(".formColumns").oninput = function () {
  columns = this.value;
  updateBombCounter();
};

document.querySelector(".slider").oninput = function () {
  let value = ((this.value - this.min) / (this.max - this.min)) * 100;
  let color;
  slider = this.value / 100;
  updateBombCounter();
  if (value < 34) {
    color = "#42f581";
  } else if (value < 67) {
    color = "#ffd000";
  } else {
    color = "#ff7070";
  }
  this.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #fff ${value}%, white 100%)`;
};

function updateBombCounter() {
  if (document.querySelector(".started") != null) return;
  bombs = Math.max(Math.min(Math.ceil(rows * columns * slider), 1750),2);
  document.getElementById("bombs-left").innerText = bombs;
}
