import { cityDistribution } from "@/data/cityDistribution";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import { jobToRegionId, topAiJob } from "@/lib/step5Layout";
import type { DistrictId, RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";

const DISTRICTS: DistrictId[] = ["artist", "engineer", "manager", "community"];

/**
 * Step 3 city bias: district where `cityDistribution` count is highest.
 * If the animal does not appear in Step 3 data, falls back to the top AI recommendation role
 * mapped to a district (same mapping as the sorting machine).
 */
export function originalDistrictForAnimal(
  animalId: string,
  aiRecommendation: Record<JobId, number>,
): DistrictId {
  let best: DistrictId = "artist";
  let bestCount = -1;
  for (const d of DISTRICTS) {
    const row = cityDistribution[d].find((x) => x.animal === animalId);
    const c = row?.count ?? 0;
    if (c > bestCount) {
      bestCount = c;
      best = d;
    }
  }
  if (bestCount <= 0) {
    return jobToRegionId(topAiJob(aiRecommendation));
  }
  return best;
}

/** Full map for Step 5 open — every story animal starts in its Step 3–biased district (not Freelancer Hub). */
export function buildInitialStep5Placements(): Record<string, RedesignRegionId> {
  const out: Record<string, RedesignRegionId> = {};
  for (const a of STEP5_ANIMALS) {
    out[a.id] = originalDistrictForAnimal(a.id, a.aiRecommendation);
  }
  return out;
}
