import { readFromFile, lcm } from "../utils";

type Monkey = {
  items: number[];
  op: {
    left: string | number;
    operator: string;
    right: string | number;
  };
  test: {
    divideBy: number;
    ifTrue: number;
    ifFalse: number;
  };
  inspected: number;
};

const parseMonkeys = (readGroups: string[]) => {
  const monkeys: Monkey[] = [];

  for (const group of readGroups) {
    const lines = group.split("\n");
    const startItems = lines[1].match(/\d+/g);
    const items = startItems ? startItems.map(Number) : [];
    const operations = lines[2].slice(lines[2].indexOf("=") + 2).split(" ");
    const [divideBy] = lines[3].match(/\d+$/)!;
    const [ifTrue] = lines[4].match(/\d+$/)!;
    const [ifFalse] = lines[5].match(/\d+$/)!;

    const monkey: Monkey = {
      items: items,
      op: {
        left: operations[0],
        operator: operations[1],
        right: operations[2],
      },
      test: {
        divideBy: +divideBy,
        ifTrue: +ifTrue,
        ifFalse: +ifFalse,
      },
      inspected: 0,
    };

    monkeys.push(monkey);
  }

  return monkeys;
};

const opDecode = (op: Monkey["op"], item: number) => {
  const left = op.left === "old" ? item : Number(op.left);
  const right = op.right === "old" ? item : Number(op.right);

  return op.operator === "+" ? left + right : left * right;
};

/** 全体が同じ余剰をもつ数値の最小値を探して返す */
const getMinLevel = (monkeysDivideBy: number[], level: number) => {
  const monkeysMod = monkeysDivideBy.map((d) => level % d);
  let minLevel = monkeysMod[0];
  let mul = monkeysDivideBy[0];

  for (let i = 0; i < monkeysDivideBy.length; i++) {
    for (;;) {
      if (minLevel % monkeysDivideBy[i] === monkeysMod[i]) {
        mul = lcm(mul, monkeysDivideBy[i]);
        break;
      }

      minLevel += mul;
    }
  }

  return minLevel;
};

const startGame = (monkeys: Monkey[], rounds: number) => {
  const monkeysDivideBy = monkeys
    .map((m) => m.test.divideBy)
    .sort((a, b) => b - a);

  for (let i = 0; i < rounds; i++) {
    for (const monkey of monkeys) {
      for (const item of monkey.items) {
        const currentLevel = opDecode(monkey.op, item);
        const minLevel = getMinLevel(monkeysDivideBy, currentLevel);
        const { divideBy, ifTrue, ifFalse } = monkey.test;

        if (minLevel % divideBy === 0) {
          monkeys[ifTrue].items.push(minLevel);
        } else {
          monkeys[ifFalse].items.push(minLevel);
        }

        monkey.inspected++;
      }

      monkey.items = [];
    }
  }
};

const monkeyInTheMiddle = (readGroups: string[]) => {
  const monkeys = parseMonkeys(readGroups);

  startGame(monkeys, 10000);

  const sortedInspecteds = monkeys
    .map((m) => m.inspected)
    .sort((a, b) => b - a);

  return sortedInspecteds[0] * sortedInspecteds[1];
};

(async () => {
  const example = await readFromFile("./example.txt", true);
  console.log(monkeyInTheMiddle(example)); // 2713310158

  const input = await readFromFile("./input.txt", true);
  console.log(monkeyInTheMiddle(input)); // 14399640002
})();
