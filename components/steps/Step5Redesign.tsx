"use client";

import { RedesignWorkspace } from "@/components/steps/step5/RedesignWorkspace";
import { Step5IntroTransition } from "@/components/steps/step5/Step5IntroTransition";
import { useGameState } from "@/lib/gameState";

/**
 * Step 5 — Human-in-the-loop city redesign (intro transition → interactive map + database).
 */
export function Step5Redesign() {
  const { state } = useGameState();

  if (!state.progress.step5IntroSeen) {
    return <Step5IntroTransition />;
  }

  return <RedesignWorkspace />;
}
