import { readFromFile, Coord } from "../utils";

/** 次の砂の動きを返す */
const getNextMoveSand = (
  currentPos: Coord,
  rockSet: Set<string>,
  mostDepthY: number
) => {
  const [x, y] = currentPos;

  // not endless!
  if (y + 1 === mostDepthY + 2) {
    return currentPos;
  }

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

const simulateSand = (
  rockSet: Set<string>,
  mostDepthY: number,
  startPos: Coord
) => {
  /** 過去の砂の進み方をメモ化する */
  const memo: string[] = [`${startPos}`];
  let sandRests = 0;

  while (true) {
    if (rockSet.has(`${startPos}`) || memo.length === 0) {
      return sandRests;
    }

    const currentPos = Coord.fromString(memo.at(-1)!);
    const nextPos = getNextMoveSand(currentPos, rockSet, mostDepthY);

    if (`${nextPos}` === `${currentPos}`) {
      rockSet.add(`${currentPos}`);
      sandRests++;
      memo.pop();
    } else {
      memo.push(`${nextPos}`);
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

      [prevX, prevY] = [nextX, nextY];
    }
  }

  return { rockSet, mostDepthY };
};

const regolithReservoir = (readlines: string[]) => {
  const rockCoords = readlines.map((line) =>
    line.split(" -> ").map((pos) => Coord.fromString(pos))
  );

  const { rockSet, mostDepthY } = getSolidRock(rockCoords);
  const sandRests = simulateSand(rockSet, mostDepthY, new Coord(500, 0));

  return sandRests;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(regolithReservoir(example)); // 93

  const input = await readFromFile("./input.txt");
  console.log(regolithReservoir(input)); // 31706
})();
