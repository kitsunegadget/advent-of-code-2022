import { readFromFile } from "../utils";
import * as readline from "readline";

type Pos = [number, number];

type Point = {
  row: number;
  col: number;
  prev: string;
  step: number;
};

let visualGrid: string[][];
let visualStep = 0;
let visualWait = 0;

const printVisualize = async (row: number, col: number, step: number) => {
  visualGrid[row][
    col
  ] = `\x1b[30;10${visualStep}m${visualGrid[row][col]}\x1b[0m`;

  await new Promise((resolve) => {
    if (visualWait === 0) {
      readline.cursorTo(process.stdout, 0, 0);
      for (let i = 0; i < visualGrid.length; i++) {
        console.log(visualGrid[i].join(""));
      }

      readline.cursorTo(process.stdout, 0, visualGrid.length);
      console.log(step, "   ");

      resolve(0);
    } else {
      setTimeout(() => {
        readline.cursorTo(process.stdout, col, row);
        console.log(visualGrid[row][col]);

        readline.cursorTo(process.stdout, 0, visualGrid.length);
        console.log(step, "   ");

        resolve(0);
      }, visualWait);
    }
  });

  visualStep = step % 7;
};

const bfs = async (
  grid: string[][],
  initPoint: Point,
  endPosStr: string,
  stepMap = new Map<string, number>()
) => {
  const queue: Point[] = [initPoint];

  while (queue.length !== 0) {
    const { row, col, prev, step } = queue.shift()!;

    if (row < 0 || grid.length <= row || col < 0 || grid[0].length <= col) {
      continue;
    }

    const current = grid[row][col];

    if (prev.charCodeAt(0) + 1 < current.charCodeAt(0)) {
      continue;
    }

    const posStr = `${row},${col}`;

    if (posStr === endPosStr) {
      return step;
    }

    if (!stepMap.has(posStr) || step < stepMap.get(posStr)!) {
      stepMap.set(posStr, step);
    } else {
      continue;
    }

    await printVisualize(row, col, step);

    queue.push({ row: row - 1, col: col, prev: current, step: step + 1 });
    queue.push({ row: row + 1, col: col, prev: current, step: step + 1 });
    queue.push({ row: row, col: col - 1, prev: current, step: step + 1 });
    queue.push({ row: row, col: col + 1, prev: current, step: step + 1 });
  }

  return Infinity;
};

const hillClimbingAlgorithm = async (readlines: string[]) => {
  const grid = readlines.map((line) => line.split(""));
  let startPoint: Pos = [0, 0];
  let endPoint: Pos = [0, 0];

  visualGrid = Array.from(grid, (v) => Array.from(v));

  for (let i = 0; i < readlines.length; i++) {
    const si = readlines[i].indexOf("S");

    if (si !== -1) {
      startPoint = [i, si];
      grid[i][si] = "a";
      visualGrid[i][si] = "\x1b[30;107mS\x1b[0m";
    }

    const ei = readlines[i].indexOf("E");

    if (ei !== -1) {
      endPoint = [i, ei];
      grid[i][ei] = "z";
      visualGrid[i][ei] = "\x1b[30;107mE\x1b[0m";
    }
  }

  await new Promise((resolve) => {
    for (let i = 0; i < visualGrid.length; i++) {
      console.log(visualGrid[i].join(""));
    }

    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  const endPosStr = `${endPoint[0]},${endPoint[1]}`;

  const minStep = await bfs(
    grid,
    { row: startPoint[0], col: startPoint[1], prev: "a", step: 0 },
    endPosStr
  );

  readline.cursorTo(process.stdout, 0, visualGrid.length);
  return minStep;
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  // const example = await readFromFile("./example.txt");
  // visualWait = 100;
  // console.log(await hillClimbingAlgorithm(example)); // 31

  const input = await readFromFile("./input.txt");
  visualWait = 0;
  console.log(await hillClimbingAlgorithm(input)); // 517
})();
