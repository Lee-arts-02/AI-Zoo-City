import { JOB_DISPLAY } from "@/lib/aiModel";
import { topJobFromEvidence } from "@/lib/retrainedCityEvidence";
import type { JobId, RetrainedPredictionId } from "@/types/game";

/**
 * Narrative for Step 7 — emphasizes features, labels, and combined evidence, not district vote counts.
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
      `Your dream path centers on ${dreamLabel}. The original classifier learned from older labeled examples, so it first classified your profile as ${JOB_DISPLAY[oldTop].title}. ` +
      `After your redesign, the classifier reads profile features with updated labels — not just “who is most common where.” ` +
      (hubPct > 0
        ? `Because Freelancer Hub is now a class label, the system can classify a path that did not exist in the old four-label world. `
        : "") +
      `That openness is why Freelancer can appear — a new ending in the label set you reshaped.`
    );
  }

  if (oldTop === newTop) {
    return (
      `You chose ${dreamLabel} as your dream. The first pass still leaned toward ${JOB_DISPLAY[oldTop].title} from your profile features. ` +
      `The updated classifier now sees stronger links between your features and ${JOB_DISPLAY[leadEvidence].title} in the labels you built. ` +
      `It still lands on ${JOB_DISPLAY[newTop].title}, but the reason is new: your labeled examples rewired the combined evidence, not a single rule.`
    );
  }

  return (
    `You said you imagine ${dreamLabel}. At first the classifier output ${JOB_DISPLAY[oldTop].title} from older labels. ` +
    `Your redesign taught it different relationships: which features travel with which district labels. ` +
    `The updated classifier now finds more examples that connect your profile to ${JOB_DISPLAY[newTop].title} — especially through evidence leaning toward ${JOB_DISPLAY[leadEvidence].placeName}-style labels in your new map` +
    (hubPct > 0
      ? `, with Freelancer Hub adding another class label the old system could barely see`
      : "") +
    `. That is feature-based classification, not a popularity contest between districts.`
  );
}
