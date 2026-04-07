/**
 * Shared types for AI Zoo City learner profile and game progress.
 */

import type { RedesignRegionId } from "@/types/city";

export type JobId = "artist" | "engineer" | "manager" | "community";

export type PresetAnimal =
  | "rabbit"
  | "fox"
  | "bear"
  | "elephant"
  | "deer"
  | "owl"
  | "beaver"
  | "lion";

export type DreamJob = JobId;

export type LearnerProfile = {
  /** Preset animal from the grid; null if using custom animal text. */
  presetAnimal: PresetAnimal | null;
  /** Custom animal name when not using a preset (trimmed for display). */
  customAnimal: string;
  /** Up to 3 traits (known keys from the model, normalized lowercase). */
  traits: string[];
  dreamJob: DreamJob | null;
  /** Free-text dream role when not using a preset job; empty when using presets only. */
  customDreamJob: string;
  /** Full character sentence, kept in sync in the game reducer. */
  description: string;
};

export type CityProfession = {
  id: string;
  label: string;
  count: number;
};

export type CitySnapshot = {
  id: string;
  label: string;
  professions: CityProfession[];
};

export type RedesignDraft = {
  notes: string | null;
  adjustedProfessions: CityProfession[] | null;
};

/** Step 7 — linear career / identity flow (no branching). */
export type Step7CareerChoice = "follow_ai" | "own_path" | "new_path";

export type GameProgress = {
  judgmentSeen: boolean;
  originalCitySeen: boolean;
  aiExplained: boolean;
  redesignDraft: RedesignDraft | null;
  comparisonSeen: boolean;
  reflection: string | null;
  /** Step 5: intro transition (machine → maps → copy) has finished once. */
  step5IntroSeen: boolean;
  /** PNG data URL of original map (Step 3 baseline) for Step 6. */
  beforeCityImageDataUrl: string | null;
  /** PNG data URL of redesigned map with placements + Freelancer Hub. */
  afterCityImageDataUrl: string | null;
  /** Animal id → region after Step 5 redesign. */
  redesignPlacements: Record<string, RedesignRegionId> | null;
  /** Step 5 locked after finish / ≥5 placements + capture. */
  redesignComplete: boolean;
  /** How many drops onto Freelancer Hub (for first-time vs repeat copy). */
  freelancerHubDropCount: number;
  /** True while Step 5 save celebration plays; blocks Next until Step 6 is shown. */
  finishingStep5Celebration: boolean;
  /** Step 7 internal phase: 1 enter city → 2 decision → 3 draw → 4 reflection → 5 artifacts. */
  step7Phase: 1 | 2 | 3 | 4 | 5;
  step7CareerChoice: Step7CareerChoice | null;
  step7DrawingDataUrl: string | null;
  /** Final kept reflection sentence (after Keep). */
  step7ReflectionSentence: string | null;
};

export type GameState = {
  currentStep: number;
  learner: LearnerProfile;
  progress: GameProgress;
};

export type GameAction =
  | { type: "SET_STEP"; step: number }
  | { type: "SET_LEARNER"; learner: Partial<LearnerProfile> }
  | { type: "MARK_PROGRESS"; patch: Partial<GameProgress> }
  | { type: "RESET_GAME" };
