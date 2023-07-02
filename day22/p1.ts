import { readFromFile } from "../utils";

type Pos = [number, number]; // [y, x]

const parseMap = (sMap: string[]) => {
  const [maxColLength] = sMap.map((s) => s.length).sort((a, b) => b - a);
  return sMap.map((s) => s.padEnd(maxColLength, " "));
};

const parseFollow = (sFollow: string) => {
  return sFollow.match(/\d+|[RL]/g)!;
};

const changeFacing = (current: number, dir: string) => {
  return dir === "R" ? (current + 1) % 4 : (current + 3) % 4;
};

const getAreaLimit = (map: string[], fixedAxis: number, facing: number) => {
  if (facing === 0) {
    return map[fixedAxis].search(/[.#]/);
  }

  if (facing === 1) {
    for (let i = 0; ; i++) {
      if (map[i][fixedAxis] !== " ") {
        return i;
      }
    }
  }

  if (facing === 2) {
    return map[fixedAxis].search(/[.#](\s|$)/);
  }

  if (facing === 3) {
    for (let i = map.length - 1; ; i--) {
      if (map[i][fixedAxis] !== " ") {
        return i;
      }
    }
  }

  throw new Error("facing not found.");
};

const followLine = (
  map: string[],
  cPos: Pos,
  step: number,
  facing: number
): [number, number] => {
  const [cRow, cCol] = cPos;
  const rowLength = map.length;
  const colLength = map[cCol].length;

  // right
  if (facing === 0) {
    const areaLeft = getAreaLimit(map, cRow, facing);
    let base = cCol;
    let newCol = cCol;

    for (let t = 1; t <= step; t++) {
      if (base + t >= colLength || map[cRow][base + t] === " ") {
        base = areaLeft - t;
      }

      const next = map[cRow][base + t];

      if (next === "#") {
        break;
      }

      newCol = base + t;
    }

    return [cRow, newCol];
  }

  // down
  if (facing === 1) {
    const areaDown = getAreaLimit(map, cCol, facing);
    let base = cRow;
    let newRow = cRow;

    for (let t = 1; t <= step; t++) {
      if (base + t >= rowLength || map[base + t][cCol] === " ") {
        base = areaDown - t;
      }

      const next = map[base + t][cCol];

      if (next === "#") {
        break;
      }

      newRow = base + t;
    }

    return [newRow, cCol];
  }

  // left
  if (facing === 2) {
    const areaRight = getAreaLimit(map, cRow, facing);
    let base = cCol;
    let newCol = cCol;

    for (let t = 1; t <= step; t++) {
      if (base - t < 0 || map[cRow][base - t] === " ") {
        base = areaRight + t;
      }

      const next = map[cRow][base - t];

      if (next === "#") {
        break;
      }

      newCol = base - t;
    }

    return [cRow, newCol];
  }

  // up
  if (facing === 3) {
    const areaUp = getAreaLimit(map, cCol, facing);
    let base = cRow;
    let newRow = cRow;

    for (let t = 1; t <= step; t++) {
      if (base - t < 0 || map[base - t][cCol] === " ") {
        base = areaUp + t;
      }

      const next = map[base - t][cCol];

      if (next === "#") {
        break;
      }

      newRow = base - t;
    }

    return [newRow, cCol];
  }

  throw new Error("facing not found.");
};

const traversePath = (map: string[], follows: string[]) => {
  const startPos: Pos = [0, map[0].indexOf(".")];

  let cPos = startPos;
  let facing = 0;

  for (let i = 0; i < follows.length; i++) {
    if (Number.isNaN(+follows[i])) {
      facing = changeFacing(facing, follows[i]);
      continue;
    }

    cPos = followLine(map, cPos, +follows[i], facing);
  }

  return { cPos, facing };
};

const monkeyMap = (readGroups: string[]) => {
  const [sMap, sFollow] = readGroups;
  const map = parseMap(sMap.split("\n"));
  const follows = parseFollow(sFollow);

  const { cPos, facing } = traversePath(map, follows);

  return 1000 * (cPos[0] + 1) + 4 * (cPos[1] + 1) + facing;
};

(async () => {
  const example = await readFromFile("./example.txt", true);
  console.log(monkeyMap(example)); // 6032

  const input = await readFromFile("./input.txt", true);
  console.log(monkeyMap(input)); // 66292
})();
