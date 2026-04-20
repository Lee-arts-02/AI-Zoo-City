"use client";

import Step3CityDistribution from "@/components/steps/Step3CityDistribution";
import { Step4AISystem } from "@/components/steps/Step4AISystem";
import { Step5Redesign } from "@/components/steps/Step5Redesign";
import { Step6Comparison } from "@/components/steps/Step6Comparison";
import { Step7Reflection } from "@/components/steps/Step7Reflection";
import { Step3InteractionProvider } from "@/components/steps/Step3InteractionContext";
import { getAnimalDisplayName } from "@/lib/learnerUtils";
import { useGameState } from "@/lib/gameState";
import { StepNavigation } from "./StepNavigation";
import { StepProgress } from "./StepProgress";

function StoryStepPanel() {
  const { state } = useGameState();
  const step = state.currentStep;

  switch (step) {
    case 3:
      return <Step3CityDistribution />;
    case 4:
      return <Step4AISystem />;
    case 5:
      return <Step5Redesign />;
    case 6:
      return <Step6Comparison />;
    case 7:
      return <Step7Reflection />;
    default:
      return <Step3CityDistribution />;
  }
}

export type MainStoryShellProps = {
  /** From chapter 3, “Previous” returns to the AI judgment (intro step 2). */
  onBackFromStoryStart?: () => void;
};

export function MainStoryShell({ onBackFromStoryStart }: MainStoryShellProps) {
  const { state } = useGameState();
  const rawName = getAnimalDisplayName(state.learner);
  const companion =
    rawName !== "mystery animal"
      ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
      : null;

  const step3Immersive = state.currentStep === 3;
  const step4Immersive = state.currentStep === 4;
  const step5Immersive = state.currentStep === 5;
  const step6Wide = state.currentStep === 6;
  const step7Wide = state.currentStep === 7;
  const wideStoryLayout =
    step3Immersive ||
    step4Immersive ||
    step5Immersive ||
    step6Wide ||
    step7Wide;

  return (
    <Step3InteractionProvider>
    <div
      className={`mx-auto flex min-h-0 w-full flex-1 flex-col py-6 sm:py-8 ${
        wideStoryLayout
          ? "max-w-none px-0 sm:px-4 lg:px-8"
          : "max-w-3xl px-4 sm:px-6"
      }`}
    >
      <header className={`text-center ${wideStoryLayout ? "mb-4" : "mb-8"}`}>
        <p className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/70">
          A storybook adventure
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-amber-950">
          AI Zoo City
        </h1>
        {companion ? (
          <p className="mt-3 font-serif text-lg text-amber-900/90">
            You are playing as:{" "}
            <span className="font-semibold">{companion}</span>
          </p>
        ) : (
          <p className="mt-3 font-serif text-base text-amber-800/70">
            Create your character on step 1 to see them here.
          </p>
        )}
      </header>

      <StepProgress currentStep={state.currentStep} />

      <main
        className={`flex min-h-0 flex-1 flex-col ${wideStoryLayout ? "mt-4" : "mt-8"}`}
      >
        <StoryStepPanel />
        <div className={wideStoryLayout ? "mt-6" : "mt-10"}>
          <StepNavigation onBackFromStoryStart={onBackFromStoryStart} />
        </div>
      </main>
    </div>
    </Step3InteractionProvider>
  );
}
