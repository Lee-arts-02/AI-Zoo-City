import {
  getZooAnimalEntry,
  resolveZooAnimalInput,
} from "@/data/zooAnimalDataset";
import {
  traitWeights,
  traitsForModel,
  TRAIT_SYNONYMS,
} from "@/data/modelTraits";
import type { DreamJob, JobId, LearnerProfile, PresetAnimal } from "@/types/game";

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

export type DreamJobOption = {
  key: string;
  label: string;
  aliases?: string[];
  district: JobId;
  emoji?: string;
  description?: string;
};

export const REPRESENTATIVE_DREAM_JOBS: DreamJobOption[] = [
  {
    key: "Artist",
    label: "Artist",
    district: "artist",
    emoji: "🎨",
    description: "create, perform, design",
  },
  {
    key: "Engineer",
    label: "Engineer",
    district: "engineer",
    emoji: "⚙️",
    description: "build, invent, solve",
  },
  {
    key: "Supporter",
    label: "Supporter",
    district: "community",
    emoji: "🤝",
    description: "help, teach, care",
  },
  {
    key: "Manager",
    label: "Manager",
    district: "manager",
    emoji: "📋",
    description: "lead, organize, plan",
  },
];

export const INTERNAL_DREAM_JOB_DATABASE: DreamJobOption[] = [
  { key: "Artist", label: "Artist", district: "artist" },
  { key: "Painter", label: "Painter", district: "artist" },
  { key: "Musician", label: "Musician", district: "artist" },
  { key: "Dancer", label: "Dancer", district: "artist" },
  {
    key: "Filmmaker",
    label: "Filmmaker",
    aliases: ["Film Maker", "Movie Maker", "Movie Director"],
    district: "artist",
  },
  { key: "Designer", label: "Designer", district: "artist" },
  { key: "Writer", label: "Writer", district: "artist" },
  { key: "Actor", label: "Actor", district: "artist" },
  { key: "Animator", label: "Animator", district: "artist" },
  { key: "Illustrator", label: "Illustrator", district: "artist" },
  { key: "Photographer", label: "Photographer", district: "artist" },
  { key: "Singer", label: "Singer", district: "artist" },
  { key: "Composer", label: "Composer", district: "artist" },
  { key: "Fashion Designer", label: "Fashion Designer", district: "artist" },
  { key: "Game Artist", label: "Game Artist", district: "artist" },
  { key: "Engineer", label: "Engineer", district: "engineer" },
  { key: "Builder", label: "Builder", district: "engineer" },
  { key: "Robot Engineer", label: "Robot Engineer", district: "engineer" },
  { key: "Inventor", label: "Inventor", district: "engineer" },
  { key: "Bridge Designer", label: "Bridge Designer", district: "engineer" },
  {
    key: "Game Developer",
    label: "Game Developer",
    aliases: ["Video Game Developer"],
    district: "engineer",
  },
  { key: "Programmer", label: "Programmer", district: "engineer" },
  { key: "Software Developer", label: "Software Developer", district: "engineer" },
  { key: "Architect", label: "Architect", district: "engineer" },
  { key: "Mechanic", label: "Mechanic", district: "engineer" },
  { key: "Scientist", label: "Scientist", district: "engineer" },
  { key: "Data Scientist", label: "Data Scientist", district: "engineer" },
  { key: "AI Engineer", label: "AI Engineer", aliases: ["A I Engineer"], district: "engineer" },
  { key: "Electrician", label: "Electrician", district: "engineer" },
  { key: "Machine Designer", label: "Machine Designer", district: "engineer" },
  { key: "Supporter", label: "Supporter", district: "community" },
  { key: "Teacher", label: "Teacher", district: "community" },
  { key: "Doctor", label: "Doctor", district: "community" },
  { key: "Nurse", label: "Nurse", district: "community" },
  { key: "Caregiver", label: "Caregiver", district: "community" },
  { key: "Counselor", label: "Counselor", district: "community" },
  { key: "Firefighter", label: "Firefighter", district: "community" },
  { key: "Social Worker", label: "Social Worker", district: "community" },
  { key: "Therapist", label: "Therapist", district: "community" },
  { key: "Community Helper", label: "Community Helper", district: "community" },
  { key: "Veterinarian", label: "Veterinarian", aliases: ["Vet"], district: "community" },
  { key: "Librarian", label: "Librarian", district: "community" },
  { key: "Coach", label: "Coach", district: "community" },
  { key: "Helper", label: "Helper", district: "community" },
  { key: "Volunteer", label: "Volunteer", district: "community" },
  { key: "Manager", label: "Manager", district: "manager" },
  { key: "Team Leader", label: "Team Leader", district: "manager" },
  { key: "City Planner", label: "City Planner", district: "manager" },
  { key: "Shop Owner", label: "Shop Owner", district: "manager" },
  { key: "Event Organizer", label: "Event Organizer", district: "manager" },
  { key: "Project Manager", label: "Project Manager", district: "manager" },
  { key: "Principal", label: "Principal", district: "manager" },
  { key: "Mayor", label: "Mayor", district: "manager" },
  { key: "Director", label: "Director", district: "manager" },
  { key: "Producer", label: "Producer", district: "manager" },
  { key: "Entrepreneur", label: "Entrepreneur", district: "manager" },
  { key: "Business Owner", label: "Business Owner", district: "manager" },
  { key: "Coordinator", label: "Coordinator", district: "manager" },
  { key: "Organizer", label: "Organizer", district: "manager" },
  { key: "Supervisor", label: "Supervisor", district: "manager" },
];

export const DREAM_JOBS: DreamJobOption[] = INTERNAL_DREAM_JOB_DATABASE;

const LEGACY_DREAM_DISTRICTS: Record<string, JobId> = {
  artist: "artist",
  engineer: "engineer",
  manager: "manager",
  community: "community",
};

export const DREAM_DISTRICT_LABELS: Record<JobId, string> = {
  artist: "Artist District",
  engineer: "Engineer Quarter",
  community: "Community Support",
  manager: "Manager Center",
};

export const DREAM_PATH_LABELS: Record<JobId, string> = {
  artist: "Artist",
  engineer: "Engineer",
  community: "Supporter",
  manager: "Manager",
};

export function isRepresentativeDreamJobLabel(label: string | null | undefined): boolean {
  if (!label) return false;
  return REPRESENTATIVE_DREAM_JOBS.some((j) => j.label === label);
}

export function normalizeDreamJobInput(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getDreamJobOption(key: string | null | undefined): DreamJobOption | null {
  if (!key) return null;
  const normalized = normalizeDreamJobInput(key);
  return (
    DREAM_JOBS.find((j) => {
      if (normalizeDreamJobInput(j.key) === normalized) return true;
      if (normalizeDreamJobInput(j.label) === normalized) return true;
      return (j.aliases ?? []).some((alias) => normalizeDreamJobInput(alias) === normalized);
    }) ?? null
  );
}

export function matchDreamJobInput(input: string): DreamJobOption | null {
  return getDreamJobOption(input);
}

export function getDreamDistrictForJob(key: string | null | undefined): JobId | null {
  const option = getDreamJobOption(key);
  if (option) return option.district;
  if (key && LEGACY_DREAM_DISTRICTS[key]) return LEGACY_DREAM_DISTRICTS[key];
  return null;
}

function dreamJobPhrase(job: DreamJob): string {
  const lower = job.toLowerCase();
  const article = /^[aeiou]/.test(lower) ? "an" : "a";
  return `${article} ${lower}`;
}

/**
 * Preset job id for narrative / comparison when the learner chose a custom dream string.
 * Maps keywords to the nearest category; defaults to artist.
 */
export function getEffectiveDreamJob(learner: LearnerProfile): JobId {
  if (learner.dreamDistrict) return learner.dreamDistrict;
  const presetDistrict = getDreamDistrictForJob(learner.dreamJob);
  if (presetDistrict) return presetDistrict;
  const c = (learner.customDreamJob.trim() || learner.dreamJob?.trim() || "").toLowerCase();
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
    return getDreamJobOption(learner.dreamJob)?.label ?? learner.dreamJob;
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
  return `You are a ${animal} with a dream of becoming ${jobPhrase}.`;
}

export function isLearnerProfileComplete(learner: LearnerProfile): boolean {
  const hasAnimal = getResolvedAnimalKey(learner) !== null;
  const hasProfileFeatures = learner.diet !== null && learner.size !== null;
  const hasDream =
    (learner.dreamJob !== null && learner.dreamDistrict !== null) ||
    learner.customDreamJob.trim().length > 0;
  return hasAnimal && hasProfileFeatures && hasDream;
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
 * Feature words from free-typed trait text for display (and state), lowercased.
 * Unknown words are kept for the card; the model maps known ones through the trait lexicon.
 */
export function parseFreeTraitTokens(text: string): string[] {
  const raw = text
    .split(/[,;\n]+|[\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0 && !TRAIT_STOPWORDS.has(s));
  return [...new Set(raw)];
}

/** Canonical trait keys for the AI classifier. */
export function traitsNormalizedForModel(learner: LearnerProfile): string[] {
  return traitsForModel(learner.traits);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
