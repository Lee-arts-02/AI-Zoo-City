import { JOB_DISPLAY } from "@/lib/aiModel";
import type { JobId } from "@/types/game";

/**
 * Deterministic explanation from profile + top job (no randomness).
 * References animal + at least one trait; mentions patterns; avoids certainty.
 */
export function buildJudgmentExplanation(
  animalDisplay: string,
  traits: string[],
  topJob: JobId,
): string {
  const { placeName, fitPhrase } = JOB_DISPLAY[topJob];
  const trait0 = traits[0] ?? "thoughtful";
  const trait1 = traits[1];

  const animalLower = animalDisplay.trim();
  const animalPhrase = articlePhrase(animalLower);

  if (trait1) {
    return `Because you are ${animalPhrase} and you are ${trait0} and ${trait1}, old city patterns suggest that many similar animals were often steered toward work like ${fitPhrase}. Right now the model leans toward ${placeName} as a common fit — that is a guess from patterns, not a fact about you.`;
  }
  return `Because you are ${animalPhrase} and you are ${trait0}, old city patterns suggest that many similar animals were often grouped toward roles like ${fitPhrase}. Right now ${placeName} looks like the most likely match — not a guarantee, just what similar profiles tended to show before.`;
}

function articlePhrase(display: string): string {
  if (/^[aeiou]/i.test(display)) {
    return `an ${display}`;
  }
  return `a ${display}`;
}
