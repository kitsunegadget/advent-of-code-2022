import { readFromFile } from "../utils";

type Crates = {
  [pos: number]: string[];
};

type MoveProcedure = {
  qty: number;
  from: number;
  to: number;
};

const parseMoveProcedures = (lines: string[]) => {
  const moves: MoveProcedure[] = [];

  for (const moveLine of lines) {
    const [qty, from, to] = moveLine.match(/\d+/g)!.map(Number);
    moves.push({ qty, from, to });
  }

  return moves;
};

const parseCrates = (lines: string[]) => {
  const crates: Crates = {};
  const posLine = lines.at(-1)!;

  for (let i = 0; i < posLine.length; i++) {
    const pos = Number(posLine[i]);

    if (pos === 0) {
      continue;
    }

    if (crates[pos] == null) {
      crates[pos] = [];
    }

    for (let j = lines.length - 2; j >= 0; j--) {
      const crate = lines[j][i];

      if (crate === " ") {
        break;
      }
      crates[pos].push(crate);
    }
  }

  return crates;
};

const supplyStacks = (readGroups: string[]) => {
  const [secA, secB] = readGroups.map((s) => s.split("\n"));
  const crates = parseCrates(secA);
  const moves = parseMoveProcedures(secB);

  // Move crates same order
  for (const move of moves) {
    const splices = crates[move.from].splice(-move.qty, move.qty);
    crates[move.to].push(...splices);
  }

  return Object.values(crates).reduce((acc, b) => acc + b.at(-1), "");
};

(async () => {
  const example = await readFromFile("./example", true);
  console.log(supplyStacks(example)); // MCD

  const input = await readFromFile("./input", true);
  console.log(supplyStacks(input)); // CJVLJQPHS
})();
