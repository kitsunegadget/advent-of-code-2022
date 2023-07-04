import { readFromFile, sumArray } from "../utils";

type Blueprint = {
  id: number;
  oreBot: { ore: number };
  clayBot: { ore: number };
  obsBot: {
    ore: number;
    clay: number;
  };
  geodeBot: {
    ore: number;
    obs: number;
  };
};

type Amount = {
  ore: number;
  clay: number;
  obs: number;
  geode: number;
};

type Status = {
  robots: Amount;
  res: Amount;
};

const parseBlueprint = (readlines: string[]) => {
  return readlines.map((s) => {
    const [secA, secB] = s.split(":");
    const id = Number(secA.replace(/^[a-zA-Z\s]+(\d+)$/, "$1"));

    const [ore, clay, obs, geode] = secB.split(".");
    const oreCost = Number(ore.replace(/^[a-zA-Z\s]+(\d+) ore$/, "$1"));
    const clayCost = Number(clay.replace(/^[a-zA-Z\s]+(\d+) ore$/, "$1"));
    const obsCost = obs.match(/\d+/g)!.map(Number);
    const geodeCost = geode.match(/\d+/g)!.map(Number);

    const blueprint: Blueprint = {
      id: id,
      oreBot: {
        ore: oreCost,
      },
      clayBot: {
        ore: clayCost,
      },
      obsBot: {
        ore: obsCost[0],
        clay: obsCost[1],
      },
      geodeBot: {
        ore: geodeCost[0],
        obs: geodeCost[1],
      },
    } as const;

    return blueprint;
  });
};

const isCanMakeGeodeBot = (stat: Status, BP: Blueprint) => {
  if (stat.res.ore >= BP.geodeBot.ore && stat.res.obs >= BP.geodeBot.obs) {
    return true;
  }

  return false;
};

const isCanMakeObsBot = (stat: Status, BP: Blueprint) => {
  if (stat.res.ore >= BP.obsBot.ore && stat.res.clay >= BP.obsBot.clay) {
    return true;
  }

  return false;
};

const collectResource = (stat: Status, duration: number) => {
  const next: Status = {
    robots: Object.assign({}, stat.robots),
    res: Object.assign({}, stat.res),
  };

  next.res.ore += stat.robots.ore * duration;
  next.res.clay += stat.robots.clay * duration;
  next.res.obs += stat.robots.obs * duration;
  next.res.geode += stat.robots.geode * duration;

  return next;
};

const work = (BP: Blueprint, TIME: number) => {
  const maxOreMps = Math.max(
    BP.oreBot.ore,
    BP.clayBot.ore,
    BP.obsBot.ore,
    BP.geodeBot.ore
  );
  const maxClayMps = BP.obsBot.clay;
  const maxObsMps = BP.geodeBot.obs;

  const initStat: Status = {
    robots: {
      ore: 1,
      clay: 0,
      obs: 0,
      geode: 0,
    },
    res: {
      ore: 0,
      clay: 0,
      obs: 0,
      geode: 0,
    },
  };

  let maxGeodeStat = initStat;
  let maxGeodeRobots = 0;
  let maxGeodeTime = 0;

  const stack = [{ status: initStat, time: TIME }];

  while (stack.length !== 0) {
    const { status, time } = stack.pop()!;
    const res = status.res;
    const robots = status.robots;

    // time over
    if (time < 0) {
      continue;
    }

    // just time end
    if (time === 0) {
      if (maxGeodeStat.res.geode < res.geode) {
        maxGeodeStat = status;
      }
      continue;
    }

    // geode 生産が時間に対して前の結果より遅い場合は切り捨て
    if (robots.geode < maxGeodeRobots && time < maxGeodeTime) {
      continue;
    }
    // 速い場合は更新
    else if (maxGeodeRobots < robots.geode && maxGeodeTime <= time) {
      maxGeodeRobots = robots.geode;
      maxGeodeTime = time;
    }

    // 毎分作れるロボットは一つだけなので、いずれか以上の資源mpsは必要ない
    // 必要以上のロボットがあるブランチは捨てる
    if (
      robots.ore > maxOreMps ||
      robots.clay > maxClayMps ||
      robots.obs > maxObsMps
    ) {
      continue;
    }

    // 次に作るロボットを決めて分岐する

    // geode
    if (robots.obs > 0) {
      let nextGeodeTime = 1;

      // if resources are low
      if (res.ore < BP.geodeBot.ore || res.obs < BP.geodeBot.obs) {
        const oreReqTime = Math.ceil((BP.geodeBot.ore - res.ore) / robots.ore);
        const obsReqTime = Math.ceil((BP.geodeBot.obs - res.obs) / robots.obs);

        nextGeodeTime += Math.max(oreReqTime, obsReqTime);
      }

      // Set next-time status
      if (time - nextGeodeTime > 0) {
        const nextStat = collectResource(status, nextGeodeTime);
        nextStat.res.ore -= BP.geodeBot.ore;
        nextStat.res.obs -= BP.geodeBot.obs;
        nextStat.robots.geode++;

        stack.push({ status: nextStat, time: time - nextGeodeTime });
      }
    }

    // obsidian
    if (robots.clay > 0) {
      let nextObsTime = 1;

      if (res.ore < BP.obsBot.ore || res.clay < BP.obsBot.clay) {
        const oreReqTime = Math.ceil((BP.obsBot.ore - res.ore) / robots.ore);
        const clayReqTime = Math.ceil(
          (BP.obsBot.clay - res.clay) / robots.clay
        );

        nextObsTime += Math.max(oreReqTime, clayReqTime);
      }

      if (time - nextObsTime > 0) {
        const nextStatM1 = collectResource(status, nextObsTime - 1);

        // 次の時間までに geodeBot が作れない場合のみ obsBot を作る
        if (!isCanMakeGeodeBot(nextStatM1, BP)) {
          const nextStat = collectResource(nextStatM1, 1);
          nextStat.res.ore -= BP.obsBot.ore;
          nextStat.res.clay -= BP.obsBot.clay;
          nextStat.robots.obs++;

          stack.push({ status: nextStat, time: time - nextObsTime });
        }
      }
    }

    // clay
    {
      let nextClayTime = 1;

      if (res.ore < BP.clayBot.ore) {
        nextClayTime += Math.ceil((BP.clayBot.ore - res.ore) / robots.ore);
      }

      if (time - nextClayTime > 0) {
        const nextStatM1 = collectResource(status, nextClayTime - 1);

        if (
          !isCanMakeGeodeBot(nextStatM1, BP) ||
          !isCanMakeObsBot(nextStatM1, BP)
        ) {
          const nextStat = collectResource(nextStatM1, 1);
          nextStat.res.ore -= BP.clayBot.ore;
          nextStat.robots.clay++;

          stack.push({ status: nextStat, time: time - nextClayTime });
        }
      }
    }

    // ore robot
    {
      let nextOreTime = 1;

      if (res.ore < BP.oreBot.ore) {
        nextOreTime += Math.ceil((BP.oreBot.ore - res.ore) / robots.ore);
      }

      if (time - nextOreTime > 0) {
        const nextStatM1 = collectResource(status, nextOreTime - 1);

        if (!isCanMakeGeodeBot(nextStatM1, BP)) {
          const nextStat = collectResource(nextStatM1, 1);
          nextStat.res.ore -= BP.oreBot.ore;
          nextStat.robots.ore++;

          stack.push({ status: nextStat, time: time - nextOreTime });
        }
      }
    }

    // 何も作らず最後まで進む場合
    {
      const nextStat = collectResource(status, time);
      stack.push({ status: nextStat, time: 0 });
    }
  }

  // console.log(maxGeodeStat);

  return maxGeodeStat.res.geode;
};

const notEnoughMinerals = (readlines: string[]) => {
  const blueprints = parseBlueprint(readlines);
  const qualityLevel = sumArray(blueprints, (BP) => BP.id * work(BP, 24));

  return qualityLevel;
};

(async () => {
  const example = await readFromFile("./example.txt", true);
  console.log(notEnoughMinerals(example)); // 33

  const input = await readFromFile("./input.txt");
  console.log(notEnoughMinerals(input)); // 790
})();
