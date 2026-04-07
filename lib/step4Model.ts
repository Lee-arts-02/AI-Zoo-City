/**
 * Simplified conditional structure for Step 4 pedagogy:
 * single-token condition (Markov-style) vs fused multi-token state → softmax probabilities.
 */

import { JOB_IDS, traitWeights, probabilitiesToPercentages } from "@/lib/aiModel";
import type { JobId } from "@/types/game";
import type { Step4Token } from "@/lib/step4Tokens";
import { getAnimalPriorRecord } from "@/lib/step4Tokens";

const EPS = 1e-9;

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

/** One-token conditional: P(job | token) from the token’s channel only (softmax over jobs). */
export function distributionGivenSingleToken(token: Step4Token): Record<JobId, number> {
  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };

  if (token.kind === "animal") {
    const prior = getAnimalPriorRecord(token.modelKey);
    for (const j of JOB_IDS) {
      raw[j] = Math.log((prior[j] ?? 0) + EPS);
    }
    return softmaxJobs(raw);
  }

  if (token.kind === "trait") {
    const w = traitWeights[token.modelKey];
    if (!w) {
      for (const j of JOB_IDS) raw[j] = 0;
      return softmaxJobs(raw);
    }
    for (const j of JOB_IDS) {
      raw[j] = w[j];
    }
    return softmaxJobs(raw);
  }

  // dream: soft preference toward the stated goal (not a hard rule)
  for (const j of JOB_IDS) {
    raw[j] = j === token.modelKey ? 1.2 : 0;
  }
  return softmaxJobs(raw);
}

/**
 * Multi-token state: summed log-channels → softmax (conditional on the active set).
 * Tokens contribute to a combined signal; jobs are not reached directly from each token.
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
    if (token.kind === "animal") {
      const prior = getAnimalPriorRecord(token.modelKey);
      for (const j of JOB_IDS) {
        raw[j] += Math.log((prior[j] ?? 0) + EPS);
      }
    } else if (token.kind === "trait") {
      const w = traitWeights[token.modelKey];
      if (w) {
        for (const j of JOB_IDS) {
          raw[j] += w[j];
        }
      }
    } else if (token.kind === "dream") {
      for (const j of JOB_IDS) {
        raw[j] += j === token.modelKey ? 0.35 : 0;
      }
    }
  }

  return softmaxJobs(raw);
}

export function toPercentages(probs: Record<JobId, number>): Record<JobId, number> {
  return probabilitiesToPercentages(probs);
}

export function pctDelta(
  before: Record<JobId, number>,
  after: Record<JobId, number>,
): Record<JobId, number> {
  const out: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    out[j] = after[j] - before[j];
  }
  return out;
}

/** Impact of removing one token: L1 distance of probability vectors. */
export function tokenImpactScore(
  token: Step4Token,
  allTokens: Step4Token[],
  activeIds: Set<string>,
): number {
  const active = allTokens.filter((t) => activeIds.has(t.id));
  const without = active.filter((t) => t.id !== token.id);
  const pWith = distributionFromActiveTokens(active);
  const pWithout = distributionFromActiveTokens(without);
  let s = 0;
  for (const j of JOB_IDS) {
    s += Math.abs(pWith[j] - pWithout[j]);
  }
  return s;
}

export function highestImpactTokenId(
  allTokens: Step4Token[],
  activeIds: Set<string>,
): string | null {
  const active = allTokens.filter((t) => activeIds.has(t.id));
  if (active.length === 0) return null;
  let bestId: string | null = null;
  let best = -1;
  for (const t of active) {
    const score = tokenImpactScore(t, allTokens, activeIds);
    if (score > best) {
      best = score;
      bestId = t.id;
    }
  }
  return bestId;
}

/** Strength of edge fusion → job (for line width). */
export function fusionToJobStrengths(probs: Record<JobId, number>): Record<JobId, number> {
  return { ...probs };
}

export { JOB_IDS };
