"use client";

import { AssignmentFeedback } from "@/components/redesign/AssignmentFeedback";
import { JOB_DISPLAY } from "@/lib/aiModel";
import type { Step5Animal } from "@/data/step5Animals";
import type { AssignmentFeedbackResult } from "@/lib/assignmentFeedback";
import { topAiJob } from "@/lib/step5Layout";
import type { DistrictId } from "@/types/city";
import type { JobId } from "@/types/game";

const BTN: Record<
  DistrictId,
  string
> = {
  artist:
    "border-rose-300 bg-rose-50 text-rose-950 hover:bg-rose-100 disabled:opacity-40",
  engineer:
    "border-sky-300 bg-sky-50 text-sky-950 hover:bg-sky-100 disabled:opacity-40",
  manager:
    "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100 disabled:opacity-40",
  community:
    "border-emerald-300 bg-emerald-50 text-emerald-950 hover:bg-emerald-100 disabled:opacity-40",
};

const DISTRICT_ORDER: DistrictId[] = ["artist", "engineer", "manager", "community"];

export type AnimalCandidateCardProps = {
  animal: Step5Animal;
  originalDistrictLabel: string;
  processed: boolean;
  wasSkipped?: boolean;
  feedback: AssignmentFeedbackResult | null;
  disabled: boolean;
  onAssign: (district: DistrictId) => void;
  onSkip: () => void;
};

export function AnimalCandidateCard({
  animal,
  originalDistrictLabel,
  processed,
  wasSkipped,
  feedback,
  disabled,
  onAssign,
  onSkip,
}: AnimalCandidateCardProps) {
  const aiTop = topAiJob(animal.aiRecommendation);
  const aiPct = animal.aiRecommendation[aiTop];

  return (
    <article
      className={`rounded-2xl border-2 border-rose-200/80 bg-white/95 p-4 shadow-sm transition ${
        processed ? "ring-1 ring-amber-200/60" : ""
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex shrink-0 justify-center sm:w-36">
          {/* eslint-disable-next-line @next/next/no-img-element -- transparent PNG */}
          <img
            src={animal.avatar}
            alt=""
            className="max-h-40 w-auto max-w-[200px] object-contain object-center drop-shadow-sm"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-rose-950">{animal.name}</h3>
            <p className="mt-1 font-serif text-sm text-rose-900/85">
              <span className="font-semibold text-rose-900">Original district:</span>{" "}
              {originalDistrictLabel}
            </p>
            <p className="mt-1 font-serif text-sm text-rose-900/90">
              <span className="font-semibold">AI recommendation:</span>{" "}
              {JOB_DISPLAY[aiTop].title} ({aiPct}%)
            </p>
          </div>

          <blockquote className="rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2 font-serif text-sm italic leading-relaxed text-rose-950/95">
            “{animal.voice}”
          </blockquote>

          {processed && wasSkipped ? (
            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 font-serif text-sm text-stone-800">
              Kept in original district — no move this round.
            </p>
          ) : null}

          {processed && feedback ? (
            <AssignmentFeedback shortName={animal.name.split(" ")[0] ?? animal.name} feedback={feedback} />
          ) : null}

          {!processed ? (
            <div className="flex flex-col gap-2">
              <p className="font-serif text-xs font-semibold uppercase tracking-wide text-rose-800/75">
                Assign to a district
              </p>
              <div className="flex flex-wrap gap-2">
                {DISTRICT_ORDER.map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => onAssign(d)}
                    className={`min-h-[44px] rounded-xl border-2 px-3 py-2 font-serif text-sm font-semibold shadow-sm transition ${BTN[d]}`}
                  >
                    Assign to {JOB_DISPLAY[d as JobId].title}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={onSkip}
                  className="min-h-[44px] rounded-xl border-2 border-stone-300 bg-stone-100 px-3 py-2 font-serif text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-200 disabled:opacity-40"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
