import { readFromFile } from "../utils";

const getIsFullyContains = (rangeA: number[], rangeB: number[]) => {
  const isAcontainsB = rangeA[0] <= rangeB[0] && rangeB[1] <= rangeA[1];
  const isBcontainsA = rangeB[0] <= rangeA[0] && rangeA[1] <= rangeB[1];
  return isAcontainsB || isBcontainsA;
};

const getRange = (section: string) => {
  return section.split("-").map(Number);
};

const campCleanup = (readlines: string[]) => {
  let fullyContains = 0;

  for (const pair of readlines) {
    const [secA, secB] = pair.split(",");
    const rangeA = getRange(secA);
    const rangeB = getRange(secB);

    fullyContains += getIsFullyContains(rangeA, rangeB) ? 1 : 0;
  }

  return fullyContains;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(campCleanup(example)); // 2

  const input = await readFromFile("./input.txt");
  console.log(campCleanup(input)); // 496
})();
