"use client";

import { JOB_DISPLAY } from "@/lib/aiModel";
import { DREAM_DISTRICT_LABELS } from "@/lib/learnerUtils";
import type { JobId, RetrainedPredictionId } from "@/types/game";
import {
  placeForRetrainedPrediction,
  titleForRetrainedPrediction,
} from "@/lib/predictionDisplay";

export type PredictionComparisonProps = {
  dreamLabel: string;
  dreamDistrictId: JobId;
  originalTop: JobId;
  currentTop: RetrainedPredictionId;
  explanation: string;
};

export function PredictionComparison({
  dreamLabel,
  dreamDistrictId,
  originalTop,
  currentTop,
  explanation,
}: PredictionComparisonProps) {
  const shifted = originalTop !== currentTop;
  return (
    <div className="w-full space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-4 shadow-sm ring-1 ring-stone-900/5">
          <p className="font-serif text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Dream job
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-stone-900">{dreamLabel}</p>
          <p className="mt-1 font-serif text-xs text-stone-600">
            From Step 1
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white/95 px-4 py-4 shadow-sm ring-1 ring-stone-900/5">
          <p className="font-serif text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Dream district
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-stone-900">
            {DREAM_DISTRICT_LABELS[dreamDistrictId]}
          </p>
          <p className="mt-1 font-serif text-xs text-stone-600">
            Used for comparison
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-stone-50/95 px-4 py-4 shadow-sm ring-1 ring-stone-900/5">
          <p className="font-serif text-[11px] font-semibold uppercase tracking-wide text-stone-500">
            Original Classification
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-stone-900">
            {JOB_DISPLAY[originalTop].title}
          </p>
          <p className="mt-1 font-serif text-xs text-stone-600">
            Before your redesign — {JOB_DISPLAY[originalTop].placeName}
          </p>
        </div>
        <div
          className={`rounded-2xl border px-4 py-4 shadow-sm ring-1 ${
            shifted
              ? "border-amber-300/80 bg-amber-50/90 ring-amber-200/50"
              : "border-stone-200/90 bg-white/95 ring-stone-900/5"
          }`}
        >
          <p className="font-serif text-[11px] font-semibold uppercase tracking-wide text-amber-900/80">
            Current Classification
          </p>
          <p className="mt-2 font-serif text-xl font-bold text-amber-950">
            {titleForRetrainedPrediction(currentTop)}
          </p>
          <p className="mt-1 font-serif text-xs text-amber-950/80">
            After the city changed — {placeForRetrainedPrediction(currentTop)}
          </p>
        </div>
      </div>
      <div className="rounded-2xl border border-amber-200/70 bg-white/90 px-5 py-4 shadow-inner ring-1 ring-amber-900/5">
        <p className="font-serif text-sm leading-relaxed text-amber-950/95">{explanation}</p>
      </div>
    </div>
  );
}
