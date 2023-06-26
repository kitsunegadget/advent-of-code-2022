import { readFromFile } from "../utils";

type Valve = {
  valve: string;
  rate: number;
  leads: Map<string, number>;
};

const parseGraph = (readlines: string[]) => {
  const valveMap = new Map<string, Valve>();

  for (const line of readlines) {
    const match = line.match(
      /^Valve (\w+) has .+ rate=(\d+); .+ valves{0,1} (.+){1,}/
    )!;

    const [_, valve, rate, leads] = match;

    valveMap.set(valve, {
      valve: valve,
      rate: +rate,
      leads: new Map(leads.split(",").map((s) => [s.trim(), Infinity])),
    });
  }

  const newValveMap = new Map<string, Valve>();

  for (const v of valveMap.values()) {
    if (v.rate === 0 && v.valve !== "AA") {
      continue;
    }

    newValveMap.set(v.valve, {
      valve: v.valve,
      rate: v.rate,
      leads: getDistanceValveMaps(valveMap, v),
    });
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
  visited = new Set<string>()
) => {
  if (time <= 1 || visited.has(current.valve)) {
    return -1;
  }
  visited.add(current.valve);

  total += current.rate * time;
  let best = total;

  for (const [leadValve, cost] of current.leads) {
    const nextTotal = dfs(
      valveMap,
      valveMap.get(leadValve)!,
      time - cost - 1,
      total,
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
  const bestPressure = dfs(valveMap, valveMap.get("AA")!, 30, 0);

  return bestPressure;
};

(async () => {
  const example = await readFromFile("./example.txt");
  console.log(proboscideaVolcanium(example)); // 1651

  const input = await readFromFile("./input.txt");
  console.log(proboscideaVolcanium(input)); // 1751
})();
