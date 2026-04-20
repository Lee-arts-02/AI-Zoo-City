/**
 * Shared types for AI Zoo City learner profile and game progress.
 */

import type { DistrictId } from "@/types/city";
import type { RedesignRegionId } from "@/types/city";
import type { ZooCityAnimalKey } from "@/data/zooAnimalDataset";

export type JobId = "artist" | "engineer" | "manager" | "community";

/** Retrained Step 6 prediction may surface Freelancer when the new city includes the hub. */
export type RetrainedPredictionId = JobId | "freelancer";

/** Canonical animal id from the built-in Zoo City dataset (see `data/zooAnimalDataset.ts`). */
export type PresetAnimal = ZooCityAnimalKey;

export type DreamJob = JobId;

export type LearnerProfile = {
  /** Learner's own name (optional); trimmed in UI, max length enforced in inputs. */
  name: string;
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
  /** PNG data URL from Step 1 drawing (optional); updated again in Step 7 if edited. */
  drawingDataUrl: string | null;
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
  /** Step 3: unique districts the learner opened (detail view); used for organizer reflection gate. */
  step3DistrictsVisited: DistrictId[];
  /** Step 3: learner clicked “View more from the current Zoo City” in the axis organizer. */
  step3OrganizerRevealActivated: boolean;
  aiExplained: boolean;
  redesignDraft: RedesignDraft | null;
  comparisonSeen: boolean;
  reflection: string | null;
  /** Step 5: intro transition (machine → maps → copy) has finished once. */
  step5IntroSeen: boolean;
  /** PNG data URL of original map (Step 3 baseline) for Step 6. */
  beforeCityImageDataUrl: string | null;
  /** PNG data URL of map after Step 5 assignments (optional visual). */
  afterCityImageDataUrl: string | null;
  /** Animal id → district after Step 5 hiring decisions. */
  redesignPlacements: Record<string, RedesignRegionId> | null;
  /** Step 5 locked after Save My New City. */
  redesignComplete: boolean;
  /** True while Step 5 save celebration plays; blocks Next until Step 6 is shown. */
  finishingStep5Celebration: boolean;
  /** Step 6: learner tapped to reveal retrained prediction (suspense gate). */
  step6PredictionRevealed: boolean;
  /** Step 7: 0 prediction reveal → 1 identity → 2 decision → 3 draw → 4 reflection → 5 artifacts. */
  step7Phase: 0 | 1 | 2 | 3 | 4 | 5;
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
