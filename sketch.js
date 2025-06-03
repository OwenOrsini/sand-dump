let grid;
const ROWS = 80;
const COLS = 150;
const CELL_SIZE = 8;
let hue = 0;

const Type = {
  AIR: 0,
  SAND: 1,
  WATER: 2,
};

function placeParticle(grid, x, y, type, hue = 100, sat = 50) {

  if (x < 0 || x >= ROWS || y < 0 || y >= COLS) {
    return; // Out of bounds
  }

  if (grid[x][y].type != Type.AIR) {
    return; // Cell is already occupied
  }
  grid[x][y] = {
    type: type,
    hue: hue,
    sat: sat,
  };
};

function initializeGrid(rows, cols) {
  let grid = new Array(rows);
  for (let row = 0; row < rows; row++) {
    grid[row] = new Array(cols).fill(null).map(() => ({
      type: Type.AIR,
      hue: 0,
      sat: 0,
    }));
  }
  return grid;
}

function drawParticle(grid, cellSize, row, col) {
  if (grid[row][col].type != Type.AIR) {
    let sat = grid[row][col].sat;
    let hue = grid[row][col].hue;
    noStroke();
    fill(hue, 40 + 2 * row, sat);
    let y = row * cellSize;
    let x = col * cellSize;
    rect(x, y, cellSize, cellSize)
  }
}

function drawGrid(grid, cell_size, rows, cols) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      drawParticle(grid, cell_size, row, col);
    }
  }
}

function moveParticle(grid, newgrid, from_row, from_col, to_row, to_col, sat = 0) {
  newgrid[from_row][from_col] = grid[to_row][to_col];
  newgrid[to_row][to_col] = grid[from_row][from_col];
  if (sat != 0) {
    newgrid[to_row][to_col].sat = newgrid[to_row][to_col].sat + sat;
  }

}

function nextParticle(grid, newgrid, row, col) {
  let y = row + 1;
  if (y >= ROWS || grid[y][col].type == Type.SAND) {
    newgrid[row][col] = grid[row][col];

    if (y < ROWS && y > 0) {

      // Check left
      let x_left = col - 1;
      let fall_left =
        (x_left >= 0 && grid[y][x_left].type != Type.SAND);

      // Check right
      let x_right = col + 1;
      let fall_right = (x_right < COLS && grid[y][x_right].type != Type.SAND)

      // Move the cell left or right depending on neighbors
      if (fall_left && fall_right) {
        let x = x_left;
        if (Math.random() > .5) {
          x = x_right;
        }
        moveParticle(grid, newgrid, row, col, y, x, 5);
      } else if (fall_left) {
        moveParticle(grid, newgrid, row, col, y, x_left, 5);
      } else if (fall_right) {
        moveParticle(grid, newgrid, row, col, y, x_right, 5);
      }
    }
  } else if (grid[y][col].type == Type.AIR) {
    moveParticle(grid, newgrid, row, col, y, col);
  } else if (grid[y][col].type == Type.WATER) {
    moveParticle(grid, newgrid, row, col, y, col, -4);

  } else {
    // Otherwise, stay in place
    newgrid[row][col] = grid[row][col];
  }
}

function nextWaterParticle(grid, newgrid, row, col) {
  let y = row + 1;

  if (y >= ROWS || grid[y][col].type == Type.WATER || grid[y][col].type == Type.SAND) {
    newgrid[row][col] = grid[row][col];

    if (y < ROWS && y > 0) {
      let ledge = findLedge(grid, row, col);
      if (ledge) {
        if (ledge.Direction == Direction.LEFT) {
          moveParticle(grid, newgrid, row, col, row, col - 1);
        } else if (ledge.Direction == Direction.RIGHT) {
          moveParticle(grid, newgrid, row, col, row, col + 1);
        }
      }
    }
  }
  else {
    moveParticle(grid, newgrid, row, col, y, col);
  }
}

const Direction = {
  LEFT: 0,
  RIGHT: 1,
}

function findLedge(grid, row, col) {
  let search_length = 100;
  for (let i = 1; i <= search_length; i++) {
    let x = col + i;
    if (x < 0 || x >= COLS || grid[row][x].type != Type.AIR) {
      break; // we hit a wall or another particle
    }
    if (grid[row + 1][x].type == Type.AIR) {
      return { Direction: Direction.RIGHT };
    }
  }

  for (let i = 1; i <= search_length; i++) {

    let x = col - i;
    if (x < 0 || x >= COLS || grid[row][x].type != Type.AIR) {
      break; // we hit a wall or another particle
    }
    if (grid[row + 1][x].type == Type.AIR) {
      return { Direction: Direction.LEFT };
    }
  }

  return null;
}


function nextgrid(grid, rows, cols) {
  let newgrid = initializeGrid(rows, cols);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (newgrid[row][col].type === Type.AIR) {
        if (grid[row][col].type == Type.SAND) {
          nextParticle(grid, newgrid, row, col);
        } else if (grid[row][col].type == Type.WATER) {
          nextWaterParticle(grid, newgrid, row, col);
        }
      }
    }
  }
  return newgrid;

}
function mousePressed() {
  mouseHeld();
}

function mouseHeld() {

  if (mouseIsPressed) {
    let x = floor(mouseX / CELL_SIZE);
    let y = floor(mouseY / CELL_SIZE);
    // randomly place sand particles left and right of the mouse
    x += Math.floor(Math.random() * 3) - 1; // -1, 0, or +1

    if (mouseButton === LEFT) {
      placeParticle(grid, y, x, Type.SAND, hue);
      hue += .1;
      if (hue > 160) {
        hue = 1;
      }
    } else {
      placeParticle(grid, y, x, Type.WATER, 200, 150);

    }
  }
}

function setup() {
  grid = initializeGrid(ROWS, COLS);
  createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE);
  colorMode(HSB, 360, 255, 255);
  frameRate(144);
}

function keyPressed() {
  if (key === ' ') {
    grid = initializeGrid(ROWS, COLS); // Reset the grid
  }
}

function draw() {
  background(200, 35, 460);
  drawGrid(grid, CELL_SIZE, ROWS, COLS);
  mouseHeld();
  grid = nextgrid(grid, ROWS, COLS);

}