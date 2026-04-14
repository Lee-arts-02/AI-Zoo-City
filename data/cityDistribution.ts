import type { ZooCityAnimalId } from "@/data/animalAssets";

export type CityDistributionRow = {
  animal: ZooCityAnimalId;
  count: number;
};

/** Original Zoo City — headcounts per district (percentages derived in lib/cityUtils). */
export const cityDistribution: Record<
  "artist" | "engineer" | "manager" | "community",
  CityDistributionRow[]
> = {
  artist: [
    { animal: "rabbit", count: 18 },
    { animal: "hedgehog", count: 12 },
    { animal: "capybara", count: 10 },
    { animal: "squirrel", count: 6 },
  ],
  engineer: [
    { animal: "fox", count: 20 },
    { animal: "chameleon", count: 14 },
    { animal: "cat", count: 10 },
    { animal: "otter", count: 6 },
  ],
  manager: [
    { animal: "bear", count: 22 },
    { animal: "lion", count: 15 },
    { animal: "wolf", count: 10 },
    { animal: "tiger", count: 6 },
  ],
  community: [
    { animal: "deer", count: 20 },
    { animal: "sheep", count: 14 },
    { animal: "elephant", count: 12 },
    { animal: "zebra", count: 6 },
  ],
};
