import { readFromFile } from "../utils";

const getPriority = (char: string) => {
  const charCode = char.charCodeAt(0);
  return charCode < 91 ? charCode - 38 : charCode - 96;
};

const getSameChar = (a: string, b: string) => {
  const aSet = new Set(a);
  const bSet = new Set(b);

  let sameChar = "";

  for (const char of aSet) {
    if (bSet.has(char)) {
      sameChar = char;
    }
  }

  return sameChar;
};

const rucksackReorganization = (readlines: string[]) => {
  let prioritySum = 0;

  for (const contain of readlines) {
    const mid = Math.floor(contain.length / 2);
    const first = contain.slice(0, mid);
    const second = contain.slice(mid);

    const char = getSameChar(first, second);
    prioritySum += getPriority(char);
  }

  return prioritySum;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(rucksackReorganization(example)); // 157

  const input = await readFromFile("./input");
  console.log(rucksackReorganization(input)); // 7746
})();
