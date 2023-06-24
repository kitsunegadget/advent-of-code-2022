import { readFromFile } from "../utils";

const tuningTrouble = (line: string) => {
  const received: string[] = [];

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const lastAppearedIndex = received.lastIndexOf(char);

    if (lastAppearedIndex !== -1) {
      received.splice(0, lastAppearedIndex + 1);
    }

    received.push(char);

    if (received.length === 14) {
      return i + 1;
    }
  }
};

(async () => {
  const examples = await readFromFile("./example.txt");
  const [exampleA, exampleB, exampleC, exampleD, exampleE] = examples;
  console.log(tuningTrouble(exampleA)); // 19
  console.log(tuningTrouble(exampleB)); // 23
  console.log(tuningTrouble(exampleC)); // 23
  console.log(tuningTrouble(exampleD)); // 29
  console.log(tuningTrouble(exampleE)); // 26

  const [input] = await readFromFile("./input.txt");
  console.log(tuningTrouble(input)); // 2635
})();
