import { readFromFile, sumArray } from "../utils";

const traversalFolder = (readlines: string[], i: number, founds: number[]) => {
  if (i >= readlines.length || i < 0) {
    return [0, readlines.length];
  }

  // nextDirIndex: prevent conflicts when a child of the previous folder has the same folder name.
  let nextDirIndex = i + 1;
  let folderSize = 0;

  if (readlines[i] === "$ ls") {
    i++;

    while (i < readlines.length && !readlines[i].startsWith("$")) {
      const [secA, secB] = readlines[i].split(" ");

      if (secA === "dir") {
        const dirIndex = readlines.indexOf(`$ cd ${secB}`, nextDirIndex);
        const [size, nextDir] = traversalFolder(
          readlines,
          dirIndex + 1,
          founds
        );

        folderSize += size;
        nextDirIndex = nextDir + 1;
      } else {
        folderSize += Number(secA);
      }

      i++;
    }
  }

  if (folderSize <= 100000) {
    founds.push(folderSize);
  }

  return [folderSize, nextDirIndex];
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
