export type DistrictId = "artist" | "engineer" | "manager" | "community";

/** Step 5 drop zones: classic districts plus the new Freelancer Hub (map v2). */
export type RedesignRegionId = DistrictId | "freelancer";

export interface AnimalCount {
  animal: string;
  count: number;
}