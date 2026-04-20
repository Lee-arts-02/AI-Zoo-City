/**
 * Zoo City — canonical supported animals (emoji + priors + alias resolution).
 * Images may reuse existing PNG art where we do not have a unique asset yet.
 */

import type { JobId } from "@/types/game";

/** Sharper role priors (sum to 1) so district leanings read more clearly in the model. */
export type ZooAnimalEntry = {
  key: string;
  label: string;
  emoji: string;
  /** Alternate spellings / plurals / kid phrasing */
  aliases: string[];
  /** PNG under public/animals — may be a stand-in for species without bespoke art */
  image: string;
  rolePrior: Record<JobId, number>;
};

function p(
  a: number,
  e: number,
  m: number,
  c: number,
): Record<JobId, number> {
  return { artist: a, engineer: e, manager: m, community: c };
}

/**
 * Full supported set. Keys are lowercase singular English.
 */
export const ZOO_ANIMAL_DATA: ZooAnimalEntry[] = [
  {
    key: "rabbit",
    label: "Rabbit",
    emoji: "🐰",
    aliases: ["bunny", "bunnies", "hare"],
    image: "/animals/Rabbit3.png",
    rolePrior: p(0.48, 0.12, 0.1, 0.3),
  },
  {
    key: "hedgehog",
    label: "Hedgehog",
    emoji: "🦔",
    aliases: ["hedge hogs", "hedge-hog"],
    image: "/animals/Hedgehog.png",
    rolePrior: p(0.44, 0.14, 0.12, 0.3),
  },
  {
    key: "capybara",
    label: "Capybara",
    emoji: "🦫",
    aliases: ["capy bara"],
    image: "/animals/Capybara.png",
    rolePrior: p(0.18, 0.14, 0.16, 0.52),
  },
  {
    key: "squirrel",
    label: "Squirrel",
    emoji: "🐿️",
    aliases: ["chipmunk"],
    image: "/animals/Squirrel.png",
    rolePrior: p(0.42, 0.16, 0.14, 0.28),
  },
  {
    key: "fox",
    label: "Fox",
    emoji: "🦊",
    aliases: ["foxes"],
    image: "/animals/Fox3.png",
    rolePrior: p(0.12, 0.48, 0.22, 0.18),
  },
  {
    key: "chameleon",
    label: "Chameleon",
    emoji: "🦎",
    aliases: ["lizard", "chameleons"],
    image: "/animals/Chameleon.png",
    rolePrior: p(0.14, 0.46, 0.18, 0.22),
  },
  {
    key: "cat",
    label: "Cat",
    emoji: "🐱",
    aliases: ["kitten", "kitty", "cats"],
    image: "/animals/Cat.png",
    rolePrior: p(0.16, 0.18, 0.46, 0.2),
  },
  {
    key: "dog",
    label: "Dog",
    emoji: "🐶",
    aliases: ["puppy", "puppies", "pup", "dogs", "hound"],
    image: "/animals/Cat.png",
    rolePrior: p(0.14, 0.2, 0.28, 0.38),
  },
  {
    key: "otter",
    label: "Otter",
    emoji: "🦦",
    aliases: ["otters"],
    image: "/animals/Otter.png",
    rolePrior: p(0.12, 0.42, 0.14, 0.32),
  },
  {
    key: "bear",
    label: "Bear",
    emoji: "🐻",
    aliases: ["bears", "grizzly", "panda bear"],
    image: "/animals/Bear.png",
    rolePrior: p(0.1, 0.2, 0.48, 0.22),
  },
  {
    key: "lion",
    label: "Lion",
    emoji: "🦁",
    aliases: ["lions"],
    image: "/animals/Lion.png",
    rolePrior: p(0.08, 0.12, 0.58, 0.22),
  },
  {
    key: "wolf",
    label: "Wolf",
    emoji: "🐺",
    aliases: ["wolves"],
    image: "/animals/Wolf.png",
    rolePrior: p(0.1, 0.22, 0.44, 0.24),
  },
  {
    key: "tiger",
    label: "Tiger",
    emoji: "🐯",
    aliases: ["tigers"],
    image: "/animals/Tiger.png",
    rolePrior: p(0.08, 0.14, 0.54, 0.24),
  },
  {
    key: "deer",
    label: "Deer",
    emoji: "🦌",
    aliases: ["buck", "doe", "fawn"],
    image: "/animals/Deer.png",
    rolePrior: p(0.28, 0.12, 0.14, 0.46),
  },
  {
    key: "sheep",
    label: "Sheep",
    emoji: "🐑",
    aliases: ["lamb", "ewe", "ram"],
    image: "/animals/Sheep.png",
    rolePrior: p(0.24, 0.08, 0.16, 0.52),
  },
  {
    key: "elephant",
    label: "Elephant",
    emoji: "🐘",
    aliases: ["elephants", "elaphant"],
    image: "/animals/Elephant.png",
    rolePrior: p(0.08, 0.14, 0.18, 0.6),
  },
  {
    key: "zebra",
    label: "Zebra",
    emoji: "🦓",
    aliases: ["zebras"],
    image: "/animals/Zebra.png",
    rolePrior: p(0.2, 0.14, 0.16, 0.5),
  },
  {
    key: "giraffe",
    label: "Giraffe",
    emoji: "🦒",
    aliases: ["giraffes"],
    image: "/animals/Zebra.png",
    rolePrior: p(0.22, 0.12, 0.14, 0.52),
  },
  {
    key: "monkey",
    label: "Monkey",
    emoji: "🐵",
    aliases: ["monkeys", "ape", "apes", "primate"],
    image: "/animals/Squirrel.png",
    rolePrior: p(0.26, 0.2, 0.28, 0.26),
  },
  {
    key: "panda",
    label: "Panda",
    emoji: "🐼",
    aliases: ["giant panda"],
    image: "/animals/Bear.png",
    rolePrior: p(0.2, 0.14, 0.16, 0.5),
  },
  {
    key: "koala",
    label: "Koala",
    emoji: "🐨",
    aliases: ["koalas"],
    image: "/animals/Capybara.png",
    rolePrior: p(0.18, 0.12, 0.12, 0.58),
  },
  {
    key: "pig",
    label: "Pig",
    emoji: "🐷",
    aliases: ["pigs", "piglet", "hog", "hogs"],
    image: "/animals/Sheep.png",
    rolePrior: p(0.2, 0.14, 0.2, 0.46),
  },
  {
    key: "cow",
    label: "Cow",
    emoji: "🐮",
    aliases: ["cows", "cattle", "bull", "calves", "calf"],
    image: "/animals/Deer.png",
    rolePrior: p(0.12, 0.14, 0.22, 0.52),
  },
  {
    key: "horse",
    label: "Horse",
    emoji: "🐴",
    aliases: ["horses", "pony", "ponies", "foal", "stallion", "mare"],
    image: "/animals/Deer.png",
    rolePrior: p(0.18, 0.16, 0.28, 0.38),
  },
  {
    key: "mouse",
    label: "Mouse",
    emoji: "🐭",
    aliases: ["mice", "rat", "rats"],
    image: "/animals/Rabbit3.png",
    rolePrior: p(0.32, 0.22, 0.14, 0.32),
  },
  {
    key: "frog",
    label: "Frog",
    emoji: "🐸",
    aliases: ["frogs", "toad", "toads"],
    image: "/animals/Chameleon.png",
    rolePrior: p(0.26, 0.24, 0.12, 0.38),
  },
  {
    key: "penguin",
    label: "Penguin",
    emoji: "🐧",
    aliases: ["penguins"],
    image: "/animals/Otter.png",
    rolePrior: p(0.2, 0.28, 0.16, 0.36),
  },
  {
    key: "bird",
    label: "Bird",
    emoji: "🐦",
    aliases: ["birds", "chick", "chicks", "avian"],
    image: "/animals/Squirrel.png",
    rolePrior: p(0.44, 0.14, 0.14, 0.28),
  },
  {
    key: "owl",
    label: "Owl",
    emoji: "🦉",
    aliases: ["owls"],
    image: "/animals/Cat.png",
    rolePrior: p(0.34, 0.2, 0.18, 0.28),
  },
  {
    key: "duck",
    label: "Duck",
    emoji: "🦆",
    aliases: ["ducks", "duckling", "gosling"],
    image: "/animals/Otter.png",
    rolePrior: p(0.28, 0.16, 0.14, 0.42),
  },
  {
    key: "seal",
    label: "Seal",
    emoji: "🦭",
    aliases: ["seals", "sea lion"],
    image: "/animals/Otter.png",
    rolePrior: p(0.16, 0.26, 0.14, 0.44),
  },
  {
    key: "gorilla",
    label: "Gorilla",
    emoji: "🦍",
    aliases: ["gorillas"],
    image: "/animals/Bear.png",
    rolePrior: p(0.1, 0.18, 0.46, 0.26),
  },
  {
    key: "raccoon",
    label: "Raccoon",
    emoji: "🦝",
    aliases: ["racoons", "raccoons"],
    image: "/animals/Fox3.png",
    rolePrior: p(0.2, 0.34, 0.22, 0.24),
  },
  {
    key: "turtle",
    label: "Turtle",
    emoji: "🐢",
    aliases: ["turtles", "tortoise", "tortoises"],
    image: "/animals/Chameleon.png",
    rolePrior: p(0.18, 0.28, 0.2, 0.34),
  },
  {
    key: "snake",
    label: "Snake",
    emoji: "🐍",
    aliases: ["snakes", "serpent"],
    image: "/animals/Chameleon.png",
    rolePrior: p(0.14, 0.36, 0.24, 0.26),
  },
  {
    key: "cheetah",
    label: "Cheetah",
    emoji: "🐆",
    aliases: ["cheetahs"],
    image: "/animals/Tiger.png",
    rolePrior: p(0.1, 0.2, 0.42, 0.28),
  },
  {
    key: "leopard",
    label: "Leopard",
    emoji: "🐆",
    aliases: ["leopards"],
    image: "/animals/Tiger.png",
    rolePrior: p(0.1, 0.18, 0.48, 0.24),
  },
  {
    key: "rhino",
    label: "Rhino",
    emoji: "🦏",
    aliases: ["rhinos", "rhinoceros"],
    image: "/animals/Elephant.png",
    rolePrior: p(0.08, 0.16, 0.38, 0.38),
  },
  {
    key: "hippo",
    label: "Hippo",
    emoji: "🦛",
    aliases: ["hippos", "hippopotamus"],
    image: "/animals/Elephant.png",
    rolePrior: p(0.1, 0.14, 0.32, 0.44),
  },
  {
    key: "bat",
    label: "Bat",
    emoji: "🦇",
    aliases: ["bats"],
    image: "/animals/Squirrel.png",
    rolePrior: p(0.22, 0.32, 0.18, 0.28),
  },
  {
    key: "bee",
    label: "Bee",
    emoji: "🐝",
    aliases: ["bees", "honeybee"],
    image: "/animals/Squirrel.png",
    rolePrior: p(0.24, 0.36, 0.14, 0.26),
  },
  {
    key: "flamingo",
    label: "Flamingo",
    emoji: "🦩",
    aliases: ["flamingos"],
    image: "/animals/Otter.png",
    rolePrior: p(0.42, 0.12, 0.12, 0.34),
  },
];

export const ZOO_CITY_ANIMAL_IDS = [
  ...ZOO_ANIMAL_DATA.map((a) => a.key),
] as const;

export type ZooCityAnimalKey = (typeof ZOO_CITY_ANIMAL_IDS)[number];

const byKey: Record<string, ZooAnimalEntry> = Object.fromEntries(
  ZOO_ANIMAL_DATA.map((a) => [a.key, a]),
);

/** label/alias (lowercase) → canonical key */
const resolveMap = new Map<string, string>();
for (const a of ZOO_ANIMAL_DATA) {
  resolveMap.set(a.key.toLowerCase(), a.key);
  resolveMap.set(a.label.toLowerCase(), a.key);
  for (const al of a.aliases) {
    resolveMap.set(al.trim().toLowerCase(), a.key);
  }
}

export function isZooCityAnimalKey(s: string): s is ZooCityAnimalKey {
  return s in byKey;
}

export function getZooAnimalEntry(key: string): ZooAnimalEntry | undefined {
  return byKey[key];
}

/**
 * Case-insensitive match with whitespace trim; supports aliases.
 */
export function resolveZooAnimalInput(raw: string): {
  key: ZooCityAnimalKey;
  label: string;
  emoji: string;
} | null {
  const t = raw.trim().replace(/\s+/g, " ").toLowerCase();
  if (!t) return null;
  const key = resolveMap.get(t);
  if (!key || !byKey[key]) return null;
  const e = byKey[key];
  return { key: e.key as ZooCityAnimalKey, label: e.label, emoji: e.emoji };
}

export const animalPriorFromDataset: Record<string, Record<JobId, number>> =
  Object.fromEntries(ZOO_ANIMAL_DATA.map((a) => [a.key, a.rolePrior]));
