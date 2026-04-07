"use client";

import { STEP_TITLES } from "@/data/mockCity";
import { TOTAL_STEPS } from "@/lib/gameState";

type StepProgressProps = {
  currentStep: number;
};

export function StepProgress({ currentStep }: StepProgressProps) {
  const safeStep = Math.min(TOTAL_STEPS, Math.max(1, currentStep));
  const pct = ((safeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="w-full" aria-label="Story progress">
      <div className="mb-2 flex items-center justify-between gap-2 font-serif text-sm text-amber-950/80">
        <span>
          Step {safeStep} of {TOTAL_STEPS}
        </span>
        <span className="hidden text-right sm:block">
          {STEP_TITLES[safeStep - 1]}
        </span>
      </div>
      <div
        className="h-4 w-full overflow-hidden rounded-full border-2 border-amber-900/20 bg-amber-100/80"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={safeStep}
        aria-valuetext={`Step ${safeStep} of ${TOTAL_STEPS}: ${STEP_TITLES[safeStep - 1]}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-3 flex justify-between gap-1">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1;
          const done = n < safeStep;
          const active = n === safeStep;
          return (
            <div
              key={n}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={STEP_TITLES[i]}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-serif text-sm font-bold transition-colors",
                  done
                    ? "border-amber-600 bg-amber-400 text-amber-950"
                    : active
                      ? "border-orange-500 bg-white text-orange-700 ring-2 ring-orange-300"
                      : "border-amber-200 bg-amber-50/80 text-amber-800/50",
                ].join(" ")}
              >
                {n}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
