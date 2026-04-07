"use client";

import { computeJudgment, JOB_DISPLAY, JOB_IDS } from "@/lib/aiModel";
import { buildJudgmentExplanation } from "@/lib/judgmentExplanation";
import {
  getAnimalDisplayName,
  getDreamDisplayLabel,
  getEffectiveDreamJob,
  isLearnerProfileComplete,
} from "@/lib/learnerUtils";
import { useGameState } from "@/lib/gameState";
import { useEffect, useMemo, useState } from "react";

const LOADING_MS = 2000;

export type Step2JudgmentProps = {
  onBackToWelcome: () => void;
  onContinueToStory: () => void;
};

/**
 * Step 2 — Deterministic AI judgment with softmax probabilities
 */
export function Step2Judgment({
  onBackToWelcome,
  onContinueToStory,
}: Step2JudgmentProps) {
  const { state, dispatch } = useGameState();
  const { learner } = state;
  const complete = isLearnerProfileComplete(learner);

  const inputKey = useMemo(
    () =>
      JSON.stringify({
        p: learner.presetAnimal,
        c: learner.customAnimal.trim(),
        t: learner.traits,
        d: learner.dreamJob,
        cd: learner.customDreamJob.trim(),
      }),
    [
      learner.presetAnimal,
      learner.customAnimal,
      learner.traits,
      learner.dreamJob,
      learner.customDreamJob,
    ],
  );

  const [phase, setPhase] = useState<"loading" | "result">("loading");

  useEffect(() => {
    if (!complete) return;
    // Reset to loading when inputs change; result is shown after a short delay.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional phase reset tied to inputKey
    setPhase("loading");
    const t = window.setTimeout(() => {
      setPhase("result");
      dispatch({ type: "MARK_PROGRESS", patch: { judgmentSeen: true } });
    }, LOADING_MS);
    return () => window.clearTimeout(t);
  }, [complete, inputKey, dispatch]);

  const judgment = useMemo(() => {
    if (!complete) return null;
    const dreamForModel = getEffectiveDreamJob(learner);
    return computeJudgment({
      presetAnimal: learner.presetAnimal,
      customAnimalTrimmed: learner.customAnimal.trim(),
      traits: learner.traits,
      dreamJob: dreamForModel,
    });
  }, [complete, learner]);

  const tokens = useMemo(
    () => learner.description.split(/\s+/).filter(Boolean),
    [learner.description],
  );

  if (!complete) {
    return (
      <section
        className="rounded-3xl border-4 border-sky-200 bg-gradient-to-b from-sky-50 to-indigo-50 p-8 shadow-[8px_8px_0_0_rgba(56,189,248,0.35)]"
        aria-labelledby="step2-title"
      >
        <h2
          id="step2-title"
          className="mb-4 font-serif text-2xl font-bold text-sky-950"
        >
          Finish your character first
        </h2>
        <p className="mb-6 font-serif text-lg text-sky-950/90">
          Go back to the welcome page and pick an animal, traits, and a dream
          role (preset or custom) so the AI can use your profile.
        </p>
        <button
          type="button"
          onClick={onBackToWelcome}
          className="rounded-2xl border-2 border-sky-700 bg-sky-300 px-5 py-3 font-serif text-lg font-semibold text-sky-950 shadow-sm hover:bg-sky-200"
        >
          ← Back to welcome
        </button>
      </section>
    );
  }

  if (!judgment) {
    return null;
  }

  const animalDisplay = getAnimalDisplayName(learner);
  const explanation = buildJudgmentExplanation(
    animalDisplay,
    learner.traits,
    judgment.topJob,
  );

  const dreamTitle = getDreamDisplayLabel(learner);
  const topTitle = JOB_DISPLAY[judgment.topJob].title;

  return (
    <section
      className="rounded-3xl border-4 border-sky-200 bg-gradient-to-b from-sky-50 to-indigo-50 p-6 shadow-[8px_8px_0_0_rgba(56,189,248,0.35)] sm:p-8"
      aria-labelledby="step2-title"
    >
      <p className="mb-2 font-serif text-sm font-medium uppercase tracking-widest text-sky-800/80">
        Step 2
      </p>
      <h2
        id="step2-title"
        className="mb-6 font-serif text-3xl font-bold text-sky-950"
      >
        AI judgment
      </h2>

      {phase === "loading" && (
        <div
          className="mb-8 rounded-2xl border-2 border-dashed border-sky-300 bg-white/70 p-6"
          role="status"
          aria-live="polite"
        >
          <p className="mb-4 text-center font-serif text-lg font-semibold text-sky-900">
            Analyzing your profile…
          </p>
          <p className="mb-3 text-center font-serif text-sm text-sky-800/80">
            Tokens from your description:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {tokens.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className="animate-pulse rounded-full bg-sky-200 px-3 py-1 font-mono text-sm text-sky-950"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {word}
              </span>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <span
              className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-sky-300 border-t-sky-600"
              aria-hidden
            />
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="space-y-8">
          <div className="rounded-2xl border-4 border-sky-400 bg-white p-6 shadow-inner">
            <h3 className="mb-3 font-serif text-xl font-bold text-sky-950">
              AI recommendation
            </h3>
            <p className="font-serif text-lg leading-relaxed text-sky-950">
              The system predicts your most likely fit is:{" "}
              <span className="font-bold text-indigo-800">
                {JOB_DISPLAY[judgment.topJob].title}
              </span>
              .
            </p>
            <p className="mt-2 font-serif text-sm text-sky-800/85">
              In Zoo City, that often maps to the{" "}
              {JOB_DISPLAY[judgment.topJob].placeName}.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-serif text-lg font-bold text-sky-950">
              Probability for each job
            </h3>
            <p className="mb-3 font-serif text-sm text-sky-800/90">
              Numbers come from the model’s math (animal patterns + your traits +
              a small dream-job nudge), then softmax so all four add to 100%.
            </p>
            <ul className="space-y-3">
              {JOB_IDS.map((j) => {
                const pct = judgment.percentages[j];
                return (
                  <li key={j}>
                    <div className="mb-1 flex justify-between font-serif text-sm text-sky-950">
                      <span>{JOB_DISPLAY[j].title}</span>
                      <span className="tabular-nums">{pct}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border border-sky-200 bg-sky-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-400 transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50/80 p-5">
            <h3 className="mb-2 font-serif text-lg font-bold text-indigo-950">
              Why the model leaned this way
            </h3>
            <p className="font-serif leading-relaxed text-indigo-950">
              {explanation}
            </p>
          </div>

          <div className="grid gap-3 rounded-2xl border-2 border-sky-300 bg-white/80 p-4 sm:grid-cols-2">
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-wide text-sky-800/70">
                Your dream
              </p>
              <p className="font-serif text-lg font-semibold text-sky-950">
                {dreamTitle}
              </p>
            </div>
            <div>
              <p className="font-serif text-xs font-bold uppercase tracking-wide text-sky-800/70">
                AI prediction (top job)
              </p>
              <p className="font-serif text-lg font-semibold text-sky-950">
                {topTitle}
              </p>
            </div>
          </div>

          <p className="text-center font-serif text-xl font-semibold text-sky-950">
            Does this feel right to you?
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={onContinueToStory}
              className="min-h-[52px] rounded-2xl border-2 border-sky-900 bg-sky-400 px-6 font-serif text-lg font-bold text-sky-950 shadow-[4px_4px_0_0_rgba(30,58,138,0.25)] transition hover:translate-y-px hover:bg-sky-300"
            >
              See how Zoo City works →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
