import { readFromFile } from "../utils";
import * as readline from "readline";

type Pos = [number, number]; // [y, x]
type Axis = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";

type Surface = {
  netPos: Pos;
  axis: [Axis, Axis];
};

type Connect = {
  right: string;
  down: string;
  left: string;
  up: string;
};

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

/** 隣の面の空間位置を取得する */
const getNextCoord = (axis: [Axis, Axis], moveDir: number) => {
  const axisCoord: Record<Axis, string> = {
    "+x": "1,0,0",
    "-x": "-1,0,0",
    "+y": "0,1,0",
    "-y": "0,-1,0",
    "+z": "0,0,1",
    "-z": "0,0,-1",
  };

  const axisCoordInv: Record<Axis, string> = {
    "+x": "-1,0,0",
    "-x": "1,0,0",
    "+y": "0,-1,0",
    "-y": "0,1,0",
    "+z": "0,0,-1",
    "-z": "0,0,1",
  };

  switch (moveDir) {
    case 0: // right
      return axisCoord[axis[1]];
    case 1: // down
      return axisCoord[axis[0]];
    case 2: // left
      return axisCoordInv[axis[1]];
    case 3: // up
      return axisCoordInv[axis[0]];
  }

  throw new Error(`'dir': ${moveDir} not found.`);
};

/** 展開図での隣の面の軸を取得する */
const getNextNetAxis = (axis: [Axis, Axis], moveDir: number): [Axis, Axis] => {
  const [axisY, axisX] = axis;
  const A = axisY[1];
  const B = axisX[1];

  const coordDir: Record<string, Axis> = {
    yx: "+z",
    xy: "-z",
    xz: "+y",
    zx: "-y",
    zy: "+x",
    yz: "-x",
  };

  const coordDirInv: Record<string, Axis> = {
    yx: "-z",
    xy: "+z",
    xz: "-y",
    zx: "+y",
    zy: "-x",
    yz: "+x",
  };

  switch (axis.join("")) {
    case `+${A}+${B}`:
    case `-${A}-${B}`:
      switch (moveDir) {
        case 0: // right
          return [axisY, coordDir[A + B]];
        case 1: // down
          return [coordDir[A + B], axisX];
        case 2: // left
          return [axisY, coordDirInv[A + B]];
        case 3: // up
          return [coordDirInv[A + B], axisX];
      }

    case `+${A}-${B}`:
    case `-${A}+${B}`:
      switch (moveDir) {
        case 0: // right
          return [axisY, coordDirInv[A + B]];
        case 1: // down
          return [coordDirInv[A + B], axisX];
        case 2: // left
          return [axisY, coordDir[A + B]];
        case 3: // up
          return [coordDir[A + B], axisX];
      }
  }

  throw new Error("Axis not found.");
};

const createSurfaceMap = (map: string[], surfaceLen: number) => {
  const surfaceMap = new Map<string, Surface>();

  const startX = map[0].indexOf(".");
  const startPos: Pos = [0, startX];
  const startNetPos: Pos = [0, Math.floor(startX / surfaceLen)];
  const startSurface: Surface = { netPos: startNetPos, axis: ["+y", "+x"] };

  const rowLength = map.length;
  const colLength = map[0].length;

  const stack = [
    {
      coord: "0,0,-1",
      pos: startPos,
      surface: startSurface,
    },
  ];

  while (stack.length > 0) {
    const c = stack.pop()!;
    const [cRow, cCol] = c.pos;

    if (
      cRow < 0 ||
      rowLength <= cRow ||
      cCol < 0 ||
      colLength <= cCol ||
      map[cRow][cCol] === " "
    ) {
      continue;
    }

    if (surfaceMap.has(c.coord)) {
      continue;
    }
    surfaceMap.set(c.coord, c.surface);

    const [cNetRow, cNetCol] = c.surface.netPos;

    // right
    stack.push({
      coord: getNextCoord(c.surface.axis, 0),
      pos: [cRow, cCol + surfaceLen],
      surface: {
        netPos: [cNetRow, cNetCol + 1],
        axis: getNextNetAxis(c.surface.axis, 0),
      },
    });

    // down
    stack.push({
      coord: getNextCoord(c.surface.axis, 1),
      pos: [cRow + surfaceLen, cCol],
      surface: {
        netPos: [cNetRow + 1, cNetCol],
        axis: getNextNetAxis(c.surface.axis, 1),
      },
    });

    // left
    stack.push({
      coord: getNextCoord(c.surface.axis, 2),
      pos: [cRow, cCol - surfaceLen],
      surface: {
        netPos: [cNetRow, cNetCol - 1],
        axis: getNextNetAxis(c.surface.axis, 2),
      },
    });

    // up
    stack.push({
      coord: getNextCoord(c.surface.axis, 3),
      pos: [cRow - surfaceLen, cCol],
      surface: {
        netPos: [cNetRow - 1, cNetCol],
        axis: getNextNetAxis(c.surface.axis, 3),
      },
    });
  }

  return surfaceMap;
};

const createConnectMap = (surfaceMap: Map<string, Surface>) => {
  const connectMap = new Map<string, Connect>();

  for (const surface of surfaceMap.values()) {
    const netPos = surface.netPos.join(",");

    const right = getNextCoord(surface.axis, 0);
    const rightNetPos = surfaceMap.get(right)!.netPos.join(",");

    const down = getNextCoord(surface.axis, 1);
    const downNetPos = surfaceMap.get(down)!.netPos.join(",");

    const left = getNextCoord(surface.axis, 2);
    const leftNetPos = surfaceMap.get(left)!.netPos.join(",");

    const up = getNextCoord(surface.axis, 3);
    const upNetPos = surfaceMap.get(up)!.netPos.join(",");

    connectMap.set(netPos, {
      right: rightNetPos,
      down: downNetPos,
      left: leftNetPos,
      up: upNetPos,
    });
  }

  return connectMap;
};

const getConvertedPos = (
  base: keyof Connect,
  target: keyof Connect,
  currentPos: Pos,
  nextNetPos: Pos,
  surfaceLen: number
) => {
  const nextFrontStart = (net: number) => surfaceLen * net;
  const nextBackStart = (net: number) => surfaceLen * (net + 1) - 1;
  const nextAxis = (net: number, pos: number) =>
    surfaceLen * net + ((surfaceLen + pos) % surfaceLen);
  const nextAxisInv = (net: number, pos: number) =>
    surfaceLen * (net + 1) - 1 - ((surfaceLen + pos) % surfaceLen);

  const [posY, posX] = currentPos;
  const [nNetY, nNetX] = nextNetPos;

  let nextY = 0;
  let nextX = 0;
  let nFacing = 0;

  if (base === "right") {
    switch (target) {
      case "right":
        nextY = nextAxisInv(nNetY, posY);
        nextX = nextBackStart(nNetX);
        break;
      case "down":
        nextY = nextBackStart(nNetY);
        nextX = nextAxis(nNetX, posY);
        break;
      case "left":
        nextY = nextAxis(nNetY, posY);
        nextX = nextFrontStart(nNetX);
        break;
      case "up":
        nextY = nextFrontStart(nNetY);
        nextX = nextAxisInv(nNetX, posY);
        break;
    }
  } else if (base === "down") {
    switch (target) {
      case "right":
        nextY = nextAxis(nNetY, posX);
        nextX = nextBackStart(nNetX);
        break;
      case "down":
        nextY = nextBackStart(nNetY);
        nextX = nextAxisInv(nNetX, posX);
        break;
      case "left":
        nextY = nextAxisInv(nNetY, posX);
        nextX = nextFrontStart(nNetX);
        break;
      case "up":
        nextY = nextFrontStart(nNetY);
        nextX = nextAxis(nNetX, posX);
        break;
    }
  } else if (base === "left") {
    switch (target) {
      case "right":
        nextY = nextAxis(nNetY, posY);
        nextX = nextBackStart(nNetX);
        break;
      case "down":
        nextY = nextBackStart(nNetY);
        nextX = nextAxisInv(nNetX, posY);
        break;
      case "left":
        nextY = nextAxisInv(nNetY, posY);
        nextX = nextFrontStart(nNetX);
        break;
      case "up":
        nextY = nextFrontStart(nNetY);
        nextX = nextAxis(nNetX, posY);
        break;
    }
  } else if (base === "up") {
    switch (target) {
      case "right":
        nextY = nextAxisInv(nNetY, posX);
        nextX = nextBackStart(nNetX);
        break;
      case "down":
        nextY = nextBackStart(nNetY);
        nextX = nextAxis(nNetX, posX);
        break;
      case "left":
        nextY = nextAxis(nNetY, posX);
        nextX = nextFrontStart(nNetX);
        break;
      case "up":
        nextY = nextFrontStart(nNetY);
        nextX = nextAxisInv(nNetX, posX);
        break;
    }
  }

  if (target === "right") {
    nFacing = 2;
  } else if (target === "down") {
    nFacing = 3;
  } else if (target === "left") {
    nFacing = 0;
  } else if (target === "up") {
    nFacing = 1;
  }

  const nPos: Pos = [nextY, nextX];

  return { nPos, nFacing };
};

const getNextPos = (
  pos: Pos,
  facing: number,
  connectMap: Map<string, Connect>,
  surfaceLen: number
) => {
  const cNetPos = [
    Math.floor(pos[0] / surfaceLen),
    Math.floor(pos[1] / surfaceLen),
  ].join(",");

  const cConnect = connectMap.get(cNetPos)!;

  let cDir: keyof Connect = "right";
  let nDir: keyof Connect = "right";

  if (facing === 0) {
    cDir = "right";
  } else if (facing === 1) {
    cDir = "down";
  } else if (facing === 2) {
    cDir = "left";
  } else {
    cDir = "up";
  }

  const nConnect = connectMap.get(cConnect[cDir])!;

  for (const k in nConnect) {
    const kc = k as keyof Connect;

    if (nConnect[kc] === cNetPos) {
      nDir = kc;
    }
  }

  const nNetPos = cConnect[cDir].split(",").map(Number) as Pos;

  return getConvertedPos(cDir, nDir, pos, nNetPos, surfaceLen);
};

const followLine = async (
  map: string[],
  cPos: Pos,
  step: number,
  facing: number,
  connectMap: Map<string, Connect>,
  surfaceLen: number
) => {
  const rowLength = map.length;
  const colLength = map[0].length;
  let nextPos = cPos;
  let nextFacing = facing;

  const timeWait = 3_000_000;

  for (let t = 1; t <= step; t++) {
    const [nRow, nCol] = nextPos;
    let betaPos: Pos = [...nextPos];
    let betaFacing = nextFacing;

    // right
    if (nextFacing === 0) {
      if (colLength <= nCol + 1 || map[nRow][nCol + 1] === " ") {
        const { nPos, nFacing } = getNextPos(
          nextPos,
          nextFacing,
          connectMap,
          surfaceLen
        );

        betaPos = nPos;
        betaFacing = nFacing;
      } else {
        betaPos[1]++;
      }
    }
    // down
    else if (nextFacing === 1) {
      if (rowLength <= nRow + 1 || map[nRow + 1][nCol] === " ") {
        const { nPos, nFacing } = getNextPos(
          nextPos,
          nextFacing,
          connectMap,
          surfaceLen
        );

        betaPos = nPos;
        betaFacing = nFacing;
      } else {
        betaPos[0]++;
      }
    }
    // left
    else if (nextFacing === 2) {
      if (nCol - 1 < 0 || map[nRow][nCol - 1] === " ") {
        const { nPos, nFacing } = getNextPos(
          nextPos,
          nextFacing,
          connectMap,
          surfaceLen
        );

        betaPos = nPos;
        betaFacing = nFacing;
      } else {
        betaPos[1]--;
      }
    }
    // up
    else {
      if (nRow - 1 < 0 || map[nRow - 1][nCol] === " ") {
        const { nPos, nFacing } = getNextPos(
          nextPos,
          nextFacing,
          connectMap,
          surfaceLen
        );

        betaPos = nPos;
        betaFacing = nFacing;
      } else {
        betaPos[0]--;
      }
    }

    const [bRow, bCol] = betaPos;
    const next = map[bRow][bCol];

    if (next === "#") {
      break;
    }

    nextPos = [...betaPos];
    nextFacing = betaFacing;

    await new Promise((resolve) => {
      const [nRow, nCol] = nextPos;
      readline.cursorTo(process.stdout, nCol, nRow);
      process.stdout.write(`\x1b[30;4${facing + 1}m${map[nRow][nCol]}\x1b[40m`);

      for (let i = 0; i < timeWait; i++) {}

      resolve(0);
    });
  }

  return { nextPos, nextFacing };
};

const traversePath = async (
  map: string[],
  follows: string[],
  connectMap: Map<string, Connect>,
  surfaceLen: number
) => {
  const startPos: Pos = [0, map[0].indexOf(".")];

  let currentPos = startPos;
  let facing = 0;

  await new Promise((resolve) => {
    readline.cursorTo(process.stdout, startPos[1], 0);
    process.stdout.write(`\x1b[30;41m${map[0][startPos[1]]}\x1b[40m`);

    setTimeout(() => {
      resolve(0);
    }, 1000);
  });

  for (let i = 0; i < follows.length; i++) {
    if (Number.isNaN(+follows[i])) {
      facing = changeFacing(facing, follows[i]);
      continue;
    }

    const { nextPos, nextFacing } = await followLine(
      map,
      currentPos,
      +follows[i],
      facing,
      connectMap,
      surfaceLen
    );

    currentPos = nextPos;
    facing = nextFacing;

    readline.cursorTo(process.stdout, 0, map.length);
    process.stdout.write(`\x1b[37mfacing: ${facing}, step: ${follows[i]}`);
  }

  return { currentPos, facing };
};

const monkeyMap = async (readGroups: string[], surfaceLen: number) => {
  const [sMap, sFollow] = readGroups;
  const map = parseMap(sMap.split("\n"));
  const follows = parseFollow(sFollow);

  const surfaceMap = createSurfaceMap(map, surfaceLen);
  const connectMap = createConnectMap(surfaceMap);

  readline.cursorTo(process.stdout, 0, 0);
  process.stdout.write("\x1b[37m");
  for (const s of map) {
    process.stdout.write(s + "\n");
  }

  const { currentPos, facing } = await traversePath(
    map,
    follows,
    connectMap,
    surfaceLen
  );

  const [cRow, cCol] = currentPos;
  readline.cursorTo(process.stdout, cCol, cRow);
  process.stdout.write(`\x1b[30;45m${map[cRow][cCol]}\x1b[40m`);

  readline.cursorTo(process.stdout, 0, map.length + 1);
  console.log(currentPos, facing);

  return 1000 * (currentPos[0] + 1) + 4 * (currentPos[1] + 1) + facing;
};

(async () => {
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);

  // const example = await readFromFile("./example.txt", true);
  // console.log(monkeyMap(example, 4)); // 5031

  const input = await readFromFile("./input.txt", true);
  console.log(await monkeyMap(input, 50)); // 127012
})();
