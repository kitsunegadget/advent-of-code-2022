import { readFromFile } from "../utils";

type Pos = {
  x: number;
  y: number;
};

const moveTail = (
  dir: string,
  headPos: Pos,
  tailPos: Pos,
  tailSet: Set<string>
) => {
  if (
    Math.abs(headPos.x - tailPos.x) <= 1 &&
    Math.abs(headPos.y - tailPos.y) <= 1
  ) {
    return;
  }

  if (dir === "U") {
    tailPos.x = headPos.x;
    tailPos.y = headPos.y - 1;
  } else if (dir === "R") {
    tailPos.x = headPos.x - 1;
    tailPos.y = headPos.y;
  } else if (dir === "D") {
    tailPos.x = headPos.x;
    tailPos.y = headPos.y + 1;
  } else {
    tailPos.x = headPos.x + 1;
    tailPos.y = headPos.y;
  }

  tailSet.add(`${tailPos.x},${tailPos.y}`);
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
  headPos: Pos,
  tailPos: Pos,
  tailSet: Set<string>
) => {
  for (let i = 0; i < step; i++) {
    moveHead(dir, headPos);
    moveTail(dir, headPos, tailPos, tailSet);
  }
};

const ropeBridge = (readlines: string[]) => {
  const tailSet = new Set(["0,0"]);
  const headPos: Pos = { x: 0, y: 0 };
  const tailPos: Pos = { x: 0, y: 0 };

  for (const line of readlines) {
    const [dir, step] = line.split(" ");
    move(dir, +step, headPos, tailPos, tailSet);
  }

  return tailSet.size;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(ropeBridge(example)); // 13

  const input = await readFromFile("./input");
  console.log(ropeBridge(input)); // 6339
})();
