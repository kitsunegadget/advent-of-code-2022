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

    if (received.length === 4) {
      return i + 1;
    }
  }
};

(async () => {
  const examples = await readFromFile("./example.txt");
  const [exampleA, exampleB, exampleC, exampleD, exampleE] = examples;
  console.log(tuningTrouble(exampleA)); // 7
  console.log(tuningTrouble(exampleB)); // 5
  console.log(tuningTrouble(exampleC)); // 6
  console.log(tuningTrouble(exampleD)); // 10
  console.log(tuningTrouble(exampleE)); // 11

  const [input] = await readFromFile("./input.txt");
  console.log(tuningTrouble(input)); // 1779
})();
