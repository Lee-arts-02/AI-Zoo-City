"use client";

import DistrictDashboard from "@/components/city/DistrictDashboard";
import DistrictScene from "@/components/city/DistrictScene";
import { getDistrictConfig } from "@/data/districtConfig";
import type { DistrictId } from "@/types/city";

const PANEL_CLASS = "w-[min(22rem,calc(100vw-3rem))] max-w-[min(22rem,92vw)]";

export type Step3DistrictDetailProps = {
  districtId: DistrictId;
  dashboardOpen: boolean;
  onDashboardOpenChange: (open: boolean) => void;
  onBack: () => void;
  /** When true, remind learners to return to the map to open the machine (Step 4 gate). */
  showSortingMachineHint?: boolean;
};

export default function Step3DistrictDetail({
  districtId,
  dashboardOpen,
  onDashboardOpenChange,
  onBack,
  showSortingMachineHint = false,
}: Step3DistrictDetailProps) {
  const district = getDistrictConfig(districtId);

  const drawer = (
    <>
      <button
        type="button"
        onClick={() => onDashboardOpenChange(!dashboardOpen)}
        className="flex h-full w-10 shrink-0 flex-col items-center justify-center rounded-l-xl rounded-r-none border border-white/40 bg-stone-900/85 px-1 text-white shadow-md backdrop-blur-md transition hover:bg-stone-800/90"
        aria-expanded={dashboardOpen}
        aria-controls="district-dashboard-scroll"
      >
        <span
          className="text-[0.65rem] font-semibold uppercase tracking-widest"
          style={{ writingMode: "vertical-rl" }}
          aria-hidden
        >
          {dashboardOpen ? "Hide" : "Info"}
        </span>
        <span className="sr-only">
          {dashboardOpen ? "Hide district dashboard" : "Show district dashboard"}
        </span>
      </button>

      <div
        className={`${PANEL_CLASS} h-full shrink-0 overflow-hidden ${dashboardOpen ? "" : "pointer-events-none"}`}
      >
        <div
          id="district-dashboard-panel"
          aria-hidden={!dashboardOpen}
          className={`h-full transition-transform duration-300 ease-out ${
            dashboardOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <DistrictDashboard districtId={districtId} />
        </div>
      </div>
    </>
  );

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-4 sm:gap-5">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
        >
          ← Back to city overview
        </button>
        <p className="text-sm uppercase tracking-[0.2em] text-stone-500">Step 3 of 7</p>
      </div>

      <div className="min-h-0 w-full flex-1">
        <DistrictScene districtId={districtId} aside={drawer} />
      </div>

      <div className="shrink-0 space-y-2 text-center text-sm text-stone-600">
        <p>
          Walking through{" "}
          <span className="font-semibold text-stone-800">{district.title}</span> — a few residents
          in view; open <span className="font-medium">Info</span> for full city-wide percentages.
        </p>
        {showSortingMachineHint ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-950 ring-1 ring-amber-200/80">
            To open the sorting machine, go back to the city overview — that is where the story
            continues.
          </p>
        ) : null}
      </div>
    </section>
  );
}
