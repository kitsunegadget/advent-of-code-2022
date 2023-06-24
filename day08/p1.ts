import { readFromFile } from "../utils";

const getIsVisible = (grid: number[][], row: number, col: number) => {
  const basis = grid[row][col];

  for (let left = col - 1; left >= 0; left--) {
    if (basis <= grid[row][left]) {
      break;
    }

    if (left === 0) {
      return true;
    }
  }

  for (let top = row - 1; top >= 0; top--) {
    if (basis <= grid[top][col]) {
      break;
    }

    if (top === 0) {
      return true;
    }
  }

  for (let right = col + 1; right < grid[0].length; right++) {
    if (basis <= grid[row][right]) {
      break;
    }

    if (right === grid[0].length - 1) {
      return true;
    }
  }

  for (let bottom = row + 1; bottom < grid.length; bottom++) {
    if (basis <= grid[bottom][col]) {
      break;
    }

    if (bottom === grid.length - 1) {
      return true;
    }
  }

  return false;
};

const getInteriorVisibles = (grid: number[][]) => {
  let visibles = 0;

  for (let j = 1; j < grid.length - 1; j++) {
    for (let i = 1; i < grid[0].length - 1; i++) {
      visibles += getIsVisible(grid, j, i) ? 1 : 0;
    }
  }

  return visibles;
};

const treetopTreeHouse = (readlines: string[]) => {
  const grid = readlines.map((s) => s.split("").map(Number));

  const edgeVisibles = 2 * (grid.length + grid[0].length) - 4;
  const interiorVisibles = getInteriorVisibles(grid);

  return edgeVisibles + interiorVisibles;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(treetopTreeHouse(example)); // 21

  const input = await readFromFile("./input.txt");
  console.log(treetopTreeHouse(input)); // 1717
})();
