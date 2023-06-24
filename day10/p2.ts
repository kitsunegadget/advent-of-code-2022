import { readFromFile } from "../utils";

const printSprite = (sprite: string[]) => {
  for (let i = 0; i < sprite.length; i += 40) {
    console.log(sprite.slice(i, i + 40).join(""));
  }
};

const drawSprite = (sprite: string[], cycle: number, x: number) => {
  const rowPos = (cycle - 1) % 40;

  if (x - 1 <= rowPos && rowPos <= x + 1) {
    sprite[cycle - 1] = "#";
  }
};

const cathodeRayTube = (readlines: string[]) => {
  let cycle = 0;
  let x = 1;
  const sprite = new Array<string>(240).fill(".");

  for (const line of readlines) {
    const [instruction, value] = line.split(" ");

    if (instruction === "addx") {
      for (let i = 0; i < 2; i++) {
        drawSprite(sprite, ++cycle, x);
      }
      x += Number(value);
      //
    } else if (instruction === "noop") {
      drawSprite(sprite, ++cycle, x);
    }
  }

  return sprite;
};

(async () => {
  const example = await readFromFile("./example.txt");
  printSprite(cathodeRayTube(example));

  console.log();

  const input = await readFromFile("./input.txt");
  printSprite(cathodeRayTube(input));
})();
