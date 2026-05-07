import { JOB_DISPLAY } from "@/lib/aiModel";
import type { JobId } from "@/types/game";

/**
 * Deterministic explanation from profile + top job (no randomness).
 * References profile features and labeled examples; avoids certainty.
 */
export function buildJudgmentExplanation(
  animalDisplay: string,
  _traits: string[],
  topJob: JobId,
): string {
  const { placeName } = JOB_DISPLAY[topJob];

  const animalLower = animalDisplay.trim();
  const animalPhrase = articlePhrase(animalLower);

  return `Because your profile says ${animalPhrase}, the machine checked only size and diet, then matched those features with old animal cards. The output is ${placeName} — a classification from past labels, not a fact about you.`;
}

function articlePhrase(display: string): string {
  if (/^[aeiou]/i.test(display)) {
    return `an ${display}`;
  }
  return `a ${display}`;
}
