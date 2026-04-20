import { STEP5_ANIMALS } from "@/data/step5Animals";
import type { RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";

const JOB_IDS: JobId[] = ["artist", "engineer", "manager", "community"];

/**
 * Turn final placements into job shares for retraining. Freelancer counts split evenly across jobs.
 */
export function buildCityJobSharesFromPlacements(
  placements: Record<string, RedesignRegionId>,
): Record<JobId, number> {
  const raw: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  const total = STEP5_ANIMALS.length;

  for (const a of STEP5_ANIMALS) {
    const r = placements[a.id];
    if (!r) continue;
    if (r === "freelancer") {
      for (const j of JOB_IDS) {
        raw[j] += 0.25;
      }
    } else {
      raw[r] += 1;
    }
  }

  const out: Record<JobId, number> = { ...raw };
  for (const j of JOB_IDS) {
    out[j] = total > 0 ? out[j] / total : 0.25;
  }
  return out;
}
