import type { JobId, LearnerProfile } from "@/types/game";
import { normalizeTraitForModel } from "@/data/modelTraits";
import {
  getAnimalDisplayName,
  getResolvedAnimalKey,
} from "@/lib/learnerUtils";
import { animalPrior, customAnimalPrior } from "@/lib/aiModel";

export type Step4TokenKind = "animal" | "trait";

export type Step4Token = {
  id: string;
  label: string;
  kind: Step4TokenKind;
  /** Model lookup: canonical animal key or trait key */
  modelKey: string;
};

/**
 * Machine key tokens: one animal + one token per learner-selected trait (Step 1 allows up to 3).
 */
export function buildStep4Tokens(learner: LearnerProfile): Step4Token[] {
  const animalName = getAnimalDisplayName(learner);
  const key = getResolvedAnimalKey(learner);
  const modelAnimal =
    key && animalPrior[key] ? key : "custom";

  const out: Step4Token[] = [
    {
      id: "tok-animal",
      label: animalName,
      kind: "animal",
      modelKey: modelAnimal,
    },
  ];

  const traits = learner.traits.slice(0, 3);
  for (let i = 0; i < traits.length; i++) {
    const t = traits[i];
    const modelKey = normalizeTraitForModel(t) ?? t.trim().toLowerCase();
    out.push({
      id: `tok-trait-${i}-${t}`,
      label: t,
      kind: "trait",
      modelKey,
    });
  }

  return out;
}

export function animalModelKeyForLearner(learner: LearnerProfile): string {
  const k = getResolvedAnimalKey(learner);
  if (k && animalPrior[k]) return k;
  return "custom";
}

export function getAnimalPriorRecord(modelKey: string): Record<JobId, number> {
  if (modelKey === "custom" || !animalPrior[modelKey]) {
    return { ...customAnimalPrior };
  }
  return { ...animalPrior[modelKey] };
}
