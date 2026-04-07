/**
 * Deterministic job prediction: same inputs always yield the same probabilities.
 * Raw score = 0.6 * animalPrior + 0.3 * traitSignal + 0.1 * dreamSignal, then softmax.
 */

import type { DreamJob, JobId } from "@/types/game";

export const JOB_IDS: readonly JobId[] = [
  "artist",
  "engineer",
  "manager",
  "community",
] as const;

export const DREAM_BOOST = 0.08;

/** Human-readable labels for UI and explanations */
export const JOB_DISPLAY: Record<
  JobId,
  { title: string; placeName: string; fitPhrase: string }
> = {
  artist: {
    title: "Artist",
    placeName: "Artist Studio",
    fitPhrase: "creative studio work",
  },
  engineer: {
    title: "Engineer",
    placeName: "Engineering Bay",
    fitPhrase: "building and fixing systems",
  },
  manager: {
    title: "Manager",
    placeName: "Manager Center",
    fitPhrase: "leading teams and plans",
  },
  community: {
    title: "Community helper",
    placeName: "Community Hub",
    fitPhrase: "helping neighbors and groups",
  },
};

export const animalPrior: Record<
  string,
  Record<JobId, number>
> = {
  fox: { artist: 0.15, engineer: 0.2, manager: 0.45, community: 0.2 },
  rabbit: { artist: 0.4, engineer: 0.15, manager: 0.1, community: 0.35 },
  beaver: { artist: 0.1, engineer: 0.55, manager: 0.15, community: 0.2 },
  lion: { artist: 0.1, engineer: 0.15, manager: 0.6, community: 0.15 },
  elephant: { artist: 0.1, engineer: 0.2, manager: 0.25, community: 0.45 },
  deer: { artist: 0.3, engineer: 0.15, manager: 0.15, community: 0.4 },
  owl: { artist: 0.15, engineer: 0.45, manager: 0.25, community: 0.15 },
  bear: { artist: 0.1, engineer: 0.3, manager: 0.4, community: 0.2 },
};

/** Uniform prior for custom animals (sums to 1). */
export const customAnimalPrior: Record<JobId, number> = {
  artist: 0.25,
  engineer: 0.25,
  manager: 0.25,
  community: 0.25,
};

export const traitWeights: Record<
  string,
  Record<JobId, number>
> = {
  creative: { artist: 0.18, engineer: 0.02, manager: 0.02, community: 0.04 },
  clever: { artist: 0.04, engineer: 0.1, manager: 0.1, community: 0.02 },
  helpful: { artist: 0.02, engineer: 0.03, manager: 0.03, community: 0.18 },
  strong: { artist: 0.01, engineer: 0.08, manager: 0.08, community: 0.05 },
  careful: { artist: 0.02, engineer: 0.12, manager: 0.04, community: 0.06 },
  friendly: { artist: 0.05, engineer: 0.01, manager: 0.04, community: 0.12 },
  fast: { artist: 0.02, engineer: 0.06, manager: 0.08, community: 0.04 },
  curious: { artist: 0.05, engineer: 0.1, manager: 0.05, community: 0.02 },
  quiet: { artist: 0.03, engineer: 0.05, manager: 0.01, community: 0.06 },
  brave: { artist: 0.02, engineer: 0.06, manager: 0.12, community: 0.03 },
};

const WEIGHT_PRIOR = 0.6;
const WEIGHT_TRAIT = 0.3;
const WEIGHT_DREAM = 0.1;

function getPriorForAnimal(presetKey: string | null, isCustom: boolean): Record<JobId, number> {
  if (isCustom || !presetKey || !animalPrior[presetKey]) {
    return customAnimalPrior;
  }
  return animalPrior[presetKey];
}

function traitSignalForJobs(traits: string[]): Record<JobId, number> {
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const t of traits) {
    const w = traitWeights[t];
    if (!w) continue;
    for (const j of JOB_IDS) {
      out[j] += w[j];
    }
  }
  return out;
}

function dreamSignalForJobs(dreamJob: DreamJob): Record<JobId, number> {
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  out[dreamJob] = DREAM_BOOST;
  return out;
}

function softmax(raw: Record<JobId, number>): Record<JobId, number> {
  const max = Math.max(...JOB_IDS.map((j) => raw[j]));
  let sumExp = 0;
  const expMap: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    const e = Math.exp(raw[j] - max);
    expMap[j] = e;
    sumExp += e;
  }
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    out[j] = expMap[j] / sumExp;
  }
  return out;
}

/**
 * Convert probabilities to integer percentages that sum to exactly 100.
 */
export function probabilitiesToPercentages(
  probs: Record<JobId, number>,
): Record<JobId, number> {
  return redistributePercentages(probs);
}

function redistributePercentages(
  probs: Record<JobId, number>,
): Record<JobId, number> {
  const entries = JOB_IDS.map((j) => ({ j, v: probs[j] * 100 }));
  const floors = entries.map((e) => Math.floor(e.v));
  const remainder = 100 - floors.reduce((a, b) => a + b, 0);
  const withFrac = entries.map((e, i) => ({
    j: e.j,
    frac: e.v - floors[i],
  }));
  withFrac.sort((a, b) => b.frac - a.frac);
  const pct: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (let i = 0; i < JOB_IDS.length; i++) {
    pct[JOB_IDS[i]] = floors[i];
  }
  for (let k = 0; k < remainder; k++) {
    pct[withFrac[k].j] += 1;
  }
  return pct;
}

export type JudgmentInput = {
  presetAnimal: string | null;
  customAnimalTrimmed: string;
  traits: string[];
  dreamJob: DreamJob;
};

export type JudgmentResult = {
  raw: Record<JobId, number>;
  probabilities: Record<JobId, number>;
  percentages: Record<JobId, number>;
  topJob: JobId;
};

export function computeJudgment(input: JudgmentInput): JudgmentResult {
  const isCustom =
    input.customAnimalTrimmed.length > 0 && input.presetAnimal === null;
  const priorKey =
    !isCustom && input.presetAnimal && animalPrior[input.presetAnimal]
      ? input.presetAnimal
      : null;
  const prior = getPriorForAnimal(priorKey, isCustom);
  const tSignal = traitSignalForJobs(input.traits);
  const dSignal = dreamSignalForJobs(input.dreamJob);

  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    raw[j] =
      WEIGHT_PRIOR * prior[j] +
      WEIGHT_TRAIT * tSignal[j] +
      WEIGHT_DREAM * dSignal[j];
  }

  const probabilities = softmax(raw);
  const percentages = redistributePercentages(probabilities);

  let topJob: JobId = "artist";
  let bestP = -1;
  for (const j of JOB_IDS) {
    if (probabilities[j] > bestP) {
      bestP = probabilities[j];
      topJob = j;
    }
  }

  return { raw, probabilities, percentages, topJob };
}
