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
  dog: { diet: "carnivore", size: "small" },
  otter: { diet: "carnivore", size: "medium" },
  bear: { diet: "carnivore", size: "large" },
  lion: { diet: "carnivore", size: "large" },
  wolf: { diet: "carnivore", size: "medium" },
  tiger: { diet: "carnivore", size: "large" },
  deer: { diet: "herbivore", size: "medium" },
  sheep: { diet: "herbivore", size: "medium" },
  elephant: { diet: "herbivore", size: "large" },
  zebra: { diet: "herbivore", size: "large" },
  giraffe: { diet: "herbivore", size: "large" },
  monkey: { diet: "herbivore", size: "medium" },
  panda: { diet: "herbivore", size: "large" },
  koala: { diet: "herbivore", size: "medium" },
  pig: { diet: "herbivore", size: "medium" },
  cow: { diet: "herbivore", size: "large" },
  horse: { diet: "herbivore", size: "large" },
  mouse: { diet: "herbivore", size: "small" },
  frog: { diet: "carnivore", size: "small" },
  penguin: { diet: "carnivore", size: "medium" },
  bird: { diet: "herbivore", size: "small" },
  owl: { diet: "carnivore", size: "small" },
  duck: { diet: "herbivore", size: "small" },
  seal: { diet: "carnivore", size: "medium" },
  gorilla: { diet: "herbivore", size: "large" },
  raccoon: { diet: "carnivore", size: "small" },
  turtle: { diet: "carnivore", size: "small" },
  snake: { diet: "carnivore", size: "small" },
  cheetah: { diet: "carnivore", size: "large" },
  leopard: { diet: "carnivore", size: "large" },
  rhino: { diet: "herbivore", size: "large" },
  hippo: { diet: "herbivore", size: "large" },
  bat: { diet: "carnivore", size: "small" },
  bee: { diet: "herbivore", size: "small" },
  flamingo: { diet: "herbivore", size: "medium" },
};

/** Large / medium → top half (Large); small → bottom half (Small). */
export function isLargeHalf(size: SizeAxis): boolean {
  return size === "large" || size === "medium";
}
