import { readFromFile, Coord } from "../utils";
import * as readline from "readline";

let timeWait = 0;
let visualPad = 0;
let padPos = 0;

const createVisualGrid = (
  rockSet: Set<string>,
  minX: number,
  maxX: number,
  maxY: number
) => {
  const visualGrid = Array.from(
    { length: maxY + 1 },
    (v) => (v = Array.from({ length: maxX - minX + visualPad }, () => "　"))
  );

  for (const rock of rockSet) {
    const [x, y] = rock.split(",").map(Number);
    visualGrid[y][x - minX + padPos] = "🟦";
  }

  return visualGrid;
};

const printVisualGrid = (grid: string[][]) => {
  for (const line of grid) {
    console.log(line.join(""));
  }
};

/** 次の砂の動きを返す */
const getNextMoveSand = (currentPos: Coord, rockSet: Set<string>) => {
  const [x, y] = currentPos;

  // down
  if (!rockSet.has(`${x},${y + 1}`)) {
    return new Coord(x, y + 1);
  }

  // down left
  if (!rockSet.has(`${x - 1},${y + 1}`)) {
    return new Coord(x - 1, y + 1);
  }

  // down right
  if (!rockSet.has(`${x + 1},${y + 1}`)) {
    return new Coord(x + 1, y + 1);
  }

  return currentPos;
};

const simulateSand = async (
  rockSet: Set<string>,
  mostDepthY: number,
  startPos: Coord,
  minX: number
) => {
  let currentPos = startPos;
  let sandRests = 0;

  while (true) {
    const nextPos = getNextMoveSand(currentPos, rockSet);

    const [cx, cy] = currentPos;
    const [nx, ny] = nextPos;

    if (nextPos.coords[1] === mostDepthY) {
      readline.cursorTo(process.stdout, (nx - minX + padPos) * 2, ny);
      console.log("🔻");

      return sandRests;
    }

    await new Promise((resolve) => {
      readline.cursorTo(process.stdout, (cx - minX + padPos) * 2, cy);
      console.log("　");

      readline.cursorTo(process.stdout, (nx - minX + padPos) * 2, ny);
      console.log("🟨");

      if (timeWait === 0) {
        for (let i = 0; i < 500000; i++) {
          // wait...
        }
        resolve(0);
      } else {
        setTimeout(() => {
          resolve(0);
        }, timeWait);
      }
    });

    if (`${nextPos}` === `${currentPos}`) {
      rockSet.add(`${currentPos}`);
      sandRests++;
      currentPos = startPos;

      readline.cursorTo(process.stdout, 0, mostDepthY + 1);
      console.log(sandRests, "   ");
    } else {
      currentPos = nextPos;
    }
  }
};

const setRockLine = (
  prevX: number,
  prevY: number,
  diffX: number,
  diffY: number,
  rockSet: Set<string>
) => {
  const dx = diffX === 0 ? 1 : (diffX / Math.abs(diffX)) * -1;
  const dy = diffY === 0 ? 1 : (diffY / Math.abs(diffY)) * -1;

  for (let j = prevY; j !== prevY - diffY + dy; j += dy) {
    for (let i = prevX; i !== prevX - diffX + dx; i += dx) {
      rockSet.add(`${i},${j}`);
    }
  }
};

const getSolidRock = (rockCoords: Coord[][]) => {
  const rockSet = new Set<string>();
  let mostDepthY = 0;
  let minX = Infinity;
  let maxX = -Infinity;

  for (const coords of rockCoords) {
    let [prevX, prevY] = coords[0];

    for (let i = 0; i < coords.length; i++) {
      const [nextX, nextY] = coords[i];
      const diffX = prevX - nextX;
      const diffY = prevY - nextY;

      setRockLine(prevX, prevY, diffX, diffY, rockSet);

      if (nextY > mostDepthY) {
        mostDepthY = nextY;
      }

      if (nextX < minX) {
        minX = nextX;
      } else if (nextX > maxX) {
        maxX = nextX;
      }

      [prevX, prevY] = [nextX, nextY];
    }
  }

  return { rockSet, mostDepthY, minX, maxX };
};

const regolithReservoir = async (readlines: string[]) => {
  const rockCoords = readlines.map((line) =>
    line.split(" -> ").map((pos) => Coord.fromString(pos))
  );

  const { rockSet, mostDepthY, minX, maxX } = getSolidRock(rockCoords);
  const visualGrid = createVisualGrid(rockSet, minX, maxX, mostDepthY);

  await new Promise((resolve) => {
    printVisualGrid(visualGrid);
    console.log();
    console.log();

    setTimeout(() => {
      resolve(0);
    }, 500);
  });

  const sandRests = await simulateSand(
    rockSet,
    mostDepthY,
    new Coord(500, 0),
    minX
  );

  readline.cursorTo(process.stdout, 0, mostDepthY + 1);
  return sandRests;
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  // const example = await readFromFile("./example.txt");
  // timeWait = 50;
  // visualPad = 20;
  // padPos = 8;
  // console.log(await regolithReservoir(example)); // 24

  const input = await readFromFile("./input.txt");
  timeWait = 0;
  visualPad = 300;
  padPos = 131;
  console.log(await regolithReservoir(input)); // 692
})();
