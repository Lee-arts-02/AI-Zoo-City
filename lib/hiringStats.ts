import { STEP5_ANIMALS } from "@/data/step5Animals";
import { animalTraits, isLargeHalf } from "@/data/animalTraits";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import type { DistrictId } from "@/types/city";

const DISTRICTS: DistrictId[] = ["artist", "engineer", "manager", "community"];

export function countByDistrict(
  placements: Record<string, DistrictId>,
): Record<DistrictId, number> {
  const out: Record<DistrictId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const a of STEP5_ANIMALS) {
    const r = placements[a.id];
    if (r) out[r] += 1;
  }
  return out;
}

export type DistrictDeltaLine = {
  district: DistrictId;
  label: string;
  delta: number;
};

/** e.g. “Artist District now has +2 animals” */
export function buildDistrictDeltaLines(
  baseline: Record<DistrictId, number>,
  live: Record<DistrictId, number>,
): DistrictDeltaLine[] {
  const lines: DistrictDeltaLine[] = [];
  const labels: Record<DistrictId, string> = {
    artist: "Artist District",
    engineer: "Engineer Quarter",
    manager: "Manager Center",
    community: "Community Support",
  };
  for (const d of DISTRICTS) {
    const delta = live[d] - baseline[d];
    if (delta === 0) continue;
    const unit = Math.abs(delta) === 1 ? "animal" : "animals";
    lines.push({
      district: d,
      delta,
      label: `${labels[d]} now has ${delta > 0 ? "+" : ""}${delta} ${unit}`,
    });
  }
  if (lines.length === 0) {
    return [
      {
        district: "artist",
        delta: 0,
        label: "District counts still match the original city.",
      },
    ];
  }
  return lines;
}

type DietFrac = { carnivore: number; large: number; n: number };

function dietFractionsInDistrict(
  placements: Record<string, DistrictId>,
  district: DistrictId,
): DietFrac {
  let n = 0;
  let carn = 0;
  let large = 0;
  for (const a of STEP5_ANIMALS) {
    if (placements[a.id] !== district) continue;
    n += 1;
    const t = animalTraits[a.id as ZooCityAnimalId];
    if (t.diet === "carnivore") carn += 1;
    if (isLargeHalf(t.size)) large += 1;
  }
  return { carnivore: n ? carn / n : 0, large: n ? large / n : 0, n };
}

/** Short, readable “mid-process” cues — not a dashboard. */
export function buildMiniBiasLines(
  baselinePlacements: Record<string, DistrictId>,
  livePlacements: Record<string, DistrictId>,
): string[] {
  const out: string[] = [];
  for (const d of DISTRICTS) {
    const b = dietFractionsInDistrict(baselinePlacements, d);
    const l = dietFractionsInDistrict(livePlacements, d);
    if (l.n < 2) continue;
    if (l.carnivore - b.carnivore >= 0.2) {
      const name =
        d === "manager"
          ? "Manager"
          : d === "artist"
            ? "Artist"
            : d === "engineer"
              ? "Engineer"
              : "Community";
      out.push(`${name} is becoming more carnivore-heavy.`);
    } else if (b.carnivore - l.carnivore >= 0.2) {
      const name =
        d === "community"
          ? "Community"
          : d === "artist"
            ? "Artist"
            : d === "engineer"
              ? "Engineer"
              : "Manager";
      out.push(`${name} is including more plant-eating animals now.`);
    }
    if (l.large - b.large >= 0.22 && l.n >= 3) {
      out.push(
        `${d === "artist" ? "Artist" : d === "engineer" ? "Engineer" : d === "manager" ? "Manager" : "Community"} now includes more large animals.`,
      );
    }
  }

  const mixed = mixedness(livePlacements);
  const mixedB = mixedness(baselinePlacements);
  if (mixed - mixedB >= 0.08) {
    out.push("The city is becoming more mixed across districts.");
  }

  return [...new Set(out)].slice(0, 4);
}

/** Shannon-like balance across districts (0–1, higher = more even). */
function mixedness(placements: Record<string, DistrictId>): number {
  const c = countByDistrict(placements);
  const total = STEP5_ANIMALS.length;
  let h = 0;
  for (const d of DISTRICTS) {
    const p = c[d] / total;
    if (p > 0) h -= p * Math.log(p);
  }
  return h / Math.log(DISTRICTS.length);
}
