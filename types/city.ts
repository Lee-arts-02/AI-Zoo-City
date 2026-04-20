export type DistrictId = "artist" | "engineer" | "manager" | "community";

/** Step 5 placement targets — four districts plus optional Freelancer Hub. */
export type RedesignRegionId = DistrictId | "freelancer";

export interface AnimalCount {
  animal: string;
  count: number;
}