"use client";

import DistrictDashboard from "@/components/city/DistrictDashboard";
import DistrictScene from "@/components/city/DistrictScene";
import { getDistrictConfig } from "@/data/districtConfig";
import type { DistrictId } from "@/types/city";
import type { ReactNode } from "react";

const PANEL_CLASS = "w-[min(22rem,calc(100vw-3rem))] max-w-[min(22rem,92vw)]";

export type Step3DistrictDetailProps = {
  districtId: DistrictId;
  dashboardOpen: boolean;
  onDashboardOpenChange: (open: boolean) => void;
  onBack: () => void;
  /** @deprecated Robot guide replaces footer hints */
  showSortingMachineHint?: boolean;
  /** Interactive layer on the district illustration (sorting space toggle + organizer). */
  sceneOverlay?: ReactNode;
};

export default function Step3DistrictDetail({
  districtId,
  dashboardOpen,
  onDashboardOpenChange,
  onBack,
  sceneOverlay,
}: Step3DistrictDetailProps) {
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
    <section className="flex min-h-0 w-full flex-1 flex-col gap-3 sm:gap-4">
      <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
        >
          ← Back
        </button>
        <p className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-400">Step 3 of 7</p>
      </div>

      <div className="min-h-0 w-full flex-1">
        <DistrictScene districtId={districtId} aside={drawer} overlay={sceneOverlay} />
      </div>
    </section>
  );
}
