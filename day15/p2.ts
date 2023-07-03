import { readFromFile, Coord } from "../utils";

const crossProduct = (A: Coord, B: Coord) => {
  const [Ax, Ay] = A;
  const [Bx, By] = B;
  return Ax * By - Bx * Ay;
};

/**
 * Counter-clockwise is positive.
 *
 * Linear dir: A -> B.
 *
 * cp = 0: on the line.
 *
 * cp < 0: right.
 *
 * 0 < cp: left.
 *
 * 線分ABにおいて点Pが左右のどちらかにあるか返す
 */
const getDirection = (A: Coord, B: Coord, P: Coord) => {
  const [Ax, Ay] = A;
  const [Bx, By] = B;
  const [Px, py] = P;
  const subAB = new Coord(Bx - Ax, By - Ay);
  const subAP = new Coord(Px - Ax, py - Ay);

  return crossProduct(subAB, subAP);
};

/** ２つの線分の交点を求める */
const getIntersectionPoint = (AB: Coord[], CD: Coord[]) => {
  const [Ax, Ay, Bx, By] = [...AB[0], ...AB[1]];
  const [Cx, Cy, Dx, Dy] = [...CD[0], ...CD[1]];
  const subAB = new Coord(Bx - Ax, By - Ay);
  const subCD = new Coord(Dx - Cx, Dy - Cy);

  const base = crossProduct(subAB, subCD);

  // 0 のときは平行
  if (base !== 0) {
    const subAC = new Coord(Cx - Ax, Cy - Ay);
    const subCA = new Coord(Ax - Cx, Ay - Cy);

    const s = crossProduct(subAC, subCD) / base;
    const t = crossProduct(subAB, subCA) / base;

    if (s < 0 || 1 < s || t < 0 || 1 < t) {
      return null;
    }

    const [subABx, subABy] = subAB;

    return new Coord(Ax + s * subABx, Ay + s * subABy);
  }

  return null;
};

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

/** 各センサーの頂点を返す */
const getSensorsVertex = (sensors: [Coord, Coord][]) => {
  const sensorsVertex: Coord[][] = [];
  const beaconSet = new Set<string>();

  for (const [sensor, beacon] of sensors) {
    const beaconDistance = getBeaconDistance(sensor, beacon);
    const [sensorX, sensorY] = sensor;

    beaconSet.add(`${beacon}`);

    const vertexUp = new Coord(sensorX, sensorY - beaconDistance);
    const vertexDown = new Coord(sensorX, sensorY + beaconDistance);
    const vertexLeft = new Coord(sensorX - beaconDistance, sensorY);
    const vertexRight = new Coord(sensorX + beaconDistance, sensorY);

    sensorsVertex.push([vertexUp, vertexDown, vertexLeft, vertexRight]);
  }

  return sensorsVertex;
};

/** 幅１の空間がある線分を取得する */
const getEmptyLines = (sensorsVertex: Coord[][]) => {
  const uldrFounds: Coord[][] = []; // ／
  const dlurFounds: Coord[][] = []; // ＼

  for (let i = 0; i < sensorsVertex.length - 1; i++) {
    for (let j = i + 1; j < sensorsVertex.length; j++) {
      const [iUp, iDown, iLeft, iRight] = sensorsVertex[i];
      const [jUp, jDown, jLeft, jRight] = sensorsVertex[j];

      const [iUpX, iUpY] = iUp;
      const [iLeftX, iLeftY] = iLeft;
      const [iDownX, iDownY] = iDown;

      const [jUpX, jUpY] = jUp;
      const [jLeftX, jLeftY] = jLeft;
      const [jDownX, jDownY] = jDown;

      const iUp1 = new Coord(iUpX, iUpY - 1);
      const iLeft1 = new Coord(iLeftX - 1, iLeftY);
      const iDown1 = new Coord(iDownX, iDownY + 1);

      const jUp1 = new Coord(jUpX, jUpY - 1);
      const jLeft1 = new Coord(jLeftX - 1, jLeftY);
      const jDown1 = new Coord(jDownX, jDownY + 1);

      // i[Up-left] : j[Down-right]
      if (getDirection(iUp1, iLeft1, jDown1) === 0) {
        uldrFounds.push([iUp1, iLeft1]);
      }

      // i[Down-right] : j[Up-left]
      if (getDirection(jUp1, jLeft1, iDown1) === 0) {
        uldrFounds.push([jUp1, jLeft1]);
      }

      // i[Down-left] : j[Up-right]
      if (getDirection(iDown1, iLeft1, jUp1) === 0) {
        dlurFounds.push([iDown1, iLeft1]);
      }

      // i[Up-right] : j[Down-left]
      if (getDirection(jDown1, jLeft1, iUp1) === 0) {
        dlurFounds.push([jDown1, jLeft1]);
      }
    }
  }

  return { uldrFounds, dlurFounds };
};

/** target座標が領域に含まれるかどうか */
const isTragetInnerArea = (areaVertex: Coord[], target: Coord) => {
  const [vUp, vDown, vLeft, vRight] = areaVertex;

  const upLeft = getDirection(vUp, vLeft, target);
  const upRight = getDirection(vUp, vRight, target);
  const downLeft = getDirection(vDown, vLeft, target);
  const downRight = getDirection(vDown, vRight, target);

  if (upLeft <= 0 && upRight >= 0 && downLeft >= 0 && downRight <= 0) {
    return true;
  }

  return false;
};

const getSignalPoint = (
  intersectionPoints: Coord[],
  sensorsVertex: Coord[][]
) => {
  for (const targetCoord of intersectionPoints) {
    const isNotInnerAll = sensorsVertex.every(
      (areaVertex) => isTragetInnerArea(areaVertex, targetCoord) === false
    );

    if (isNotInnerAll) {
      return targetCoord;
    }
  }

  throw new Error("Signal not found.");
};

const beaconExclusionZone = (readlines: string[], limit: number) => {
  const sensors = parseSensors(readlines);
  const sensorsVertex = getSensorsVertex(sensors);
  const { uldrFounds, dlurFounds } = getEmptyLines(sensorsVertex);

  // お互いのセンサー範囲+1 がちょうど重なる場合、斜め幅1の空間直線がある
  // その直線の交点が捜索ポイントになる
  const intersectionPoints: Coord[] = [];

  for (let i = 0; i < uldrFounds.length; i++) {
    for (let j = 0; j < dlurFounds.length; j++) {
      const point = getIntersectionPoint(uldrFounds[i], dlurFounds[j]);

      if (point) {
        intersectionPoints.push(point);
      }
    }
  }

  const [signalX, signalY] = getSignalPoint(intersectionPoints, sensorsVertex);

  return signalX * 4000000 + signalY;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(beaconExclusionZone(example, 20)); // 56000011

  const input = await readFromFile("./input.txt");
  console.log(beaconExclusionZone(input, 4000000)); // 11016575214126
})();
