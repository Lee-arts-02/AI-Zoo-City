/**
 * Original Zoo City — canonical animal keys (lowercase singular) and image paths.
 * Paths match files in public/animals/ exactly (Capitalized.png).
 */

export const ZOO_CITY_ANIMAL_IDS = [
  "rabbit",
  "hedgehog",
  "capybara",
  "squirrel",
  "fox",
  "chameleon",
  "cat",
  "otter",
  "bear",
  "lion",
  "wolf",
  "tiger",
  "deer",
  "sheep",
  "elephant",
  "zebra",
] as const;

export type ZooCityAnimalId = (typeof ZOO_CITY_ANIMAL_IDS)[number];

export const animalAssets: Record<ZooCityAnimalId, { label: string; image: string }> = {
  rabbit: { label: "Rabbit", image: "/animals/Rabbit1.png" },
  hedgehog: { label: "Hedgehog", image: "/animals/Hedgehog.png" },
  capybara: { label: "Capybara", image: "/animals/Capybara.png" },
  squirrel: { label: "Squirrel", image: "/animals/Squirrel.png" },
  fox: { label: "Fox", image: "/animals/Fox.png" },
  chameleon: { label: "Chameleon", image: "/animals/Chameleon.png" },
  cat: { label: "Cat", image: "/animals/Cat.png" },
  otter: { label: "Otter", image: "/animals/Otter.png" },
  bear: { label: "Bear", image: "/animals/Bear.png" },
  lion: { label: "Lion", image: "/animals/Lion.png" },
  wolf: { label: "Wolf", image: "/animals/Wolf.png" },
  tiger: { label: "Tiger", image: "/animals/Tiger.png" },
  deer: { label: "Deer", image: "/animals/Deer.png" },
  sheep: { label: "Sheep", image: "/animals/Sheep.png" },
  elephant: { label: "Elephant", image: "/animals/Elephant.png" },
  zebra: { label: "Zebra", image: "/animals/Zebra.png" },
};

export function isZooCityAnimalId(s: string): s is ZooCityAnimalId {
  return (ZOO_CITY_ANIMAL_IDS as readonly string[]).includes(s);
}
