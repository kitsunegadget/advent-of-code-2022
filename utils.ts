import fs from "node:fs/promises";

const readFromFile = async (fileName: string, isSplitDoubleLine = false) => {
  const file = await fs.readFile(fileName, { encoding: "utf8" });
  return isSplitDoubleLine ? file.split("\n\n") : file.split("\n");
};

const sumArray = (array: number[]) => {
  return array.reduce((acc, b) => acc + b);
};

export { readFromFile, sumArray };
