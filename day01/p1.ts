import { readFromFile, sumArray } from "../utils";

const calorieCounting = (readGroups: string[]) => {
  const carriedCalories: number[] = [];

  for (const groups of readGroups) {
    const calories = groups.split("\n").map(Number);
    const total = sumArray(calories);
    carriedCalories.push(total);
  }

  return Math.max(...carriedCalories);
};

(async () => {
  const example = await readFromFile("./example", true);
  console.log(calorieCounting(example)); // 24000

  const input = await readFromFile("./input", true);
  console.log(calorieCounting(input)); // 66186
})();
