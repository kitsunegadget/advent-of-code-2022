import { readFromFile, sumArray } from "../utils";

type Valve = {
  bitId: number;
  valve: string;
  rate: number;
  leads: Map<string, number>;
};

const getBitId = (valveMap: Map<string, Valve>, visited: string[]) => {
  return sumArray(visited, (s) => valveMap.get(s)!.bitId);
};

const parseGraph = (readlines: string[]) => {
  const valveMap = new Map<string, Valve>();

  for (const line of readlines) {
    const match = line.match(
      /^Valve (\w+) has .+ rate=(\d+); .+ valves{0,1} (.+){1,}/
    )!;

    const [_, valve, rate, leads] = match;

    valveMap.set(valve, {
      bitId: 0,
      valve: valve,
      rate: +rate,
      leads: new Map(leads.split(",").map((s) => [s.trim(), Infinity])),
    });
  }

  const newValveMap = new Map<string, Valve>();
  let bitId = 1; // Max 32 bit

  for (const v of valveMap.values()) {
    if (v.rate === 0 && v.valve !== "AA") {
      continue;
    }

    newValveMap.set(v.valve, {
      bitId,
      valve: v.valve,
      rate: v.rate,
      leads: getDistanceValveMaps(valveMap, v),
    });

    bitId <<= 1;
  }

  return newValveMap;
};

const getDistanceValveMaps = (
  valveMap: Map<string, Valve>,
  base: Valve,
  visited = new Set<string>()
) => {
  const queue: [Valve, number][] = [[base, 0]];
  const distanceMap = new Map<string, number>();

  while (queue.length !== 0) {
    const [current, dist] = queue.shift()!;

    if (visited.has(current.valve)) {
      continue;
    }
    visited.add(current.valve);

    if (current.rate !== 0) {
      distanceMap.set(current.valve, dist);
    }

    for (const lead of current.leads.keys()) {
      queue.push([valveMap.get(lead)!, dist + 1]);
    }
  }

  return distanceMap;
};

const dfs = (
  valveMap: Map<string, Valve>,
  current: Valve,
  time: number,
  total: number,
  pressureMap: Map<number, number>,
  visited = new Set<string>()
) => {
  if (time <= 1 || visited.has(current.valve)) {
    return -1;
  }
  visited.add(current.valve);

  total += current.rate * time;
  let best = total;

  const bitId = getBitId(valveMap, [...visited].slice(1)) >> 1; // excludes valve AA
  const oldScore = pressureMap.get(bitId) ?? 0;

  if (oldScore < total) {
    pressureMap.set(bitId, total);
  }

  for (const [leadValve, cost] of current.leads) {
    const nextTotal = dfs(
      valveMap,
      valveMap.get(leadValve)!,
      time - cost - 1,
      total,
      pressureMap,
      new Set(visited)
    );

    if (nextTotal > 0) {
      best = Math.max(best, nextTotal);
    }
  }

  return best;
};

const proboscideaVolcanium = (readlines: string[]) => {
  const valveMap = parseGraph(readlines);
  const pressureMap = new Map<number, number>();

  dfs(valveMap, valveMap.get("AA")!, 26, 0, pressureMap);

  // 一人の場合の訪問バルブ最大量マップが最初の計算で出力できているので、
  // 一方のある訪問バルブに対して、もう一方は残った未訪問バルブでの最大量を既に計算したルート値から合計すれば良い
  let best = 0;

  for (const [valvesA, scoreA] of pressureMap) {
    for (const [valuesB, scoreB] of pressureMap) {
      if ((valvesA & valuesB) === 0) {
        const score = scoreA + scoreB;

        if (best < score) {
          best = score;
        }
      }
    }
  }

  return best;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(proboscideaVolcanium(example)); // 1707

  const input = await readFromFile("./input.txt");
  console.log(proboscideaVolcanium(input)); // 2207
})();
