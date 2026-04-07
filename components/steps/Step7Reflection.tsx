"use client";

import { Step7DrawingCanvas } from "@/components/steps/step7/Step7DrawingCanvas";
import {
  CERTIFICATE_SHORT,
  CHOICE_LABEL,
  REFLECTION_VARIANTS,
} from "@/lib/step7Copy";
import { getAiSuggestedJob } from "@/lib/step7AiSuggest";
import { useGameState } from "@/lib/gameState";
import {
  DREAM_JOBS,
  extractKnownTraitsFromText,
  getAnimalDisplayName,
  getDreamDisplayLabel,
  parseFreeTraitTokens,
  PRESET_ANIMALS,
  SUGGESTED_TRAITS,
} from "@/lib/learnerUtils";
import type {
  DreamJob,
  LearnerProfile,
  PresetAnimal,
  Step7CareerChoice,
} from "@/types/game";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

function formatTraits(traits: string[]): string {
  if (traits.length === 0) return "—";
  return traits
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(", ");
}

function certificateName(learner: LearnerProfile): string {
  const raw = getAnimalDisplayName(learner);
  if (raw === "mystery animal") return "Zoo City Friend";
  return raw
    .split(/\s+/)
    .map(
      (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join(" ");
}

function jobLabel(id: DreamJob): string {
  return DREAM_JOBS.find((j) => j.id === id)?.label ?? id;
}

export function Step7Reflection() {
  const { state, dispatch } = useGameState();
  const learner = state.learner;
  const afterSrc = state.progress.afterCityImageDataUrl;
  const phase = state.progress.step7Phase;
  const choice = state.progress.step7CareerChoice;
  const drawingUrl = state.progress.step7DrawingDataUrl;
  const reflectionKept = state.progress.step7ReflectionSentence;

  const aiJobId = useMemo(() => getAiSuggestedJob(learner), [learner]);
  /** Preset or custom profession — custom text wins when filled (same as Step 1). */
  const dreamLabel = getDreamDisplayLabel(learner);
  const aiSuggestLabel = jobLabel(aiJobId);

  const [shuffleIx, setShuffleIx] = useState(0);
  useEffect(() => {
    if (phase === 4) setShuffleIx(0);
  }, [phase]);

  const variants = choice ? REFLECTION_VARIANTS[choice] : [];
  const draftSentence =
    variants.length > 0 ? variants[shuffleIx % variants.length] : "";

  const exportRef = useRef<HTMLDivElement>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);

  const setPhase = useCallback(
    (p: 1 | 2 | 3 | 4 | 5) => {
      dispatch({ type: "MARK_PROGRESS", patch: { step7Phase: p } });
    },
    [dispatch],
  );

  const pickChoice = (c: Step7CareerChoice) => {
    dispatch({
      type: "MARK_PROGRESS",
      patch: { step7CareerChoice: c, step7Phase: 3 },
    });
  };

  const onDrawingDone = (dataUrl: string) => {
    dispatch({
      type: "MARK_PROGRESS",
      patch: {
        step7DrawingDataUrl: dataUrl,
        step7Phase: 4,
      },
    });
  };

  const onKeepReflection = () => {
    dispatch({
      type: "MARK_PROGRESS",
      patch: {
        step7ReflectionSentence: draftSentence,
        reflection: draftSentence,
        step7Phase: 5,
      },
    });
  };

  const shuffle = () => {
    if (!choice) return;
    setShuffleIx((i) => i + 1);
  };

  const downloadPng = async () => {
    const node = exportRef.current;
    if (!node) return;
    setDownloadBusy(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        pixelRatio: 2.5,
        cacheBust: true,
        backgroundColor: "#f4f0e8",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "zoo-city-identity.png";
      a.click();
    } finally {
      setDownloadBusy(false);
    }
  };

  const narrativeTop = useMemo(() => {
    switch (phase) {
      case 1:
        return "Take a breath. The city knows you — and you still get to choose.";
      case 2:
        return "Every path here is a mix of pattern and choice.";
      case 3:
        return "Show us how you see yourself in this place.";
      case 4:
        return "Words for what you decided.";
      case 5:
        return "Something to keep, and something to carry forward.";
      default:
        return "";
    }
  }, [phase]);

  const progressLabel = () => {
    if (phase >= 1 && phase <= 4) return `Step ${phase} / 4`;
    return "Complete";
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

  const selectPreset = (id: PresetAnimal) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { presetAnimal: id, customAnimal: "" },
    });
  };

  const setCustomAnimal = (value: string) => {
    if (value.trim().length > 0) {
      dispatch({
        type: "SET_LEARNER",
        learner: { presetAnimal: null, customAnimal: value },
      });
    } else {
      dispatch({ type: "SET_LEARNER", learner: { customAnimal: value } });
    }
  };

  const setDreamJob = (id: DreamJob) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { dreamJob: id, customDreamJob: "" },
    });
  };

  const setCustomDreamJob = (value: string) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { dreamJob: null, customDreamJob: value },
    });
  };

  const hasCustom =
    learner.customAnimal.trim().length > 0 && learner.presetAnimal === null;

  const [traitInput, setTraitInput] = useState("");
  const traitFieldId = useId();

  const addTraitsFromText = useCallback(() => {
    const fromTyping = parseFreeTraitTokens(traitInput);
    const fromModel = extractKnownTraitsFromText(traitInput);
    const merged = [
      ...new Set([...learner.traits, ...fromTyping, ...fromModel]),
    ].slice(0, 3);
    dispatch({ type: "SET_LEARNER", learner: { traits: merged } });
    setTraitInput("");
  }, [dispatch, learner.traits, traitInput]);

  const removeTrait = useCallback(
    (t: string) => {
      dispatch({
        type: "SET_LEARNER",
        learner: { traits: learner.traits.filter((x) => x !== t) },
      });
    },
    [dispatch, learner.traits],
  );

  return (
    <section
      className="step7-enter flex min-h-0 w-full flex-1 flex-col px-4 pb-2 sm:px-6 lg:px-10"
      aria-labelledby="step7-title"
    >
      <p className="mb-3 text-center font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/75">
        Chapter 7 — Reflection &amp; final artifact
      </p>
      <h2
        id="step7-title"
        className="sr-only"
      >
        Identity, choice, and career connection
      </h2>

      {/* TOP: narrative */}
      <p className="mx-auto mb-6 max-w-xl text-center font-serif text-base leading-relaxed text-amber-950/90 sm:text-lg">
        {narrativeTop}
      </p>

      {/* CENTER: single active stage */}
      <div className="relative mx-auto flex min-h-[min(60vh,520px)] w-full max-w-4xl flex-1 flex-col items-center justify-center">
        {phase === 1 && (
          <div className="w-full max-w-lg space-y-6">
            <div className="relative overflow-hidden rounded-3xl border border-amber-900/15 shadow-[0_20px_50px_-20px_rgba(120,53,15,0.25)]">
              {afterSrc ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                  <img
                    src={afterSrc}
                    alt=""
                    className="h-48 w-full scale-105 object-cover opacity-50 blur-md"
                    aria-hidden
                  />
                </>
              ) : (
                <div
                  className="h-48 w-full bg-gradient-to-br from-stone-300/80 to-amber-200/60"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-950/20 to-transparent" />
              <div className="relative px-6 py-8 text-center">
                <p className="font-serif text-xl font-semibold text-amber-950 sm:text-2xl">
                  Now you are part of this city.
                </p>
                <p className="mt-3 font-serif text-lg text-amber-950/90">
                  Who are you here?
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-900/10 bg-white/80 p-6 shadow-inner">
              <p className="mb-4 font-serif text-sm font-medium uppercase tracking-wider text-amber-900/60">
                Identity card
              </p>
              <dl className="space-y-2 font-serif text-amber-950">
                <div className="flex justify-between gap-4">
                  <dt className="text-amber-800/80">Animal</dt>
                  <dd className="font-semibold">
                    {getAnimalDisplayName(learner)
                      .split(/\s+/)
                      .map(
                        (w) =>
                          w.charAt(0).toUpperCase() +
                          w.slice(1).toLowerCase(),
                      )
                      .join(" ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-amber-800/80">Traits</dt>
                  <dd className="text-right font-semibold">
                    {formatTraits(learner.traits)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-amber-800/80">Dream</dt>
                  <dd className="font-semibold">{dreamLabel}</dd>
                </div>
              </dl>

              <details className="mt-5 border-t border-amber-900/10 pt-4">
                <summary className="cursor-pointer font-serif text-sm text-amber-900/70">
                  Small edits (optional)
                </summary>
                <div className="mt-4 space-y-4 text-left">
                  <label className="block font-serif text-xs text-amber-900/70">
                    Animal
                    <select
                      className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2 font-serif text-amber-950"
                      value={hasCustom ? "" : learner.presetAnimal ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") {
                          dispatch({
                            type: "SET_LEARNER",
                            learner: { presetAnimal: null },
                          });
                          return;
                        }
                        selectPreset(v as PresetAnimal);
                      }}
                    >
                      <option value="">Custom name below…</option>
                      {PRESET_ANIMALS.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-serif text-xs text-amber-900/70">
                    Custom animal (if not using list)
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2 font-serif text-amber-950"
                      value={learner.customAnimal}
                      onChange={(e) => setCustomAnimal(e.target.value)}
                      placeholder="e.g. Red panda"
                    />
                  </label>
                  <div>
                    <p className="font-serif text-xs font-medium text-amber-900/80">
                      Traits (up to 3)
                    </p>
                    {learner.traits.length > 0 && (
                      <div className="mt-2">
                        <p className="font-serif text-xs text-amber-900/65">
                          Your traits (tap to remove)
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2">
                        {learner.traits.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => removeTrait(t)}
                            title={`Remove ${t}`}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-700/40 bg-amber-100/90 px-2.5 py-1 font-serif text-sm capitalize text-amber-950 hover:bg-amber-200"
                          >
                            <span aria-hidden>×</span>
                            {t}
                          </button>
                        ))}
                        </div>
                      </div>
                    )}
                    <p className="mt-3 font-serif text-xs text-amber-900/70">
                      Suggested
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {SUGGESTED_TRAITS.map((t) => {
                        const on = learner.traits.includes(t);
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleTrait(t)}
                            className={[
                              "rounded-full border px-3 py-1 font-serif text-sm capitalize",
                              on
                                ? "border-amber-700 bg-amber-200 text-amber-950"
                                : "border-amber-900/15 bg-white text-amber-900/80",
                            ].join(" ")}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-4 rounded-xl border border-amber-900/15 bg-amber-50/50 p-3">
                      <p className="font-serif text-xs font-medium text-amber-900/80">
                        Custom traits
                      </p>
                      <p className="mt-1 font-serif text-xs text-amber-900/65">
                        Type your own words (same as step 1), then add them to
                        your card.
                      </p>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <label
                            htmlFor={traitFieldId}
                            className="sr-only"
                          >
                            Custom trait words
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
                            placeholder="e.g. silly, determined…"
                            className="w-full rounded-lg border border-amber-900/20 bg-white px-3 py-2 font-serif text-sm text-amber-950 placeholder:text-amber-800/40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={addTraitsFromText}
                          className="shrink-0 rounded-lg border border-amber-800 bg-amber-200 px-3 py-2 font-serif text-sm font-semibold text-amber-950 hover:bg-amber-300"
                        >
                          Add words
                        </button>
                      </div>
                    </div>
                  </div>
                  <label className="block font-serif text-xs text-amber-900/70">
                    Dream role (preset)
                    <select
                      className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2 font-serif text-amber-950"
                      value={
                        learner.customDreamJob.trim()
                          ? ""
                          : (learner.dreamJob ?? "")
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") return;
                        setDreamJob(v as DreamJob);
                      }}
                    >
                      <option value="">
                        {learner.customDreamJob.trim()
                          ? "Using custom dream below…"
                          : "Choose…"}
                      </option>
                      {DREAM_JOBS.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block font-serif text-xs text-amber-900/70">
                    Custom dream role (optional)
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border border-amber-900/20 bg-white px-3 py-2 font-serif text-amber-950"
                      value={learner.customDreamJob}
                      onChange={(e) => setCustomDreamJob(e.target.value)}
                      placeholder="Overrides preset when filled"
                    />
                  </label>
                </div>
              </details>

              <button
                type="button"
                onClick={() => setPhase(2)}
                className="mt-6 w-full rounded-2xl border-2 border-amber-800 bg-amber-400 py-3 font-serif text-lg font-semibold text-amber-950 shadow-sm transition hover:bg-amber-300"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {phase === 2 && (
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="rounded-2xl border border-amber-900/12 bg-white/90 px-6 py-8 shadow-inner">
              <p className="font-serif text-sm text-amber-800/80">Your Dream</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-amber-950">
                {dreamLabel}
              </p>
              <p className="mt-6 font-serif text-sm text-amber-800/80">
                AI Suggests
              </p>
              <p className="mt-1 font-serif text-2xl font-semibold text-amber-950">
                {aiSuggestLabel}
              </p>
            </div>
            <p className="font-serif text-xl text-amber-950">
              What would you do?
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => pickChoice("follow_ai")}
                className="rounded-2xl border border-amber-900/20 bg-white px-4 py-4 font-serif text-lg font-medium text-amber-950 shadow-sm transition hover:bg-amber-50"
              >
                Follow the AI suggestion
              </button>
              <button
                type="button"
                onClick={() => pickChoice("own_path")}
                className="rounded-2xl border border-amber-900/20 bg-white px-4 py-4 font-serif text-lg font-medium text-amber-950 shadow-sm transition hover:bg-amber-50"
              >
                Choose my own path
              </button>
              <button
                type="button"
                onClick={() => pickChoice("new_path")}
                className="rounded-2xl border border-amber-900/20 bg-white px-4 py-4 font-serif text-lg font-medium text-amber-950 shadow-sm transition hover:bg-amber-50"
              >
                Create a new path
              </button>
            </div>
          </div>
        )}

        {phase === 3 && (
          <div className="flex w-full max-w-3xl flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
            <Step7DrawingCanvas onDone={onDrawingDone} />
            <div className="flex flex-1 flex-col justify-center font-serif text-amber-950/95 lg:pt-4">
              <p className="text-lg leading-relaxed sm:text-xl">
                Draw yourself in your Zoo City.
              </p>
            </div>
          </div>
        )}

        {phase === 4 && choice && (
          <div className="w-full max-w-lg space-y-6">
            <div className="rounded-2xl border border-amber-900/12 bg-white/95 p-6 shadow-inner">
              <p className="text-center font-serif text-xl leading-relaxed text-amber-950">
                {draftSentence}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={onKeepReflection}
                className="min-h-[48px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-8 font-serif text-lg font-semibold text-amber-950 shadow-sm hover:bg-amber-300"
              >
                Keep
              </button>
              <button
                type="button"
                onClick={shuffle}
                className="min-h-[48px] rounded-2xl border border-amber-900/25 bg-white px-8 font-serif text-lg font-semibold text-amber-950 hover:bg-amber-50"
              >
                Shuffle
              </button>
            </div>
          </div>
        )}

        {phase === 5 && choice && reflectionKept && (
          <div className="flex w-full max-w-3xl flex-col items-center gap-8">
            <div className="grid w-full gap-6 lg:grid-cols-2 lg:gap-8">
              {/* Certificate */}
              <article className="flex flex-col rounded-2xl border-2 border-amber-900/20 bg-[#fdfbf7] p-5 shadow-sm">
                <h3 className="text-center font-serif text-lg font-bold uppercase tracking-wide text-amber-950">
                  Zoo City Co-Designer
                </h3>
                <div className="mt-4 flex justify-center">
                  <div className="h-16 w-28 overflow-hidden rounded-lg border border-amber-900/15 bg-stone-200/80">
                    {afterSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={afterSrc}
                        alt=""
                        className="h-full w-full object-cover opacity-80"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-stone-300 to-amber-200/80" />
                    )}
                  </div>
                </div>
                <p className="mt-4 text-center font-serif text-sm text-amber-900/80">
                  This certifies that
                </p>
                <p className="mt-2 text-center font-serif text-2xl font-semibold text-amber-950">
                  {certificateName(learner)}
                </p>
                <p className="mx-auto mt-4 max-w-[14rem] text-center font-serif text-sm leading-relaxed text-amber-950/90">
                  has redesigned Zoo City making decisions together with AI and
                  creating new possibilities.
                </p>
                <dl className="mt-5 space-y-1 border-t border-amber-900/10 pt-4 font-serif text-sm text-amber-950">
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Animal</dt>
                    <dd className="font-medium">
                      {getAnimalDisplayName(learner)
                        .split(/\s+/)
                        .map(
                          (w) =>
                            w.charAt(0).toUpperCase() +
                            w.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Choice</dt>
                    <dd className="text-right font-medium">
                      {CHOICE_LABEL[choice]}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-center font-serif text-sm italic text-amber-900/85">
                  “{CERTIFICATE_SHORT[choice]}”
                </p>
              </article>

              {/* Career card */}
              <article className="flex flex-col overflow-hidden rounded-2xl border-2 border-amber-900/20 bg-white p-5 shadow-sm">
                <h3 className="text-center font-serif text-lg font-bold text-amber-950">
                  Your Path in Zoo City
                </h3>
                {drawingUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={drawingUrl}
                    alt="Your drawing"
                    className="mx-auto mt-4 max-h-56 w-auto max-w-full rounded-xl border border-amber-900/10 object-contain"
                  />
                ) : null}
                <dl className="mt-4 space-y-2 font-serif text-sm text-amber-950">
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Dream</dt>
                    <dd className="font-medium">{dreamLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">AI Suggests</dt>
                    <dd className="font-medium">{aiSuggestLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Your Choice</dt>
                    <dd className="text-right font-medium">
                      {CHOICE_LABEL[choice]}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 border-t border-amber-900/10 pt-4 font-serif text-sm leading-relaxed text-amber-950/95">
                  {reflectionKept}
                </p>
                <p className="mt-4 font-serif text-sm leading-relaxed text-amber-900/85">
                  In real life, systems can suggest paths, but people make
                  decisions.
                </p>
              </article>
            </div>

            <button
              type="button"
              disabled={downloadBusy}
              onClick={downloadPng}
              className="min-h-[52px] rounded-2xl border-2 border-amber-800 bg-amber-400 px-10 font-serif text-lg font-semibold text-amber-950 shadow-sm transition enabled:hover:bg-amber-300 disabled:opacity-50"
            >
              {downloadBusy ? "Preparing…" : "Download My City Identity"}
            </button>

            {/* Off-screen export (single PNG) */}
            <div className="fixed left-[-9999px] top-0 overflow-hidden">
              <div
                ref={exportRef}
                className="flex flex-col items-center bg-[#f4f0e8] p-10"
                style={{ width: 900, minHeight: 1200 }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-25"
                  aria-hidden
                >
                  {afterSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={afterSrc}
                      alt=""
                      className="h-full w-full object-cover blur-[2px]"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-amber-200/90 to-stone-300/80" />
                  )}
                </div>
                <div className="relative z-[1] w-full max-w-[760px]">
                  <p className="text-center font-serif text-sm font-medium uppercase tracking-widest text-amber-900/70">
                    My Zoo City Identity
                  </p>
                  {drawingUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={drawingUrl}
                      alt=""
                      className="mx-auto mt-6 max-h-[420px] w-auto rounded-2xl border-4 border-white shadow-lg"
                    />
                  ) : null}
                  <div className="mt-8 rounded-2xl border border-amber-900/15 bg-white/95 p-6 font-serif text-amber-950 shadow-sm">
                    <p className="text-center text-sm text-amber-800/80">
                      {certificateName(learner)}
                    </p>
                    <p className="mt-2 text-center text-lg">
                      <span className="font-semibold">Animal:</span>{" "}
                      {getAnimalDisplayName(learner)
                        .split(/\s+/)
                        .map(
                          (w) =>
                            w.charAt(0).toUpperCase() +
                            w.slice(1).toLowerCase(),
                        )
                        .join(" ")}
                    </p>
                    <p className="mt-1 text-center text-lg">
                      <span className="font-semibold">Dream:</span> {dreamLabel}
                    </p>
                    <p className="mt-1 text-center text-lg">
                      <span className="font-semibold">Choice:</span>{" "}
                      {CHOICE_LABEL[choice]}
                    </p>
                    <p className="mt-4 text-center text-base leading-relaxed">
                      {reflectionKept}
                    </p>
                    <p className="mt-4 text-center text-sm italic text-amber-900/85">
                      “{CERTIFICATE_SHORT[choice]}”
                    </p>
                  </div>
                  <p className="mt-8 text-center font-serif text-sm leading-relaxed text-amber-900/90">
                    In real life, systems can suggest paths, but people make
                    decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM: inner step progress */}
      {phase <= 5 && (
        <p
          className="mt-8 text-center font-serif text-sm tabular-nums text-amber-900/65"
          aria-live="polite"
        >
          {progressLabel()}
        </p>
      )}
    </section>
  );
}
