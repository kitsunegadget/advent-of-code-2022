import fs from "node:fs/promises";

const readFromFile = async (fileName: string, isSplitDoubleLine = false) => {
  const file = await fs.readFile(fileName, { encoding: "utf8" });
  return isSplitDoubleLine ? file.split("\n\n") : file.split("\n");
};

const sumArray = (array: number[]) => {
  return array.reduce((acc, b) => acc + b);
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
