"use client";

import { HiringAssignmentWorkspace } from "@/components/steps/step5/HiringAssignmentWorkspace";
import { Step5IntroTransition } from "@/components/steps/step5/Step5IntroTransition";
import { useGameState } from "@/lib/gameState";

/**
 * Step 5 — Human-in-the-loop hiring / assignment (intro → district gates + candidate cards).
 */
export function Step5Redesign() {
  const { state } = useGameState();

  if (!state.progress.step5IntroSeen) {
    return <Step5IntroTransition />;
  }

  return <HiringAssignmentWorkspace />;
}
