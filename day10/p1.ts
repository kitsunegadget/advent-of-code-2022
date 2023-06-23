import { readFromFile } from "../utils";

const checkCycle = (cycle: number) => {
  if (cycle > 220) {
    return false;
  }

  if ((cycle - 20) % 40 === 0) {
    return true;
  }

  return false;
};

const getSignalStrength = (cycle: number, x: number) => {
  return cycle * x;
};

const cathodeRayTube = (readlines: string[]) => {
  let cycle = 0;
  let x = 1;
  let signalSum = 0;

  for (const line of readlines) {
    const [instruction, value] = line.split(" ");

    if (instruction === "addx") {
      for (let i = 0; i < 2; i++) {
        if (checkCycle(++cycle)) {
          signalSum += getSignalStrength(cycle, x);
        }
      }
      x += Number(value);
      //
    } else if (instruction === "noop") {
      if (checkCycle(++cycle)) {
        signalSum += getSignalStrength(cycle, x);
      }
    }
  }

  return signalSum;
};

(async () => {
  const example = await readFromFile("./example");
  console.log(cathodeRayTube(example)); // 13140

  const input = await readFromFile("./input");
  console.log(cathodeRayTube(input)); // 15120
})();
