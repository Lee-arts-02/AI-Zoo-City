import { topAiJob } from "@/lib/step5Layout";
import type { DistrictId } from "@/types/city";
import type { JobId } from "@/types/game";

export type AssignmentFeedbackTone = "positive" | "mixed" | "concern" | "growth";

export type AssignmentFeedbackResult = {
  tone: AssignmentFeedbackTone;
  message: string;
};

function hashSeed(parts: string[]): number {
  let h = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(seed: number, arr: readonly T[]): T {
  return arr[seed % arr.length]!;
}

/** Nuanced first-person line after assign or skip — not a single “correct answer”. */
export function buildAssignmentFeedback(args: {
  animalId: string;
  assigned: DistrictId;
  originalDistrict: DistrictId;
  aiRecommendation: Record<JobId, number>;
  dreamJob: JobId;
  skipped: boolean;
}): AssignmentFeedbackResult {
  const seed = hashSeed([
    args.animalId,
    args.assigned,
    args.skipped ? "skip" : "go",
  ]);
  const aiTop = topAiJob(args.aiRecommendation);
  const pAssigned = args.aiRecommendation[args.assigned] / 100;
  const matchesAi = args.assigned === aiTop;
  const matchesDream = args.assigned === args.dreamJob;
  const matchesOriginal = args.assigned === args.originalDistrict;

  if (args.skipped) {
    const message = pick(seed, [
      "I’m staying where I started — familiar paths still feel like home.",
      "Keeping my original district feels steady. I know the rhythms here.",
      "Same neighborhood for now. I can always wonder about another gate later.",
    ] as const);
    return { tone: "mixed", message };
  }

  // Soft fit score: model support for this district + learner-aligned signals
  let score = pAssigned * 0.55;
  if (matchesDream) score += 0.22;
  if (matchesAi) score += 0.12;
  if (matchesOriginal) score += 0.08;
  // Occasional “generous” read — keeps non-obvious placements interesting
  if (seed % 7 === 0) score += 0.06;
  score = Math.min(1, score);

  if (score >= 0.62) {
    const message = pick(seed, [
      "I feel excited here. This really matches what I enjoy.",
      "I think I can do well here — it lines up with how I want to grow.",
      "This fits my story more than I expected. I’m curious to try it.",
    ] as const);
    return { tone: "positive", message };
  }

  if (score >= 0.38) {
    const message = pick(seed, [
      "This is different from what I expected, but trying something new feels interesting.",
      "I’m not sure yet, but I want to see what I can learn here.",
      "Part of me hesitates, and part of me wants to see what this neighborhood teaches.",
    ] as const);
    return { tone: "mixed", message };
  }

  if (score >= 0.22) {
    const message = pick(seed, [
      "This seems hard for me, but maybe I can grow into it.",
      "I may need more support to succeed here — and I’m willing to ask.",
      "I’m worried this may not match what I’m good at, but I’ll stay open.",
    ] as const);
    return { tone: "growth", message };
  }

  const message = pick(seed, [
    "I don’t feel very confident in this role yet — I’ll need patience and help.",
    "I’m worried this may not match what I’m good at.",
    "This feels like a stretch. I hope the city meets me halfway.",
  ] as const);
  return { tone: "concern", message };
}
