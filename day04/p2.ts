import { readFromFile } from "../utils";

const getIsOverlap = (rangeA: number[], rangeB: number[]) => {
  return rangeB[0] <= rangeA[1] && rangeA[0] <= rangeB[1];
};

const getRange = (section: string) => {
  return section.split("-").map(Number);
};

const campCleanup = (readlines: string[]) => {
  let overlaps = 0;

  for (const pair of readlines) {
    const [secA, secB] = pair.split(",");
    const rangeA = getRange(secA);
    const rangeB = getRange(secB);

    overlaps += getIsOverlap(rangeA, rangeB) ? 1 : 0;
  }

  return overlaps;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(campCleanup(example)); // 4

  const input = await readFromFile("./input");
  console.log(campCleanup(input)); // 847
})();
