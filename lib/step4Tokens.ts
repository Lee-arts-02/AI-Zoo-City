import type { LearnerProfile } from "@/types/game";
import { getLearnerDiet, getLearnerSize } from "@/lib/profileFeatures";

export type Step4TokenKind = "diet" | "size";

export type Step4Token = {
  id: string;
  label: string;
  kind: Step4TokenKind;
  /** Model lookup: canonical size or diet value. */
  modelKey: string;
};

/**
 * Machine features for the simplified classifier: diet and size only.
 */
export function buildStep4Tokens(learner: LearnerProfile): Step4Token[] {
  const out: Step4Token[] = [];

  const diet = getLearnerDiet(learner);
  if (diet) {
    out.push({
      id: "tok-diet",
      label: diet,
      kind: "diet",
      modelKey: diet,
    });
  }

  const size = getLearnerSize(learner);
  if (size) {
    out.push({
      id: "tok-size",
      label: size,
      kind: "size",
      modelKey: size,
    });
  }

  return out;
}

