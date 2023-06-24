import { readFromFile } from "../utils";

const tuningTrouble = (line: string, size: number) => {
  for (let i = size; i < line.length; i++) {
    const set = new Set(line.slice(i - size, i));

    if (set.size === size) {
      return i;
    }
  }
};

(async () => {
  const examples = await readFromFile("./example.txt");
  const [exampleA, exampleB, exampleC, exampleD, exampleE] = examples;
  console.log(tuningTrouble(exampleA, 4)); // 7
  console.log(tuningTrouble(exampleB, 4)); // 5
  console.log(tuningTrouble(exampleC, 4)); // 6
  console.log(tuningTrouble(exampleD, 4)); // 10
  console.log(tuningTrouble(exampleE, 4)); // 11

  const [input] = await readFromFile("./input.txt");
  console.log(tuningTrouble(input, 4)); // 1779

  console.log();

  console.log(tuningTrouble(exampleA, 14)); // 19
  console.log(tuningTrouble(exampleB, 14)); // 23
  console.log(tuningTrouble(exampleC, 14)); // 23
  console.log(tuningTrouble(exampleD, 14)); // 29
  console.log(tuningTrouble(exampleE, 14)); // 26

  console.log(tuningTrouble(input, 14)); // 2635
})();
