/**
 * Deterministic supervised classifier: the machine sees size and diet, then
 * matches those features against old animal cards with district labels.
 * Dream job is not part of the machine signal (learner aspiration only).
 */

import { animalPriorFromDataset, resolveZooAnimalInput } from "@/data/zooAnimalDataset";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import { getDefaultProfileFeatures } from "@/lib/profileFeatures";
import type { AnimalDiet, AnimalSize, JobId } from "@/types/game";

export const JOB_IDS: readonly JobId[] = [
  "artist",
  "engineer",
  "manager",
  "community",
] as const;

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

const PAST_LABEL_BY_ANIMAL: Record<string, JobId> = {
  rabbit: "artist",
  hedgehog: "artist",
  capybara: "artist",
  squirrel: "artist",
  fox: "engineer",
  chameleon: "engineer",
  cat: "engineer",
  dog: "community",
  otter: "engineer",
  bear: "manager",
  lion: "manager",
  wolf: "manager",
  tiger: "manager",
  deer: "community",
  sheep: "community",
  elephant: "community",
  zebra: "community",
};

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

const DIET_SIGNAL: Record<AnimalDiet, Record<JobId, number>> = {
  Carnivore: { artist: 0.1, engineer: 0.2, manager: 0.45, community: 0.25 },
  Herbivore: { artist: 0.28, engineer: 0.12, manager: 0.14, community: 0.46 },
  Omnivore: { artist: 0.22, engineer: 0.28, manager: 0.26, community: 0.24 },
};

const SIZE_SIGNAL: Record<AnimalSize, Record<JobId, number>> = {
  Small: { artist: 0.38, engineer: 0.22, manager: 0.18, community: 0.22 },
  Medium: { artist: 0.22, engineer: 0.28, manager: 0.26, community: 0.24 },
  Large: { artist: 0.12, engineer: 0.22, manager: 0.28, community: 0.38 },
};

function featureValueForInput(input: JudgmentInput): {
  animalKey: string | null;
  diet: AnimalDiet | null;
  size: AnimalSize | null;
} {
  const animalKey = effectiveAnimalKey(input);
  const defaults = getDefaultProfileFeatures(animalKey);
  return {
    animalKey,
    diet: input.diet ?? defaults?.diet ?? null,
    size: input.size ?? defaults?.size ?? null,
  };
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
  diet?: AnimalDiet | null;
  size?: AnimalSize | null;
  traits: string[];
  trainingLabels?: Record<string, JobId | "freelancer"> | null;
};

export type JudgmentResult = {
  raw: Record<JobId, number>;
  probabilities: Record<JobId, number>;
  percentages: Record<JobId, number>;
  topJob: JobId;
};

export function computeJudgment(input: JudgmentInput): JudgmentResult {
  const labelSignal = trainingLabelSignal(input);

  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    raw[j] = labelSignal[j];
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

function trainingLabelSignal(input: JudgmentInput): Record<JobId, number> {
  const counts: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  const features = featureValueForInput(input);
  const addMatches = (mode: "exact" | "diet" | "size" | "all") => {
    let matched = 0;
    for (const example of STEP5_ANIMALS) {
      const label = input.trainingLabels?.[example.id] ?? example.originalLabel ?? PAST_LABEL_BY_ANIMAL[example.animalType ?? example.id] ?? example.dreamJob;
      if (label === "freelancer") continue;
      const exampleType = example.animalType ?? example.id;
      const defaults = getDefaultProfileFeatures(exampleType);
      const sameDiet = Boolean(features.diet && features.diet === (example.diet ?? defaults?.diet));
      const sameSize = Boolean(features.size && features.size === (example.size ?? defaults?.size));
      const ok =
        mode === "all" ||
        (mode === "exact" && sameDiet && sameSize) ||
        (mode === "diet" && sameDiet) ||
        (mode === "size" && sameSize);
      if (!ok) continue;
      counts[label] += mode === "exact" ? 4 : mode === "all" ? 1 : 2;
      matched += 1;
    }
    return matched;
  };

  let matched = addMatches("exact");
  if (matched === 0) matched = addMatches("diet");
  if (matched === 0) matched = addMatches("size");
  if (matched === 0) addMatches("all");

  let best: JobId = "artist";
  for (const j of JOB_IDS) {
    if (counts[j] > counts[best]) best = j;
  }

  return {
    artist: best === "artist" ? 1 : 0,
    engineer: best === "engineer" ? 1 : 0,
    manager: best === "manager" ? 1 : 0,
    community: best === "community" ? 1 : 0,
  };
}
