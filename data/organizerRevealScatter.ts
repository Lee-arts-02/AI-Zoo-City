import { animalTraits, isLargeHalf } from "@/data/animalTraits";
import { cityDistribution } from "@/data/cityDistribution";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import type { DistrictId } from "@/types/city";

export type ScatterQuadrant = "HL" | "HR" | "SL" | "SR";

export type ScatterDot = {
  id: string;
  quadrant: ScatterQuadrant;
  leftPct: number;
  topPct: number;
  district: DistrictId;
  opacity: number;
};

export type ScatterIcon = {
  id: string;
  quadrant: ScatterQuadrant;
  leftPct: number;
  topPct: number;
  district: DistrictId;
  animal: ZooCityAnimalId;
  opacity: number;
};

function quadrantForAnimal(animal: ZooCityAnimalId): ScatterQuadrant {
  const t = animalTraits[animal];
  const large = isLargeHalf(t.size);
  if (t.diet === "herbivore" && large) return "HL";
  if (t.diet === "carnivore" && large) return "HR";
  if (t.diet === "herbivore" && !large) return "SL";
  return "SR";
}

function dominantQuadrantForDistrict(d: DistrictId): ScatterQuadrant {
  const tally: Record<ScatterQuadrant, number> = { HL: 0, HR: 0, SL: 0, SR: 0 };
  for (const row of cityDistribution[d]) {
    tally[quadrantForAnimal(row.animal)] += row.count;
  }
  let best: ScatterQuadrant = "HL";
  let bestV = -1;
  for (const q of ["HL", "HR", "SL", "SR"] as const) {
    if (tally[q] > bestV) {
      bestV = tally[q];
      best = q;
    }
  }
  return best;
}

const ADJACENT: Record<ScatterQuadrant, ScatterQuadrant[]> = {
  HL: ["HR", "SL"],
  HR: ["HL", "SR"],
  SL: ["HL", "SR"],
  SR: ["HR", "SL"],
};

/** Deterministic 0..1 PRNG for stable scatter between renders. */
function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickAdjacent(rng: () => number, q: ScatterQuadrant): ScatterQuadrant {
  const opts = ADJACENT[q];
  return opts[Math.floor(rng() * opts.length)]!;
}

/**
 * City-wide visualization: many district-colored dots + a few animal icons,
 * biased toward each district’s dominant quadrant with spillover (~16%).
 */
export function buildOrganizerRevealScatter(seed: number): {
  dots: ScatterDot[];
  icons: ScatterIcon[];
} {
  const rng = mulberry32(seed >>> 0);
  const dots: ScatterDot[] = [];
  const icons: ScatterIcon[] = [];
  const districts: DistrictId[] = ["artist", "engineer", "manager", "community"];
  /** ~12–18% spill into an adjacent quadrant (visible bias, not a perfect grid). */
  const spillRoll = () => 0.12 + rng() * 0.06;

  let dotIndex = 0;
  for (const d of districts) {
    const dominant = dominantQuadrantForDistrict(d);
    const rows = cityDistribution[d];
    const totalHeads = rows.reduce((s, r) => s + r.count, 0);
    const dotCount = Math.min(56, Math.max(20, Math.round(totalHeads * 1.15)));

    for (let i = 0; i < dotCount; i++) {
      const useSpill = rng() < spillRoll();
      const quadrant = useSpill ? pickAdjacent(rng, dominant) : dominant;
      const leftPct = 8 + rng() * 84 + (rng() - 0.5) * 8;
      const topPct = 8 + rng() * 84 + (rng() - 0.5) * 8;
      const opacity = 0.22 + rng() * 0.12;
      dots.push({
        id: `dot-${d}-${dotIndex++}`,
        quadrant,
        leftPct: Math.min(96, Math.max(4, leftPct)),
        topPct: Math.min(96, Math.max(4, topPct)),
        district: d,
        opacity,
      });
    }

    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const row = rows[i]!;
      const traitQ = quadrantForAnimal(row.animal);
      const useSpill = rng() < 0.14 + rng() * 0.06;
      const quadrant = useSpill ? pickAdjacent(rng, traitQ) : traitQ;
      const leftPct = 18 + rng() * 64;
      const topPct = 18 + rng() * 64;
      icons.push({
        id: `icon-${d}-${row.animal}-${i}`,
        quadrant,
        leftPct,
        topPct,
        district: d,
        animal: row.animal,
        opacity: 0.44 + rng() * 0.12,
      });
    }
  }

  return { dots, icons };
}
