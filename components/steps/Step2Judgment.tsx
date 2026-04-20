"use client";

import { computeJudgment, JOB_DISPLAY, JOB_IDS } from "@/lib/aiModel";
import {
  APPROVAL_MIN_TOP_PROBABILITY,
  getApprovalDetailKind,
  isDreamRoleApproved,
} from "@/lib/judgmentApproval";
import { buildJudgmentExplanation } from "@/lib/judgmentExplanation";
import {
  getAnimalDisplayName,
  getDreamDisplayLabel,
  getEffectiveDreamJob,
  isLearnerProfileComplete,
} from "@/lib/learnerUtils";
import { useAudio } from "@/lib/audio/AudioProvider";
import { useGameState } from "@/lib/gameState";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const { playDecisionSfx } = useAudio();
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
  const [detailsOpen, setDetailsOpen] = useState(false);

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
    return computeJudgment({
      presetAnimal: learner.presetAnimal,
      customAnimalTrimmed: learner.customAnimal.trim(),
      traits: learner.traits,
    });
  }, [complete, learner]);

  const dreamJobId = useMemo(
    () => getEffectiveDreamJob(learner),
    [learner],
  );

  const approved = useMemo(() => {
    if (!judgment) return false;
    return isDreamRoleApproved(judgment, dreamJobId);
  }, [judgment, dreamJobId]);

  const sfxPlayedKeyRef = useRef<string | null>(null);

  /** Play approve/reject as soon as Step 2 has a verdict — do not wait for the loading UI. */
  useEffect(() => {
    if (!complete || !judgment) return;
    const key = `${inputKey}:${approved}`;
    if (sfxPlayedKeyRef.current === key) return;
    sfxPlayedKeyRef.current = key;
    playDecisionSfx(approved);
  }, [complete, judgment, inputKey, approved, playDecisionSfx]);

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
  const detailKind = getApprovalDetailKind(judgment, dreamJobId);
  const dreamPct = judgment.percentages[dreamJobId];
  const topPct = judgment.percentages[judgment.topJob];

  const decisionSubline =
    detailKind === "aligned"
      ? "Your dream role lines up with the AI’s strongest guess, and the model is fairly sure."
      : detailKind === "different_role"
        ? `The AI’s best guess (${topTitle}) is not the same category as your dream pick—we show why below if you want details.`
        : `The AI agrees on your dream role as the top pick, but the score is below ${Math.round(APPROVAL_MIN_TOP_PROBABILITY * 100)}%—so we mark this as “not sure yet” instead of a strong match.`;

  return (
    <section
      className="rounded-3xl border-4 border-sky-200 bg-gradient-to-b from-sky-50 to-indigo-50 p-6 shadow-[8px_8px_0_0_rgba(56,189,248,0.35)] sm:p-8"
      aria-labelledby="step2-title"
    >
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-6">
        <p className="mb-2 text-center font-serif text-sm font-medium uppercase tracking-widest text-sky-800/80">
          Step 2
        </p>
        <h2
          id="step2-title"
          className="mb-8 text-center font-serif text-3xl font-bold text-sky-950"
        >
          AI judgment
        </h2>

        {phase === "loading" && (
          <div
            className="rounded-2xl border-2 border-dashed border-sky-300 bg-white/70 p-8"
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
          <div className="flex flex-col gap-8 md:gap-10">
            <div
              className={[
                "rounded-2xl border-4 px-6 py-8 text-center shadow-inner",
                approved
                  ? "border-green-400 bg-green-100 text-green-900"
                  : "border-red-300 bg-red-100 text-red-900",
              ].join(" ")}
              role="status"
            >
              <p className="mb-2 font-serif text-sm font-bold uppercase tracking-widest opacity-90">
                System decision
              </p>
              <p className="flex items-center justify-center gap-3 font-serif text-4xl font-black tracking-tight sm:text-5xl">
                <span aria-hidden className="select-none">
                  {approved ? "✓" : "✕"}
                </span>
                {approved ? "APPROVED" : "REJECTED"}
              </p>
              <p className="mx-auto mt-4 max-w-xl font-serif text-base leading-relaxed opacity-95">
                {decisionSubline}
              </p>
            </div>

            <div className="rounded-2xl border-2 border-sky-300 bg-white/90 p-5 text-center shadow-sm sm:p-6">
              <p className="font-serif text-sm text-sky-800/80">
                Your dream
              </p>
              <p className="font-serif text-xl font-semibold text-sky-950">
                {dreamTitle}
              </p>
              <p className="mt-4 font-serif text-sm text-sky-800/80">
                AI top pick
              </p>
              <p className="font-serif text-xl font-semibold text-indigo-900">
                {topTitle}{" "}
                <span className="text-base font-normal text-sky-700">
                  ({topPct}%)
                </span>
              </p>
            </div>

            <p className="text-center font-serif text-xl font-semibold text-sky-950">
              Does this feel right to you?
            </p>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                className="rounded-xl border-2 border-sky-600 bg-white px-5 py-2.5 font-serif text-base font-semibold text-sky-900 shadow-sm transition hover:bg-sky-50"
                aria-expanded={detailsOpen}
              >
                {detailsOpen ? "Hide details" : "View details"}
              </button>

              {detailsOpen && (
                <div className="w-full rounded-2xl border-2 border-indigo-200 bg-indigo-50/90 p-5 text-left shadow-inner md:p-6">
                  <h3 className="mb-3 font-serif text-lg font-bold text-indigo-950">
                    How the numbers line up
                  </h3>
                  <p className="mb-4 font-serif text-sm leading-relaxed text-indigo-950/95">
                    Chance for <strong>your dream category</strong> (
                    {JOB_DISPLAY[dreamJobId].title}):{" "}
                    <strong className="tabular-nums">{dreamPct}%</strong>. Same
                    math is used for the green/red decision: the top job must
                    match your dream category and score at least{" "}
                    {Math.round(APPROVAL_MIN_TOP_PROBABILITY * 100)}%.
                  </p>
                  <ul className="mb-6 space-y-3">
                    {JOB_IDS.map((j) => {
                      const pct = judgment.percentages[j];
                      return (
                        <li key={j}>
                          <div className="mb-1 flex justify-between font-serif text-sm text-indigo-950">
                            <span>{JOB_DISPLAY[j].title}</span>
                            <span className="tabular-nums">{pct}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full border border-indigo-200 bg-white">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-sky-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <h4 className="mb-2 font-serif font-bold text-indigo-950">
                    Why the model leaned this way
                  </h4>
                  <p className="font-serif text-sm leading-relaxed text-indigo-950">
                    {explanation}
                  </p>
                  <p className="mt-4 font-serif text-sm text-indigo-900/85">
                    {detailKind === "different_role"
                      ? "Traits and animal type pushed the model toward a different role than the dream category you picked."
                      : detailKind === "uncertain"
                        ? "Your traits matched the top role, but scores were spread out—try tweaking traits to see numbers shift."
                        : "Your traits and animal pattern fit this role strongly in the model’s view."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={onContinueToStory}
                className="min-h-[52px] w-full max-w-md rounded-2xl border-2 border-sky-900 bg-sky-400 px-6 font-serif text-lg font-bold text-sky-950 shadow-[4px_4px_0_0_rgba(30,58,138,0.25)] transition hover:translate-y-px hover:bg-sky-300"
              >
                See how Zoo City works →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
