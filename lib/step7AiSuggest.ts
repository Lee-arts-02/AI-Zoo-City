import { distributionFromActiveTokens, JOB_IDS } from "@/lib/step4Model";
import { buildStep4Tokens } from "@/lib/step4Tokens";
import type { JobId, LearnerProfile } from "@/types/game";

/** Top AI job suggestion from the same fused model as Step 4. */
export function getAiSuggestedJob(learner: LearnerProfile): JobId {
  const tokens = buildStep4Tokens(learner);
  const dist = distributionFromActiveTokens(tokens);
  let best: JobId = "manager";
  let bestP = -1;
  for (const j of JOB_IDS) {
    if (dist[j] > bestP) {
      bestP = dist[j];
      best = j;
    }
  }
  return best;
}
