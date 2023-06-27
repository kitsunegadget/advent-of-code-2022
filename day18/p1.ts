import { readFromFile, Coord, sumArray } from "../utils";

const getOpenSurface = (gridSet: Set<string>, pos: string) => {
  const [x, y, z] = Coord.fromString(pos);
  let openSurfaces = 0;

  // 6 direction
  openSurfaces += gridSet.has(`${x - 1},${y},${z}`) ? 0 : 1;
  openSurfaces += gridSet.has(`${x + 1},${y},${z}`) ? 0 : 1;
  openSurfaces += gridSet.has(`${x},${y - 1},${z}`) ? 0 : 1;
  openSurfaces += gridSet.has(`${x},${y + 1},${z}`) ? 0 : 1;
  openSurfaces += gridSet.has(`${x},${y},${z - 1}`) ? 0 : 1;
  openSurfaces += gridSet.has(`${x},${y},${z + 1}`) ? 0 : 1;

  return openSurfaces;
};

// 立方体の接続されてない側面を数える
const boilingBoulders = (readlines: string[]) => {
  const gridSet = new Set<string>(readlines);
  return sumArray([...gridSet], (pos) => getOpenSurface(gridSet, pos));
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(boilingBoulders(example)); // 64

  const input = await readFromFile("./input.txt");
  console.log(boilingBoulders(input)); // 3530
})();
