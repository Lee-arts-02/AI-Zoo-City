import { cityDistribution } from "@/data/cityDistribution";
import type { DistrictId } from "@/types/city";

export function getDistrictTotal(districtId: DistrictId) {
  return cityDistribution[districtId].reduce((sum, item) => sum + item.count, 0);
}

export function getDistrictPercentages(districtId: DistrictId) {
  const total = getDistrictTotal(districtId);
  return cityDistribution[districtId].map((item) => ({
    ...item,
    percentage: total === 0 ? 0 : Math.round((item.count / total) * 100),
  }));
}

export function getTopAnimals(districtId: DistrictId, limit = 3) {
  return [...cityDistribution[districtId]]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}