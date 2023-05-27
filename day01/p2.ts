import { readFromFile, sumArray } from "../utils";

const calorieCounting = (readGroups: string[]) => {
  const carriedCalories: number[] = [];

  for (const groups of readGroups) {
    const calories = groups.split("\n").map(Number);
    const total = sumArray(calories);
    carriedCalories.push(total);
  }

  const descCalories = carriedCalories.sort((a, b) => b - a);
  return sumArray(descCalories.slice(0, 3));
};

(async () => {
  const example = await readFromFile("./example", true);
  console.log(calorieCounting(example)); // 45000

  const input = await readFromFile("./input", true);
  console.log(calorieCounting(input)); // 196804
})();
