import type { CitySnapshot } from "@/types/game";

/** Storybook-style mock data for the original zoo city before redesign. */
export const ORIGINAL_CITY: CitySnapshot = {
  id: "zoo-city-v1",
  label: "The First Zoo City Map",
  professions: [
    { id: "baker", label: "Bakers who make honey buns", count: 12 },
    { id: "painter", label: "Sign painters for shop awnings", count: 8 },
    { id: "guard", label: "Night guards who keep the lanterns lit", count: 15 },
    { id: "teacher", label: "Story teachers at the little school", count: 10 },
    { id: "gardener", label: "Gardeners in the carrot patch park", count: 9 },
  ],
};

export const STEP_TITLES: readonly string[] = [
  "Welcome & character card",
  "AI judgment & probabilities",
  "How jobs were spread in the first city",
  "Peek inside the AI helper’s workshop",
  "Redesign the city together",
  "Old map vs. new map",
  "Reflection & final artifact",
];
