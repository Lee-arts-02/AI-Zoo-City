import { JOB_DISPLAY } from "@/lib/aiModel";
import { topJobFromEvidence } from "@/lib/retrainedCityEvidence";
import type { JobId, RetrainedPredictionId } from "@/types/game";

/**
 * Narrative for Step 7 — emphasizes combined clues / patterns, not district vote counts.
 */
export function buildPredictionExplanation(
  dreamJob: JobId,
  oldTop: JobId,
  newTop: RetrainedPredictionId,
  cityEvidence: Record<JobId, number>,
  freelancerShare: number,
): string {
  const dreamLabel = JOB_DISPLAY[dreamJob].title;
  const leadEvidence = topJobFromEvidence(cityEvidence);
  const hubPct = Math.round(freelancerShare * 100);

  if (newTop === "freelancer") {
    return (
      `Your dream path centers on ${dreamLabel}. The original model learned mostly from older city patterns, so it first suggested ${JOB_DISPLAY[oldTop].title}. ` +
      `After your redesign, the retrained model reads combined clues — traits, dreams, and how stories cluster — not just “who is most common where.” ` +
      (hubPct > 0
        ? `Because Freelancer Hub is now part of the city’s teachable patterns, the system can recommend a path that did not exist in the old four-district world. `
        : "") +
      `That openness is why Freelancer can appear — a new possible ending in the possibility space you reshaped.`
    );
  }

  if (oldTop === newTop) {
    return (
      `You chose ${dreamLabel} as your dream. The first pass still leaned toward ${JOB_DISPLAY[oldTop].title} from your profile clues. ` +
      `The retrained model now sees stronger links between your traits and ${JOB_DISPLAY[leadEvidence].title} in the city you built — ` +
      `patterns of who lives where, how dreams line up, and how much the layout shifted from the old map. ` +
      `It still lands on ${JOB_DISPLAY[newTop].title}, but the *reason* is new: your dataset rewired the combined possibilities, not a single rule.`
    );
  }

  return (
    `You said you imagine ${dreamLabel}. At first the system guessed ${JOB_DISPLAY[oldTop].title} — the older city’s default emphasis. ` +
    `Your redesign taught it different relationships: which traits travel with which district stories, and how your dream sits next to those threads. ` +
    `The retrained model now finds more examples that connect you to ${JOB_DISPLAY[newTop].title} — especially through evidence leaning toward ${JOB_DISPLAY[leadEvidence].placeName}-style stories in your new map` +
    (hubPct > 0
      ? `, with Freelancer Hub adding another branch the old system could barely see`
      : "") +
    `. That is combined possibility reasoning, not a popularity contest between districts.`
  );
}
