import type { JobId } from "@/types/game";
import { animalAssets } from "@/data/animalAssets";
import type { AnimalDiet, AnimalSize } from "@/types/game";

export type Step5Animal = {
  id: string;
  name: string;
  animalType?: string;
  avatar: string;
  diet?: AnimalDiet;
  size?: AnimalSize;
  traits: string[];
  originalLabel?: JobId;
  currentLabel?: JobId | "freelancer";
  dreamJob: JobId;
  aiRecommendation: Record<JobId, number>;
  personalVoice?: string;
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
    voice: "What if my curiosity leads me from the canvas to the code? I’m ready to find out. 🐇🌌",
  },
  {
    id: "hedgehog",
    name: "Hazel the Hedgehog",
    avatar: img("hedgehog"),
    traits: ["careful", "creative"],
    dreamJob: "artist",
    aiRecommendation: { artist: 52, community: 20, engineer: 14, manager: 14 },
    voice: "The most meaningful patterns are often hidden in the smallest, quietest places. 🦔🔍",
  },
  {
    id: "capybara",
    name: "Cruz the Capybara",
    avatar: img("capybara"),
    traits: ["calm", "friendly"],
    dreamJob: "community",
    aiRecommendation: { artist: 22, community: 44, engineer: 14, manager: 20 },
    voice: "There’s a natural rhythm to everything; I’m just here to find the flow. 🍊🌊",
  },
  {
    id: "squirrel",
    name: "Sora the Squirrel",
    avatar: img("squirrel"),
    traits: ["quick", "playful"],
    dreamJob: "artist",
    aiRecommendation: { artist: 48, community: 22, engineer: 16, manager: 14 },
    voice: "My energy is a resource; I’m ready to spend it on any big, impossible challenge. 🐿️⚡",
  },
  {
    id: "fox",
    name: "Finn the Fox",
    avatar: img("fox"),
    traits: ["clever", "focused"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 16, community: 18, engineer: 50, manager: 16 },
    voice: "The shortest path isn’t always a straight line; it’s the one that makes sense. 🦊🌀",
  },
  {
    id: "chameleon",
    name: "Camille the Chameleon",
    avatar: img("chameleon"),
    traits: ["adaptable", "patient"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 14, community: 20, engineer: 48, manager: 18 },
    voice: "I’m a professional shapeshifter, ready to master whatever the new world demands. 🦎🔮",
  },
  {
    id: "cat",
    name: "Cleo the Cat",
    avatar: img("cat"),
    traits: ["independent", "precise"],
    dreamJob: "manager",
    aiRecommendation: { artist: 18, community: 16, engineer: 22, manager: 44 },
    voice: "Everything has its right place; I just happen to notice when it isn’t there. 🐈📐",
  },
  {
    id: "otter",
    name: "Otto the Otter",
    avatar: img("otter"),
    traits: ["joyful", "cooperative"],
    dreamJob: "engineer",
    aiRecommendation: { artist: 12, community: 26, engineer: 46, manager: 16 },
    voice: "Difficult things become playful when you have the right hands to hold onto. 🦦🎡",
  },
  {
    id: "bear",
    name: "Bjorn the Bear",
    avatar: img("bear"),
    traits: ["strong", "steady"],
    dreamJob: "manager",
    aiRecommendation: { artist: 12, community: 22, engineer: 18, manager: 48 },
    voice: "I’m the quiet ground that stays still so everyone else can reach higher. 🐻🏔️",
  },
  {
    id: "lion",
    name: "Leo the Lion",
    avatar: img("lion"),
    traits: ["brave", "leading"],
    dreamJob: "manager",
    aiRecommendation: { artist: 10, community: 18, engineer: 14, manager: 58 },
    voice: "Sometimes the bravest thing you can do is make sure the quietest voice is heard. 🦁📣",
  },
  {
    id: "wolf",
    name: "Willa the Wolf",
    avatar: img("wolf"),
    traits: ["loyal", "strategic"],
    dreamJob: "manager",
    aiRecommendation: { artist: 14, community: 22, engineer: 20, manager: 44 },
    voice: "We see much further when we all look toward the same horizon together. 🐺🌙",
  },
  {
    id: "tiger",
    name: "Tara the Tiger",
    avatar: img("tiger"),
    traits: ["bold", "focused"],
    dreamJob: "manager",
    aiRecommendation: { artist: 12, community: 20, engineer: 16, manager: 52 },
    voice: "If I can see it clearly in my mind, I can make it happen in the world. 🐯💎",
  },
  {
    id: "deer",
    name: "Dara the Deer",
    avatar: img("deer"),
    traits: ["observant", "calm"],
    dreamJob: "community",
    aiRecommendation: { artist: 20, community: 46, engineer: 12, manager: 22 },
    voice: "I listen for the things that aren’t being said. That’s where the truth is. 🦌🍃",
  },
  {
    id: "sheep",
    name: "Shea the Sheep",
    avatar: img("sheep"),
    traits: ["warm", "steady"],
    dreamJob: "community",
    aiRecommendation: { artist: 24, community: 44, engineer: 10, manager: 22 },
    voice: "A warm heart and a steady hand can lead a revolution in any industry. 🐑🌤️",
  },
  {
    id: "elephant",
    name: "Ellie the Elephant",
    avatar: img("elephant"),
    traits: ["kind", "patient"],
    dreamJob: "community",
    aiRecommendation: { artist: 14, community: 54, engineer: 12, manager: 20 },
    voice: "Real change takes time, and I have all the patience the world needs. 🐘⏳",
  },
  {
    id: "zebra",
    name: "Zee the Zebra",
    avatar: img("zebra"),
    traits: ["balanced", "social"],
    dreamJob: "community",
    aiRecommendation: { artist: 22, community: 42, engineer: 14, manager: 22 },
    voice: "I love the space where different worlds meet—it’s where the music starts. 🦓🎶",
  },
];

export const STEP5_ANIMALS_BY_ID: Record<string, Step5Animal> = Object.fromEntries(
  STEP5_ANIMALS.map((a) => [a.id, a]),
);
