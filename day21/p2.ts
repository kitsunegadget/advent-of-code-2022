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

const operateInv = (
  base: number,
  operand: number,
  op: string,
  targetDir: "L" | "R"
) => {
  switch (op) {
    case "+":
      return base - operand;
    case "*":
      return base / operand;

    // 以下の逆演算では対象(humn)の位置で式が変わる
    case "-": // (z = l - r) -> (l = z + r) or (r = l - z)
      return targetDir === "L" ? base + operand : operand - base;
    case "/": // (z = l / r) -> (l = z * r) or (r = l / z)
      return targetDir === "L" ? base * operand : operand / base;

    default:
      throw new Error("Operator not found.");
  }
};

/** humnまでの逆演算 */
const calcHumnYell = (
  rootLeft: string | number,
  rootRight: string | number
) => {
  let eqBase = 0;
  let expression = "";

  if (typeof rootLeft === "number") {
    eqBase = rootLeft;
    expression = String(rootRight);
  } else if (typeof rootRight === "number") {
    eqBase = rootRight;
    expression = String(rootLeft);
  }

  let i = 1;
  let j = expression.length - 2;

  while (true) {
    if (expression[i] === "h" || expression[j] === "n") {
      const [left, op, right] = expression.slice(i, j + 1).split(" ");

      if (left === "humn") {
        eqBase = operateInv(eqBase, +right, op, "L");
      } else {
        eqBase = operateInv(eqBase, +left, op, "R");
      }

      break;
    }

    if (expression[i] !== "(") {
      const nextBracketIndex = expression.indexOf("(", i + 1);
      const [left, op] = expression.slice(i, nextBracketIndex - 1).split(" ");

      eqBase = operateInv(eqBase, +left, op, "R");

      i = nextBracketIndex;
      //
    } else if (expression[j] !== ")") {
      const prevBracketIndex = expression.lastIndexOf(")", j - 1);
      const [op, right] = expression
        .slice(prevBracketIndex + 2, j + 1)
        .split(" ");

      eqBase = operateInv(eqBase, +right, op, "L");

      j = prevBracketIndex;
    }

    i++;
    j--;
  }

  return eqBase;
};

const yellDfs = (
  monkeys: Map<string, string>,
  currentName = "root",
  memo = new Map()
): number | string => {
  if (memo.has(currentName)) {
    return memo.get(currentName);
  }

  const job = monkeys.get(currentName)!;
  let val: number | string;

  if (currentName === "humn") {
    val = "humn";
  } else if (Number.isNaN(+job)) {
    const [left, op, right] = job.split(" ");

    const vLeft = yellDfs(monkeys, left, memo);
    const vRight = yellDfs(monkeys, right, memo);
    const isNumberBoth = !Number.isNaN(+vLeft - +vRight);

    val = isNumberBoth
      ? operate(+vLeft, +vRight, op)
      : `(${vLeft} ${op} ${vRight})`;
  } else {
    val = job;
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

  const memo = new Map();

  // 式のツリーを事前計算できる場所は行いつつ、その文字列か数値を返す
  const [left, _, right] = monkeysMap.get("root")!.split(" ");
  const vLeft = yellDfs(monkeysMap, left, memo);
  const vRight = yellDfs(monkeysMap, right, memo);

  // 等価対象の値からhumnまでを逆演算していく
  return calcHumnYell(vLeft, vRight);
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(monkeyMath(example)); // 301

  const input = await readFromFile("./input.txt");
  console.log(monkeyMath(input)); // 3243420789721
})();
