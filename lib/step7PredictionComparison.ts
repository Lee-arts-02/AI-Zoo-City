import { STEP5_ANIMALS } from "@/data/step5Animals";
import { computeJudgment, type JudgmentInput } from "@/lib/aiModel";
import {
  buildCombinedCityEvidence,
  type CityEvidenceInput,
} from "@/lib/retrainedCityEvidence";
import { computeFreelancerShare, computeRetrainedJudgment } from "@/lib/retrainedJudgment";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import { buildPredictionExplanation } from "@/lib/step6Interpretation";
import {
  getDreamDisplayLabel,
  getEffectiveDreamJob,
  isLearnerProfileComplete,
} from "@/lib/learnerUtils";
import type { GameState } from "@/types/game";
import type { RedesignRegionId } from "@/types/city";
import type { JobId, RetrainedPredictionId } from "@/types/game";

function ensurePlacements(
  raw: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) return raw;
  return buildInitialStep5Placements() as Record<string, RedesignRegionId>;
}

export type PredictionComparisonPayload =
  | {
      predictionReady: true;
      dreamLabel: string;
      dreamJobId: JobId;
      originalTop: JobId;
      currentTop: RetrainedPredictionId;
      explanation: string;
    }
  | { predictionReady: false };

export function buildPredictionComparisonPayload(state: GameState): PredictionComparisonPayload {
  const learner = state.learner;
  if (!isLearnerProfileComplete(learner)) {
    return { predictionReady: false };
  }

  const placements = ensurePlacements(state.progress.redesignPlacements);
  const freelancerShare = computeFreelancerShare(placements);
  const dreamJobId = getEffectiveDreamJob(learner);

  const judgmentInput: JudgmentInput = {
    presetAnimal: learner.presetAnimal,
    customAnimalTrimmed: learner.customAnimal.trim(),
    traits: learner.traits,
  };
  const cityInput: CityEvidenceInput = {
    ...judgmentInput,
    dreamJob: dreamJobId,
  };
  const cityEvidence = buildCombinedCityEvidence(placements, cityInput);
  const beforeJ = computeJudgment(judgmentInput);
  const pack = computeRetrainedJudgment(
    cityInput,
    placements,
    cityEvidence,
    freelancerShare,
  );
  const explanation = buildPredictionExplanation(
    dreamJobId,
    beforeJ.topJob,
    pack.topJob,
    cityEvidence,
    freelancerShare,
  );

  return {
    predictionReady: true,
    dreamLabel: getDreamDisplayLabel(learner),
    dreamJobId,
    originalTop: beforeJ.topJob,
    currentTop: pack.topJob,
    explanation,
  };
}
