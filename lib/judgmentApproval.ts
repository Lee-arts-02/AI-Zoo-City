import type { JudgmentResult } from "@/lib/aiModel";
import type { JobId } from "@/types/game";

/**
 * Minimum softmax probability (0–1) for the top job so the “APPROVED” state
 * counts as confident. Same inputs → same decision (deterministic).
 */
export const APPROVAL_MIN_TOP_PROBABILITY = 0.28;

export type ApprovalDetailKind = "aligned" | "different_role" | "uncertain";

/**
 * True when the learner’s effective dream job matches the model’s top job
 * and that top probability meets the confidence floor.
 */
export function isDreamRoleApproved(
  judgment: JudgmentResult,
  dreamJobId: JobId,
): boolean {
  return (
    judgment.topJob === dreamJobId &&
    judgment.probabilities[judgment.topJob] >= APPROVAL_MIN_TOP_PROBABILITY
  );
}

export function getApprovalDetailKind(
  judgment: JudgmentResult,
  dreamJobId: JobId,
): ApprovalDetailKind {
  if (judgment.topJob !== dreamJobId) return "different_role";
  if (judgment.probabilities[judgment.topJob] < APPROVAL_MIN_TOP_PROBABILITY) {
    return "uncertain";
  }
  return "aligned";
}
