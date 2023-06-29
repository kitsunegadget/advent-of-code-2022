import { Coord, readFromFile } from "../utils";
import * as readline from "node:readline";

type Direction = "N" | "NE" | "E" | "SE" | "S" | "SW" | "W" | "NW";

const printVisualGrid = (gridSet: Set<string>, round: number) => {
  const grid = [...gridSet].map((s) => Coord.fromString(s).coords);
  const sortedRow = grid.map((c) => c[0]).sort((a, b) => a - b);
  const sortedCol = grid.map((c) => c[1]).sort((a, b) => a - b);

  const rowLen = Math.abs(sortedRow.at(-1)! - sortedRow[0]) + 1;
  const colLen = Math.abs(sortedCol.at(-1)! - sortedCol[0]) + 1;

  const vGrid = Array.from({ length: rowLen }, () =>
    Array.from({ length: colLen }, () => "")
  );

  for (let j = 0; j < rowLen; j++) {
    for (let i = 0; i < colLen; i++) {
      vGrid[j][i] = gridSet.has(`${sortedRow[0] + j},${sortedCol[0] + i}`)
        ? "\x1b[93m▇▊"
        : "\x1b[90m()";
    }
  }

  readline.cursorTo(process.stdout, 0, 0);

  let count = 0;

  for (const line of vGrid) {
    readline.cursorTo(
      process.stdout,
      26 + sortedCol[0] * 2,
      12 + sortedRow[0] + count
    );

    process.stdout.write(line.join("") + "\n");
    count++;
  }

  readline.cursorTo(
    process.stdout,
    26 + sortedCol[0] * 2,
    12 + sortedRow[0] + count
  );
  process.stdout.write(`\x1b[0m- Round ${round} - `);
};

const parseGridSet = (readLines: string[]) => {
  const gridSet = new Set<string>();

  for (let r = 0; r < readLines.length; r++) {
    for (let c = 0; c < readLines[0].length; c++) {
      if (readLines[r][c] === "#") {
        gridSet.add(`${r},${c}`);
      }
    }
  }

  return gridSet;
};

const consider8Pos = (
  gridSet: Set<string>,
  row: number,
  col: number,
  round: number
): [number, number] | null => {
  const directions: Direction[] = ["NW", "N", "NE", "W", "E", "SW", "S", "SE"];

  // search 8 directions
  const elf8Pos = new Set<Direction>();
  let count = 0;

  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r === row && c === col) {
        continue;
      }

      if (gridSet.has(`${r},${c}`)) {
        elf8Pos.add(directions[count]);
      }

      count++;
    }
  }

  if (elf8Pos.size === 0) {
    return null;
  }

  // check no elf in directions
  const aElfPos = [...elf8Pos.values()];

  for (
    let i = 0, roundMod = (round - 1) % 4;
    i < 4;
    i++, roundMod = (roundMod + 1) % 4
  ) {
    if (roundMod === 0 && !aElfPos.some((e) => /^(N|NE|NW)$/.test(e))) {
      return [row - 1, col];
    }

    if (roundMod === 1 && !aElfPos.some((e) => /^(S|SE|SW)$/.test(e))) {
      return [row + 1, col];
    }

    if (roundMod === 2 && !aElfPos.some((e) => /^(W|NW|SW)$/.test(e))) {
      return [row, col - 1];
    }

    if (roundMod === 3 && !aElfPos.some((e) => /^(E|NE|SE)$/.test(e))) {
      return [row, col + 1];
    }
  }

  return null;
};

const runRound = (gridSet: Set<string>, round: number) => {
  const nGridSet = new Set<string>();
  const movedMap = new Map<string, string[]>(); // newPos -> oldPos[]

  for (const pos of gridSet) {
    const [r, c] = Coord.fromString(pos);
    const nextMove = consider8Pos(gridSet, r, c, round);

    if (nextMove == null) {
      nGridSet.add(pos);
    } else {
      const newPos = `${new Coord(...nextMove)}`;

      if (movedMap.has(newPos)) {
        movedMap.get(newPos)!.push(pos);
        nGridSet.delete(newPos);
      } else {
        movedMap.set(newPos, [pos]);
        nGridSet.add(newPos);
      }
    }
  }

  // 衝突していた場所を元の座標に戻す
  for (const moved of movedMap.values()) {
    if (moved.length > 1) {
      moved.forEach((m) => nGridSet.add(m));
    }
  }

  const isRoundStop = movedMap.size === 0 ? true : false;

  return { nGridSet, isRoundStop };
};

const unstableDiffusion = async (readLines: string[], timeWaitMS: number) => {
  const gridSet = parseGridSet(readLines);

  await new Promise((resolve) => {
    printVisualGrid(gridSet, 0);

    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  let newGridSet = gridSet;

  for (let i = 1; ; i++) {
    const result = await new Promise((resolve) => {
      const { nGridSet, isRoundStop } = runRound(newGridSet, i);
      printVisualGrid(nGridSet, i);

      if (isRoundStop) {
        resolve("STOP");
      }

      newGridSet = nGridSet;

      setTimeout(() => {
        resolve("");
      }, timeWaitMS);
    });

    if (result === "STOP") {
      return i;
    }
  }
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  // const example = await readFromFile("./example.txt");
  // console.log("\x1b[0mRound stop:", await unstableDiffusion(example, 500)); // 20

  const input = await readFromFile("./input.txt");
  console.log("\x1b[0mRound stop:", await unstableDiffusion(input, 0)); // 1079
})();
