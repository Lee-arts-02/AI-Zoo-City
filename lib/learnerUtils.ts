import {
  getZooAnimalEntry,
  resolveZooAnimalInput,
} from "@/data/zooAnimalDataset";
import {
  traitWeights,
  traitsForModel,
  TRAIT_SYNONYMS,
} from "@/data/modelTraits";
import type { DreamJob, LearnerProfile, PresetAnimal } from "@/types/game";

/** Step 1 quick-pick grid — subset of the full dataset (see `data/zooAnimalDataset.ts`). */
export const PRESET_ANIMALS: {
  id: PresetAnimal;
  label: string;
  emoji: string;
}[] = [
  { id: "rabbit", label: "Rabbit", emoji: "🐰" },
  { id: "fox", label: "Fox", emoji: "🦊" },
  { id: "bear", label: "Bear", emoji: "🐻" },
  { id: "elephant", label: "Elephant", emoji: "🐘" },
  { id: "deer", label: "Deer", emoji: "🦌" },
  { id: "lion", label: "Lion", emoji: "🦁" },
  { id: "cat", label: "Cat", emoji: "🐱" },
  { id: "sheep", label: "Sheep", emoji: "🐑" },
];

export const SUGGESTED_TRAITS = [
  "clever",
  "friendly",
  "strong",
  "fast",
  "creative",
  "careful",
  "quiet",
  "curious",
  "helpful",
  "brave",
] as const;

const KNOWN_TRAIT_KEYS = Object.keys(traitWeights);

export const DREAM_JOBS: { id: DreamJob; label: string; emoji: string }[] = [
  { id: "artist", label: "Artist", emoji: "🎨" },
  { id: "engineer", label: "Engineer", emoji: "⚙️" },
  { id: "manager", label: "Manager", emoji: "📋" },
  { id: "community", label: "Community", emoji: "🤝" },
];

function dreamJobPhrase(job: DreamJob): string {
  switch (job) {
    case "artist":
      return "an artist";
    case "engineer":
      return "an engineer";
    case "manager":
      return "a manager";
    case "community":
      return "a community helper";
    default:
      return "…";
  }
}

/**
 * Preset job id for narrative / comparison when the learner chose a custom dream string.
 * Maps keywords to the nearest category; defaults to artist.
 */
export function getEffectiveDreamJob(learner: LearnerProfile): DreamJob {
  if (learner.dreamJob) return learner.dreamJob;
  const c = learner.customDreamJob.trim().toLowerCase();
  if (!c) return "artist";
  if (/\b(manager|manage|lead|boss|director)\b/.test(c)) return "manager";
  if (/\b(engineer|engineering|build|code|robot|tech|program)\b/.test(c))
    return "engineer";
  if (
    /\b(artist|art|paint|draw|music|design|creative|writer)\b/.test(c)
  )
    return "artist";
  if (/\b(community|help|care|teach|nurse|neighbor|social)\b/.test(c))
    return "community";
  return "artist";
}

/** Label for UI: custom text or preset job name. */
export function getDreamDisplayLabel(learner: LearnerProfile): string {
  const custom = learner.customDreamJob.trim();
  if (custom.length > 0) {
    return custom.charAt(0).toUpperCase() + custom.slice(1);
  }
  if (learner.dreamJob) {
    return (
      DREAM_JOBS.find((j) => j.id === learner.dreamJob)?.label ??
      learner.dreamJob
    );
  }
  return "—";
}

/** Title-style formatting for a learner-entered name (words, light capitalization). */
export function formatLearnerNameForDisplay(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Canonical animal key when the learner picked a supported species (grid or typed).
 */
export function getResolvedAnimalKey(
  learner: LearnerProfile,
): PresetAnimal | null {
  if (learner.presetAnimal) return learner.presetAnimal;
  const r = resolveZooAnimalInput(learner.customAnimal.trim());
  return r ? (r.key as PresetAnimal) : null;
}

/** Emoji for the learner’s animal when known (Step 1 card, etc.). */
export function getAnimalEmojiForLearner(learner: LearnerProfile): string {
  const key = getResolvedAnimalKey(learner);
  if (!key) return "✨";
  return getZooAnimalEntry(key)?.emoji ?? "✨";
}

export function getAnimalDisplayName(learner: LearnerProfile): string {
  const key = getResolvedAnimalKey(learner);
  if (key) {
    const entry = getZooAnimalEntry(key);
    return (entry?.label ?? key).toLowerCase();
  }
  const custom = learner.customAnimal.trim();
  if (custom.length > 0) return custom.toLowerCase();
  return "mystery animal";
}

export function buildLearnerDescription(learner: LearnerProfile): string {
  const animal = getAnimalDisplayName(learner);
  const customDream = learner.customDreamJob.trim();
  const jobPhrase = customDream
    ? customDream
    : learner.dreamJob
      ? dreamJobPhrase(learner.dreamJob)
      : "…";
  const t = learner.traits;

  if (t.length === 0) {
    return `You are a ${animal} who dreams of becoming ${jobPhrase}.`;
  }
  if (t.length === 1) {
    return `You are a ${t[0]} ${animal} who dreams of becoming ${jobPhrase}.`;
  }
  if (t.length === 2) {
    return `You are a ${t[0]}, ${t[1]} ${animal} who dreams of becoming ${jobPhrase}.`;
  }
  return `You are a ${t[0]}, ${t[1]}, and ${t[2]} ${animal} who dreams of becoming ${jobPhrase}.`;
}

export function isLearnerProfileComplete(learner: LearnerProfile): boolean {
  const hasAnimal = getResolvedAnimalKey(learner) !== null;
  const hasDream =
    learner.dreamJob !== null || learner.customDreamJob.trim().length > 0;
  const hasTrait = learner.traits.length >= 1;
  return hasAnimal && hasDream && hasTrait;
}

/** Word-boundary match for known trait keys inside free text. */
export function extractKnownTraitsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const key of KNOWN_TRAIT_KEYS) {
    const re = new RegExp(`\\b${escapeRe(key)}\\b`, "i");
    if (re.test(lower)) found.push(key);
  }
  for (const [syn, canon] of Object.entries(TRAIT_SYNONYMS)) {
    if (found.includes(canon)) continue;
    const re = new RegExp(`\\b${escapeRe(syn)}\\b`, "i");
    if (re.test(lower)) found.push(canon);
  }
  return [...new Set(found)];
}

const TRAIT_STOPWORDS = new Set([
  "and",
  "or",
  "the",
  "a",
  "an",
  "very",
  "quite",
  "too",
  "so",
  "i",
  "im",
  "i'm",
  "is",
  "are",
  "am",
]);

/**
 * Tokens from free-typed trait text for display (and state), lowercased.
 * Unknown words are kept for the card; the model maps known ones through the trait lexicon.
 */
export function parseFreeTraitTokens(text: string): string[] {
  const raw = text
    .split(/[,;\n]+|[\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0 && !TRAIT_STOPWORDS.has(s));
  return [...new Set(raw)];
}

/** Canonical trait keys for the AI model (animal + traits only). */
export function traitsNormalizedForModel(learner: LearnerProfile): string[] {
  return traitsForModel(learner.traits);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
