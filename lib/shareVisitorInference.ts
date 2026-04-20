import {
  buildCombinedCityEvidence,
  type CityEvidenceInput,
} from "@/lib/retrainedCityEvidence";
import { computeFreelancerShare, computeRetrainedJudgment } from "@/lib/retrainedJudgment";
import type { JudgmentInput } from "@/lib/aiModel";
import type { ShareSnapshotV1 } from "@/lib/shareSnapshot";
import type { LearnerProfile } from "@/types/game";
import { getEffectiveDreamJob } from "@/lib/learnerUtils";
import { placeForRetrainedPrediction, titleForRetrainedPrediction } from "@/lib/predictionDisplay";
import type { RetrainedPredictionId } from "@/types/game";

/** Minimum top probability for an “Approved” outcome (front-end presentation). */
const APPROVE_MIN_TOP = 0.24;
/** Minimum gap between 1st and 2nd place — avoids calling a tie “strong.” */
const APPROVE_MIN_MARGIN = 0.048;

const SHORT_LABEL: Record<RetrainedPredictionId, string> = {
  artist: "Artist",
  community: "Community",
  engineer: "Engineer",
  manager: "Manager",
  freelancer: "Freelancer",
};

export type VisitorProbabilityRow = {
  id: RetrainedPredictionId;
  label: string;
  pct: number;
  fraction: number;
};

export type VisitorInferenceResult = {
  top: RetrainedPredictionId;
  title: string;
  placeName: string;
  /** True when the top probability is strong enough vs. the rest (binary presentation layer). */
  approved: boolean;
  /** Large subtitle under Approved / Rejected: district name or “No strong match”. */
  outcomeLabel: string;
  /** Single readable sentence for the primary card. */
  summaryLine: string;
  /** Sorted by probability (highest first) for the expanded panel. */
  probabilities: VisitorProbabilityRow[];
  /** Short lines for the expanded section (not long prose). */
  framingLines: string[];
  /** Top probability mass (for UI copy). */
  topProbability: number;
  /** Gap between first and second place. */
  probabilityMargin: number;
};

function computeApprovalFromProbabilities(
  probs: Record<RetrainedPredictionId, number>,
): { approved: boolean; top: RetrainedPredictionId; topP: number; secondP: number; margin: number } {
  const entries = (Object.entries(probs) as [RetrainedPredictionId, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const top = entries[0]![0];
  const topP = entries[0]![1];
  const secondP = entries[1]?.[1] ?? 0;
  const margin = topP - secondP;
  const approved = topP >= APPROVE_MIN_TOP && margin >= APPROVE_MIN_MARGIN;
  return { approved, top, topP, secondP, margin };
}

function buildProbabilityRows(
  probs: Record<RetrainedPredictionId, number>,
): VisitorProbabilityRow[] {
  const rows: VisitorProbabilityRow[] = (Object.keys(probs) as RetrainedPredictionId[]).map((id) => ({
    id,
    label: SHORT_LABEL[id],
    fraction: probs[id] ?? 0,
    pct: Math.round((probs[id] ?? 0) * 100),
  }));
  rows.sort((a, b) => b.fraction - a.fraction);
  return rows;
}

/**
 * Run the same lightweight “retrained” blend as the main game, using the creator’s placements.
 * Approve / reject is a presentation layer on top of the existing probability vector.
 */
export function inferVisitorWithSharedModel(
  snapshot: ShareSnapshotV1,
  visitor: Pick<
    LearnerProfile,
    "presetAnimal" | "customAnimal" | "traits" | "dreamJob" | "customDreamJob"
  >,
): VisitorInferenceResult {
  const placements = snapshot.placements;
  const freelancerShare = computeFreelancerShare(placements);

  const learner: LearnerProfile = {
    name: "",
    presetAnimal: visitor.presetAnimal,
    customAnimal: visitor.customAnimal,
    traits: visitor.traits,
    dreamJob: visitor.dreamJob,
    customDreamJob: visitor.customDreamJob,
    description: "",
    drawingDataUrl: null,
  };
  const dreamJob = getEffectiveDreamJob(learner);

  const judgmentInput: JudgmentInput = {
    presetAnimal: visitor.presetAnimal,
    customAnimalTrimmed: visitor.customAnimal.trim(),
    traits: visitor.traits,
  };
  const cityInput: CityEvidenceInput = { ...judgmentInput, dreamJob };

  const cityEvidence = buildCombinedCityEvidence(placements, cityInput);
  const pack = computeRetrainedJudgment(
    cityInput,
    placements,
    cityEvidence,
    freelancerShare,
  );
  const probs = pack.probabilitiesFive;

  const { approved, top, topP, margin } = computeApprovalFromProbabilities(probs);
  const title = titleForRetrainedPrediction(top);
  const placeName = placeForRetrainedPrediction(top);

  let outcomeLabel: string;
  let summaryLine: string;

  if (approved) {
    outcomeLabel = placeName;
    if (top === "freelancer") {
      summaryLine =
        "This Zoo City would place you in a path beyond the original four districts.";
    } else {
      summaryLine = `This Zoo City would place you in ${title}.`;
    }
  } else {
    outcomeLabel = "No strong match";
    summaryLine = "This Zoo City would not place you in one clear district.";
  }

  const framingLines = [
    "This result follows the current Zoo City model probabilities.",
    "The model compares your clues with what this city has learned.",
    "These probabilities come from the city’s learned patterns.",
  ];

  return {
    top,
    title,
    placeName,
    approved,
    outcomeLabel,
    summaryLine,
    probabilities: buildProbabilityRows(probs),
    framingLines,
    topProbability: topP,
    probabilityMargin: margin,
  };
}
