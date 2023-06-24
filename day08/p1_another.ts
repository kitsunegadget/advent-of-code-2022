import { readFromFile } from "../utils";

const calcRowVisible = (
  grid: number[][],
  row: number,
  refStatusGrid: boolean[][]
) => {
  const rowLine = grid[row];
  let maxTree = grid[row][0];

  for (let i = 1; i < rowLine.length; i++) {
    const basis = rowLine[i];

    if (maxTree < basis) {
      refStatusGrid[row][i] = true;
      maxTree = basis;
    }
  }

  maxTree = rowLine.at(-1)!;
  for (let i = rowLine.length - 2; i >= 0; i--) {
    const basis = grid[row][i];

    if (maxTree < basis) {
      refStatusGrid[row][i] = true;
      maxTree = basis;
    }
  }
};

const calcColVisible = (
  grid: number[][],
  col: number,
  refStatusGrid: boolean[][]
) => {
  let maxTree = grid[0][col];

  for (let i = 1; i < grid.length; i++) {
    const basis = grid[i][col];

    if (maxTree < basis) {
      refStatusGrid[i][col] = true;
      maxTree = basis;
    }
  }

  maxTree = grid.at(-1)![col];
  for (let i = grid.length - 2; i >= 0; i--) {
    const basis = grid[i][col];

    if (maxTree < basis) {
      refStatusGrid[i][col] = true;
      maxTree = basis;
    }
  }
};

const getInteriorVisibles = (grid: number[][]) => {
  let visibles = 0;
  const statusGrid = new Array(grid.length)
    .fill(false)
    .map((b) => new Array(grid[0].length).fill(false));

  for (let j = 1; j < grid.length - 1; j++) {
    calcRowVisible(grid, j, statusGrid);
  }

  for (let i = 1; i < grid[0].length - 1; i++) {
    calcColVisible(grid, i, statusGrid);
  }

  for (let k = 1; k < grid.length - 1; k++) {
    visibles += statusGrid[k].slice(1, -1).filter((b) => b).length;
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
