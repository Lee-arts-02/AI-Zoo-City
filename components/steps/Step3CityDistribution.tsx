"use client";

import AxisOrganizer, {
  type OrganizerSlotId,
} from "@/components/city/AxisOrganizer";
import OrganizerToggle from "@/components/city/OrganizerToggle";
import { MachineRevealTransition } from "@/components/steps/MachineRevealTransition";
import Step3CityOverview from "@/components/steps/Step3CityOverview";
import Step3DistrictDetail from "@/components/steps/Step3DistrictDetail";
import { buildStarterOrganizerTokens } from "@/data/organizerTokens";
import { useGameState } from "@/lib/gameState";
import { useCallback, useMemo, useState } from "react";
import type { DistrictId } from "@/types/city";

export default function Step3CityDistribution() {
  const { state, dispatch } = useGameState();
  const [view, setView] = useState<"overview" | "district">("overview");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);

  const starterTokens = useMemo(() => buildStarterOrganizerTokens(), []);

  const [placements, setPlacements] = useState<Record<string, OrganizerSlotId>>(() => {
    const initial: Record<string, OrganizerSlotId> = {};
    for (const t of starterTokens) {
      initial[t.instanceId] = "bank";
    }
    return initial;
  });

  const [learnerDistrictColors, setLearnerDistrictColors] = useState<
    Record<string, DistrictId | null>
  >({});
  const [learnerSortingVisible, setLearnerSortingVisible] = useState(true);

  const visited = state.progress.step3DistrictsVisited;
  const revealActivated = state.progress.step3OrganizerRevealActivated;
  const machineReady = state.progress.aiExplained;
  const organizerSortingReady = visited.length >= 3 && revealActivated;

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
    if (!organizerSortingReady) return;
    setRevealOpen(true);
  }, [dispatch, machineReady, organizerSortingReady]);

  function recordDistrictVisit(id: DistrictId) {
    if (visited.includes(id)) return;
    dispatch({
      type: "MARK_PROGRESS",
      patch: { step3DistrictsVisited: [...visited, id] },
    });
  }

  function handleSelectDistrict(id: DistrictId) {
    recordDistrictVisit(id);
    setSelectedDistrict(id);
    setDashboardOpen(false);
    setView("district");
  }

  function handleBackToOverview() {
    setView("overview");
    setSelectedDistrict(null);
  }

  function handleOrganizerReveal() {
    dispatch({ type: "MARK_PROGRESS", patch: { step3OrganizerRevealActivated: true } });
  }

  const machineBlockedReason =
    !machineReady && !organizerSortingReady
      ? "Visit three different districts, open the sorting space, reflect, then tap “View more from the current Zoo City” to unlock."
      : undefined;

  const districtSceneOverlay =
    view === "district" && selectedDistrict ? (
      <>
        <OrganizerToggle open={organizerOpen} onToggle={() => setOrganizerOpen((o) => !o)} />
        <AxisOrganizer
          open={organizerOpen}
          onClose={() => setOrganizerOpen(false)}
          starterTokens={starterTokens}
          placements={placements}
          setPlacements={setPlacements}
          learnerDistrictColors={learnerDistrictColors}
          setLearnerDistrictColors={setLearnerDistrictColors}
          visitedDistricts={visited}
          revealActivated={revealActivated}
          learnerSortingVisible={learnerSortingVisible}
          setLearnerSortingVisible={setLearnerSortingVisible}
          onRevealClick={handleOrganizerReveal}
          sortingMachineUnlocked={organizerSortingReady}
        />
      </>
    ) : null;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      {revealOpen ? <MachineRevealTransition onComplete={finishReveal} /> : null}

      {view === "district" && selectedDistrict ? (
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <Step3DistrictDetail
            districtId={selectedDistrict}
            dashboardOpen={dashboardOpen}
            onDashboardOpenChange={setDashboardOpen}
            onBack={handleBackToOverview}
            showSortingMachineHint={!machineReady}
            sceneOverlay={districtSceneOverlay}
          />
        </div>
      ) : (
        <Step3CityOverview
          onSelectDistrict={handleSelectDistrict}
          onOpenSortingMachine={handleOpenMachine}
          machineReady={machineReady}
          sortingMachineBlocked={!machineReady && !organizerSortingReady}
          sortingMachineBlockedReason={machineBlockedReason}
        />
      )}
    </div>
  );
}
