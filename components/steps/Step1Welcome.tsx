"use client";

import { useGameState } from "@/lib/gameState";
import { resolveZooAnimalInput } from "@/data/zooAnimalDataset";
import {
  DREAM_PATH_LABELS,
  getDreamDistrictForJob,
  getResolvedAnimalKey,
  isRepresentativeDreamJobLabel,
  isLearnerProfileComplete,
  matchDreamJobInput,
  PRESET_ANIMALS,
  REPRESENTATIVE_DREAM_JOBS,
} from "@/lib/learnerUtils";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { AnimalProfileCard } from "@/components/shared/AnimalProfileCard";
import {
  buildLearnerProfileCardData,
  getDefaultProfileFeatures,
} from "@/lib/profileFeatures";
import type { DreamJob, JobId, PresetAnimal } from "@/types/game";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/** Robot guide intro — same pacing as Home Page typing sequence */
const STEP1_INTRO_SENTENCES = [
  "In this city, every animal is matched to a job by an AI Career System.",
  "Before you enter, the system needs to know who you are.",
] as const;
const STEP1_CHAR_MS = 40;
const STEP1_BETWEEN_SENTENCE_MS = 850;

export type Step1WelcomeProps = {
  onEnterAISystem: () => void;
};

/**
 * Step 1 — Welcome, character creation, live card, enter AI system
 */
export function Step1Welcome({ onEnterAISystem }: Step1WelcomeProps) {
  const { state, dispatch } = useGameState();
  const { learner } = state;
  const [customDreamInput, setCustomDreamInput] = useState(() =>
    learner.dreamJob && !isRepresentativeDreamJobLabel(learner.dreamJob)
      ? learner.dreamJob
      : "",
  );
  const nameFieldId = useId();

  const selectedPreset = learner.presetAnimal;
  const custom = learner.customAnimal;
  const hasCustomFocus = custom.trim().length > 0 && selectedPreset === null;

  const selectPreset = (id: PresetAnimal) => {
    const defaults = getDefaultProfileFeatures(id);
    dispatch({
      type: "SET_LEARNER",
      learner: {
        presetAnimal: id,
        customAnimal: "",
        diet: defaults?.diet ?? learner.diet,
        size: defaults?.size ?? learner.size,
      },
    });
  };

  const onCustomChange = (value: string) => {
    if (value.trim().length > 0) {
      dispatch({
        type: "SET_LEARNER",
        learner: { presetAnimal: null, customAnimal: value },
      });
    } else {
      dispatch({ type: "SET_LEARNER", learner: { customAnimal: value } });
    }
  };

  const onCustomBlur = () => {
    const t = learner.customAnimal.trim();
    if (!t || learner.presetAnimal !== null) return;
    const r = resolveZooAnimalInput(t);
    if (r) {
      const defaults = getDefaultProfileFeatures(r.key);
      dispatch({
        type: "SET_LEARNER",
        learner: {
          presetAnimal: r.key as PresetAnimal,
          customAnimal: "",
          diet: defaults?.diet ?? learner.diet,
          size: defaults?.size ?? learner.size,
        },
      });
    }
  };

  const setDreamJob = (id: DreamJob) => {
    dispatch({
      type: "SET_LEARNER",
      learner: {
        dreamJob: id,
        dreamDistrict: getDreamDistrictForJob(id),
        customDreamJob: "",
      },
    });
  };

  const setCustomDreamJobInput = (value: string) => {
    setCustomDreamInput(value);
    const trimmed = value.trim();
    if (!trimmed) {
      if (
        learner.dreamJob &&
        !isRepresentativeDreamJobLabel(learner.dreamJob)
      ) {
        dispatch({
          type: "SET_LEARNER",
          learner: { dreamJob: null, dreamDistrict: null, customDreamJob: "" },
        });
      }
      return;
    }

    const matched = matchDreamJobInput(trimmed);
    dispatch({
      type: "SET_LEARNER",
      learner: {
        dreamJob: matched?.label ?? trimmed,
        dreamDistrict: matched?.district ?? null,
        customDreamJob: "",
      },
    });
  };

  const chooseCustomDreamPath = (district: JobId) => {
    const trimmed = customDreamInput.trim();
    if (!trimmed) return;
    dispatch({
      type: "SET_LEARNER",
      learner: {
        dreamJob: trimmed,
        dreamDistrict: district,
        customDreamJob: "",
      },
    });
  };

  const complete = isLearnerProfileComplete(learner);
  const profileCard = buildLearnerProfileCardData(learner);

  const hasAnimal =
    learner.presetAnimal !== null || learner.customAnimal.trim().length > 0;

  const animalUnsupported =
    learner.presetAnimal === null &&
    learner.customAnimal.trim().length > 0 &&
    getResolvedAnimalKey(learner) === null;

  const onDrawingChange = useCallback(
    (dataUrl: string | null) => {
      dispatch({ type: "SET_LEARNER", learner: { drawingDataUrl: dataUrl } });
    },
    [dispatch],
  );

  const [introSentenceIndex, setIntroSentenceIndex] = useState(0);
  const [introTypedText, setIntroTypedText] = useState("");
  const [introIsTyping, setIntroIsTyping] = useState(false);
  const introPauseRef = useRef<number | null>(null);

  useEffect(() => {
    if (introSentenceIndex >= STEP1_INTRO_SENTENCES.length) return;

    const full = STEP1_INTRO_SENTENCES[introSentenceIndex];
    let i = 0;
    setIntroTypedText("");
    setIntroIsTyping(true);

    const id = window.setInterval(() => {
      i += 1;
      setIntroTypedText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(id);
        setIntroIsTyping(false);
        const pauseId = window.setTimeout(() => {
          if (introSentenceIndex < STEP1_INTRO_SENTENCES.length - 1) {
            setIntroSentenceIndex((s) => s + 1);
          }
        }, STEP1_BETWEEN_SENTENCE_MS);
        introPauseRef.current =
          typeof pauseId === "number" ? pauseId : null;
      }
    }, STEP1_CHAR_MS);

    return () => {
      window.clearInterval(id);
      const p = introPauseRef.current;
      if (p != null) window.clearTimeout(p);
      introPauseRef.current = null;
    };
  }, [introSentenceIndex]);

  return (
    <section
      className="rounded-3xl border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50 p-6 shadow-[8px_8px_0_0_rgba(251,191,36,0.4)] sm:p-8"
      aria-labelledby="step1-title"
    >
      <div className="w-full max-w-[1000px] mx-auto px-4 md:px-6">
        <h2 id="step1-title" className="sr-only">
          Create your Zoo City character
        </h2>

        <div className="mb-10 md:mb-12">
          <div className="flex flex-col items-stretch gap-6 md:gap-8 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex flex-shrink-0 justify-center lg:justify-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/robot.png"
                alt="Friendly robot guide"
                className="animate-home-robot-enter h-auto max-h-[200px] w-auto max-w-[min(100%,220px)] object-contain sm:max-h-[240px]"
              />
            </div>
            <div
              className="min-w-0 flex-1 rounded-3xl border-2 border-amber-200/90 bg-amber-50/90 p-5 shadow-[6px_6px_0_0_rgba(251,191,36,0.2)] backdrop-blur-sm md:p-7"
              aria-live="polite"
            >
              <p className="min-h-[4.5rem] font-serif text-base leading-relaxed text-amber-950 sm:text-lg md:min-h-[5rem] md:text-xl md:leading-relaxed">
                {introTypedText}
                {introIsTyping ? (
                  <span
                    className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-amber-700 align-middle"
                    aria-hidden
                  />
                ) : null}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-10 md:gap-12">
          <section className="w-full">
            <label
              htmlFor={nameFieldId}
              className="mx-auto block max-w-xl font-serif text-sm font-semibold text-amber-900"
            >
              Your name
              <input
                id={nameFieldId}
                type="text"
                value={learner.name}
                onChange={(e) =>
                  dispatch({
                    type: "SET_LEARNER",
                    learner: { name: e.target.value.slice(0, 30) },
                  })
                }
                onBlur={(e) =>
                  dispatch({
                    type: "SET_LEARNER",
                    learner: {
                      name: e.target.value.trim().slice(0, 30),
                    },
                  })
                }
                placeholder="Enter your name"
                autoComplete="name"
                className="mt-2 w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </label>
          </section>

          <section
            className="w-full"
            aria-labelledby="step1-animal-heading"
          >
            <h2
              id="step1-animal-heading"
              className="mb-6 text-center font-serif text-2xl font-bold text-amber-950 md:text-3xl"
            >
              1. Create your animal profile
            </h2>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {PRESET_ANIMALS.map((a) => {
                const isOn = selectedPreset === a.id && !hasCustomFocus;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => selectPreset(a.id)}
                    className={[
                      "rounded-2xl border-4 p-3 text-center font-serif transition",
                      isOn
                        ? "border-amber-600 bg-amber-100 shadow-[4px_4px_0_0_rgba(180,83,9,0.35)]"
                        : "border-amber-200/80 bg-white/70 hover:border-amber-400",
                    ].join(" ")}
                  >
                    <span className="text-2xl" aria-hidden>
                      {a.emoji}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-amber-950 sm:text-sm">
                      {a.label}
                    </span>
                  </button>
                );
              })}
            </div>
            <label className="mx-auto mt-6 block max-w-xl font-serif text-sm font-semibold text-amber-900">
              Or type another animal from Zoo City&apos;s list
              <input
                type="text"
                value={custom}
                onChange={(e) => onCustomChange(e.target.value)}
                onBlur={onCustomBlur}
                placeholder="e.g. penguin, owl, panda…"
                className="mt-2 w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </label>
            {animalUnsupported ? (
              <p
                className="mx-auto mt-3 max-w-xl text-center font-serif text-sm text-orange-800"
                role="status"
              >
                Zoo City has not detected that animal yet.
              </p>
            ) : null}
          </section>

          <section
            className="w-full"
            aria-labelledby="step1-features-heading"
          >
            <h2
              id="step1-features-heading"
              className="mb-3 text-center font-serif text-2xl font-bold text-amber-950 md:text-3xl"
            >
              2. Review default diet and size
            </h2>
            <p className="mx-auto mb-5 max-w-2xl text-center font-serif text-sm text-amber-900/85 md:text-base">
              These classifier features are fixed by Zoo City&apos;s animal card.
              You can see them here, but you cannot change them.
            </p>
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-amber-300/70 bg-white/80 p-4">
                <p className="mb-3 text-center font-serif text-sm font-bold uppercase tracking-wide text-amber-800">
                  Diet
                </p>
                <ReadOnlyFeatureValue value={profileCard.diet} fallback="Choose an animal first" />
              </div>
              <div className="rounded-2xl border-2 border-amber-300/70 bg-white/80 p-4">
                <p className="mb-3 text-center font-serif text-sm font-bold uppercase tracking-wide text-amber-800">
                  Size
                </p>
                <ReadOnlyFeatureValue value={profileCard.size} fallback="Choose an animal first" />
              </div>
            </div>
          </section>

          <section
            className="w-full"
            aria-labelledby="step1-dream-heading"
          >
            <h2
              id="step1-dream-heading"
              className="mb-6 text-center font-serif text-2xl font-bold text-amber-950 md:text-3xl"
            >
              3. Human dream
            </h2>
            <p className="mx-auto mb-3 max-w-2xl text-center font-serif text-lg font-semibold text-amber-950">
              What kind of dream job do you want?
            </p>
            <p className="mx-auto mb-6 max-w-2xl text-center font-serif text-sm text-amber-900/85 md:text-base">
              Pick a path, or type your own dream job. The AI classifier uses
              size and diet, not your dream, to classify.
            </p>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {REPRESENTATIVE_DREAM_JOBS.map((j) => {
                const isOn =
                  learner.dreamJob === j.label &&
                  learner.dreamDistrict === j.district &&
                  customDreamInput.trim().length === 0;
                return (
                  <button
                    key={j.key}
                    type="button"
                    onClick={() => {
                      setCustomDreamInput("");
                      setDreamJob(j.label);
                    }}
                    aria-pressed={isOn}
                    className={[
                      "rounded-2xl border-4 p-3 text-center font-serif transition",
                      isOn
                        ? "border-orange-500 bg-orange-100 shadow-[4px_4px_0_0_rgba(234,88,12,0.35)]"
                        : "border-amber-200/80 bg-white/80 hover:border-orange-300",
                    ].join(" ")}
                  >
                    <span className="text-2xl" aria-hidden>
                      {j.emoji}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-amber-950">
                      {j.label}
                    </span>
                    <span className="mt-1 block text-xs font-medium text-amber-800/80">
                      {j.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-amber-300/70 bg-amber-50/50 p-5 md:p-6">
              <label className="block font-serif text-sm font-semibold text-amber-900">
                Or type your own dream job
                <input
                  type="text"
                  value={customDreamInput}
                  onChange={(e) =>
                    setCustomDreamJobInput(e.target.value.slice(0, 80))
                  }
                  placeholder="e.g. doctor, robot engineer, film maker…"
                  className="mt-2 w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </label>
              {customDreamInput.trim().length > 0 && learner.dreamDistrict ? (
                <p className="mt-3 text-center font-serif text-sm text-amber-900/80">
                  Zoo City connects this dream to the{" "}
                  <strong>{DREAM_PATH_LABELS[learner.dreamDistrict]}</strong>{" "}
                  path.
                </p>
              ) : null}
              {customDreamInput.trim().length > 0 && !learner.dreamDistrict ? (
                <div className="mt-4 rounded-xl border border-orange-200 bg-white/75 p-4">
                  <p className="text-center font-serif text-sm font-semibold text-amber-950">
                    Which path is this dream closest to?
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {REPRESENTATIVE_DREAM_JOBS.map((j) => (
                      <button
                        key={`custom-${j.key}`}
                        type="button"
                        onClick={() => chooseCustomDreamPath(j.district)}
                        className="rounded-xl border-2 border-amber-200 bg-white px-3 py-2 font-serif text-sm font-semibold text-amber-950 hover:border-orange-300 hover:bg-orange-50"
                      >
                        {j.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section
            className="w-full"
            aria-labelledby="step1-draw-heading"
          >
            <h2
              id="step1-draw-heading"
              className="mb-6 text-center font-serif text-2xl font-bold text-amber-950 md:text-3xl"
            >
              4. Draw your animal
            </h2>
            {hasAnimal ? (
              <div className="mx-auto max-w-xl rounded-2xl border-2 border-amber-300/80 bg-white/80 p-5 shadow-inner md:p-6">
                <h3 className="mb-1 text-center font-serif text-xl font-bold text-amber-950 md:text-2xl">
                  Draw your animal
                </h3>
                <p className="mb-4 text-center font-serif text-sm text-amber-900/80">
                  Show how you imagine your character in Zoo City — you can
                  change this anytime before the end.
                </p>
                <DrawingCanvas
                  variant="step1"
                  initialData={learner.drawingDataUrl}
                  onChange={onDrawingChange}
                />
              </div>
            ) : (
              <p className="mx-auto max-w-xl text-center font-serif text-sm text-amber-900/75">
                Choose an animal above (or name your own), then you can draw
                your character here.
              </p>
            )}
          </section>

          <div className="flex flex-col items-center gap-4 pt-4">
            {!complete && (
              <p className="max-w-lg text-center font-serif text-sm text-orange-800">
                Pick a Zoo City animal, review its default diet and size, and choose a dream job path to continue.
              </p>
            )}
            <button
              type="button"
              disabled={!complete}
              onClick={onEnterAISystem}
              className="min-h-[52px] w-full max-w-md rounded-2xl border-2 border-amber-900 bg-gradient-to-r from-amber-400 to-orange-400 px-6 font-serif text-lg font-bold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.3)] transition enabled:hover:translate-y-px enabled:hover:from-amber-300 enabled:hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enter the AI Classifier →
            </button>
          </div>

          <AnimalProfileCard
            profile={profileCard}
            title="Live Animal Profile"
            className="mx-auto mt-4 w-full max-w-lg"
          />
        </div>
      </div>
    </section>
  );
}

function ReadOnlyFeatureValue({
  value,
  fallback,
}: {
  value: string | null | undefined;
  fallback: string;
}) {
  const display = value ?? fallback;
  const hasValue = Boolean(value);

  return (
    <div
      className={[
        "rounded-2xl border-2 px-4 py-3 text-center font-serif shadow-inner",
        hasValue
          ? "border-sky-300 bg-sky-50 text-sky-950"
          : "border-amber-200 bg-amber-50/70 text-amber-800/70",
      ].join(" ")}
      aria-readonly="true"
    >
      <p className="text-lg font-black">{display}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-70">
        Fixed default
      </p>
    </div>
  );
}
