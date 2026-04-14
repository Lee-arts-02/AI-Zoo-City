import type { ZooCityAnimalId } from "@/data/animalAssets";

/** Diet axis: left = herbivore, right = carnivore */
export type DietAxis = "herbivore" | "carnivore";

/** Size axis: top = large, bottom = small (medium maps to “large” half for organizer simplicity). */
export type SizeAxis = "small" | "medium" | "large";

export type AnimalTraitRow = {
  diet: DietAxis;
  size: SizeAxis;
};

/**
 * Simplified traits for the Step 3 two-axis organizer (child-friendly quadrants).
 * “Medium” animals sit in the large-size half for layout simplicity.
 */
export const animalTraits: Record<ZooCityAnimalId, AnimalTraitRow> = {
  rabbit: { diet: "herbivore", size: "small" },
  hedgehog: { diet: "herbivore", size: "small" },
  capybara: { diet: "herbivore", size: "large" },
  squirrel: { diet: "herbivore", size: "small" },
  fox: { diet: "carnivore", size: "small" },
  chameleon: { diet: "carnivore", size: "small" },
  cat: { diet: "carnivore", size: "small" },
  otter: { diet: "carnivore", size: "medium" },
  bear: { diet: "carnivore", size: "large" },
  lion: { diet: "carnivore", size: "large" },
  wolf: { diet: "carnivore", size: "medium" },
  tiger: { diet: "carnivore", size: "large" },
  deer: { diet: "herbivore", size: "medium" },
  sheep: { diet: "herbivore", size: "medium" },
  elephant: { diet: "herbivore", size: "large" },
  zebra: { diet: "herbivore", size: "large" },
};

/** Large / medium → top half (Large); small → bottom half (Small). */
export function isLargeHalf(size: SizeAxis): boolean {
  return size === "large" || size === "medium";
}
