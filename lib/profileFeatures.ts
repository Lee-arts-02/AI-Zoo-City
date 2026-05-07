import { getZooAnimalEntry } from "@/data/zooAnimalDataset";
import type { Step5Animal } from "@/data/step5Animals";
import type { AnimalDiet, AnimalSize, LearnerProfile } from "@/types/game";
import {
  getAnimalDisplayName,
  getAnimalEmojiForLearner,
  getDreamDisplayLabel,
  getResolvedAnimalKey,
} from "@/lib/learnerUtils";

export const DIET_OPTIONS: readonly AnimalDiet[] = [
  "Carnivore",
  "Herbivore",
  "Omnivore",
] as const;

export const SIZE_OPTIONS: readonly AnimalSize[] = [
  "Small",
  "Medium",
  "Large",
] as const;

const ANIMAL_FEATURE_DEFAULTS: Record<string, { diet: AnimalDiet; size: AnimalSize }> = {
  rabbit: { diet: "Herbivore", size: "Small" },
  hedgehog: { diet: "Omnivore", size: "Small" },
  capybara: { diet: "Herbivore", size: "Medium" },
  squirrel: { diet: "Omnivore", size: "Small" },
  fox: { diet: "Carnivore", size: "Small" },
  chameleon: { diet: "Omnivore", size: "Small" },
  cat: { diet: "Carnivore", size: "Small" },
  dog: { diet: "Omnivore", size: "Medium" },
  otter: { diet: "Carnivore", size: "Small" },
  bear: { diet: "Omnivore", size: "Large" },
  lion: { diet: "Carnivore", size: "Large" },
  wolf: { diet: "Carnivore", size: "Medium" },
  tiger: { diet: "Carnivore", size: "Large" },
  deer: { diet: "Herbivore", size: "Medium" },
  sheep: { diet: "Herbivore", size: "Medium" },
  elephant: { diet: "Herbivore", size: "Large" },
  zebra: { diet: "Herbivore", size: "Medium" },
  giraffe: { diet: "Herbivore", size: "Large" },
  monkey: { diet: "Omnivore", size: "Medium" },
  panda: { diet: "Herbivore", size: "Large" },
  koala: { diet: "Herbivore", size: "Small" },
  pig: { diet: "Omnivore", size: "Medium" },
  cow: { diet: "Herbivore", size: "Large" },
  horse: { diet: "Herbivore", size: "Large" },
  mouse: { diet: "Omnivore", size: "Small" },
  frog: { diet: "Carnivore", size: "Small" },
  penguin: { diet: "Carnivore", size: "Medium" },
  bird: { diet: "Omnivore", size: "Small" },
  owl: { diet: "Carnivore", size: "Small" },
  duck: { diet: "Omnivore", size: "Small" },
  seal: { diet: "Carnivore", size: "Medium" },
  gorilla: { diet: "Herbivore", size: "Large" },
  raccoon: { diet: "Omnivore", size: "Small" },
  turtle: { diet: "Omnivore", size: "Small" },
  snake: { diet: "Carnivore", size: "Small" },
  cheetah: { diet: "Carnivore", size: "Medium" },
  leopard: { diet: "Carnivore", size: "Medium" },
  rhino: { diet: "Herbivore", size: "Large" },
  hippo: { diet: "Herbivore", size: "Large" },
  bat: { diet: "Omnivore", size: "Small" },
  bee: { diet: "Herbivore", size: "Small" },
  flamingo: { diet: "Omnivore", size: "Medium" },
};

export type AnimalProfileCardData = {
  animal: string;
  emoji: string;
  diet: AnimalDiet | null;
  size: AnimalSize | null;
  traits?: string[];
  dreamJob?: string;
};

export function getDefaultProfileFeatures(
  animalKey: string | null | undefined,
): { diet: AnimalDiet; size: AnimalSize } | null {
  if (!animalKey) return null;
  return ANIMAL_FEATURE_DEFAULTS[animalKey] ?? null;
}

export function getLearnerDiet(learner: LearnerProfile): AnimalDiet | null {
  return learner.diet ?? getDefaultProfileFeatures(getResolvedAnimalKey(learner))?.diet ?? null;
}

export function getLearnerSize(learner: LearnerProfile): AnimalSize | null {
  return learner.size ?? getDefaultProfileFeatures(getResolvedAnimalKey(learner))?.size ?? null;
}

export function buildLearnerProfileCardData(
  learner: LearnerProfile,
): AnimalProfileCardData {
  const animal = getAnimalDisplayName(learner)
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
  return {
    animal,
    emoji: getAnimalEmojiForLearner(learner),
    diet: getLearnerDiet(learner),
    size: getLearnerSize(learner),
    traits: [],
    dreamJob: getDreamDisplayLabel(learner),
  };
}

export function buildStep5ProfileCardData(
  animal: Step5Animal,
): AnimalProfileCardData {
  const animalType = animal.animalType ?? animal.id;
  const entry = getZooAnimalEntry(animalType);
  const defaults = getDefaultProfileFeatures(animalType);
  return {
    animal: animalType.charAt(0).toUpperCase() + animalType.slice(1),
    emoji: entry?.emoji ?? "🐾",
    diet: animal.diet ?? defaults?.diet ?? null,
    size: animal.size ?? defaults?.size ?? null,
    traits: [],
  };
}
