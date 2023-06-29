import { lcm, readFromFile } from "../utils";
import * as readline from "readline";

type Pos = [number, number]; // [y, x]
type Blizzard = {
  y: number;
  x: number;
  dir: "^" | "v" | "<" | ">";
};

const parseFirstBlizzard = (grid: string[][]) => {
  const blizzards: Blizzard[] = [];

  for (let j = 0; j < grid.length; j++) {
    for (let i = 0; i < grid[0].length; i++) {
      if (/^[\^v<>]$/.test(grid[j][i])) {
        blizzards.push({
          y: j,
          x: i,
          dir: grid[j][i] as Blizzard["dir"],
        });
      }
    }
  }

  return blizzards;
};

const getNextBlizzard = (blizzards: Blizzard[], length: Pos) => {
  const [rowLength, colLength] = length;

  const newGrid = Array.from({ length: rowLength }, (_, rk) =>
    Array.from({ length: colLength }, (_, ck) => {
      if (
        rk === 0 ||
        rk === rowLength - 1 ||
        ck === 0 ||
        ck === colLength - 1
      ) {
        return "#";
      } else {
        return ".";
      }
    })
  ) as string[][];

  newGrid[0][1] = ".";
  newGrid[rowLength - 1][colLength - 2] = ".";

  const newBlizzards = blizzards.map((b) => Object.assign({}, b));

  for (const nb of newBlizzards) {
    switch (nb.dir) {
      case "^":
        nb.y = nb.y > 1 ? nb.y - 1 : rowLength - 2;
        break;

      case "v":
        nb.y = nb.y < rowLength - 2 ? nb.y + 1 : 1;
        break;

      case "<":
        nb.x = nb.x > 1 ? nb.x - 1 : colLength - 2;
        break;

      case ">":
        nb.x = nb.x < colLength - 2 ? nb.x + 1 : 1;
        break;
    }

    newGrid[nb.y][nb.x] = ((g: string) => {
      if (g === ".") {
        return nb.dir;
      } else if (/^[\^v<>]$/.test(g)) {
        return "2";
      } else {
        return String(+g + 1);
      }
    })(newGrid[nb.y][nb.x]);
  }

  return { newGrid, newBlizzards };
};

const bfs = async (
  firstGrid: string[][],
  blizzards: Blizzard[],
  startPos: Pos,
  goalPos: Pos,
  modTime: number,
  direction: "StoG" | "GtoS",
  timeWait: number,
  status: number
) => {
  const visited = new Map<string, number>();
  const queue = [
    {
      bliz: blizzards,
      pos: startPos,
      minute: 0,
      visited: visited,
    },
  ];

  const rowLength = firstGrid.length;
  const colLength = firstGrid[0].length;
  let minute = 0;
  let nextGrid = firstGrid;
  let nextBlizzards = blizzards;

  while (queue.length > 0) {
    const c = queue.shift()!;
    const [row, col] = c.pos;

    // out of range
    if (row < 0 || row >= rowLength || col < 0 || col >= colLength) {
      continue;
    }

    // update blizzard
    if (minute < c.minute) {
      const { newGrid, newBlizzards } = getNextBlizzard(c.bliz, [
        rowLength,
        colLength,
      ]);
      nextGrid = newGrid;
      nextBlizzards = newBlizzards;

      minute++;

      readline.cursorTo(process.stdout, 0, 0);

      for (let i = 0; i < rowLength; i++) {
        const nline = nextGrid[i];

        if (i === 0 || i === rowLength - 1) {
          process.stdout.write("\x1b[92m");
          process.stdout.write(nline.join("") + "\n");
        } else {
          process.stdout.write(
            `\x1b[92m${nline[0]}\x1b[90m${nline
              .slice(1, colLength - 1)
              .join("")}\x1b[92m${nline[colLength - 1]}\n`
          );
        }
      }
    }

    // この場所に動けない場合
    if (/^[\^<>v234#]$/.test(nextGrid[row][col])) {
      continue;
    }

    // ブリザードのループパターンで前と同じ位置にいた場合は切り捨て
    if (visited.has(`${row},${col},${c.minute % modTime}`)) {
      continue;
    }
    visited.set(`${row},${col},${c.minute % modTime}`, 0);

    // 時間に対してゴールから遠い場所は切り捨て
    const d =
      direction === "StoG" ? row + col : startPos[0] - row + startPos[1] - col;
    if (d < -10 + 0.5 * c.minute) {
      continue;
    }

    // 描画用
    await new Promise((resolve) => {
      readline.cursorTo(process.stdout, col, row);
      process.stdout.write(`\x1b[97;41m.\x1b[40m`);

      readline.cursorTo(process.stdout, 0, rowLength + status);

      const name = status === 0 ? "Start:" : status === 1 ? "Back" : "Again:";
      console.log("\x1b[97m" + name, minute, " ");

      for (let i = 0; i < timeWait; i++) {
        // wait...
      }

      resolve(0);
    });

    // goal
    if (row === goalPos[0] && col === goalPos[1]) {
      return { minute: c.minute, bliz: nextBlizzards, grid: nextGrid };
    }

    // down
    queue.push({
      bliz: nextBlizzards,
      pos: [row + 1, col],
      minute: c.minute + 1,
      visited: visited,
    });
    // right
    queue.push({
      bliz: nextBlizzards,
      pos: [row, col + 1],
      minute: c.minute + 1,
      visited: visited,
    });
    // up
    queue.push({
      bliz: nextBlizzards,
      pos: [row - 1, col],
      minute: c.minute + 1,
      visited: visited,
    });
    // left
    queue.push({
      bliz: nextBlizzards,
      pos: [row, col - 1],
      minute: c.minute + 1,
      visited: visited,
    });
    // wait
    queue.push({
      bliz: nextBlizzards,
      pos: [row, col],
      minute: c.minute + 1,
      visited: visited,
    });
  }
};

const blizzardBasin = async (readlines: string[], timeWait: number) => {
  const grid = readlines.map((s) => s.split(""));
  const blizzards = parseFirstBlizzard(grid);

  const rowLength = grid.length;
  const colLength = grid[0].length;
  const modTime = lcm(rowLength - 2, colLength - 2);

  await new Promise((resolve) => {
    readline.cursorTo(process.stdout, 0, 0);

    for (let i = 0; i < rowLength; i++) {
      const nline = grid[i];

      if (i === 0 || i === rowLength - 1) {
        process.stdout.write("\x1b[92m");
        process.stdout.write(nline.join("") + "\n");
      } else {
        process.stdout.write(
          `\x1b[92m${nline[0]}\x1b[90m${nline
            .slice(1, colLength - 1)
            .join("")}\x1b[92m${nline[colLength - 1]}\n`
        );
      }
    }

    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  const {
    minute: minuteStoG,
    bliz: blizStoG,
    grid: gridStoG,
  } = (await bfs(
    grid,
    blizzards,
    [0, 1],
    [rowLength - 1, colLength - 2],
    modTime,
    "StoG",
    timeWait,
    0
  ))!;

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  const {
    minute: minuteGtoS,
    bliz: blizGtoS,
    grid: gridGtoS,
  } = (await bfs(
    gridStoG,
    blizStoG,
    [rowLength - 1, colLength - 2],
    [0, 1],
    modTime,
    "GtoS",
    timeWait,
    1
  ))!;

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  const { minute: minuteAgainStoG } = (await bfs(
    gridGtoS,
    blizGtoS,
    [0, 1],
    [rowLength - 1, colLength - 2],
    modTime,
    "StoG",
    timeWait,
    2
  ))!;

  return minuteStoG + minuteGtoS + minuteAgainStoG;
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  // const exampleSmall = await readFromFile("./example-small.txt");
  // console.log(await blizzardBasin(exampleSmall, 100_000_000)); // 30

  // const example = await readFromFile("./example.txt");
  // console.log(await blizzardBasin(example, 300_000_000)); // 54

  const input = await readFromFile("./input.txt");
  console.log(await blizzardBasin(input, 1_000_000)); // 974
})();
