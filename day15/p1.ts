import { readFromFile, Coord } from "../utils";

const parseSensors = (readlines: string[]): [Coord, Coord][] => {
  return readlines.map((line) => {
    const values = line.match(/-{0,1}\d+/g);

    if (values == null || values.length < 4) {
      throw new Error("Cound not parse sensors.");
    }

    return [
      new Coord(+values[0], +values[1]), // Sensor [x, y]
      new Coord(+values[2], +values[3]), // Beacon [x, y]
    ];
  });
};

const getBeaconDistance = (sensor: Coord, beacon: Coord) => {
  const [sensorX, sensorY] = sensor;
  const [beaconX, beaconY] = beacon;
  const diffX = Math.abs(sensorX - beaconX);
  const diffY = Math.abs(sensorY - beaconY);

  return diffX + diffY;
};

const getTargetRanges = (sensors: [Coord, Coord][], targetRow: number) => {
  const targetRanges: [number, number][] = [];
  const beaconSet = new Set<string>();

  for (const [sensor, beacon] of sensors) {
    const beaconDistance = getBeaconDistance(sensor, beacon);
    const [sensorX, sensorY] = sensor;

    beaconSet.add(`${beacon}`);

    if (
      sensorY - beaconDistance <= targetRow &&
      sensorY + beaconDistance >= targetRow
    ) {
      // ビーコンまでの距離範囲にターゲット列がある場合
      // その列の左右方向の数を計算する
      const length = beaconDistance - Math.abs(sensorY - targetRow);
      const limitLeft = sensorX - length;
      const limitRight = sensorX + length;

      // ターゲット列の範囲端にビーコンがあるか調べる
      const isBeaconLeft = beaconSet.has(`${limitLeft},${targetRow}`);
      const isBeaconRight = beaconSet.has(`${limitRight},${targetRow}`);

      if (isBeaconLeft && isBeaconRight) {
        continue;
      }

      // ビーコンが無い部分の範囲を算出
      const leftX = isBeaconLeft ? limitLeft + 1 : limitLeft;
      const rightX = isBeaconRight ? limitRight - 1 : limitRight;

      targetRanges.push([leftX, rightX]);
    }
  }

  return targetRanges;
};

const getTargetCounts = (ranges: [number, number][]) => {
  let [min, max] = ranges[0];
  let result = Math.abs(max - min) + 1;

  for (let i = 1; i < ranges.length; i++) {
    if (max < ranges[i][0]) {
      [min, max] = ranges[i];
      result += Math.abs(max - min) + 1;
      //
    } else if (max < ranges[i][1]) {
      min = max;
      max = ranges[i][1];
      result += Math.abs(max - min);
    }
  }

  return result;
};

const beaconExclusionZone = (readlines: string[], targetRow: number) => {
  const sensors = parseSensors(readlines);
  const targetRanges = getTargetRanges(sensors, targetRow);

  targetRanges.sort((a, b) => a[0] - b[0]);

  return getTargetCounts(targetRanges);
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(beaconExclusionZone(example, 10)); // 26

  const input = await readFromFile("./input.txt");
  console.log(beaconExclusionZone(input, 2000000)); // 5040643
})();
