import { JOB_DISPLAY } from "@/lib/aiModel";
import type { RetrainedPredictionId } from "@/types/game";

export function titleForRetrainedPrediction(id: RetrainedPredictionId): string {
  if (id === "freelancer") return "Freelancer";
  return JOB_DISPLAY[id].title;
}

export function placeForRetrainedPrediction(id: RetrainedPredictionId): string {
  if (id === "freelancer") return "Freelancer Hub";
  return JOB_DISPLAY[id].placeName;
}
