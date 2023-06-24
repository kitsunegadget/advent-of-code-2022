import { readFromFile } from "../utils";

type Pos = [number, number];

type Point = {
  row: number;
  col: number;
  prev: string;
  step: number;
};

const bfs = (
  grid: string[][],
  initPoint: Point,
  stepMap = new Map<string, number>()
) => {
  const queue: Point[] = [initPoint];

  while (queue.length !== 0) {
    const { row, col, prev, step } = queue.shift()!;

    if (row < 0 || grid.length <= row || col < 0 || grid[0].length <= col) {
      continue;
    }

    const current = grid[row][col];

    if (prev.charCodeAt(0) - 1 > current.charCodeAt(0)) {
      continue;
    }

    if (current === "a") {
      return step;
    }

    const posStr = `${row},${col}`;

    if (!stepMap.has(posStr) || step < stepMap.get(posStr)!) {
      stepMap.set(posStr, step);
    } else {
      continue;
    }

    queue.push({ row: row - 1, col: col, prev: current, step: step + 1 });
    queue.push({ row: row + 1, col: col, prev: current, step: step + 1 });
    queue.push({ row: row, col: col - 1, prev: current, step: step + 1 });
    queue.push({ row: row, col: col + 1, prev: current, step: step + 1 });
  }

  return Infinity;
};

const hillClimbingAlgorithm = (readlines: string[]) => {
  const grid = readlines.map((line) => line.split(""));
  let startPoint: Pos = [0, 0];
  let endPoint: Pos = [0, 0];

  for (let i = 0; i < readlines.length; i++) {
    const si = readlines[i].indexOf("S");

    if (si !== -1) {
      startPoint = [i, si];
      grid[i][si] = "a";
    }

    const ei = readlines[i].indexOf("E");

    if (ei !== -1) {
      endPoint = [i, ei];
      grid[i][ei] = "z";
    }
  }

  const minStep = bfs(grid, {
    row: endPoint[0],
    col: endPoint[1],
    prev: "z",
    step: 0,
  });

  return minStep;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(hillClimbingAlgorithm(example)); // 29

  const input = await readFromFile("./input.txt");
  console.log(hillClimbingAlgorithm(input)); // 512
})();
