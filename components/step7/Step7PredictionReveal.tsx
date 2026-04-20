"use client";

import { PredictionComparison } from "@/components/comparison/PredictionComparison";
import { buildPredictionComparisonPayload } from "@/lib/step7PredictionComparison";
import { useGameState } from "@/lib/gameState";
import { useMemo } from "react";

export function Step7PredictionReveal({ onContinue }: { onContinue: () => void }) {
  const { state } = useGameState();
  const payload = useMemo(() => buildPredictionComparisonPayload(state), [state]);

  return (
    <div className="w-full max-w-4xl space-y-8">
      <header className="space-y-2 text-center">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-amber-950 sm:text-4xl">
          Your Character, Predicted Again
        </h2>
        <p className="mx-auto max-w-2xl font-serif text-base text-amber-900/85 sm:text-lg">
          After the city changed, the model changed too.
        </p>
      </header>

      {payload.predictionReady ? (
        <PredictionComparison
          dreamLabel={payload.dreamLabel}
          dreamJobId={payload.dreamJobId}
          originalTop={payload.originalTop}
          currentTop={payload.currentTop}
          explanation={payload.explanation}
        />
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-5 py-5 font-serif text-amber-950 shadow-sm">
          <p className="text-sm leading-relaxed">
            Finish your character in Step 1 to see dream job and predictions side by side. Your new
            city still changed what the model might guess — you&apos;ll explore that more in the
            next screens.
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onContinue}
          className="min-h-[52px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-10 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.2)] transition hover:translate-y-px hover:bg-amber-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
