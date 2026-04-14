import type { JobId } from "@/types/game";
import { animalAssets } from "@/data/animalAssets";

export type Step5Animal = {
  id: string;
  name: string;
  avatar: string;
  traits: string[];
  dreamJob: JobId;
  aiRecommendation: Record<JobId, number>;
  voice: string;
};

const img = (id: keyof typeof animalAssets) => animalAssets[id].image;

/**
 * Full cast for Step 5 — one story per species; avatars match `animalAssets`.
 * `aiRecommendation` percentages sum to 100 (illustrative model-style output).
 */
export const STEP5_ANIMALS: Step5Animal[] = [
  {
    id: "rabbit",
    name: "Milo the Rabbit",
    avatar: img("rabbit"),
    traits: ["curious", "gentle"],
    dreamJob: "artist",
    aiRecommendation: { artist: 56, community: 18, engineer: 12, manager: 14 },
    voice: "I love when color meets a quiet corner.",
  },
  {
    id: "hedgehog",
    name: "Hazel the Hedgehog",
    avatar: img("hedgehog"),
    traits: ["careful", "creative"],
    dreamJob: "artist",
    aiRecommendation: { artist: 52, community: 20, engineer: 14, manager: 14 },
    voice: "Tiny details make the biggest stories.",
  },
  {
    id: "capybara",
    name: "Cruz the Capybara",
    avatar: img("capybara"),
    traits: ["calm", "friendly"],
    dreamJob: "community",
    aiRecommendation: { artist: 22, community: 44, engineer: 14, manager: 20 },
    voice: "Slow afternoons are my favorite studio light.",
  },
  {
    id: "squirrel",
    name: "Sora the Squirrel",
    avatar: img("squirrel"),
    traits: ["quick", "playful"],
    dreamJob: "artist",
    aiRecommendation: { artist: 48, community: 22, engineer: 16, manager: 14 },
    voice: "I stash ideas like acorns — always another season.",
  },
  {
    id: "fox",
    name: "Finn the Fox",
    avatar: img("fox"),
    traits: ["clever", "focused"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 16, community: 18, engineer: 50, manager: 16 },
    voice: "Shortcuts are fine if nobody gets hurt.",
  },
  {
    id: "chameleon",
    name: "Camille the Chameleon",
    avatar: img("chameleon"),
    traits: ["adaptable", "patient"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 14, community: 20, engineer: 48, manager: 18 },
    voice: "I blend in until the problem shows its true shape.",
  },
  {
    id: "cat",
    name: "Cleo the Cat",
    avatar: img("cat"),
    traits: ["independent", "precise"],
    dreamJob: "manager",
    aiRecommendation: { artist: 18, community: 16, engineer: 22, manager: 44 },
    voice: "I keep the schedule purring.",
  },
  {
    id: "otter",
    name: "Otto the Otter",
    avatar: img("otter"),
    traits: ["joyful", "cooperative"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 12, community: 26, engineer: 46, manager: 16 },
    voice: "We test bridges by sliding across them together.",
  },
  {
    id: "bear",
    name: "Bjorn the Bear",
    avatar: img("bear"),
    traits: ["strong", "steady"],
    dreamJob: "manager",
    aiRecommendation: { artist: 12, community: 22, engineer: 18, manager: 48 },
    voice: "Hugs and heavy lifting — I do both.",
  },
  {
    id: "lion",
    name: "Leo the Lion",
    avatar: img("lion"),
    traits: ["brave", "leading"],
    dreamJob: "manager",
    aiRecommendation: { artist: 10, community: 18, engineer: 14, manager: 58 },
    voice: "I roar so the shy ones get heard too.",
  },
  {
    id: "wolf",
    name: "Willa the Wolf",
    avatar: img("wolf"),
    traits: ["loyal", "strategic"],
    dreamJob: "manager",
    aiRecommendation: { artist: 14, community: 22, engineer: 20, manager: 44 },
    voice: "We go farther when we run together.",
  },
  {
    id: "tiger",
    name: "Tara the Tiger",
    avatar: img("tiger"),
    traits: ["bold", "focused"],
    dreamJob: "manager",
    aiRecommendation: { artist: 12, community: 20, engineer: 16, manager: 52 },
    voice: "Quiet paws, loud plans.",
  },
  {
    id: "deer",
    name: "Dara the Deer",
    avatar: img("deer"),
    traits: ["observant", "calm"],
    dreamJob: "community",
    aiRecommendation: { artist: 20, community: 46, engineer: 12, manager: 22 },
    voice: "I notice who needs a quiet friend.",
  },
  {
    id: "sheep",
    name: "Shea the Sheep",
    avatar: img("sheep"),
    traits: ["warm", "steady"],
    dreamJob: "community",
    aiRecommendation: { artist: 24, community: 44, engineer: 10, manager: 22 },
    voice: "Soft wool, strong fences.",
  },
  {
    id: "elephant",
    name: "Ellie the Elephant",
    avatar: img("elephant"),
    traits: ["kind", "patient"],
    dreamJob: "community",
    aiRecommendation: { artist: 14, community: 54, engineer: 12, manager: 20 },
    voice: "Big hearts make room for everyone.",
  },
  {
    id: "zebra",
    name: "Zee the Zebra",
    avatar: img("zebra"),
    traits: ["balanced", "social"],
    dreamJob: "community",
    aiRecommendation: { artist: 22, community: 42, engineer: 14, manager: 22 },
    voice: "Stripes are just paths that decided to stay friends.",
  },
];

export const STEP5_ANIMALS_BY_ID: Record<string, Step5Animal> = Object.fromEntries(
  STEP5_ANIMALS.map((a) => [a.id, a]),
);
