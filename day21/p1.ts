import { readFromFile } from "../utils";

const operate = (left: number, right: number, op: string) => {
  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return left / right;
    default:
      throw new Error("Operator not found.");
  }
};

const yellDfs = (
  monkeys: Map<string, string>,
  currentName = "root",
  memo = new Map()
): number => {
  if (memo.has(currentName)) {
    return memo.get(currentName);
  }

  const job = monkeys.get(currentName)!;
  let val = 0;

  if (Number.isNaN(+job)) {
    const [left, op, right] = job.split(" ");

    const vLeft = yellDfs(monkeys, left, memo);
    const vRight = yellDfs(monkeys, right, memo);

    val = operate(vLeft, vRight, op);
  } else {
    val = +job;
  }

  memo.set(currentName, val);
  return val;
};

const monkeyMath = (readlines: string[]) => {
  const monkeysMap = new Map<string, string>();

  readlines.forEach((s) => {
    const [name, job] = s.split(": ");
    monkeysMap.set(name, job);
  });

  return yellDfs(monkeysMap);
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(monkeyMath(example)); // 152

  const input = await readFromFile("./input.txt");
  console.log(monkeyMath(input)); // 70674280581468
})();
