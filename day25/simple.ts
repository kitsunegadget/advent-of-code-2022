import { readFromFile, sumArray } from "../utils";

type SNAFU = "0" | "1" | "2" | "=" | "-";
type DtoS = {
  [n: number]: { to: SNAFU; diff: number };
};

const stodMap: Record<SNAFU, number> = {
  "0": 0,
  "1": 1,
  "2": 2,
  "=": -2,
  "-": -1,
};

const dtosMap: DtoS = {
  0: { to: "0", diff: 0 },
  1: { to: "1", diff: 0 },
  2: { to: "2", diff: 0 },
  3: { to: "=", diff: 2 },
  4: { to: "-", diff: 1 },
};

const snafuToDecimal = (value: string) => {
  let t = 5 ** value.length;

  return sumArray([...value], (v) => {
    t /= 5;
    return stodMap[v as SNAFU] * t;
  });
};

const decimalToSnafu = (value: number) => {
  let line = "";
  let q = value;

  for (;;) {
    const r = q % 5;

    line = dtosMap[r].to + line;
    q = Math.floor((q + dtosMap[r].diff) / 5);

    if (q === 0) {
      break;
    }
  }

  return line;
};

const fullOfHotAir = (readlines: string[]) => {
  const sumN = sumArray(readlines, snafuToDecimal);
  return `${sumN} -> ${decimalToSnafu(sumN)}`;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(fullOfHotAir(example)); // 2=-1=0

  const input = await readFromFile("./input.txt");
  console.log(fullOfHotAir(input)); // 2=1-=02-21===-21=200
})();
