"use client";

import OverviewMap from "@/components/city/OverviewMap";
import type { DistrictId } from "@/types/city";

export type Step3CityOverviewProps = {
  onSelectDistrict: (id: DistrictId) => void;
  onOpenSortingMachine: () => void;
  machineReady: boolean;
};

export default function Step3CityOverview({
  onSelectDistrict,
  onOpenSortingMachine,
  machineReady,
}: Step3CityOverviewProps) {
  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      <div className="shrink-0 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Step 3 of 7</p>
        <p className="mt-2 text-base leading-relaxed text-stone-800 sm:text-lg">
          This is how Zoo City currently works. Choose a district to explore.
        </p>
      </div>

      <div className="min-h-0 w-full flex-1">
        <OverviewMap onSelectDistrict={onSelectDistrict} />
      </div>

      <div className="shrink-0 rounded-2xl border-2 border-amber-200/80 bg-amber-50/90 px-4 py-5 text-center shadow-sm sm:px-6">
        <p className="font-serif text-base leading-relaxed text-amber-950 sm:text-lg">
          You have now seen the city results. Want to look inside the AI machine?
        </p>
        <button
          type="button"
          onClick={onOpenSortingMachine}
          className="mt-4 min-h-[48px] rounded-2xl border-2 border-violet-700 bg-violet-500 px-6 py-3 font-serif text-lg font-semibold text-white shadow-[4px_4px_0_0_rgba(91,33,182,0.35)] transition enabled:hover:translate-y-px enabled:hover:bg-violet-400"
        >
          {machineReady ? "Return to City Sorting Machine" : "Open City Sorting Machine"}
        </button>
      </div>
    </div>
  );
}
