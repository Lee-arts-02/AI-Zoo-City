import { computeJudgment, type JudgmentInput, type JudgmentResult } from "@/lib/aiModel";
import type { CityEvidenceInput } from "@/lib/retrainedCityEvidence";
import { freelancerHubLearningSignal } from "@/lib/retrainedCityEvidence";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import type { JobId, RetrainedPredictionId } from "@/types/game";
import type { RedesignRegionId } from "@/types/city";

const JOB_IDS: JobId[] = ["artist", "engineer", "manager", "community"];

export function computeFreelancerShare(
  placements: Record<string, RedesignRegionId>,
): number {
  let c = 0;
  for (const a of STEP5_ANIMALS) {
    if (placements[a.id] === "freelancer") c++;
  }
  return STEP5_ANIMALS.length > 0 ? c / STEP5_ANIMALS.length : 0;
}

export type RetrainedJudgmentPack = {
  base: JudgmentResult;
  blendedFour: Record<JobId, number>;
  topJob: RetrainedPredictionId;
  probabilitiesFive: Record<RetrainedPredictionId, number>;
};

/**
 * Retrained prediction: blends Step-4-style profile judgment with **combined city evidence**
 * (traits + identity + dream resonance + soft district stories + pattern shift), not raw
 * district headcounts. See `buildCombinedCityEvidence`.
 */
export function computeRetrainedJudgment(
  input: CityEvidenceInput,
  placements: Record<string, RedesignRegionId>,
  cityEvidence: Record<JobId, number>,
  freelancerShare: number,
  blend = 0.34,
): RetrainedJudgmentPack {
  const base = computeJudgment(input as JudgmentInput);
  const hubLearn = freelancerHubLearningSignal(placements, input);

  const blendedFour: Record<JobId, number> = {
    artist: 0,
    engineer: 0,
    manager: 0,
    community: 0,
  };
  for (const j of JOB_IDS) {
    blendedFour[j] =
      (1 - blend) * base.probabilities[j] + blend * (cityEvidence[j] ?? 0);
  }

  // Freelancer path: hub presence + how much hub stories align with learner traits (expansion).
  const freelancerMass =
    blend * (freelancerShare * 3.8 + hubLearn * 0.45) +
    (1 - blend) * 0.012 * freelancerShare;

  let sumFour = 0;
  for (const j of JOB_IDS) sumFour += blendedFour[j]!;
  const total = sumFour + freelancerMass;

  const probabilitiesFive: Record<RetrainedPredictionId, number> = {
    artist: blendedFour.artist / total,
    engineer: blendedFour.engineer / total,
    manager: blendedFour.manager / total,
    community: blendedFour.community / total,
    freelancer: freelancerMass / total,
  };

  let topJob: RetrainedPredictionId = "artist";
  let best = -1;
  for (const j of JOB_IDS) {
    if (probabilitiesFive[j]! > best) {
      best = probabilitiesFive[j]!;
      topJob = j;
    }
  }
  if (probabilitiesFive.freelancer > best) {
    topJob = "freelancer";
  }

  return { base, blendedFour, topJob, probabilitiesFive };
}
