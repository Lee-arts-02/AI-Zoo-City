"use client";

import { useStep3Interaction } from "@/components/steps/Step3InteractionContext";
import { SoftGateTooltip } from "@/components/shared/SoftGateTooltip";
import { useSoftGateFeedback } from "@/components/shared/useSoftGateFeedback";
import { STEP3_SOFT_GATE_OPEN_MACHINE_MESSAGE } from "@/lib/step3SortingGate";
import { TOTAL_STEPS, useGameState } from "@/lib/gameState";

export type StepNavigationProps = {
  /** When on story step 3, go back to intro step 2 (AI judgment) instead of global step 2. */
  onBackFromStoryStart?: () => void;
};

export function StepNavigation({ onBackFromStoryStart }: StepNavigationProps) {
  const { state, dispatch } = useGameState();
  const step = state.currentStep;
  const canGoBack = step > 3 || (step === 3 && onBackFromStoryStart);
  const step5NeedsRedesign = step === 5 && !state.progress.redesignComplete;
  const step5Celebration = step === 5 && state.progress.finishingStep5Celebration;
  const { tipOpen, nudge, trigger, message } = useSoftGateFeedback(2000);
  const { primaryActionsUnlocked } = useStep3Interaction();
  /** Step 3 uses a soft gate (tooltip) instead of disabling the Next button. */
  const canGoNext =
    step < TOTAL_STEPS && !step5NeedsRedesign && !step5Celebration;

  const goBack = () => {
    if (step === 3 && onBackFromStoryStart) {
      onBackFromStoryStart();
      return;
    }
    dispatch({ type: "SET_STEP", step: step - 1 });
  };

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-amber-900/10 pt-6"
      aria-label="Story pages"
    >
      <button
        type="button"
        onClick={goBack}
        disabled={!canGoBack}
        className="min-h-[48px] min-w-[120px] rounded-2xl border-2 border-amber-800/30 bg-white px-5 font-serif text-lg font-semibold text-amber-950 shadow-sm transition enabled:hover:border-amber-700 enabled:hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Previous page
      </button>
      <SoftGateTooltip show={tipOpen} tone="amber" message={message}>
        <button
          type="button"
          onClick={() => {
            if (step === 3 && !state.progress.aiExplained) {
              if (!primaryActionsUnlocked) {
                trigger();
                return;
              }
              trigger(STEP3_SOFT_GATE_OPEN_MACHINE_MESSAGE);
              return;
            }
            if (step === 6) {
              dispatch({ type: "MARK_PROGRESS", patch: { step7Phase: 0 } });
            }
            dispatch({ type: "SET_STEP", step: step + 1 });
          }}
          disabled={!canGoNext}
          title={
            step === 3 && !state.progress.aiExplained
              ? primaryActionsUnlocked
                ? "Go to the next chapter when you’re ready."
                : "Finish sorting and follow the robot guide on this page first."
              : step5NeedsRedesign
                ? "Tap Save City on Chapter 5 to continue."
                : step5Celebration
                  ? "Your city moment is still unfolding — next page unlocks in a moment."
                  : undefined
          }
          className={`min-h-[48px] min-w-[120px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-5 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.25)] transition enabled:hover:translate-y-px enabled:hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 ${
            nudge ? "animate-step3-gate-nudge" : ""
          }`}
        >
          Next page →
        </button>
      </SoftGateTooltip>
    </nav>
  );
}
