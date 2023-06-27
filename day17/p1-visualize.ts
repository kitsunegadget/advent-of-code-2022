import { readFromFile, Coord } from "../utils";
import * as readline from "readline";

const visualSplitCol = 90;

type Rock = {
  coords: Set<string>;
  height: number;
};

type Pos = [number, number]; // [y, x]

const createVisualGrid = (limit: number) => {
  const rowLength = Math.ceil(limit / visualSplitCol);
  let cols = "";
  for (let i = 0; i < rowLength; i++) {
    cols += "\x1b[90m▓       ▓";
  }

  const grid = Array.from({ length: visualSplitCol }, () => cols);
  grid.push("▓▓▓▓▓▓▓▓▓\x1b[0m");

  return grid;
};

const printVisualGrid = (grid: string[]) => {
  for (const line of grid) {
    console.log(line);
  }
};

const printRockPattern = async (
  rock: Set<string>,
  currentPos: Pos,
  waitTime: number,
  rockOrder?: number
) => {
  await new Promise((resolve) => {
    for (const r of rock) {
      const [ry, rx] = Coord.fromString(r);

      const visualX =
        1 +
        currentPos[1] +
        rx +
        9 * Math.floor((currentPos[0] + ry) / visualSplitCol);
      const visualY =
        visualSplitCol - ((currentPos[0] + ry) % visualSplitCol) - 1;

      readline.cursorTo(process.stdout, visualX, visualY);

      if (rockOrder != null) {
        process.stdout.write(`\x1b[9${rockOrder + 1}m#\x1b[97m`);
      } else {
        process.stdout.write(`#`);
      }
    }

    for (let i = 0; i < waitTime; i++) {
      // wait...
    }

    resolve(0);
  });
};

const eraseRockPattern = (rock: Set<string>, currentPos: Pos) => {
  for (const r of rock) {
    const [ry, rx] = Coord.fromString(r);

    const visualX =
      1 +
      currentPos[1] +
      rx +
      9 * Math.floor((currentPos[0] + ry) / visualSplitCol);
    const visualY =
      visualSplitCol - ((currentPos[0] + ry) % visualSplitCol) - 1;

    readline.cursorTo(process.stdout, visualX, visualY);

    process.stdout.write(" ");
  }
};

/** パターンの順序を保持するためのクラス */
class Order {
  #order: number;
  readonly size: number;

  constructor(size: number) {
    this.#order = 0;
    this.size = size;
  }

  [Symbol.toPrimitive]() {
    return this.#order;
  }

  get order() {
    return this.#order;
  }

  next() {
    this.#order = (this.#order + 1) % this.size;
  }
}

// ピボットは左下に設定
const parseRockPatterns = (rockPatterns: string[]) => {
  const rockSets: Rock[] = [];

  for (const rock of rockPatterns) {
    const lines = rock.split("\n").reverse();
    const coordSet = new Set<string>();

    for (let h = 0; h < lines.length; h++) {
      for (let w = 0; w < lines[h].length; w++) {
        if (lines[h][w] === "#") {
          coordSet.add(`${h},${w}`);
        }
      }
    }

    rockSets.push({ coords: coordSet, height: lines.length });
  }

  return rockSets;
};

const checkCollision = (
  restRock: Set<string>,
  currentRock: Set<string>,
  currentPos: Pos
) => {
  for (const rockPosStr of currentRock) {
    const [rockY, rockX] = Coord.fromString(rockPosStr);
    const newY = currentPos[0] + rockY;
    const newX = currentPos[1] + rockX;

    if (newY < 0 || newX < 0 || 6 < newX || restRock.has(`${newY},${newX}`)) {
      return true;
    }
  }

  return false;
};

const setRestRock = (
  restRock: Set<string>,
  rocks: Set<string>,
  rockPos: Pos
) => {
  for (const r of rocks) {
    const [ry, rx] = Coord.fromString(r);
    restRock.add(`${rockPos[0] + ry},${rockPos[1] + rx}`);
  }
};

const simulateFlow = async (
  jetPatterns: string,
  rockSets: Rock[],
  limit: number
) => {
  const restRock = new Set<string>();
  let height = 0;
  let totalRocks = 0;

  const rockOrder = new Order(rockSets.length);
  const jetOrder = new Order(jetPatterns.length);

  let cRock = rockSets[+rockOrder];
  let cRockPos: Pos = [height + 3, 2];

  let baseTime = 160_000_000;
  let waitCount = 1;
  let waitTime = baseTime - Math.log(waitCount) * 100;

  // 1落下ごとにループ
  while (totalRocks < limit) {
    // jet
    const jet = jetPatterns[+jetOrder];

    if (
      jet === "<" &&
      !checkCollision(restRock, cRock.coords, [cRockPos[0], cRockPos[1] - 1])
    ) {
      cRockPos[1]--;
      //
    } else if (
      jet === ">" &&
      !checkCollision(restRock, cRock.coords, [cRockPos[0], cRockPos[1] + 1])
    ) {
      cRockPos[1]++;
    }

    jetOrder.next();

    await printRockPattern(cRock.coords, cRockPos, waitTime);
    eraseRockPattern(cRock.coords, cRockPos);

    // down
    if (
      !checkCollision(restRock, cRock.coords, [cRockPos[0] - 1, cRockPos[1]])
    ) {
      cRockPos[0]--;

      await printRockPattern(cRock.coords, cRockPos, waitTime);
      eraseRockPattern(cRock.coords, cRockPos);
      //
    } else {
      setRestRock(restRock, cRock.coords, cRockPos);
      totalRocks++;

      printRockPattern(cRock.coords, cRockPos, 0, +rockOrder);
      readline.cursorTo(process.stdout, 0, visualSplitCol + 1);
      process.stdout.write(`${totalRocks}`);

      const newHeight = cRockPos[0] + cRock.height;

      if (height < newHeight) {
        height = newHeight;
      }

      rockOrder.next();

      cRock = rockSets[+rockOrder];
      cRockPos = [height + 3, 2];
    }

    waitTime =
      waitTime > 0
        ? Math.floor(baseTime - 16_000_000 * Math.log2(waitCount))
        : 0;
    waitCount++;
  }

  return height;
};

const pyroclasticFlow = async (jetPatterns: string, rockPatterns: string[]) => {
  const visualGrid = createVisualGrid(3200);
  printVisualGrid(visualGrid);

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  const rockSets = parseRockPatterns(rockPatterns);
  const height = await simulateFlow(jetPatterns, rockSets, 2022);

  readline.cursorTo(process.stdout, 0, visualSplitCol + 2);
  return height;
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  const rockPatterns = await readFromFile("./rockPatterns.txt", true);

  // const [example] = await readFromFile("./example.txt");
  // console.log(await pyroclasticFlow(example, rockPatterns)); // 3068

  const [input] = await readFromFile("./input.txt");
  console.log(await pyroclasticFlow(input, rockPatterns)); // 3197
})();
