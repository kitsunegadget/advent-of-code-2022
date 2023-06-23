import { readFromFile } from "../utils";

const getScenicScore = (grid: number[][], row: number, col: number) => {
  const basis = grid[row][col];
  let leftViews = 0;
  let upViews = 0;
  let rightViews = 0;
  let bottomViews = 0;

  for (let left = col - 1; left >= 0; left--) {
    leftViews += 1;

    if (basis <= grid[row][left]) {
      break;
    }
  }

  for (let top = row - 1; top >= 0; top--) {
    upViews += 1;

    if (basis <= grid[top][col]) {
      break;
    }
  }

  for (let right = col + 1; right < grid[0].length; right++) {
    rightViews += 1;

    if (basis <= grid[row][right]) {
      break;
    }
  }

  for (let bottom = row + 1; bottom < grid.length; bottom++) {
    bottomViews += 1;

    if (basis <= grid[bottom][col]) {
      break;
    }
  }

  return leftViews * upViews * rightViews * bottomViews;
};

const getHighestScenicScore = (grid: number[][]) => {
  let highestScore = 0;

  for (let j = 0; j < grid.length; j++) {
    for (let i = 0; i < grid[0].length; i++) {
      highestScore = Math.max(getScenicScore(grid, j, i), highestScore);
    }
  }

  return highestScore;
};

const treetopTreeHouse = (readlines: string[]) => {
  const grid = readlines.map((s) => s.split("").map(Number));
  return getHighestScenicScore(grid);
};

(async () => {
  const example = await readFromFile("./example");
  console.log(treetopTreeHouse(example)); // 8

  const input = await readFromFile("./input");
  console.log(treetopTreeHouse(input)); // 321975
})();
