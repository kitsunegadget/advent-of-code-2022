import { readFromFile } from "../utils";

const getHandScore = (hand: string) => {
  if (hand === "A" || hand === "X") {
    return 1;
  }
  if (hand === "B" || hand === "Y") {
    return 2;
  }
  return 3;
};

const getRoundScore = (oppHand: string, yourHand: string) => {
  const opp = getHandScore(oppHand);
  const you = getHandScore(yourHand);
  const absDiff = Math.abs(opp - you);
  const isYouWin = absDiff === 2 ? opp % 3 < you % 3 : opp < you;

  if (absDiff === 0) {
    return you + 3;
  }

  return isYouWin ? you + 6 : you;
};

const rockPaperScissers = (readlines: string[]) => {
  const roundHands = readlines.map((line) => line.split(" "));

  let totalScore = 0;

  for (const hands of roundHands) {
    const [oppHand, yourHand] = hands;
    totalScore += getRoundScore(oppHand, yourHand);
  }

  return totalScore;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(rockPaperScissers(example)); // 15

  const input = await readFromFile("./input.txt");
  console.log(rockPaperScissers(input)); // 12772
})();
