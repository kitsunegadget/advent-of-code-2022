import { readFromFile, sumArray } from "../utils";

type SizeResult = [number, number];

const getAllFileSize = (readlines: string[], i: number): SizeResult => {
  let size = 0;

  while (i < readlines.length && !readlines[i].startsWith("$")) {
    const [secA] = readlines[i++].split(" ");

    if (secA !== "dir") {
      size += Number(secA);
    }
  }

  return [size, i];
};

const traversalFolder = (
  readlines: string[],
  i: number,
  founds: number[]
): SizeResult => {
  let folderSize = 0;

  while (i < readlines.length) {
    const line = readlines[i];

    if (line === "$ ls") {
      const [size, nextIndex] = getAllFileSize(readlines, i + 1);
      folderSize += size;
      i = nextIndex;
      //
    } else if (line.startsWith("$ cd")) {
      if (line.endsWith("..")) {
        break;
      }

      const [size, nextIndex] = traversalFolder(readlines, i + 1, founds);
      folderSize += size;
      i = nextIndex;
    }
  }

  if (folderSize <= 100000) {
    founds.push(folderSize);
  }

  return [folderSize, i + 1];
};

const noSpaceLeftOnDevice = (readlines: string[]) => {
  const founds: number[] = [];

  traversalFolder(readlines, 1, founds);

  return sumArray(founds);
};

(async () => {
  const example = await readFromFile("./example");
  console.log(noSpaceLeftOnDevice(example)); // 95437

  const input = await readFromFile("./input");
  console.log(noSpaceLeftOnDevice(input)); // 1428881
})();
