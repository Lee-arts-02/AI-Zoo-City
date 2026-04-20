"use client";

import OverviewMap from "@/components/city/OverviewMap";
import { SoftGateTooltip } from "@/components/shared/SoftGateTooltip";
import { useSoftGateFeedback } from "@/components/shared/useSoftGateFeedback";
import type { DistrictId } from "@/types/city";

export type Step3CityOverviewProps = {
  onSelectDistrict: (id: DistrictId) => void;
  onOpenSortingMachine: () => void;
  machineReady: boolean;
  /** True when the sorting-space + reveal gate is satisfied (before or after robot bridge). */
  organizerSortingReady: boolean;
  /** Physical sorting done + robot guidance visible — Open Box / flow unlocked (unless machineReady). */
  primaryActionsUnlocked: boolean;
  /** After post-reveal return: narrative bridge CTA. */
  bridgeUnlocked?: boolean;
};

export default function Step3CityOverview({
  onSelectDistrict,
  onOpenSortingMachine,
  machineReady,
  organizerSortingReady,
  primaryActionsUnlocked,
  bridgeUnlocked = false,
}: Step3CityOverviewProps) {
  const { tipOpen, nudge, trigger, message } = useSoftGateFeedback(2000);
  const showOpenBoxNextHint = bridgeUnlocked && !machineReady;

  function handleMachineClick() {
    if (machineReady || primaryActionsUnlocked) {
      onOpenSortingMachine();
      return;
    }
    trigger();
  }

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col gap-2 sm:gap-3">
      <p className="shrink-0 text-center text-[0.65rem] uppercase tracking-[0.2em] text-stone-400">
        Step 3 of 7
      </p>

      <div className="min-h-0 w-full flex-1">
        <OverviewMap onSelectDistrict={onSelectDistrict} />
      </div>

      <div className="shrink-0 flex flex-col items-center gap-1 pb-1">
        {showOpenBoxNextHint ? (
          <div
            className="animate-step3-next-hint flex flex-col items-center text-violet-600/90"
            aria-hidden
          >
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-violet-500/90">
              Next
            </span>
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5"
            >
              <path d="M12 5v12" />
              <path d="m6 13 6 6 6-6" />
            </svg>
          </div>
        ) : null}
        <SoftGateTooltip show={tipOpen} message={message}>
          <button
            type="button"
            onClick={handleMachineClick}
            title={
              machineReady
                ? "Continue to the next chapter"
                : organizerSortingReady
                  ? "Open the City Sorting Machine"
                  : "Explore districts and complete the sorting organizer first"
            }
            className={`min-h-[44px] rounded-2xl border-2 border-violet-700 bg-violet-500 px-5 py-2.5 font-serif text-base font-semibold text-white shadow-md transition enabled:hover:bg-violet-400 ${
              bridgeUnlocked && !machineReady ? "animate-step3-open-box border-violet-400" : ""
            } ${nudge ? "animate-step3-gate-nudge" : ""}`}
          >
            {machineReady
              ? "Return to City Sorting Machine"
              : bridgeUnlocked
                ? "Open Box"
                : "City Sorting Machine"}
          </button>
        </SoftGateTooltip>
      </div>
    </div>
  );
}
