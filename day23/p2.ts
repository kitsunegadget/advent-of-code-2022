import { Coord, readFromFile } from "../utils";

type Direction = "NW" | "N" | "NE" | "W" | "E" | "SW" | "S" | "SE";

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

  // check no elves in directions
  const aroundElf = [...elf8Pos.values()];

  for (
    let i = 0, roundMod = (round - 1) % 4;
    i < 4;
    i++, roundMod = (roundMod + 1) % 4
  ) {
    if (roundMod === 0 && !aroundElf.some((e) => /^(N|NE|NW)$/.test(e))) {
      return [row - 1, col];
    }

    if (roundMod === 1 && !aroundElf.some((e) => /^(S|SE|SW)$/.test(e))) {
      return [row + 1, col];
    }

    if (roundMod === 2 && !aroundElf.some((e) => /^(W|NW|SW)$/.test(e))) {
      return [row, col - 1];
    }

    if (roundMod === 3 && !aroundElf.some((e) => /^(E|NE|SE)$/.test(e))) {
      return [row, col + 1];
    }
  }

  return null;
};

const runRound = (gridSet: Set<string>, round: number) => {
  const newGridSet = new Set<string>();
  const movedMap = new Map<string, string[]>(); // newPos -> oldPos[]

  for (const pos of gridSet) {
    const [r, c] = Coord.fromString(pos);
    const nextMove = consider8Pos(gridSet, r, c, round);

    if (nextMove == null) {
      newGridSet.add(pos);
    } else {
      const newPos = `${new Coord(...nextMove)}`;

      if (movedMap.has(newPos)) {
        movedMap.get(newPos)!.push(pos);
        newGridSet.delete(newPos);
      } else {
        movedMap.set(newPos, [pos]);
        newGridSet.add(newPos);
      }
    }
  }

  // 衝突していた場所を元の座標に戻す
  for (const moved of movedMap.values()) {
    if (moved.length > 1) {
      moved.forEach((m) => newGridSet.add(m));
    }
  }

  const isRoundStop = movedMap.size === 0 ? true : false;

  return { newGridSet, isRoundStop };
};

const unstableDiffusion = (readLines: string[]) => {
  const gridSet = parseGridSet(readLines);

  let nextGridSet = gridSet;

  for (let i = 1; ; i++) {
    const { newGridSet, isRoundStop } = runRound(nextGridSet, i);

    if (isRoundStop) {
      return i;
    }

    nextGridSet = newGridSet;
  }
};

(async () => {
  const exampleSmall = await readFromFile("./example-small.txt");
  console.log(unstableDiffusion(exampleSmall)); // 4

  const example = await readFromFile("./example.txt");
  console.log(unstableDiffusion(example)); // 20

  const input = await readFromFile("./input.txt");
  console.log(unstableDiffusion(input)); // 1079
})();
