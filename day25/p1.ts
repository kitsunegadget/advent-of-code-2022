import { readFromFile, sumArray } from "../utils";

const snafuToDecimal = (value: string) => {
  let t = 5 ** (value.length - 1);
  let acc = 0;

  for (const char of value) {
    if (char === "=") {
      acc -= 2 * t;
    } else if (char === "-") {
      acc -= t;
    } else {
      acc += +char * t;
    }

    t /= 5;
  }

  return acc;
};

const decimalToSnafu = (value: number) => {
  let line = "";

  let q = value;
  let r = 0;
  let carry = 0;

  for (;;) {
    r = q % 5;
    q = Math.floor(q / 5);

    r = r + carry;

    if (r >= 5) {
      r %= 5;
      carry = 1;
    } else {
      carry = 0;
    }

    let next = String(r);

    if (r >= 3) {
      if (r === 3) {
        next = "=";
      } else if (r === 4) {
        next = "-";
      }

      carry = 1;
    }

    line = next + line;

    if (q === 0) {
      if (carry === 1) {
        line = "1" + line;
      }

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
