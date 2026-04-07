"use client";

import { MainStoryShell } from "@/components/shared/MainStoryShell";
import { Step1Welcome } from "@/components/steps/Step1Welcome";
import { Step2Judgment } from "@/components/steps/Step2Judgment";
import { useGameState } from "@/lib/gameState";
import { type ReactNode, useState } from "react";

function IntroLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-8 sm:px-6">
      <header className="mb-8 text-center">
        <p className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/70">
          A storybook adventure
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-amber-950">
          AI Zoo City
        </h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

/**
 * Intro uses local step state (1 = welcome, 2 = AI judgment).
 * The main story (chapters 3–7) uses global game step after entering.
 */
export function ZooCityClient() {
  const [step, setStep] = useState(1);
  const { dispatch } = useGameState();

  if (step === 1) {
    return (
      <IntroLayout>
        <Step1Welcome onEnterAISystem={() => setStep(2)} />
      </IntroLayout>
    );
  }

  if (step === 2) {
    return (
      <IntroLayout>
        <Step2Judgment
          onBackToWelcome={() => {
            dispatch({ type: "SET_STEP", step: 1 });
            setStep(1);
          }}
          onContinueToStory={() => {
            dispatch({ type: "SET_STEP", step: 3 });
            setStep(3);
          }}
        />
      </IntroLayout>
    );
  }

  return (
    <MainStoryShell
      onBackFromStoryStart={() => {
        dispatch({ type: "SET_STEP", step: 2 });
        setStep(2);
      }}
    />
  );
}
