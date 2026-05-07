/**
 * Simplified conditional structure for Step 4 pedagogy:
 * simplified size/diet feature state for Step 4.
 */

import { JOB_IDS } from "@/lib/aiModel";
import type { AnimalDiet, AnimalSize, JobId } from "@/types/game";
import type { Step4Token } from "@/lib/step4Tokens";

const EPS = 1e-9;

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

function softmaxJobs(raw: Record<JobId, number>): Record<JobId, number> {
  const max = Math.max(...JOB_IDS.map((j) => raw[j]));
  let sum = 0;
  const exp: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    const e = Math.exp(raw[j] - max);
    exp[j] = e;
    sum += e;
  }
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    out[j] = exp[j] / sum;
  }
  return out;
}

/** One-feature conditional: P(job | feature) from the feature's channel only. */
export function distributionGivenSingleToken(token: Step4Token): Record<JobId, number> {
  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };

  if (token.kind === "diet") {
    const signal = DIET_SIGNAL[token.modelKey as AnimalDiet];
    if (signal) {
      for (const j of JOB_IDS) raw[j] = Math.log((signal[j] ?? 0) + EPS);
      return softmaxJobs(raw);
    }
  }

  if (token.kind === "size") {
    const signal = SIZE_SIGNAL[token.modelKey as AnimalSize];
    if (signal) {
      for (const j of JOB_IDS) raw[j] = Math.log((signal[j] ?? 0) + EPS);
      return softmaxJobs(raw);
    }
  }

  for (const j of JOB_IDS) raw[j] = 0;
  return softmaxJobs(raw);
}

/**
 * Multi-feature state: summed log-channels → softmax (conditional on the active set).
 */
export function distributionFromActiveTokens(active: Step4Token[]): Record<JobId, number> {
  if (active.length === 0) {
    const u: Record<JobId, number> = {
      artist: 0,
      engineer: 0,
      manager: 0,
      community: 0,
    };
    for (const j of JOB_IDS) u[j] = 0;
    return softmaxJobs(u);
  }

  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };

  for (const token of active) {
    if (token.kind === "diet") {
      const signal = DIET_SIGNAL[token.modelKey as AnimalDiet];
      if (signal) {
        for (const j of JOB_IDS) raw[j] += Math.log((signal[j] ?? 0) + EPS) * 0.8;
      }
    } else if (token.kind === "size") {
      const signal = SIZE_SIGNAL[token.modelKey as AnimalSize];
      if (signal) {
        for (const j of JOB_IDS) raw[j] += Math.log((signal[j] ?? 0) + EPS) * 0.65;
      }
    }
  }

  return softmaxJobs(raw);
}

export { JOB_IDS };
