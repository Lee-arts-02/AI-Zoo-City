import { cityDistribution } from "@/data/cityDistribution";
import type { DistrictId } from "@/types/city";

/** Largest remainder so displayed percentages sum to 100 for each district. */
function percentagesFromCounts(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return counts.map(() => 0);
  const exact = counts.map((c) => (c / total) * 100);
  const floors = exact.map((e) => Math.floor(e));
  let rem = 100 - floors.reduce((a, b) => a + b, 0);
  const order = counts
    .map((_, i) => i)
    .sort((i, j) => exact[j] - floors[j] - (exact[i] - floors[i]));
  const out = [...floors];
  for (let k = 0; k < rem; k++) out[order[k]] += 1;
  return out;
}

export function getDistrictTotal(districtId: DistrictId) {
  return cityDistribution[districtId].reduce((sum, item) => sum + item.count, 0);
}

export function getDistrictPercentages(districtId: DistrictId) {
  const rows = cityDistribution[districtId];
  const counts = rows.map((r) => r.count);
  const pct = percentagesFromCounts(counts);
  return rows.map((item, i) => ({
    ...item,
    percentage: pct[i],
  }));
}

export function getTopAnimals(districtId: DistrictId, limit = 3) {
  return [...cityDistribution[districtId]]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
