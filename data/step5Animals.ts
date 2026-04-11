import type { JobId } from "@/types/game";

export type Step5Animal = {
  id: string;
  name: string;
  avatar: string;
  traits: string[];
  dreamJob: JobId;
  aiRecommendation: Record<JobId, number>;
  voice: string;
};

/**
 * Full cast for Step 5 — aligns with public animal art in `animalAssets`.
 * Percentages are illustrative pattern outputs, not ground truth.
 */
export const STEP5_ANIMALS: Step5Animal[] = [
  {
    id: "rabbit",
    name: "Milo the Rabbit",
    avatar: "/animals/rabbit.png",
    traits: ["curious", "gentle"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 52, community: 20, engineer: 8, manager: 20 },
    voice: "I love building tiny bridge machines.",
  },
  {
    id: "deer",
    name: "Dara the Deer",
    avatar: "/animals/deer1.png",
    traits: ["observant", "calm"],
    dreamJob: "community",
    aiRecommendation: { artist: 18, community: 48, engineer: 12, manager: 22 },
    voice: "I notice who needs a quiet friend.",
  },
  {
    id: "peacock",
    name: "Pablo the Peacock",
    avatar: "/animals/peacock1.png",
    traits: ["bold", "expressive"],
    dreamJob: "artist",
    aiRecommendation: { artist: 61, community: 15, engineer: 8, manager: 16 },
    voice: "Color tells my story before words do.",
  },
  {
    id: "cat",
    name: "Cleo the Cat",
    avatar: "/animals/cat1.png",
    traits: ["independent", "precise"],
    dreamJob: "manager",
    aiRecommendation: { artist: 22, community: 14, engineer: 18, manager: 46 },
    voice: "I keep the schedule purring.",
  },
  {
    id: "fox",
    name: "Finn the Fox",
    avatar: "/animals/fox.png",
    traits: ["quick", "clever"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 20, community: 18, engineer: 44, manager: 18 },
    voice: "Shortcuts are fine if nobody gets hurt.",
  },
  {
    id: "beaver",
    name: "Bridget the Beaver",
    avatar: "/animals/beaver1.png",
    traits: ["patient", "builder"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 12, community: 24, engineer: 52, manager: 12 },
    voice: "One log at a time — that is how rivers change.",
  },
  {
    id: "owl",
    name: "Orin the Owl",
    avatar: "/animals/owl1.png",
    traits: ["thoughtful", "wise"],
    dreamJob: "community",
    aiRecommendation: { artist: 25, community: 38, engineer: 17, manager: 20 },
    voice: "I listen until the real question appears.",
  },
  {
    id: "raccoon",
    name: "Riley the Raccoon",
    avatar: "/animals/raccoon1.png",
    traits: ["resourceful", "playful"],
    dreamJob: "artist",
    aiRecommendation: { artist: 42, community: 28, engineer: 14, manager: 16 },
    voice: "Found objects are my favorite medium.",
  },
  {
    id: "elephant",
    name: "Ellie the Elephant",
    avatar: "/animals/elephant1.png",
    traits: ["steady", "kind"],
    dreamJob: "community",
    aiRecommendation: { artist: 14, community: 55, engineer: 11, manager: 20 },
    voice: "Big hearts make room for everyone.",
  },
  {
    id: "dog",
    name: "Danny the Dog",
    avatar: "/animals/dog1.png",
    traits: ["loyal", "energetic"],
    dreamJob: "community",
    aiRecommendation: { artist: 19, community: 49, engineer: 10, manager: 22 },
    voice: "Teams feel like family to me.",
  },
  {
    id: "lion",
    name: "Leo the Lion",
    avatar: "/animals/lion1.png",
    traits: ["brave", "leading"],
    dreamJob: "manager",
    aiRecommendation: { artist: 10, community: 20, engineer: 14, manager: 56 },
    voice: "I roar so the shy ones get heard too.",
  },
  {
    id: "bear",
    name: "Bjorn the Bear",
    avatar: "/animals/bear1.png",
    traits: ["strong", "gentle"],
    dreamJob: "community",
    aiRecommendation: { artist: 16, community: 44, engineer: 18, manager: 22 },
    voice: "Hugs and heavy lifting — I do both.",
  },
  {
    id: "wolf",
    name: "Willa the Wolf",
    avatar: "/animals/wolf1.png",
    traits: ["loyal", "strategic"],
    dreamJob: "manager",
    aiRecommendation: { artist: 15, community: 22, engineer: 20, manager: 43 },
    voice: "We go farther when we run together.",
  },
  {
    id: "eagle",
    name: "Ezra the Eagle",
    avatar: "/animals/eagle1.png",
    traits: ["focused", "visionary"],
    dreamJob: "manager",
    aiRecommendation: { artist: 18, community: 16, engineer: 22, manager: 44 },
    voice: "From up here I see the whole plan.",
  },
  {
    id: "sheep",
    name: "Shea the Sheep",
    avatar: "/animals/sheep1.png",
    traits: ["warm", "steady"],
    dreamJob: "community",
    aiRecommendation: { artist: 28, community: 41, engineer: 9, manager: 22 },
    voice: "Soft wool, strong fences.",
  },
  {
    id: "turtle",
    name: "Tessa the Turtle",
    avatar: "/animals/turtle1.png",
    traits: ["patient", "careful"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 14, community: 26, engineer: 48, manager: 12 },
    voice: "Slow steps still cross the finish line.",
  },
];

export const STEP5_ANIMALS_BY_ID: Record<string, Step5Animal> = Object.fromEntries(
  STEP5_ANIMALS.map((a) => [a.id, a]),
);
