"use client";

import { MachineRevealTransition } from "@/components/steps/MachineRevealTransition";
import Step3CityOverview from "@/components/steps/Step3CityOverview";
import Step3DistrictDetail from "@/components/steps/Step3DistrictDetail";
import { useGameState } from "@/lib/gameState";
import { useCallback, useState } from "react";
import type { DistrictId } from "@/types/city";

export default function Step3CityDistribution() {
  const { state, dispatch } = useGameState();
  const [view, setView] = useState<"overview" | "district">("overview");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);

  const machineReady = state.progress.aiExplained;

  const finishReveal = useCallback(() => {
    setRevealOpen(false);
    dispatch({ type: "MARK_PROGRESS", patch: { aiExplained: true } });
    dispatch({ type: "SET_STEP", step: 4 });
  }, [dispatch]);

  const handleOpenMachine = useCallback(() => {
    if (machineReady) {
      dispatch({ type: "SET_STEP", step: 4 });
      return;
    }
    setRevealOpen(true);
  }, [dispatch, machineReady]);

  function handleSelectDistrict(id: DistrictId) {
    setSelectedDistrict(id);
    setDashboardOpen(false);
    setView("district");
  }

  function handleBackToOverview() {
    setView("overview");
    setSelectedDistrict(null);
  }

  if (view === "district" && selectedDistrict) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col">
        <Step3DistrictDetail
          districtId={selectedDistrict}
          dashboardOpen={dashboardOpen}
          onDashboardOpenChange={setDashboardOpen}
          onBack={handleBackToOverview}
          showSortingMachineHint={!machineReady}
        />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      {revealOpen ? <MachineRevealTransition onComplete={finishReveal} /> : null}
      <Step3CityOverview
        onSelectDistrict={handleSelectDistrict}
        onOpenSortingMachine={handleOpenMachine}
        machineReady={machineReady}
      />
    </div>
  );
}
