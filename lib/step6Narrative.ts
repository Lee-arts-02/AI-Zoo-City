import { STEP5_ANIMALS } from "@/data/step5Animals";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { RedesignRegionId } from "@/types/city";

function ensurePlacements(
  p: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (p && Object.keys(p).length >= STEP5_ANIMALS.length) return p;
  return buildInitialStep5Placements() as Record<string, RedesignRegionId>;
}

/** Headline on the save celebration overlay (before Step 6). */
export function buildStep6CelebrationHeadline(
  placements: Record<string, RedesignRegionId> | null | undefined,
): string {
  const final = ensurePlacements(placements);
  const initial = buildInitialStep5Placements();
  let changed = 0;
  for (const a of STEP5_ANIMALS) {
    if (final[a.id] !== initial[a.id]) changed += 1;
  }
  if (changed >= 3) return "You redesigned the city.";
  return "Your new Zoo City is ready.";
}
