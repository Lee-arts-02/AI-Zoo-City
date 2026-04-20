import { STEP5_ANIMALS } from "@/data/step5Animals";
import { animalTraits } from "@/data/animalTraits";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import type { DistrictId } from "@/types/city";

export type Step6ScatterPoint = {
  id: string;
  leftPct: number;
  topPct: number;
  district: DistrictId;
};

function hash(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 1000;
}

/**
 * Herbivore ← → Carnivore (x), Small ← → Large (y, small at bottom).
 * Jittered so points don’t sit on one pixel.
 */
export function buildStep6ScatterPoints(
  placements: Record<string, DistrictId>,
  seed = 42_001,
): Step6ScatterPoint[] {
  return STEP5_ANIMALS.map((a) => {
    const t = animalTraits[a.id as ZooCityAnimalId];
    const herb = t.diet === "herbivore";
    const baseX = herb ? 18 + hash(a.id, seed) * 0.04 : 82 - hash(a.id, seed + 3) * 0.04;
    const xJ = ((hash(a.id, seed + 7) % 17) - 8) * 0.35;
    const leftPct = Math.min(94, Math.max(6, baseX + xJ));

    let baseY = 78;
    if (t.size === "small") baseY = 82;
    else if (t.size === "medium") baseY = 52;
    else baseY = 22;
    const yJ = ((hash(a.id, seed + 11) % 19) - 9) * 0.4;
    const topPct = Math.min(92, Math.max(8, baseY + yJ));

    return {
      id: a.id,
      leftPct,
      topPct,
      district: placements[a.id] ?? "artist",
    };
  });
}
