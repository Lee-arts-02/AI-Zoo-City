"use client";

import { useGameState } from "@/lib/gameState";
import { resolveZooAnimalInput } from "@/data/zooAnimalDataset";
import {
  DREAM_JOBS,
  extractKnownTraitsFromText,
  getAnimalDisplayName,
  getAnimalEmojiForLearner,
  getResolvedAnimalKey,
  isLearnerProfileComplete,
  parseFreeTraitTokens,
  PRESET_ANIMALS,
  SUGGESTED_TRAITS,
} from "@/lib/learnerUtils";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import type { DreamJob, PresetAnimal } from "@/types/game";
import { useCallback, useEffect, useId, useRef, useState } from "react";

/** Robot guide intro — same pacing as Home Page typing sequence */
const STEP1_INTRO_SENTENCES = [
  "In this city, every animal is matched to a job by an AI Career System.",
  "Before you enter, the system needs to know who you are.",
] as const;
const STEP1_CHAR_MS = 32;
const STEP1_BETWEEN_SENTENCE_MS = 650;

export type Step1WelcomeProps = {
  onEnterAISystem: () => void;
};

/**
 * Step 1 — Welcome, character creation, live card, enter AI system
 */
export function Step1Welcome({ onEnterAISystem }: Step1WelcomeProps) {
  const { state, dispatch } = useGameState();
  const { learner } = state;
  const [traitInput, setTraitInput] = useState("");
  const traitFieldId = useId();
  const nameFieldId = useId();

  const selectedPreset = learner.presetAnimal;
  const custom = learner.customAnimal;
  const hasCustomFocus = custom.trim().length > 0 && selectedPreset === null;

  const selectPreset = (id: PresetAnimal) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { presetAnimal: id, customAnimal: "" },
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
      dispatch({
        type: "SET_LEARNER",
        learner: { presetAnimal: r.key as PresetAnimal, customAnimal: "" },
      });
    }
  };

  const toggleTrait = (t: string) => {
    const set = new Set(learner.traits);
    if (set.has(t)) set.delete(t);
    else if (set.size < 3) set.add(t);
    dispatch({
      type: "SET_LEARNER",
      learner: { traits: [...set].sort() },
    });
  };

  const addTraitsFromText = () => {
    const fromTyping = parseFreeTraitTokens(traitInput);
    const fromModel = extractKnownTraitsFromText(traitInput);
    const merged = [...new Set([...learner.traits, ...fromTyping, ...fromModel])].slice(
      0,
      3,
    );
    dispatch({ type: "SET_LEARNER", learner: { traits: merged } });
    setTraitInput("");
  };

  const setDreamJob = (id: DreamJob) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { dreamJob: id, customDreamJob: "" },
    });
    setDreamCustomMode(false);
  };

  const chooseCustomDreamRole = () => {
    dispatch({ type: "SET_LEARNER", learner: { dreamJob: null } });
    setDreamCustomMode(true);
  };

  const setCustomDreamJob = (value: string) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { dreamJob: null, customDreamJob: value },
    });
  };

  const [dreamCustomMode, setDreamCustomMode] = useState(false);
  useEffect(() => {
    if (learner.customDreamJob.trim().length > 0) setDreamCustomMode(true);
    if (learner.dreamJob) setDreamCustomMode(false);
  }, [learner.customDreamJob, learner.dreamJob]);

  const complete = isLearnerProfileComplete(learner);
  const displayName = getAnimalDisplayName(learner);

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
              1. Choose your animal
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
            aria-labelledby="step1-traits-heading"
          >
            <h2
              id="step1-traits-heading"
              className="mb-2 text-center font-serif text-2xl font-bold text-amber-950 md:text-3xl"
            >
              2. Describe yourself
            </h2>
            <p className="mx-auto mb-6 max-w-2xl text-center font-serif text-sm text-amber-900/85 md:text-base">
              Pick up to three traits from the suggestions, or add your own words
              below.
            </p>
            <h3 className="mb-3 text-center font-serif text-base font-semibold text-amber-950">
              Suggested traits
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {SUGGESTED_TRAITS.map((t) => {
                const on = learner.traits.includes(t);
                const disabled = !on && learner.traits.length >= 3;
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleTrait(t)}
                    className={[
                      "rounded-full border-2 px-3 py-1.5 font-serif text-sm font-semibold transition",
                      on
                        ? "border-amber-700 bg-amber-300 text-amber-950 shadow-sm"
                        : disabled
                          ? "cursor-not-allowed border-amber-200/50 bg-amber-50/50 text-amber-800/40"
                          : "border-amber-300 bg-white text-amber-950 hover:border-amber-500",
                    ].join(" ")}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-amber-300/70 bg-amber-50/50 p-5 md:p-6">
              <h3 className="mb-2 text-center font-serif text-base font-semibold text-amber-950">
                Your own words
              </h3>
              <p className="mb-4 text-center font-serif text-sm text-amber-900/80">
                Type trait words (e.g. <em>clever</em>, <em>brave</em>), then add
                them to your card.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={traitFieldId}
                    className="font-serif text-sm font-medium text-amber-900"
                  >
                    Your words
                  </label>
                  <input
                    id={traitFieldId}
                    type="text"
                    value={traitInput}
                    onChange={(e) => setTraitInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTraitsFromText();
                      }
                    }}
                    placeholder="Type trait words…"
                    className="mt-1 w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={addTraitsFromText}
                  className="shrink-0 rounded-xl border-2 border-amber-700 bg-amber-200 px-4 py-2 font-serif text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-300"
                >
                  Add words
                </button>
              </div>
              <p className="mt-3 text-center font-serif text-xs text-amber-800/70">
                Add words shows them on your card (max 3). Known words also
                nudge the AI model.
              </p>
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
              3. Dream job
            </h2>
            <h3 className="mb-3 text-center font-serif text-base font-semibold text-amber-950">
              Preset roles
            </h3>
            <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4">
              {DREAM_JOBS.map((j) => {
                const isOn =
                  learner.dreamJob === j.id &&
                  learner.customDreamJob.trim().length === 0;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setDreamJob(j.id)}
                    className={[
                      "rounded-2xl border-4 p-3 text-center font-serif transition",
                      isOn
                        ? "border-orange-500 bg-orange-100 shadow-[4px_4px_0_0_rgba(234,88,12,0.35)]"
                        : "border-amber-200/80 bg-white/70 hover:border-orange-300",
                    ].join(" ")}
                  >
                    <span className="text-2xl" aria-hidden>
                      {j.emoji}
                    </span>
                    <span className="mt-1 block text-xs font-semibold text-amber-950 sm:text-sm">
                      {j.label}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={chooseCustomDreamRole}
                className={[
                  "rounded-2xl border-4 p-3 text-center font-serif transition",
                  dreamCustomMode ||
                  (learner.dreamJob === null &&
                    learner.customDreamJob.trim().length > 0)
                    ? "border-orange-500 bg-orange-100 shadow-[4px_4px_0_0_rgba(234,88,12,0.35)]"
                    : "border-amber-200/80 bg-white/70 hover:border-orange-300",
                ].join(" ")}
              >
                <span className="text-2xl" aria-hidden>
                  ✨
                </span>
                <span className="mt-1 block text-xs font-semibold text-amber-950 sm:text-sm">
                  Custom
                </span>
              </button>
            </div>
            <div className="mx-auto mt-8 max-w-2xl rounded-2xl border-2 border-amber-300/70 bg-amber-50/50 p-5 md:p-6">
              <h3 className="mb-2 text-center font-serif text-base font-semibold text-amber-950">
                Custom dream role
              </h3>
              <p className="mb-4 text-center font-serif text-sm text-amber-900/80">
                Describe any role you like. It stays on your card as{" "}
                <em>your</em> dream — the machine&apos;s prediction clues use
                your animal and traits, not this dream label.
              </p>
              <label className="mx-auto block max-w-lg font-serif text-sm font-medium text-amber-900">
                Your dream
                <input
                  type="text"
                  value={learner.customDreamJob}
                  onChange={(e) => setCustomDreamJob(e.target.value)}
                  placeholder="e.g. Marine biologist, game designer…"
                  className="mt-1 w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </label>
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
                Pick a Zoo City animal (grid or typed), at least one trait, and
                a dream role (preset or custom) to continue.
              </p>
            )}
            <button
              type="button"
              disabled={!complete}
              onClick={onEnterAISystem}
              className="min-h-[52px] w-full max-w-md rounded-2xl border-2 border-amber-900 bg-gradient-to-r from-amber-400 to-orange-400 px-6 font-serif text-lg font-bold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.3)] transition enabled:hover:translate-y-px enabled:hover:from-amber-300 enabled:hover:to-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enter the AI System →
            </button>
          </div>

          <aside
            className="mx-auto mt-4 w-full max-w-lg rounded-2xl border-4 border-amber-300 bg-gradient-to-br from-white to-amber-100/90 p-6 shadow-[6px_6px_0_0_rgba(217,119,6,0.25)]"
            aria-live="polite"
          >
          <p className="mb-2 text-center font-serif text-xs font-bold uppercase tracking-widest text-amber-800/80">
            Live character card
          </p>
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="text-4xl" aria-hidden>
              {getAnimalEmojiForLearner(learner)}
            </span>
            <span className="font-serif text-lg font-semibold capitalize text-amber-950">
              {displayName}
            </span>
          </div>
          <p className="text-center font-serif text-base leading-relaxed text-amber-950">
            {learner.description}
          </p>
          {learner.traits.length > 0 && (
            <ul className="mt-3 flex flex-wrap justify-center gap-1">
              {learner.traits.map((t) => (
                <li
                  key={t}
                  className="rounded-full bg-amber-200/80 px-2 py-0.5 font-serif text-xs font-medium text-amber-950"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
          </aside>
        </div>
      </div>
    </section>
  );
}
