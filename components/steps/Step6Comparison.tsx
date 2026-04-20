"use client";

import { DistrictCityBoard } from "@/components/step5/DistrictCityBoard";
import { Step6QuadrantOrganizer } from "@/components/step6/Step6QuadrantOrganizer";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import { useGameState } from "@/lib/gameState";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { RedesignRegionId } from "@/types/city";
import { useEffect, useMemo } from "react";

function ensurePlacements(
  raw: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) return raw;
  return buildInitialStep5Placements() as Record<string, RedesignRegionId>;
}

export function Step6Comparison() {
  const { state, dispatch } = useGameState();
  const placements = useMemo(
    () => ensurePlacements(state.progress.redesignPlacements),
    [state.progress.redesignPlacements],
  );

  useEffect(() => {
    if (!state.progress.comparisonSeen) {
      dispatch({ type: "MARK_PROGRESS", patch: { comparisonSeen: true } });
    }
  }, [dispatch, state.progress.comparisonSeen]);

  const continueToStep7 = () => {
    dispatch({ type: "MARK_PROGRESS", patch: { step7Phase: 0 } });
    dispatch({ type: "SET_STEP", step: 7 });
  };

  return (
    <section
      className="step6-page-enter flex min-h-0 w-full flex-1 flex-col gap-8 px-4 pb-8 opacity-0 sm:px-6 lg:gap-10 lg:px-10"
      aria-labelledby="step6-title"
    >
      <header className="shrink-0 space-y-2 text-center">
        <p className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/75">
          Chapter 6
        </p>
        <h2
          id="step6-title"
          className="font-serif text-3xl font-bold tracking-tight text-amber-950 sm:text-4xl"
        >
          Your New Zoo City
        </h2>
        <p className="mx-auto max-w-2xl font-serif text-base text-amber-900/85 sm:text-lg">
          The city has changed.
        </p>
      </header>

      <div className="mx-auto w-full max-w-3xl space-y-4 rounded-3xl border border-amber-200/50 bg-gradient-to-b from-amber-50/40 via-white/80 to-amber-50/30 p-4 ring-1 ring-amber-100/60 sm:p-5">
        <p className="text-center font-serif text-xs font-semibold uppercase tracking-wide text-amber-800/70">
          Your city snapshot
        </p>
        <DistrictCityBoard placements={placements} compact />
        <Step6QuadrantOrganizer placements={placements} />
      </div>

      <p className="mx-auto max-w-xl text-center font-serif text-sm leading-relaxed text-amber-900/80">
        This is the city you shaped — where animals live and how the story adds up. Next,
        we&apos;ll look at what the updated model might guess for <em>you</em>.
      </p>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={continueToStep7}
          className="min-h-[52px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-10 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.2)] transition hover:translate-y-px hover:bg-amber-300"
        >
          See what this means for me
        </button>
      </div>
    </section>
  );
}
