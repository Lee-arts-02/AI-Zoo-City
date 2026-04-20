import { topAiJob } from "@/lib/step5Layout";
import type { RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";

/** Short, unobtrusive line after each placement choice. */
export function shortPlacementFeedback(
  assigned: RedesignRegionId,
  aiRecommendation: Record<JobId, number>,
): string {
  if (assigned === "freelancer") {
    return "You created a new possibility.";
  }
  const aiTop = topAiJob(aiRecommendation);
  if (assigned === aiTop) {
    return "You followed the system’s suggestion.";
  }
  return "You chose differently from the system.";
}
