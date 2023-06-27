import { readFromFile, Coord } from "../utils";

type Rock = {
  coords: Set<string>;
  height: number;
};

type Pos = [number, number]; // [y, x]

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

const simulateFlow = (jetPatterns: string, rockSets: Rock[], limit: number) => {
  const restRock = new Set<string>();
  let height = 0;
  let totalRocks = 0;

  const rockOrder = new Order(rockSets.length);
  const jetOrder = new Order(jetPatterns.length);

  let cRock = rockSets[+rockOrder];
  let cRockPos: Pos = [height + 3, 2];

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

    // down
    if (
      !checkCollision(restRock, cRock.coords, [cRockPos[0] - 1, cRockPos[1]])
    ) {
      cRockPos[0]--;
      //
    } else {
      setRestRock(restRock, cRock.coords, cRockPos);
      totalRocks++;

      const newHeight = cRockPos[0] + cRock.height;

      if (height < newHeight) {
        height = newHeight;
      }

      rockOrder.next();

      cRock = rockSets[+rockOrder];
      cRockPos = [height + 3, 2];
    }
  }

  return height;
};

const pyroclasticFlow = (jetPatterns: string, rockPatterns: string[]) => {
  const rockSets = parseRockPatterns(rockPatterns);
  const height = simulateFlow(jetPatterns, rockSets, 2022);

  return height;
};

(async () => {
  const rockPatterns = await readFromFile("./rockPatterns.txt", true);

  const [example] = await readFromFile("./example.txt");
  console.log(pyroclasticFlow(example, rockPatterns)); // 3068

  const [input] = await readFromFile("./input.txt");
  console.log(pyroclasticFlow(input, rockPatterns)); // 3197
})();
