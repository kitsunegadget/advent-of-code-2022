import { readFromFile } from "../utils";

const getSumOfThreeNumbers = (result: number[]) => {
  const zeroIndex = result.indexOf(0);

  let sum = 0;

  for (let i = 1000; i <= 3000; i += 1000) {
    const wrapPos = (i + zeroIndex) % result.length;
    sum += result[wrapPos];
  }

  return sum;
};

const getModIndex = (newIndex: number, range: number, minMul: number) => {
  return (range * minMul + newIndex) % range;
};

const grovePositioningSystem = (readlines: string[]) => {
  const orders = readlines.map((s) => Number(s) * 811589153);

  // 実際に動かす配列
  const indexed = Array.from({ length: orders.length }, (_, k) => k);
  const positions = [...orders];

  const loopSize = orders.length - 1;

  // 入力の負値を超えられる、最小倍数を算出しておく
  const minMul = Math.ceil(Math.abs(Math.min(...orders)) / loopSize);

  for (let t = 0; t < 10; t++) {
    for (let i = 0; i < orders.length; i++) {
      const moveIndex = indexed.indexOf(i);
      let moveVal = getModIndex(orders[i], loopSize, minMul);

      if (moveVal !== 0) {
        moveVal = (moveIndex + moveVal) % loopSize;

        const [pTarget] = positions.splice(moveIndex, 1);
        positions.splice(moveVal, 0, pTarget);

        const [iTarget] = indexed.splice(moveIndex, 1);
        indexed.splice(moveVal, 0, iTarget);
      }
    }
  }

  return getSumOfThreeNumbers(positions);
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(grovePositioningSystem(example)); // 1623178306

  const input = await readFromFile("./input.txt");
  console.log(grovePositioningSystem(input)); // 6146976244822
})();
