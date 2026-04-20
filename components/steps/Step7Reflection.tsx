"use client";

import { DrawingCanvas } from "@/components/DrawingCanvas";
import {
  CERTIFICATE_CLOSING,
  CERTIFICATE_PERSONALIZED,
  CHOICE_LABEL,
  REFLECTION_VARIANTS,
} from "@/lib/step7Copy";
import {
  buildShareSnapshotFromGameState,
  encodeShareSnapshot,
} from "@/lib/shareSnapshot";
import { titleForRetrainedPrediction } from "@/lib/predictionDisplay";
import { buildPredictionComparisonPayload } from "@/lib/step7PredictionComparison";
import { getAiSuggestedJob } from "@/lib/step7AiSuggest";
import { useGameState } from "@/lib/gameState";
import {
  DREAM_JOBS,
  extractKnownTraitsFromText,
  formatLearnerNameForDisplay,
  getAnimalDisplayName,
  getDreamDisplayLabel,
  parseFreeTraitTokens,
  PRESET_ANIMALS,
  SUGGESTED_TRAITS,
} from "@/lib/learnerUtils";
import type { DreamJob, PresetAnimal, Step7CareerChoice } from "@/types/game";
import { Step7DrawRobotPrompt } from "@/components/step7/Step7DrawRobotPrompt";
import { Step7PredictionReveal } from "@/components/step7/Step7PredictionReveal";
import { Step7SharePanel } from "@/components/step7/Step7SharePanel";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import QRCode from "react-qr-code";

function formatTraits(traits: string[]): string {
  if (traits.length === 0) return "—";
  return traits
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(", ");
}

function jobLabel(id: DreamJob): string {
  return DREAM_JOBS.find((j) => j.id === id)?.label ?? id;
}

/** Intro — bold “predictions”; shared by on-screen certificate and PNG export. */
function CertificateIntroParagraph({ className }: { className?: string }) {
  return (
    <p className={className}>
      You audited our AI system, learned how it makes <strong>predictions</strong>, and
      constructed your own way to make it better.
    </p>
  );
}

/** “What You Discovered” — shared by on-screen certificate and PNG export; bold key terms. */
function CertificateWhatYouDiscoveredList({ ulClassName }: { ulClassName: string }) {
  return (
    <ul className={ulClassName}>
      <li>
        The system works with small pieces called <strong>tokens</strong>
      </li>
      <li>
        It makes <strong>predictions</strong> based on past patterns
      </li>
      <li>
        Predictions are not final decisions, but{" "}
        <strong>people still belong in the loop</strong>
      </li>
    </ul>
  );
}

/** Match Step 1 welcome robot typing pace */
const STEP7_PHASE1_CHAR_MS = 32;
const STEP7_PHASE1_BETWEEN_MS = 650;

export function Step7Reflection() {
  const { state, dispatch } = useGameState();
  const learner = state.learner;
  const phase = state.progress.step7Phase;
  const choice = state.progress.step7CareerChoice;
  const drawingUrl = state.progress.step7DrawingDataUrl;
  /** Final drawing: Step 7 “Done” snapshot, or Step 1 drawing as fallback. */
  const displayDrawingUrl = drawingUrl ?? learner.drawingDataUrl;
  const reflectionKept = state.progress.step7ReflectionSentence;

  /** Preset or custom profession — custom text wins when filled (same as Step 1). */
  const dreamLabel = getDreamDisplayLabel(learner);

  const predictionPayload = useMemo(
    () => buildPredictionComparisonPayload(state),
    [state],
  );
  /** “AI Suggests” uses the same retrained top role as Step 6 / prediction reveal (city + hub evidence), not the raw Step-4 token fusion. */
  const aiSuggestLabel = useMemo(() => {
    if (predictionPayload.predictionReady) {
      return titleForRetrainedPrediction(predictionPayload.currentTop);
    }
    return jobLabel(getAiSuggestedJob(learner));
  }, [predictionPayload, learner]);

  const shareUrl = useMemo(() => {
    const snap = buildShareSnapshotFromGameState(state, {
      cityName: "Zoo City",
      originalGamePath: "/zoo-city",
    });
    const p = encodeShareSnapshot(snap);
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/share?p=${encodeURIComponent(p)}`;
  }, [state]);

  const [shuffleIx, setShuffleIx] = useState(0);
  useEffect(() => {
    if (phase === 4) setShuffleIx(0);
  }, [phase]);

  /** Re-run draw-phase typewriter when user re-enters phase 3 (e.g. 2→3 or 4→3). */
  const [drawRobotLineKey, setDrawRobotLineKey] = useState(0);
  const prevPhaseForDrawRef = useRef<number | null>(null);
  useEffect(() => {
    if (phase === 3 && prevPhaseForDrawRef.current !== 3) {
      setDrawRobotLineKey((k) => k + 1);
    }
    prevPhaseForDrawRef.current = phase;
  }, [phase]);

  const variants = choice ? REFLECTION_VARIANTS[choice] : [];
  const draftSentence =
    variants.length > 0 ? variants[shuffleIx % variants.length] : "";

  const exportRef = useRef<HTMLDivElement>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);

  const setPhase = useCallback(
    (p: 0 | 1 | 2 | 3 | 4 | 5) => {
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

  const onDrawingChange = useCallback(
    (dataUrl: string | null) => {
      dispatch({ type: "SET_LEARNER", learner: { drawingDataUrl: dataUrl } });
      if (dataUrl === null) {
        dispatch({
          type: "MARK_PROGRESS",
          patch: { step7DrawingDataUrl: null },
        });
      }
    },
    [dispatch],
  );

  const onDrawingDone = (dataUrl: string) => {
    dispatch({
      type: "SET_LEARNER",
      learner: { drawingDataUrl: dataUrl },
    });
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
      case 0:
        return "";
      case 1:
        return "";
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
    if (phase >= 0 && phase <= 4) return `Step ${phase + 1} / 6`;
    if (phase === 5) return "Complete";
    return "";
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
  const [nameEditing, setNameEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState("");

  const formattedLearnerName = formatLearnerNameForDisplay(learner.name);

  const step7Phase1Sentences = useMemo(() => {
    const n = formattedLearnerName.trim().length > 0 ? formattedLearnerName : "friend";
    return [
      `Thank you so much, ${n}. How do you feel about your new Zoo City?`,
      "Now you have a new chance to redesign your own character.",
      'If you have new ideas, click "Small Edits" to make changes.',
    ];
  }, [formattedLearnerName]);

  const [step7IntroIx, setStep7IntroIx] = useState(0);
  const [step7IntroTyped, setStep7IntroTyped] = useState("");
  const [step7IntroTyping, setStep7IntroTyping] = useState(false);
  const step7IntroPauseRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== 1) return;
    setStep7IntroIx(0);
    setStep7IntroTyped("");
    setStep7IntroTyping(false);
  }, [phase, step7Phase1Sentences]);

  useEffect(() => {
    if (phase !== 1) return;
    if (step7IntroIx >= step7Phase1Sentences.length) return;

    const full = step7Phase1Sentences[step7IntroIx]!;
    let i = 0;
    setStep7IntroTyped("");
    setStep7IntroTyping(true);

    const id = window.setInterval(() => {
      i += 1;
      setStep7IntroTyped(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(id);
        setStep7IntroTyping(false);
        const pauseId = window.setTimeout(() => {
          if (step7IntroIx < step7Phase1Sentences.length - 1) {
            setStep7IntroIx((s) => s + 1);
          }
        }, STEP7_PHASE1_BETWEEN_MS);
        step7IntroPauseRef.current =
          typeof pauseId === "number" ? pauseId : null;
      }
    }, STEP7_PHASE1_CHAR_MS);

    return () => {
      window.clearInterval(id);
      const p = step7IntroPauseRef.current;
      if (p != null) window.clearTimeout(p);
      step7IntroPauseRef.current = null;
    };
  }, [phase, step7IntroIx, step7Phase1Sentences]);

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
        {phase === 0
          ? "Chapter 7"
          : "Chapter 7 — Reflection and final artifact"}
      </p>
      <h2
        id="step7-title"
        className="sr-only"
      >
        Identity, choice, and career connection
      </h2>

      {/* TOP: narrative (hidden on prediction reveal — it has its own header) */}
      {phase !== 0 && narrativeTop ? (
        <p className="mx-auto mb-6 max-w-xl text-center font-serif text-base leading-relaxed text-amber-950/90 sm:text-lg">
          {narrativeTop}
        </p>
      ) : null}

      {/* CENTER: single active stage */}
      <div className="relative mx-auto flex min-h-[min(60vh,520px)] w-full max-w-4xl flex-1 flex-col items-center justify-center">
        {phase === 0 && (
          <Step7PredictionReveal onContinue={() => setPhase(1)} />
        )}

        {phase === 1 && (
          <div className="w-full max-w-lg space-y-6">
            <div className="flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex shrink-0 justify-center sm:justify-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/robot.png"
                  alt=""
                  className="h-auto max-h-[180px] w-auto max-w-[min(100%,200px)] object-contain drop-shadow sm:max-h-[200px]"
                />
              </div>
              <div
                className="min-w-0 flex-1 rounded-3xl border-2 border-amber-200/90 bg-amber-50/90 p-5 shadow-[6px_6px_0_0_rgba(251,191,36,0.2)] backdrop-blur-sm md:p-7"
                aria-live="polite"
              >
                <p className="min-h-[4.5rem] font-serif text-base leading-relaxed text-amber-950 sm:text-lg md:min-h-[5rem] md:text-xl md:leading-relaxed">
                  {step7IntroTyped}
                  {step7IntroTyping ? (
                    <span
                      className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-amber-700 align-middle"
                      aria-hidden
                    />
                  ) : null}
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

              {learner.drawingDataUrl ? (
                <div className="mt-5 border-t border-amber-900/10 pt-4">
                  <p className="mb-2 font-serif text-xs font-medium uppercase tracking-wider text-amber-900/60">
                    Your drawing (from Step 1)
                  </p>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                  <img
                    src={learner.drawingDataUrl}
                    alt="Your character drawing from the beginning of the story"
                    className="mx-auto max-h-40 w-full max-w-xs rounded-xl border border-amber-900/15 bg-white object-contain shadow-inner"
                  />
                </div>
              ) : null}

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
          <div className="flex w-full max-w-6xl flex-col gap-6">
            <p className="text-center font-serif text-sm leading-relaxed text-amber-900/85">
              This is your drawing from earlier. You can continue or start over.
            </p>
            <p className="text-center font-serif text-sm italic text-amber-800/70">
              Has your idea changed after exploring Zoo City?
            </p>
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
              <DrawingCanvas
                key="step7-draw-session"
                variant="step7"
                initialData={learner.drawingDataUrl}
                onChange={onDrawingChange}
                onDone={onDrawingDone}
              />
              <div className="flex min-w-0 flex-1 flex-col justify-start lg:pt-1">
                {drawRobotLineKey > 0 ? (
                  <Step7DrawRobotPrompt
                    lineKey={`step7-draw-${drawRobotLineKey}`}
                  />
                ) : (
                  <div
                    className="min-h-[8rem] w-full"
                    aria-hidden
                  />
                )}
              </div>
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
            <div className="w-full text-center">
              <p className="font-serif text-2xl font-semibold leading-snug text-amber-950 sm:text-3xl">
                {formattedLearnerName.length > 0
                  ? `This is ${formattedLearnerName}'s Zoo City design`
                  : "Your Zoo City design"}
              </p>

              {nameEditing ? (
                <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
                  <label className="sr-only" htmlFor="step7-name-edit">
                    Edit your name
                  </label>
                  <input
                    id="step7-name-edit"
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value.slice(0, 30))}
                    placeholder="Enter your name"
                    className="min-h-[44px] w-full rounded-xl border-2 border-amber-300 bg-white px-3 py-2 font-serif text-amber-950 placeholder:text-amber-800/40 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 sm:flex-1"
                    autoComplete="name"
                  />
                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        dispatch({
                          type: "SET_LEARNER",
                          learner: { name: nameDraft.trim().slice(0, 30) },
                        });
                        setNameEditing(false);
                      }}
                      className="rounded-xl border-2 border-amber-800 bg-amber-400 px-4 py-2 font-serif text-sm font-semibold text-amber-950 hover:bg-amber-300"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setNameEditing(false)}
                      className="rounded-xl border border-amber-900/25 bg-white px-4 py-2 font-serif text-sm font-medium text-amber-950 hover:bg-amber-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNameDraft(learner.name);
                    setNameEditing(true);
                  }}
                  className="mt-3 font-serif text-sm font-medium text-amber-800 underline decoration-amber-800/40 underline-offset-2 hover:text-amber-950"
                >
                  Edit name
                </button>
              )}
            </div>

            <div className="flex w-full max-w-2xl flex-col">
              <article className="flex flex-col overflow-hidden rounded-2xl border-2 border-amber-900/20 bg-[#fdfbf7] p-5 shadow-sm">
                <div className="flex justify-center">
                  <div className="h-20 w-36 overflow-hidden rounded-lg border border-amber-900/15 bg-stone-200/80 sm:h-24 sm:w-44">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/zoo-city-begin.png"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <p className="mt-4 text-center font-serif text-lg font-semibold leading-snug text-amber-950 sm:text-xl">
                  🎉 {formattedLearnerName.length > 0 ? formattedLearnerName : "Friend"}, Congratulations! 🎉
                </p>
                <p className="mt-2 text-center font-serif text-base font-semibold text-amber-950/95">
                  You&apos;ve Completed Your Zoo City Journey
                </p>
                <CertificateIntroParagraph className="mx-auto mt-4 max-w-prose text-center font-serif text-sm leading-relaxed text-amber-950/90" />
                {displayDrawingUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={displayDrawingUrl}
                    alt="Your character"
                    className="mx-auto mt-4 max-h-48 w-auto max-w-full rounded-xl border border-amber-900/12 object-contain"
                  />
                ) : null}
                <dl className="mt-4 space-y-1.5 border-t border-amber-900/10 pt-4 font-serif text-sm text-amber-950">
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Animal</dt>
                    <dd className="text-right font-medium">
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
                    <dt className="text-amber-800/75">Dream</dt>
                    <dd className="text-right font-medium">{dreamLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-amber-800/75">Your Choice</dt>
                    <dd className="text-right font-medium">
                      {CHOICE_LABEL[choice]}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-center font-serif text-sm font-medium leading-relaxed text-amber-950/95">
                  {CERTIFICATE_PERSONALIZED[choice]}
                </p>
                <div className="mt-5 border-t border-amber-900/10 pt-4">
                  <p className="text-center font-serif text-sm font-bold text-amber-950">
                    What You Discovered
                  </p>
                  <CertificateWhatYouDiscoveredList ulClassName="mx-auto mt-2 max-w-prose list-inside list-disc space-y-1 font-serif text-sm leading-relaxed text-amber-950/90" />
                </div>
                <p className="mt-4 text-center font-serif text-sm italic text-amber-900/90">
                  “{CERTIFICATE_CLOSING[choice]}”
                </p>

                <div className="mt-8 border-t border-amber-900/15 bg-white/60 px-1 py-6 sm:px-2">
                  <h3 className="text-center font-serif text-lg font-bold text-amber-950">
                    Your Path in Zoo City
                  </h3>
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
                </div>

                <div className="mt-6 flex flex-col items-center border-t border-amber-900/10 pt-5">
                  <div className="rounded-lg bg-white p-2 ring-1 ring-stone-200/80">
                    {shareUrl ? (
                      <QRCode value={shareUrl} size={112} level="M" className="h-auto w-full" />
                    ) : (
                      <div className="flex h-[112px] w-[112px] items-center justify-center font-serif text-xs text-amber-800/60">
                        …
                      </div>
                    )}
                  </div>
                  <p className="mx-auto mt-2 text-center font-serif text-xs text-amber-800/75">
                    Scan to open your share link.
                  </p>
                </div>
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

            <Step7SharePanel />

            {/* Off-screen export (single PNG) */}
            <div className="fixed left-[-9999px] top-0 overflow-hidden">
              <div
                ref={exportRef}
                className="relative flex flex-col items-center overflow-hidden bg-amber-50 p-10"
                style={{ width: 900, minHeight: 1500 }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.14]"
                  aria-hidden
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/zoo-city-begin.png"
                    alt=""
                    className="h-full w-full object-cover blur-[1.5px]"
                  />
                </div>
                <div className="relative z-[1] w-full max-w-[760px] px-2 font-serif text-amber-950">
                  <p className="text-center text-2xl font-semibold leading-snug sm:text-3xl">
                    🎉 {formattedLearnerName.length > 0 ? formattedLearnerName : "Friend"}, Congratulations! 🎉
                  </p>
                  <p className="mt-3 text-center text-xl font-semibold">
                    You&apos;ve Completed Your Zoo City Journey
                  </p>
                  <CertificateIntroParagraph className="mx-auto mt-5 max-w-xl text-center text-lg leading-relaxed" />
                  {displayDrawingUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={displayDrawingUrl}
                      alt=""
                      className="mx-auto mt-8 max-h-[380px] w-auto rounded-2xl border-4 border-white shadow-lg"
                    />
                  ) : null}
                  <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-amber-900/15 bg-white/95 p-6 shadow-sm">
                    <p className="text-center text-lg">
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
                    <p className="mt-2 text-center text-lg">
                      <span className="font-semibold">Dream:</span> {dreamLabel}
                    </p>
                    <p className="mt-2 text-center text-lg">
                      <span className="font-semibold">Your Choice:</span>{" "}
                      {CHOICE_LABEL[choice]}
                    </p>
                    <p className="mt-5 text-center text-lg font-medium leading-relaxed">
                      {CERTIFICATE_PERSONALIZED[choice]}
                    </p>
                  </div>
                  <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-amber-900/12 bg-white/90 p-6 shadow-sm">
                    <p className="text-center text-xl font-bold">What You Discovered</p>
                    <CertificateWhatYouDiscoveredList ulClassName="mx-auto mt-3 max-w-lg list-inside list-disc space-y-2 text-lg leading-relaxed" />
                  </div>
                  <p className="mx-auto mt-8 max-w-xl text-center text-xl italic leading-relaxed text-amber-900/95">
                    “{CERTIFICATE_CLOSING[choice]}”
                  </p>

                  <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-amber-900/12 bg-white/90 p-6 text-left shadow-sm">
                    <p className="text-center text-xl font-bold text-amber-950">
                      Your Path in Zoo City
                    </p>
                    <dl className="mt-4 space-y-2 text-lg">
                      <div className="flex justify-between gap-2">
                        <dt className="text-amber-800/80">Dream</dt>
                        <dd className="font-medium">{dreamLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-amber-800/80">AI Suggests</dt>
                        <dd className="font-medium">{aiSuggestLabel}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt className="text-amber-800/80">Your Choice</dt>
                        <dd className="text-right font-medium">{CHOICE_LABEL[choice]}</dd>
                      </div>
                    </dl>
                    <p className="mt-4 border-t border-amber-900/10 pt-4 leading-relaxed text-amber-950/95">
                      {reflectionKept}
                    </p>
                    <p className="mt-4 leading-relaxed text-amber-900/85">
                      In real life, systems can suggest paths, but people make decisions.
                    </p>
                  </div>

                  <div className="mx-auto mt-10 flex w-full max-w-xl flex-col items-center">
                    <div className="rounded-xl bg-white p-3 ring-2 ring-amber-900/10">
                      {shareUrl ? (
                        <QRCode value={shareUrl} size={160} level="M" />
                      ) : (
                        <div className="flex h-[160px] w-[160px] items-center justify-center text-sm text-amber-800/60">
                          …
                        </div>
                      )}
                    </div>
                    <p className="mt-3 text-center text-sm text-amber-800/80">
                      Scan to open your share link.
                    </p>
                  </div>
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
