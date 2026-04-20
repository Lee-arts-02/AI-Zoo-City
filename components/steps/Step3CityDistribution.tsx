"use client";

import AxisOrganizer, {
  type OrganizerSlotId,
} from "@/components/city/AxisOrganizer";
import OrganizerToggle from "@/components/city/OrganizerToggle";
import Step3RobotGuide, {
  STEP3_CENTER_INTERLUDE_OUTER_CLASS,
  type Step3RobotSentence,
} from "@/components/step3/Step3RobotGuide";
import {
  STEP3_BRIDGE_LINE2_HOLD_MS,
  STEP3_BRIDGE_SORTING_MACHINE_PAUSE_MS,
  STEP3_POST_REVEAL_BACK_DELAY_MS,
  STEP3_DISTRICT_NEAR_INFO,
  STEP3_DISTRICT_NEAR_SORT_1,
  STEP3_SCRIPT_BRIDGE_LINE1,
  STEP3_SCRIPT_BRIDGE_LINE2,
  STEP3_SCRIPT_ORG_COLOR,
  STEP3_SCRIPT_ORG_DRAG,
  STEP3_SCRIPT_OVERVIEW,
  STEP3_SCRIPT_POST_REVEAL,
  STEP3_SCRIPT_REVEAL_ASK,
} from "@/components/step3/step3RobotScripts";
import { MachineRevealTransition } from "@/components/steps/MachineRevealTransition";
import Step3CityOverview from "@/components/steps/Step3CityOverview";
import Step3DistrictDetail from "@/components/steps/Step3DistrictDetail";
import { buildStarterOrganizerTokens } from "@/data/organizerTokens";
import { useGameState } from "@/lib/gameState";
import { useAudio } from "@/lib/audio/AudioProvider";
import { OPEN_BOX_BGM_FADE_MS } from "@/lib/audio/constants";
import { isStep3PrimaryActionsUnlocked } from "@/lib/step3SortingGate";
import { useStep3Interaction } from "@/components/steps/Step3InteractionContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DistrictId } from "@/types/city";

const DISTRICT_LINES: Step3RobotSentence[] = [
  { text: STEP3_DISTRICT_NEAR_INFO, anchor: "info" },
  { text: STEP3_DISTRICT_NEAR_SORT_1, anchor: "sort" },
];

type RobotPhase =
  | "overview"
  | "district"
  | "org_color"
  | "org_drag"
  | "reveal_ask"
  | "post_reveal"
  | "bridge"
  | "bridge_open_box"
  | "off";

type DistrictGate = null | "info" | "organizer";

export default function Step3CityDistribution() {
  const { state, dispatch } = useGameState();
  const [view, setView] = useState<"overview" | "district">("overview");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictId | null>(null);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [revealOpen, setRevealOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);

  const [robotPhase, setRobotPhase] = useState<RobotPhase>("overview");
  const [sequenceKey, setSequenceKey] = useState(0);
  const [bridgeUnlocked, setBridgeUnlocked] = useState(false);

  const [hasSeenDistrictIntro, setHasSeenDistrictIntro] = useState(false);
  const [hasSeenDistrictGuidance, setHasSeenDistrictGuidance] = useState(false);

  /** One line at a time; gates before advancing. */
  const [districtLineIndex, setDistrictLineIndex] = useState(0);
  const districtLineIndexRef = useRef(0);
  districtLineIndexRef.current = districtLineIndex;
  const [districtGate, setDistrictGate] = useState<DistrictGate>(null);

  const [showRevealChoiceButtons, setShowRevealChoiceButtons] = useState(false);
  const [showPostRevealBack, setShowPostRevealBack] = useState(false);

  const orgColorDone = useRef(false);
  const orgDragDone = useRef(false);
  const prevOrganizerOpen = useRef(false);
  const revealAskLaunched = useRef(false);
  const postRevealBackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const hasAssignedColor = useMemo(
    () => starterTokens.some((t) => learnerDistrictColors[t.instanceId] != null),
    [starterTokens, learnerDistrictColors]
  );

  const allPlacedOnAxes = useMemo(
    () => starterTokens.every((t) => placements[t.instanceId] !== "bank"),
    [starterTokens, placements]
  );

  const primaryActionsUnlocked = useMemo(
    () =>
      isStep3PrimaryActionsUnlocked(
        machineReady,
        visited.length,
        starterTokens,
        placements,
        learnerDistrictColors,
        robotPhase,
        revealActivated,
        bridgeUnlocked
      ),
    [
      machineReady,
      visited.length,
      starterTokens,
      placements,
      learnerDistrictColors,
      robotPhase,
      revealActivated,
      bridgeUnlocked,
    ]
  );

  const { setPrimaryActionsUnlocked } = useStep3Interaction();
  const { fadeBgmToSilence } = useAudio();
  useEffect(() => {
    setPrimaryActionsUnlocked(primaryActionsUnlocked);
    return () => setPrimaryActionsUnlocked(false);
  }, [primaryActionsUnlocked, setPrimaryActionsUnlocked]);

  const bumpSequence = useCallback(() => {
    setSequenceKey((k) => k + 1);
  }, []);

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
    if (!primaryActionsUnlocked) return;
    fadeBgmToSilence(OPEN_BOX_BGM_FADE_MS);
    setRevealOpen(true);
  }, [dispatch, machineReady, primaryActionsUnlocked, fadeBgmToSilence]);

  function recordDistrictVisit(id: DistrictId) {
    if (visited.includes(id)) return;
    dispatch({
      type: "MARK_PROGRESS",
      patch: { step3DistrictsVisited: [...visited, id] },
    });
  }

  function handleOrganizerReveal() {
    dispatch({ type: "MARK_PROGRESS", patch: { step3OrganizerRevealActivated: true } });
  }

  function handleSelectDistrict(id: DistrictId) {
    recordDistrictVisit(id);
    setSelectedDistrict(id);
    setDashboardOpen(false);
    prevOrganizerOpen.current = false;
    setView("district");
    setDistrictGate(null);
    setDistrictLineIndex(0);
    if (!hasSeenDistrictIntro) {
      setRobotPhase("district");
      bumpSequence();
    } else {
      setRobotPhase("off");
    }
  }

  function handleBackToOverview() {
    if (postRevealBackTimerRef.current) {
      clearTimeout(postRevealBackTimerRef.current);
      postRevealBackTimerRef.current = null;
    }
    setView("overview");
    setSelectedDistrict(null);
    prevOrganizerOpen.current = false;
    setShowRevealChoiceButtons(false);
    setShowPostRevealBack(false);
    setDistrictGate(null);
    if (robotPhase !== "bridge" && robotPhase !== "bridge_open_box") {
      setRobotPhase("off");
    }
  }

  const onOverviewWelcomeComplete = useCallback(() => {}, []);

  const onDistrictSingleLineComplete = useCallback(() => {
    const idx = districtLineIndexRef.current;
    if (idx === 0) {
      setDistrictGate("info");
      return;
    }
    if (idx === 1) {
      setDistrictGate("organizer");
      return;
    }
  }, []);

  useEffect(() => {
    if (robotPhase !== "district" || districtGate !== "info" || !dashboardOpen) return;
    setDistrictGate(null);
    setDistrictLineIndex(1);
    bumpSequence();
  }, [dashboardOpen, districtGate, robotPhase, bumpSequence]);

  useEffect(() => {
    if (robotPhase !== "district" || districtGate !== "organizer" || !organizerOpen) return;
    setDistrictGate(null);
    setHasSeenDistrictIntro(true);
    if (!orgColorDone.current) {
      setRobotPhase("org_color");
    } else {
      setRobotPhase("off");
    }
    bumpSequence();
  }, [organizerOpen, districtGate, robotPhase, bumpSequence]);

  const onOrgColorComplete = useCallback(() => {
    if (hasSeenDistrictGuidance) return;
    orgColorDone.current = true;
    if (hasAssignedColor && !orgDragDone.current) {
      setRobotPhase("org_drag");
      bumpSequence();
    }
  }, [hasAssignedColor, hasSeenDistrictGuidance, bumpSequence]);

  const onOrgDragComplete = useCallback(() => {
    orgDragDone.current = true;
    setHasSeenDistrictGuidance(true);
    setRobotPhase("off");
    bumpSequence();
  }, [bumpSequence]);

  const onRevealAskComplete = useCallback(() => {
    setShowRevealChoiceButtons(true);
  }, []);

  const confirmRevealChoice = useCallback(() => {
    setShowRevealChoiceButtons(false);
    setLearnerSortingVisible(false);
    handleOrganizerReveal();
    setRobotPhase("post_reveal");
    bumpSequence();
  }, [bumpSequence]);

  const onPostRevealComplete = useCallback(() => {
    if (postRevealBackTimerRef.current) clearTimeout(postRevealBackTimerRef.current);
    postRevealBackTimerRef.current = setTimeout(() => {
      postRevealBackTimerRef.current = null;
      setShowPostRevealBack(true);
    }, STEP3_POST_REVEAL_BACK_DELAY_MS);
  }, []);

  const bridgePauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bridgeHoldTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onBridgeLine1Complete = useCallback(() => {
    if (bridgePauseTimerRef.current) clearTimeout(bridgePauseTimerRef.current);
    bridgePauseTimerRef.current = setTimeout(() => {
      bridgePauseTimerRef.current = null;
      setRobotPhase("bridge_open_box");
      bumpSequence();
    }, STEP3_BRIDGE_SORTING_MACHINE_PAUSE_MS);
  }, [bumpSequence]);

  const onBridgeLine2Complete = useCallback(() => {
    if (bridgeHoldTimerRef.current) clearTimeout(bridgeHoldTimerRef.current);
    bridgeHoldTimerRef.current = setTimeout(() => {
      bridgeHoldTimerRef.current = null;
      setRobotPhase("off");
    }, STEP3_BRIDGE_LINE2_HOLD_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (bridgePauseTimerRef.current) clearTimeout(bridgePauseTimerRef.current);
      if (bridgeHoldTimerRef.current) clearTimeout(bridgeHoldTimerRef.current);
      if (postRevealBackTimerRef.current) clearTimeout(postRevealBackTimerRef.current);
    };
  }, []);

  const handleBackToOverviewAfterReveal = useCallback(() => {
    if (postRevealBackTimerRef.current) {
      clearTimeout(postRevealBackTimerRef.current);
      postRevealBackTimerRef.current = null;
    }
    setView("overview");
    setSelectedDistrict(null);
    setOrganizerOpen(false);
    setShowPostRevealBack(false);
    setShowRevealChoiceButtons(false);
    prevOrganizerOpen.current = false;
    setRobotPhase("bridge");
    setBridgeUnlocked(true);
    bumpSequence();
  }, [bumpSequence]);

  useEffect(() => {
    if (view !== "district" || hasSeenDistrictGuidance) return;
    if (robotPhase === "district") return;
    const opened = organizerOpen && !prevOrganizerOpen.current;
    prevOrganizerOpen.current = organizerOpen;
    if (!opened) return;
    if (!orgColorDone.current) {
      setRobotPhase("org_color");
      bumpSequence();
      return;
    }
    if (hasAssignedColor && !orgDragDone.current) {
      setRobotPhase("org_drag");
      bumpSequence();
    }
  }, [organizerOpen, view, hasAssignedColor, hasSeenDistrictGuidance, robotPhase, bumpSequence]);

  useEffect(() => {
    if (view !== "district" || !organizerOpen || hasSeenDistrictGuidance) return;
    if (!orgColorDone.current || orgDragDone.current || !hasAssignedColor) return;
    if (robotPhase !== "org_color" && robotPhase !== "off") return;
    setRobotPhase("org_drag");
    bumpSequence();
  }, [hasAssignedColor, view, organizerOpen, robotPhase, bumpSequence, hasSeenDistrictGuidance]);

  useEffect(() => {
    if (view !== "district") return;
    if (!hasSeenDistrictGuidance) return;
    if (!allPlacedOnAxes || visited.length < 3 || revealActivated) return;
    if (revealAskLaunched.current) return;
    revealAskLaunched.current = true;
    setOrganizerOpen(true);
    setRobotPhase("reveal_ask");
    setShowRevealChoiceButtons(false);
    bumpSequence();
  }, [
    allPlacedOnAxes,
    visited.length,
    revealActivated,
    view,
    hasSeenDistrictGuidance,
    bumpSequence,
  ]);

  const districtSentence = DISTRICT_LINES[districtLineIndex];

  const robotStack = (
    <>
      {robotPhase === "overview" ? (
        <Step3RobotGuide
          key={`overview-${sequenceKey}`}
          variant="overview"
          anchor="overview"
          sentences={[...STEP3_SCRIPT_OVERVIEW]}
          onSequenceComplete={onOverviewWelcomeComplete}
          visible
        />
      ) : null}

      {robotPhase === "district" && districtSentence ? (
        <Step3RobotGuide
          key={`district-${districtLineIndex}-${sequenceKey}`}
          anchor="info"
          sentences={[districtSentence]}
          onSequenceComplete={onDistrictSingleLineComplete}
          visible
        />
      ) : null}

      {robotPhase === "org_color" ? (
        <Step3RobotGuide
          key={`orgc-${sequenceKey}`}
          anchor="organizer"
          sentences={[...STEP3_SCRIPT_ORG_COLOR]}
          onSequenceComplete={onOrgColorComplete}
          visible
        />
      ) : null}

      {robotPhase === "org_drag" ? (
        <Step3RobotGuide
          key={`orgd-${sequenceKey}`}
          anchor="organizer"
          sentences={[...STEP3_SCRIPT_ORG_DRAG]}
          onSequenceComplete={onOrgDragComplete}
          visible
        />
      ) : null}

      {robotPhase === "bridge" ? (
        <Step3RobotGuide
          key={`bridge-${sequenceKey}`}
          variant="overview"
          anchor="overview"
          sentences={[...STEP3_SCRIPT_BRIDGE_LINE1]}
          onSequenceComplete={onBridgeLine1Complete}
          visible
        />
      ) : null}

      {robotPhase === "bridge_open_box" ? (
        <Step3RobotGuide
          key={`bridge-box-${sequenceKey}`}
          variant="openBoxAbove"
          anchor="overview"
          sentences={[...STEP3_SCRIPT_BRIDGE_LINE2]}
          onSequenceComplete={onBridgeLine2Complete}
          visible
        />
      ) : null}
    </>
  );

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
          sortingMachineUnlocked={organizerSortingReady}
        />
      </>
    ) : null;

  return (
    <div className="relative flex min-h-0 w-full flex-1 flex-col">
      {revealOpen ? <MachineRevealTransition onComplete={finishReveal} /> : null}

      {robotPhase === "reveal_ask" ? (
        <div
          className={`${STEP3_CENTER_INTERLUDE_OUTER_CLASS} !z-[61] flex flex-col items-stretch gap-2 pointer-events-none sm:gap-2.5`}
        >
          <Step3RobotGuide
            key={`ask-${sequenceKey}`}
            variant="centerInterlude"
            embedCenterInterlude
            robotSrc="/robot1.png"
            anchor="overview"
            sentences={[...STEP3_SCRIPT_REVEAL_ASK]}
            onSequenceComplete={onRevealAskComplete}
            visible
          />
          {showRevealChoiceButtons ? (
            <div className="pointer-events-auto flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={confirmRevealChoice}
                className="rounded-xl border border-violet-500 bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-950 shadow-sm transition hover:bg-violet-200"
              >
                Yes, show me!
              </button>
              <button
                type="button"
                onClick={confirmRevealChoice}
                className="rounded-xl border border-violet-400/80 bg-white px-4 py-2.5 text-sm font-semibold text-violet-900 shadow-sm transition hover:bg-violet-50"
              >
                Okay, let’s take a look.
              </button>
            </div>
          ) : null}
        </div>
      ) : robotPhase === "post_reveal" ? (
        <div
          className={`${STEP3_CENTER_INTERLUDE_OUTER_CLASS} !z-[61] flex flex-col items-stretch gap-2 pointer-events-none sm:gap-2.5`}
        >
          <Step3RobotGuide
            key={`post-${sequenceKey}`}
            variant="centerInterlude"
            embedCenterInterlude
            robotSrc="/robot1.png"
            anchor="overview"
            sentences={[...STEP3_SCRIPT_POST_REVEAL]}
            onSequenceComplete={onPostRevealComplete}
            visible
          />
          {showPostRevealBack && view === "district" ? (
            <div className="pointer-events-auto w-full">
              <button
                type="button"
                onClick={handleBackToOverviewAfterReveal}
                className="w-full rounded-2xl border-2 border-stone-400 bg-white px-4 py-3 text-base font-semibold text-stone-900 shadow-lg transition hover:bg-stone-50"
              >
                Back to overview
              </button>
            </div>
          ) : null}
        </div>
      ) : robotPhase !== "off" ? (
        robotStack
      ) : null}

      {view === "district" && selectedDistrict ? (
        <div className="flex min-h-0 w-full flex-1 flex-col">
          <Step3DistrictDetail
            districtId={selectedDistrict}
            dashboardOpen={dashboardOpen}
            onDashboardOpenChange={setDashboardOpen}
            onBack={handleBackToOverview}
            sceneOverlay={districtSceneOverlay}
          />
        </div>
      ) : (
        <Step3CityOverview
          onSelectDistrict={handleSelectDistrict}
          onOpenSortingMachine={handleOpenMachine}
          machineReady={machineReady}
          organizerSortingReady={organizerSortingReady}
          primaryActionsUnlocked={primaryActionsUnlocked}
          bridgeUnlocked={bridgeUnlocked}
        />
      )}
    </div>
  );
}
