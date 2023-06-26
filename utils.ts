import fs from "node:fs/promises";

const readFromFile = async (fileName: string, isSplitDoubleLine = false) => {
  const file = await fs.readFile(fileName, { encoding: "utf8" });
  return isSplitDoubleLine ? file.split("\n\n") : file.split("\n");
};

/**
 * Sum values from an array.
 * If the array is in objects or requires pre-calculation, use processFn argument.
 */
const sumArray = <T>(array: T[], processFn?: (arg: T) => number): number => {
  if (array.length === 0) {
    return 0;
  }

  if (processFn) {
    return array.reduce((acc, v) => acc + processFn(v), 0);
  }

  if (
    typeof array[0] === "number" ||
    (typeof array[0] === "string" && !isNaN(+array[0]))
  ) {
    return array.reduce((acc, v) => acc + Number(v), 0);
  }

  throw new Error(
    "The array is not in a number or string. Use processFn if necessary."
  );
};

};

/** Manage coordinate or position */
class Coord {
  coords: number[];

  constructor(x: number, y: number, ...axis: number[]) {
    this.coords = new Array<number>(x, y);
    this.coords.push(...axis);
  }

  [Symbol.iterator]() {
    return this.coords.values();
  }

  [Symbol.toStringTag]() {
    return this.toString();
  }

  /** Coordinates to string key style. */
  toString() {
    return this.coords.join(",");
  }

  /** String key style to coordinate. */
  static fromString(s: string) {
    const cs = s.split(",").map(Number);

    if (cs.includes(NaN)) {
      throw Error("Invalid string to number: " + `${s}`);
    }

    return new Coord(cs[0], cs[1], ...cs.slice(2));
  }
}

export { readFromFile, sumArray, Coord };
