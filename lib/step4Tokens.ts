import type { DreamJob, JobId, LearnerProfile } from "@/types/game";
import {
  getAnimalDisplayName,
  getDreamDisplayLabel,
  getEffectiveDreamJob,
} from "@/lib/learnerUtils";
import { animalPrior, customAnimalPrior } from "@/lib/aiModel";

export type Step4TokenKind = "animal" | "trait" | "dream";

export type Step4Token = {
  id: string;
  label: string;
  kind: Step4TokenKind;
  /** Model lookup: preset id, trait key, or job id for dream */
  modelKey: string;
};

const DREAM_LABEL: Record<DreamJob, string> = {
  artist: "artist",
  engineer: "engineer",
  manager: "manager",
  community: "community",
};

/**
 * Key tokens for the simplified machine: animal, up to two traits, dream role.
 * Matches the pedagogy (e.g. fox | clever | artist) while staying data-driven.
 */
export function buildStep4Tokens(learner: LearnerProfile): Step4Token[] {
  const animalName = getAnimalDisplayName(learner);
  const preset = learner.presetAnimal;
  const isCustom =
    learner.customAnimal.trim().length > 0 && learner.presetAnimal === null;
  const modelAnimal =
    !isCustom && preset && animalPrior[preset] ? preset : "custom";

  const out: Step4Token[] = [
    {
      id: "tok-animal",
      label: animalName,
      kind: "animal",
      modelKey: modelAnimal,
    },
  ];

  const traits = learner.traits.slice(0, 2);
  for (let i = 0; i < traits.length; i++) {
    const t = traits[i];
    out.push({
      id: `tok-trait-${i}-${t}`,
      label: t,
      kind: "trait",
      modelKey: t,
    });
  }

  const hasPresetDream = learner.dreamJob !== null;
  const hasCustomDream = learner.customDreamJob.trim().length > 0;
  if (hasPresetDream || hasCustomDream) {
    const modelKey = getEffectiveDreamJob(learner);
    const label = hasCustomDream
      ? getDreamDisplayLabel(learner).toLowerCase()
      : DREAM_LABEL[learner.dreamJob!];
    out.push({
      id: "tok-dream",
      label,
      kind: "dream",
      modelKey,
    });
  }

  return out;
}

export function animalModelKeyForLearner(learner: LearnerProfile): string {
  const isCustom =
    learner.customAnimal.trim().length > 0 && learner.presetAnimal === null;
  const preset = learner.presetAnimal;
  if (!isCustom && preset && animalPrior[preset]) return preset;
  return "custom";
}

export function getAnimalPriorRecord(modelKey: string): Record<JobId, number> {
  if (modelKey === "custom" || !animalPrior[modelKey]) {
    return { ...customAnimalPrior };
  }
  return { ...animalPrior[modelKey] };
}
