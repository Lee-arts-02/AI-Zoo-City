import { cityDistribution } from "@/data/cityDistribution";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import type { DistrictId } from "@/types/city";

/** Starter tokens for the axis organizer; each carries its old district placement. */
export type OrganizerTokenDef = {
  instanceId: string;
  animal: ZooCityAnimalId;
  district: DistrictId;
};

const DISTRICTS: DistrictId[] = ["artist", "engineer", "manager", "community"];

/** Two species per district — draggable starters; colors assigned by the learner in Step 3. */
export function buildStarterOrganizerTokens(): OrganizerTokenDef[] {
  const out: OrganizerTokenDef[] = [];
  for (const d of DISTRICTS) {
    const rows = cityDistribution[d];
    for (let i = 0; i < Math.min(2, rows.length); i++) {
      const row = rows[i]!;
      out.push({
        instanceId: `starter-${d}-${row.animal}-${i}`,
        animal: row.animal,
        district: d,
      });
    }
  }
  return out;
}
