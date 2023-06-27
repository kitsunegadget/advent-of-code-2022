import { readFromFile, Coord, sumArray } from "../utils";

type Limit = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

const getLimit = (readlines: string[]) => {
  let limit: Limit = {
    minX: Infinity,
    minY: Infinity,
    minZ: Infinity,
    maxX: -Infinity,
    maxY: -Infinity,
    maxZ: -Infinity,
  };

  for (const line of readlines) {
    const [x, y, z] = Coord.fromString(line);

    if (x < limit.minX) {
      limit.minX = x;
    }
    if (limit.maxX < x) {
      limit.maxX = x;
    }
    if (y < limit.minY) {
      limit.minY = y;
    }
    if (limit.maxY < y) {
      limit.maxY = y;
    }
    if (z < limit.minZ) {
      limit.minZ = z;
    }
    if (limit.maxZ < z) {
      limit.maxZ = z;
    }
  }

  return limit as Readonly<Limit>;
};

const getAreaSurface = (
  gridSet: Set<string>,
  closedSet: Set<string>,
  openedSet: Set<string>,
  limit: Limit,
  pos: string
) => {
  const [x, y, z] = Coord.fromString(pos);
  let areaSurfaces = 0;

  // 6 direction
  let counter = 0;
  const i = [-1, 1, 0, 0, 0, 0] as const;
  const j = [0, 0, -1, 1, 0, 0] as const;
  const k = [0, 0, 0, 0, -1, 1] as const;

  while (counter < 6) {
    const newPos = `${x + i[counter]},${y + j[counter]},${z + k[counter]}`;

    if (!gridSet.has(newPos)) {
      const isClosed = searchClosedSpace(
        gridSet,
        closedSet,
        openedSet,
        limit,
        newPos
      );

      if (isClosed) {
        closedSet.add(newPos);
      } else {
        openedSet.add(newPos);
        areaSurfaces++;
      }
    }

    counter++;
  }

  return areaSurfaces;
};

const searchClosedSpace = (
  gridSet: Set<string>,
  closedSet: Set<string>,
  openedSet: Set<string>,
  limits: Limit,
  startPos: string
) => {
  const queue: string[] = [startPos];
  const visited = new Set<string>();

  while (queue.length !== 0) {
    const cPos = queue.shift()!;
    const [x, y, z] = Coord.fromString(cPos);

    if (visited.has(cPos) || gridSet.has(cPos)) {
      continue;
    }
    visited.add(cPos);

    if (closedSet.has(cPos)) {
      return true;
    }

    if (openedSet.has(cPos)) {
      return false;
    }

    if (x < limits.minX || limits.maxX < x) {
      return false;
    }
    if (y < limits.minY || limits.maxY < y) {
      return false;
    }
    if (z < limits.minZ || limits.maxZ < z) {
      return false;
    }

    // 6 direction
    let counter = 0;
    const i = [-1, 1, 0, 0, 0, 0] as const;
    const j = [0, 0, -1, 1, 0, 0] as const;
    const k = [0, 0, 0, 0, -1, 1] as const;

    while (counter < 6) {
      const newPos = `${x + i[counter]},${y + j[counter]},${z + k[counter]}`;
      queue.push(newPos);

      counter++;
    }
  }

  return true;
};

// 囲まれた空間にある側面は数えない（すなわち外側の表面積のみ）
const boilingBoulders = (readlines: string[]) => {
  const gridSet = new Set<string>(readlines);
  const limit = getLimit(readlines);

  const closedSet = new Set<string>();
  const openedSet = new Set<string>();

  return sumArray([...gridSet], (pos) =>
    getAreaSurface(gridSet, closedSet, openedSet, limit, pos)
  );
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(boilingBoulders(example)); // 58

  const input = await readFromFile("./input.txt");
  console.log(boilingBoulders(input)); // 2000
})();
