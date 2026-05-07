import { STEP5_ANIMALS } from "@/data/step5Animals";
import type { JudgmentInput } from "@/lib/aiModel";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import { getDefaultProfileFeatures } from "@/lib/profileFeatures";
import type { JobId } from "@/types/game";
import type { RedesignRegionId } from "@/types/city";

const JOB_IDS: JobId[] = ["artist", "engineer", "manager", "community"];

/** Profile signals for city label matching — dream is for comparison, not a classifier feature. */
export type CityEvidenceInput = JudgmentInput & { dreamJob: JobId };

/**
 * Soft district → job affinity: each district pulls probability toward several roles
 * (combined clues), not a single “winner district” vote.
 */
function regionJobAffinity(region: RedesignRegionId): Record<JobId, number> {
  switch (region) {
    case "artist":
      return { artist: 0.5, engineer: 0.15, manager: 0.12, community: 0.23 };
    case "engineer":
      return { artist: 0.12, engineer: 0.52, manager: 0.16, community: 0.2 };
    case "manager":
      return { artist: 0.1, engineer: 0.14, manager: 0.48, community: 0.28 };
    case "community":
      return { artist: 0.13, engineer: 0.11, manager: 0.15, community: 0.61 };
    case "freelancer":
      return { artist: 0.25, engineer: 0.25, manager: 0.25, community: 0.25 };
    default:
      return { artist: 0.25, engineer: 0.25, manager: 0.25, community: 0.25 };
  }
}

/** Redesign moved this animal vs Step 3 baseline — strengthens “pattern shift” learning. */
function patternShiftMultiplier(
  animalId: string,
  region: RedesignRegionId,
  baseline: Record<string, RedesignRegionId>,
): number {
  const b = baseline[animalId];
  if (!b) return 1;
  if (region === "freelancer" && b !== "freelancer") return 1.22;
  if (region !== b) return 1.12;
  return 1;
}

/**
 * Combined city evidence from the redesigned city: each placement contributes
 * size/diet evidence plus updated labels.
 * This is NOT raw district population counts.
 */
export function buildCombinedCityEvidence(
  placements: Record<string, RedesignRegionId>,
  input: CityEvidenceInput,
): Record<JobId, number> {
  const baseline = buildInitialStep5Placements() as Record<string, RedesignRegionId>;
  const acc: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };

  for (const a of STEP5_ANIMALS) {
    const region = placements[a.id];
    if (!region) continue;

    const aff = regionJobAffinity(region);
    const defaults = getDefaultProfileFeatures(a.animalType ?? a.id);
    const dietMatch = input.diet && input.diet === (a.diet ?? defaults?.diet);
    const sizeMatch = input.size && input.size === (a.size ?? defaults?.size);
    const featureBundle = dietMatch && sizeMatch ? 1.7 : dietMatch || sizeMatch ? 1.25 : 0.55;
    const storyWeight =
      featureBundle *
      patternShiftMultiplier(a.id, region, baseline);

    for (const j of JOB_IDS) {
      acc[j] += aff[j] * storyWeight;
    }
  }

  let sum = 0;
  for (const j of JOB_IDS) sum += acc[j];
  if (sum <= 1e-8) {
    return { artist: 0.25, engineer: 0.25, manager: 0.25, community: 0.25 };
  }
  const out: Record<JobId, number> = { ...acc };
  for (const j of JOB_IDS) out[j] = acc[j] / sum;
  return out;
}

/** Strongest job link in the combined city evidence (for explanations). */
export function topJobFromEvidence(evidence: Record<JobId, number>): JobId {
  let best: JobId = "artist";
  let v = -1;
  for (const j of JOB_IDS) {
    if ((evidence[j] ?? 0) > v) {
      v = evidence[j] ?? 0;
      best = j;
    }
  }
  return best;
}

/**
 * How much Freelancer Hub acts as a learning expansion for this learner's size/diet pattern.
 */
export function freelancerHubLearningSignal(
  placements: Record<string, RedesignRegionId>,
  input: JudgmentInput,
): number {
  let sum = 0;
  let n = 0;
  for (const a of STEP5_ANIMALS) {
    if (placements[a.id] !== "freelancer") continue;
    const defaults = getDefaultProfileFeatures(a.animalType ?? a.id);
    const dietMatch = input.diet && input.diet === (a.diet ?? defaults?.diet);
    const sizeMatch = input.size && input.size === (a.size ?? defaults?.size);
    sum += dietMatch && sizeMatch ? 1 : dietMatch || sizeMatch ? 0.5 : 0;
    n += 1;
  }
  if (n === 0) return 0;
  return Math.min(1, sum / n);
}
