/**
 * Deterministic job prediction: same inputs always yield the same probabilities.
 * Raw score = WEIGHT_PRIOR * animalPrior + WEIGHT_TRAIT * traitSignal, then softmax.
 * Dream job is not part of the machine signal (learner aspiration only).
 */

import { animalPriorFromDataset, resolveZooAnimalInput } from "@/data/zooAnimalDataset";
import { traitWeights, traitsForModel } from "@/data/modelTraits";
import type { JobId } from "@/types/game";

export const JOB_IDS: readonly JobId[] = [
  "artist",
  "engineer",
  "manager",
  "community",
] as const;

export { traitWeights };

/** Sharper priors per species — imported from the zoo dataset. */
export const animalPrior: Record<string, Record<JobId, number>> =
  animalPriorFromDataset;

/** Uniform fallback when no known animal resolves (legacy / malformed payloads). */
export const customAnimalPrior: Record<JobId, number> = {
  artist: 0.25,
  engineer: 0.25,
  manager: 0.25,
  community: 0.25,
};

const WEIGHT_PRIOR = 0.58;
const WEIGHT_TRAIT = 0.42;

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

function effectiveAnimalKey(input: JudgmentInput): string | null {
  const preset = input.presetAnimal?.trim() ?? "";
  const custom = input.customAnimalTrimmed.trim();
  if (preset && animalPrior[preset]) return preset;
  if (preset) {
    const r = resolveZooAnimalInput(preset);
    if (r && animalPrior[r.key]) return r.key;
  }
  const r2 = resolveZooAnimalInput(custom);
  if (r2 && animalPrior[r2.key]) return r2.key;
  return null;
}

function getPriorForAnimalKey(animalKey: string | null): Record<JobId, number> {
  if (animalKey && animalPrior[animalKey]) {
    return animalPrior[animalKey];
  }
  return customAnimalPrior;
}

function traitSignalForJobs(traitKeys: string[]): Record<JobId, number> {
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const t of traitKeys) {
    const w = traitWeights[t];
    if (!w) continue;
    for (const j of JOB_IDS) {
      out[j] += w[j];
    }
  }
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
};

export type JudgmentResult = {
  raw: Record<JobId, number>;
  probabilities: Record<JobId, number>;
  percentages: Record<JobId, number>;
  topJob: JobId;
};

export function computeJudgment(input: JudgmentInput): JudgmentResult {
  const prior = getPriorForAnimalKey(effectiveAnimalKey(input));
  const modelTraits = traitsForModel(input.traits);
  const tSignal = traitSignalForJobs(modelTraits);

  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    raw[j] = WEIGHT_PRIOR * prior[j] + WEIGHT_TRAIT * tSignal[j];
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
