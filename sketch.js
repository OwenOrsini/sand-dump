const Type = {
  AIR: 0,
  SAND: 1,
};

class Grid {
  constructor() {
    this.rows = 30;
    this.cols = 60;
    this.cell_size = 15;
    this.cells = this.createGrid();
    this.hue = 200;
  }

  createGrid() {
    let cells = new Array(this.rows);
    let cell_obj = {
      type: Type.AIR,
      sat: 50,
      hue: 0,
    };
    for (let row = 0; row < this.rows; row++) {
      cells[row] = new Array(this.cols).fill(null).map(() => (
        { ...cell_obj }
      ));
    }
    return cells;
  }

  drawCell(row, col) {
    if (this.cells[row][col].type == Type.AIR){
      fill(240, 230, 200);
      // noStroke();
    } else {
      let sat = this.cells[row][col].sat;
      let hue = this.cells[row][col].hue;
      fill(hue, 75, sat);
      let y = this.cell_size * row;
      let x = this.cell_size * col;
      rect(
        x,
        y,
        this.cell_size,
        this.cell_size,
      );
    }
  }

  render() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        this.drawCell(row, col);
      }
    }
  }

  changeCell(cell, type, hue, sat) {
    let new_cell = cell;
    new_cell.type = type;
    new_cell.hue = hue;
    new_cell.sat = sat;

    return new_cell;
  }

  nextgrid() {
    let new_cells = this.createGrid();
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.cells[row][col].type == Type.SAND) {
          let y = row + 1;
          if (y >= this.rows || this.cells[y][col].type == Type.SAND) {
            new_cells[row][col] = this.cells[row][col];

            if (y < this.rows && y > 0) {
              // Check left
              let fall_left = false;
              let x_left = col - 1;
              if (x_left >= 0 && this.cells[y][x_left].type == Type.AIR) {
                fall_left = true;
              }

              // Check right
              let fall_right = false;
              let x_right = col + 1;
              if (x_right < this.cols && this.cells[y][x_right].type == Type.AIR) {
                fall_right = true;
              }

              // Move the cell left or right depending on neighbors
              if (fall_left && fall_right) {
                let x = x_left;
                if (Math.random() > .5) {
                  x = x_right;
                }
                // new_cells[y][x] = this.cells[row][col] + 20;
                new_cells[y][x] = this.changeCell(
                  this.cells[row][col],
                  Type.SAND,
                  this.hue,
                  this.cells[row][col].sat + 20,
                );
                new_cells[row][col] = 0;
              } else if (fall_left) {
                new_cells[y][x_left] = this.changeCell(
                  this.cells[row][col],
                  Type.SAND,
                  this.hue,
                  this.cells[row][col].sat + 20,
                );
                new_cells[row][col] = { type: Type.AIR, hue: 0, sat: 0 };
              } else if (fall_right) {
                new_cells[y][x_right] = this.changeCell(
                  this.cells[row][col],
                  Type.SAND,
                  this.hue,
                  this.cells[row][col].sat + 20,
                );
                new_cells[row][col] = { type: Type.AIR, hue: 0, sat: 0 };
              }
            }
          } else {
            new_cells[y][col] = this.changeCell(
              this.cells[row][col],
              Type.SAND,
              this.hue,
              this.cells[row][col].sat,
            );
            new_cells[row][col] = { type: Type.AIR, hue: 0, sat: 0 };
          }
        }
      }
    }
    this.cells = new_cells;
  }

  mouse() {
    if (mouseIsPressed) {
      let x = floor(mouseX / this.cell_size);
      let y = floor(mouseY / this.cell_size);
      if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) {
        return;
      }
      if (this.cells[y][x].type == Type.AIR) {
        this.cells[y][x].type = Type.SAND;
        this.cells[y][x].hue = this.hue;
      }
      this.hue += 1;
      if (this.hue > 360) {
        this.hue = 1;
      }
    }
  }
}

let grid = new Grid();
function setup() {
  createCanvas(1500, 1500);
  colorMode(HSB, 360, 255, 255);
  grid = new Grid();
  frameRate(30);
}

function draw() {
  background(200);
  grid.mouse();
  grid.render();
  grid.nextgrid();
}
