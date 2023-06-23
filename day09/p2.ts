import { readFromFile } from "../utils";

type Pos = {
  x: number;
  y: number;
};

// If the prev position is one of A to H.
// AABCC
// A...C
// D.#.E
// F...H
// FFGHH
//
// The next tail position is as follows.
// ABC
// D.E
// FGH
const moveChain = (prevPos: Pos, targetPos: Pos) => {
  const rowDiff = prevPos.x - targetPos.x;
  const colDiff = prevPos.y - targetPos.y;

  if (Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1) {
    return;
  }

  if (rowDiff < 0) {
    targetPos.x -= 1;
  } else if (rowDiff > 0) {
    targetPos.x += 1;
  }

  if (colDiff < 0) {
    targetPos.y -= 1;
  } else if (colDiff > 0) {
    targetPos.y += 1;
  }
};

const moveHead = (dir: string, headPos: Pos) => {
  if (dir === "U") {
    headPos.y += 1;
  } else if (dir === "R") {
    headPos.x += 1;
  } else if (dir === "D") {
    headPos.y -= 1;
  } else {
    headPos.x -= 1;
  }
};

const move = (
  dir: string,
  step: number,
  positions: Pos[],
  tailSet: Set<string>
) => {
  for (let i = 0; i < step; i++) {
    moveHead(dir, positions[0]);

    for (let j = 1; j < positions.length; j++) {
      moveChain(positions[j - 1], positions[j]);
    }

    tailSet.add(`${positions.at(-1)!.x},${positions.at(-1)!.y}`);
  }
};

const ropeBridge = (readlines: string[]) => {
  const tailSet = new Set(["0,0"]);
  const positions = Array.from({ length: 10 }, () => ({ x: 0, y: 0 } as Pos));

  for (const line of readlines) {
    const [dir, step] = line.split(" ");
    move(dir, +step, positions, tailSet);
  }

  return tailSet.size;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(ropeBridge(example)); // 1

  const example2 = await readFromFile("./example2");
  console.log(ropeBridge(example2)); // 36

  const input = await readFromFile("./input");
  console.log(ropeBridge(input)); // 2541
})();
