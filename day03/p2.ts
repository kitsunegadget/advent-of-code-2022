import { readFromFile } from "../utils";

const getPriority = (char: string) => {
  const charCode = char.charCodeAt(0);
  return charCode < 91 ? charCode - 38 : charCode - 96;
};

const getSameChars = (a: string, b: string) => {
  const aSet = new Set(a);
  const bSet = new Set(b);

  let sameChars = "";

  for (const char of aSet) {
    if (bSet.has(char)) {
      sameChars += char;
    }
  }

  return sameChars;
};

const rucksackReorganization = (readlines: string[]) => {
  let prioritySum = 0;

  for (let i = 0; i < readlines.length - 2; i += 3) {
    let char = "";

    char = getSameChars(readlines[i], readlines[i + 1]);
    char = getSameChars(char, readlines[i + 2]);

    prioritySum += getPriority(char);
  }

  return prioritySum;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(rucksackReorganization(example)); // 70

  const input = await readFromFile("./input");
  console.log(rucksackReorganization(input)); // 2604
})();
