import { readFromFile } from "../utils";

/**
 *  0: continue,
 *  1: decided right signal,
 * -1: decided not right signal
 */
type CompareDecide = 0 | 1 | -1;

const getNextElemEndIndex = (list: string, start: number) => {
  let brackets = 0;

  for (let i = start; i < list.length; i++) {
    if (list[i] === "[") {
      brackets++;
    }

    if (list[i] === "]") {
      brackets--;
    }

    if (brackets === 0 && list[i] === ",") {
      return i;
    }
  }

  return list.length;
};

const compare = (left: string, right: string): CompareDecide => {
  let l = 0;
  let r = 0;

  while (l < left.length && r < right.length) {
    const lNext = getNextElemEndIndex(left, l);
    const lElem = left.slice(l, lNext);
    l = lNext + 1;

    const rNext = getNextElemEndIndex(right, r);
    const rElem = right.slice(r, rNext);
    r = rNext + 1;

    const nLeft = Number(lElem);
    const nRight = Number(rElem);
    const isLeftNaN = Number.isNaN(nLeft);
    const isRightNaN = Number.isNaN(nRight);

    if (!isLeftNaN && !isRightNaN) {
      if (nLeft < nRight) {
        return 1;
      } else if (nLeft > nRight) {
        return -1;
      }
    } else {
      // if mixed types
      const c = compare(
        isLeftNaN ? lElem.slice(1, -1) : lElem,
        isRightNaN ? rElem.slice(1, -1) : rElem
      );

      if (c * c === 1) {
        return c;
      }
    }
  }

  // if run out
  const leftRemain = left.length - l;
  const rightRemain = right.length - r;

  if (leftRemain < rightRemain) {
    return 1;
  } else if (leftRemain > rightRemain) {
    return -1;
  }

  return 0;
};

const distressSignal = (readGroups: string[]) => {
  const packets = readGroups.flatMap((s) => s.split("\n"));
  packets.push("[[2]]");
  packets.push("[[6]]");

  const sortedPacket = packets.sort((a, b) => {
    return compare(a.slice(1, -1), b.slice(1, -1)) * -1;
  });

  const dividerA = sortedPacket.indexOf("[[2]]") + 1;
  const dividerB = sortedPacket.indexOf("[[6]]") + 1;

  return dividerA * dividerB;
};

(async () => {
  const example = await readFromFile("./example.txt", true);
  console.log(distressSignal(example)); // 140

  const input = await readFromFile("./input.txt", true);
  console.log(distressSignal(input)); // 23751
})();
