"use client";

import type { AssignmentFeedbackResult } from "@/lib/assignmentFeedback";

export type AssignmentFeedbackProps = {
  shortName: string;
  feedback: AssignmentFeedbackResult;
};

/** Styled note bubble after an assign/skip decision. */
export function AssignmentFeedback({ shortName, feedback }: AssignmentFeedbackProps) {
  const toneClass =
    feedback.tone === "positive"
      ? "border-emerald-300/80 bg-emerald-50/95 text-emerald-950"
      : feedback.tone === "mixed"
        ? "border-indigo-300/80 bg-indigo-50/95 text-indigo-950"
        : feedback.tone === "growth"
          ? "border-amber-300/80 bg-amber-50/95 text-amber-950"
          : "border-rose-300/80 bg-rose-50/95 text-rose-950";

  return (
    <div className={`rounded-2xl border-2 px-3 py-2 font-serif text-sm leading-relaxed ${toneClass}`}>
      <span className="font-semibold">Note from {shortName}: </span>
      {feedback.message}
    </div>
  );
}
