"use client";

import Image from "next/image";
import { ConceptTip } from "@/components/steps/step4/ConceptTip";
import { DemoStageViewport } from "@/components/steps/step4/DemoStageViewport";
import {
  Stage1TokenizationVisual,
  Stage2OneClueVisual,
  Stage3CombineVisual,
  Stage4ReasoningReplayVisual,
} from "@/components/steps/step4/stageVisuals";
import { districtConfig } from "@/data/districtConfig";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  STEP3_ARTWORK_MAX_W_CLASS,
  Step3VisualFrame,
} from "@/components/city/Step3VisualFrame";
import { JOB_DISPLAY } from "@/lib/aiModel";
import {
  distributionFromActiveTokens,
  distributionGivenSingleToken,
  highestImpactTokenId,
  JOB_IDS,
  toPercentages,
  pctDelta,
} from "@/lib/step4Model";
import { buildStep4Tokens } from "@/lib/step4Tokens";
import { useGameState } from "@/lib/gameState";
import {
  getAnimalDisplayName,
  getDreamDisplayLabel,
  getEffectiveDreamJob,
} from "@/lib/learnerUtils";
import type { JobId } from "@/types/game";
import type { DistrictId } from "@/types/city";
import { useCallback, useMemo, useState } from "react";

const ZOO_MAP_INTRINSIC = { width: 1920, height: 1080 };

const STAGE_META = [
  { n: 1, label: "Tokens" },
  { n: 2, label: "One clue" },
  { n: 3, label: "Combine" },
  { n: 4, label: "Chances" },
  { n: 5, label: "Back to city" },
] as const;

/** Fixed demo canvas height — right panel scrolls independently. */
const DEMO_H = "h-[min(52vh,500px)] min-h-[300px] lg:h-[500px]";

export function Step4AISystem() {
  const { state } = useGameState();
  const remountKey = useMemo(
    () =>
      JSON.stringify({
        p: state.learner.presetAnimal,
        c: state.learner.customAnimal.trim(),
        t: state.learner.traits,
        d: state.learner.dreamJob,
        cd: state.learner.customDreamJob.trim(),
      }),
    [
      state.learner.presetAnimal,
      state.learner.customAnimal,
      state.learner.traits,
      state.learner.dreamJob,
      state.learner.customDreamJob,
    ],
  );
  return <Step4AISystemInner key={remountKey} />;
}

function Step4AISystemInner() {
  const { state } = useGameState();
  const sentence = state.learner.description;
  const tokens = useMemo(() => buildStep4Tokens(state.learner), [state.learner]);

  const [stage, setStage] = useState(1);
  const [tokenizationKeyReached, setTokenizationKeyReached] = useState(false);

  const [q1, setQ1] = useState<string | null>(null);
  const [q2, setQ2] = useState<string | null>(null);
  const [q4, setQ4] = useState<string | null>(null);
  const [q5, setQ5] = useState<string | null>(null);

  const [stage2TokenId, setStage2TokenId] = useState(() => tokens[0]?.id ?? "");
  const [activeIds, setActiveIds] = useState(
    () => new Set(tokens.map((t) => t.id)),
  );
  const [hoverTokenId, setHoverTokenId] = useState<string | null>(null);
  const [toggledExperimentOff, setToggledExperimentOff] = useState(false);
  const [q3b, setQ3b] = useState<string | null>(null);

  const onTokenizationKeyPhase = useCallback(() => {
    setTokenizationKeyReached(true);
  }, []);

  const experimentToken = useMemo(() => {
    const clever = tokens.find((t) => t.label.toLowerCase() === "clever");
    if (clever) return clever;
    const trait = tokens.find((t) => t.kind === "trait");
    if (trait) return trait;
    return tokens[1] ?? tokens[0];
  }, [tokens]);

  const selectedStage2Token = tokens.find((t) => t.id === stage2TokenId) ?? tokens[0];
  const singleDist = useMemo(
    () => (selectedStage2Token ? distributionGivenSingleToken(selectedStage2Token) : null),
    [selectedStage2Token],
  );

  const activeTokensList = tokens.filter((t) => activeIds.has(t.id));
  const fused = useMemo(
    () => distributionFromActiveTokens(activeTokensList),
    [activeTokensList],
  );
  const fusedPct = useMemo(() => toPercentages(fused), [fused]);

  const allOnList = tokens;
  const allOnPct = useMemo(
    () => toPercentages(distributionFromActiveTokens(allOnList)),
    [allOnList],
  );
  const deltaPct = useMemo(
    () => pctDelta(allOnPct, fusedPct),
    [allOnPct, fusedPct],
  );

  const impactWinnerId = useMemo(
    () => highestImpactTokenId(tokens, activeIds),
    [tokens, activeIds],
  );

  const [probSnapshot, setProbSnapshot] = useState<{
    pct: Record<JobId, number>;
    prob: Record<JobId, number>;
    top: DistrictId;
  } | null>(null);
  const [reasoningReplayKey, setReasoningReplayKey] = useState(0);

  const stage4Pct = probSnapshot?.pct ?? fusedPct;
  const cityHighlight: DistrictId = probSnapshot?.top ?? topJobFromDist(fused);

  const dreamJob = getEffectiveDreamJob(state.learner);
  const dreamJobLabel = getDreamDisplayLabel(state.learner);

  const animalRaw = getAnimalDisplayName(state.learner);
  const animalLabel =
    animalRaw !== "mystery animal"
      ? animalRaw.charAt(0).toUpperCase() + animalRaw.slice(1)
      : "—";
  const traitsLine =
    state.learner.traits.length > 0
      ? state.learner.traits.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")
      : "—";

  const q3Options = useMemo(
    () =>
      tokens
        .map((t) => ({
          id: t.id,
          label: t.label,
          correct: t.id === impactWinnerId,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [tokens, impactWinnerId],
  );

  function goNextStage() {
    if (stage === 3) {
      const list = tokens.filter((t) => activeIds.has(t.id));
      const dist = distributionFromActiveTokens(list);
      setProbSnapshot({
        pct: toPercentages(dist),
        prob: dist,
        top: topJobFromDist(dist),
      });
      setReasoningReplayKey((k) => k + 1);
    }
    setStage((s) => Math.min(5, s + 1));
  }

  function goPrevStage() {
    setStage((s) => Math.max(1, s - 1));
  }

  const toggleToken = useCallback(
    (id: string) => {
      setActiveIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          if (experimentToken && id === experimentToken.id) {
            setToggledExperimentOff(true);
          }
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [experimentToken],
  );

  const canAdvance1 = tokenizationKeyReached && q1 !== null;
  const canAdvance2 = q2 !== null;
  const canAdvance3 = toggledExperimentOff && q3b !== null;
  const canAdvance4 = q4 !== null;

  const stageBar = (
    <div className="flex flex-wrap justify-center gap-2 border-t border-violet-200/60 pt-4 sm:justify-start">
      {STAGE_META.map((s) => (
        <span
          key={s.n}
          className={[
            "rounded-full px-3 py-1 font-serif text-xs font-semibold",
            stage === s.n
              ? "bg-violet-600 text-white"
              : stage > s.n
                ? "bg-violet-200/80 text-violet-900"
                : "bg-stone-100 text-stone-500",
          ].join(" ")}
        >
          {s.n}. {s.label}
        </span>
      ))}
    </div>
  );

  const aiRecommendationJob = probSnapshot?.top ?? topJobFromDist(fused);

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-10"
      aria-labelledby="step4-title"
    >
      <div className="shrink-0 text-center sm:text-left">
        <p className="font-serif text-sm font-medium uppercase tracking-widest text-violet-800/80">
          Chapter 4
        </p>
        <h2
          id="step4-title"
          className="mt-1 font-serif text-3xl font-bold text-violet-950"
        >
          City Sorting Machine
        </h2>
        <p className="mt-2 max-w-prose font-serif text-base text-violet-950/85">
          The map was the surface. Underneath, pattern-based machinery turns words into clues and
          guesses — not final truth.
        </p>
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(24rem,100%)] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className={`relative w-full max-w-full shrink-0 ${DEMO_H}`}>
          <DemoStageViewport className="h-full border-violet-300/80 bg-gradient-to-b from-violet-950 via-indigo-950 to-stone-950 shadow-inner">
            {stage === 1 ? (
              <Stage1TokenizationVisual
                sentence={sentence}
                tokens={tokens}
                onReachKeyPhase={onTokenizationKeyPhase}
              />
            ) : null}
            {stage === 2 && singleDist ? (
              <Stage2OneClueVisual token={selectedStage2Token} dist={singleDist} />
            ) : null}
            {stage === 3 ? (
              <Stage3CombineVisual
                tokens={tokens}
                activeIds={activeIds}
                hoverTokenId={hoverTokenId}
                fused={fused}
                onHover={setHoverTokenId}
              />
            ) : null}
            {stage === 4 ? (
              <Stage4ReasoningReplayVisual
                key={reasoningReplayKey}
                sentence={sentence}
                tokens={tokens}
                fusedPct={stage4Pct}
                dreamJob={dreamJob}
                aiTopJob={aiRecommendationJob}
                animalLabel={animalLabel}
                traitsLine={traitsLine}
                dreamJobLabel={dreamJobLabel}
              />
            ) : null}
            {stage === 5 ? (
              <div className="relative h-full w-full min-h-[260px]">
                <Step3VisualFrame
                  className="!py-0"
                  image={
                    <Image
                      src="/map/zoo-map1.png"
                      alt="City overview with predicted district highlighted"
                      width={ZOO_MAP_INTRINSIC.width}
                      height={ZOO_MAP_INTRINSIC.height}
                      className={STEP3_ARTWORK_IMAGE_CLASS}
                      sizes="(max-width: 1500px) 100vw, 1500px"
                    />
                  }
                  overlay={
                    <>
                      {districtConfig.map((d) => {
                        const r = d.overviewHotspot;
                        const active = d.id === cityHighlight;
                        return (
                          <div
                            key={d.id}
                            className={[
                              "absolute rounded-2xl transition-all duration-700",
                              active
                                ? "border-[3px] border-amber-300 bg-amber-200/35 shadow-[0_0_40px_rgba(251,191,36,0.55)] ring-2 ring-amber-400/80"
                                : "border-2 border-white/10 bg-black/15 opacity-60",
                            ].join(" ")}
                            style={{
                              left: `${r.left}%`,
                              top: `${r.top}%`,
                              width: `${r.width}%`,
                              height: `${r.height}%`,
                            }}
                          />
                        );
                      })}
                    </>
                  }
                />
                <div
                  className={`pointer-events-none absolute inset-0 mx-auto ${STEP3_ARTWORK_MAX_W_CLASS} bg-gradient-to-t from-violet-950/15 to-transparent`}
                  aria-hidden
                />
              </div>
            ) : null}
          </DemoStageViewport>
        </div>

        <div className="flex min-h-0 w-full flex-col rounded-2xl border-2 border-violet-200 bg-violet-50/80 shadow-sm lg:max-h-[min(85vh,780px)] lg:overflow-y-auto lg:overscroll-contain lg:p-5 p-4">
          {stage === 1 ? (
            <>
              <div className="space-y-2 font-serif text-base leading-relaxed text-violet-950">
                <p>First, the AI breaks your text into many small pieces (tokens).</p>
                <p>Then it keeps only the clues it will use for guessing — not every word.</p>
              </div>
              {!tokenizationKeyReached ? (
                <p className="font-serif text-sm text-violet-800/80">
                  Watch the demo: you will see all the pieces, then the ones the machine keeps.
                </p>
              ) : null}
              <EmbeddedQuestion
                prompt="The machine is looking at your words… what do you think it keeps?"
                name="q1"
                value={q1}
                onChange={setQ1}
                options={[
                  { id: "whole", label: "Whole sentence", correct: false },
                  { id: "key", label: "Important words", correct: true },
                  { id: "feel", label: "Your feelings", correct: false },
                ]}
              />
              <ConceptTip title="What is a token?">
                <p>Tokens are units of text a model processes.</p>
                <p>They can be words, parts of words, or characters.</p>
                <p>This activity simplifies tokens as full words you can see.</p>
              </ConceptTip>
            </>
          ) : null}

          {stage === 2 ? (
            <>
              <p className="font-serif text-base leading-relaxed text-violet-950">
                The system looks at patterns it has seen before.
              </p>
              <div className="space-y-2">
                <p className="font-serif text-sm font-semibold text-violet-900">
                  Pick one clue to trace:
                </p>
                <div className="flex flex-wrap gap-2">
                  {tokens.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setStage2TokenId(t.id)}
                      className={[
                        "rounded-full border-2 px-3 py-1.5 font-serif text-sm font-medium transition",
                        stage2TokenId === t.id
                          ? "border-amber-600 bg-amber-200 text-amber-950"
                          : "border-violet-300 bg-white text-violet-900 hover:border-violet-500",
                      ].join(" ")}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <EmbeddedQuestion
                prompt={`If the system only sees “${selectedStage2Token?.label ?? "…"}”, what will it use to guess?`}
                name="q2"
                value={q2}
                onChange={setQ2}
                options={[
                  { id: "want", label: "What you want", correct: false },
                  { id: "seen", label: "What it has seen before", correct: true },
                  { id: "fair", label: "What is fair", correct: false },
                ]}
              />
              <ConceptTip title="How does this prediction work?">
                <p>This reflects a Markov-style idea: the next outcome depends on the current state.</p>
                <p>Here, the current state is just one clue.</p>
                <p>Real systems usually use much more context at once.</p>
              </ConceptTip>
            </>
          ) : null}

          {stage === 3 ? (
            <>
              <p className="font-serif text-base leading-relaxed text-violet-950">
                Turn clues on or off. The machine reads the{" "}
                <span className="font-semibold">combination</span> as one state, then updates its
                guess — like a next-step prediction that changes when the state changes.
              </p>
              <div className="rounded-xl bg-white/70 p-3 ring-1 ring-violet-200/80">
                <p className="font-serif text-sm font-semibold text-violet-900">Clue switches</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tokens.map((t) => {
                    const on = activeIds.has(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleToken(t.id)}
                        onMouseEnter={() => setHoverTokenId(t.id)}
                        onMouseLeave={() => setHoverTokenId(null)}
                        className={[
                          "rounded-full border-2 px-3 py-1.5 font-serif text-sm font-medium transition",
                          on
                            ? "border-emerald-600 bg-emerald-100 text-emerald-950"
                            : "border-stone-300 bg-stone-100 text-stone-500 line-through decoration-stone-500",
                        ].join(" ")}
                      >
                        {t.label}
                        <span className="ml-1" aria-hidden>
                          {on ? "✔" : "○"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <DeltaReadout deltaPct={deltaPct} />
              <div className="space-y-3 rounded-xl border border-amber-200/80 bg-amber-50/80 p-3">
                <p className="font-serif text-sm font-semibold text-amber-950">Try it</p>
                <p className="font-serif text-sm text-amber-950/90">
                  Turn off &ldquo;{experimentToken?.label ?? "one clue"}&rdquo; once. Watch the
                  preview shift.
                </p>
                {toggledExperimentOff ? (
                  <p className="font-serif text-sm font-medium text-emerald-800">
                    Nice — you changed the input. That is how the guess changes too.
                  </p>
                ) : (
                  <p className="font-serif text-sm text-amber-900/80">
                    Waiting for you to toggle that clue off…
                  </p>
                )}
              </div>
              <EmbeddedQuestion
                prompt="Which clue had the biggest impact on the guess (with your current switches)?"
                name="q3b"
                value={q3b}
                onChange={setQ3b}
                options={q3Options}
              />
              <ConceptTip title="What is a Markov chain?">
                <p>
                  A Markov chain models moving between states. Here, the state is the set of clues
                  you leave on, and the guess is a likely &ldquo;next&rdquo; role.
                </p>
                <p>The prediction depends on the combination, not on one word alone.</p>
                <p>Real language models are more complex than a simple Markov chain.</p>
              </ConceptTip>
            </>
          ) : null}

          {stage === 4 ? (
            <>
              <p className="font-serif text-base leading-relaxed text-violet-950">
                The replay on the left walks through how the machine <span className="font-semibold">arrives</span>{" "}
                at likely roles — from your words to percentages. That output is a recommendation
                from patterns, not a final decision about you.
              </p>
              <EmbeddedQuestion
                prompt="Did the machine decide your job, or make a guess?"
                name="q4"
                value={q4}
                onChange={setQ4}
                options={[
                  { id: "decide", label: "It decided", correct: false },
                  { id: "guess", label: "It guessed", correct: true },
                ]}
              />
              <ConceptTip title="What is an LLM?">
                <p>Large Language Models are trained on large datasets of text.</p>
                <p>They learn patterns of how words tend to appear together.</p>
                <p>They predict what is likely next using probability — not human understanding.</p>
              </ConceptTip>
            </>
          ) : null}

          {stage === 5 ? (
            <>
              <p className="font-serif text-base leading-relaxed text-violet-950">
                The city returns. The glowing district matches the machine&apos;s strongest pattern
                guess — the same kind of mapping that shaped the map you explored.
              </p>
              <EmbeddedQuestion
                prompt="If the system keeps doing this for everyone, what will the city look like?"
                name="q5"
                value={q5}
                onChange={setQ5}
                options={[
                  { id: "mixed", label: "Mixed", correct: false },
                  { id: "repeat", label: "Repeated patterns", correct: true },
                  { id: "random", label: "Random", correct: false },
                ]}
              />
              <ConceptTip title="Why this matters">
                <p>
                  When the same patterns get applied over and over, neighborhoods can start to look
                  alike — even when each guess is uncertain.
                </p>
                <p>That is one reason people ask for rules, checks, and human judgment.</p>
              </ConceptTip>
              <p className="font-serif text-sm text-violet-800/90">
                When you are ready, use <span className="font-semibold">Next page</span> to continue
                the story.
              </p>
            </>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 border-t border-violet-200/60 pt-4">
            <div className="flex flex-wrap gap-2">
              {stage > 1 ? (
                <button
                  type="button"
                  onClick={goPrevStage}
                  className="rounded-xl border-2 border-violet-400 bg-white px-4 py-2 font-serif text-sm font-semibold text-violet-950 hover:bg-violet-50"
                >
                  ← Previous stage
                </button>
              ) : null}
              {stage < 5 ? (
                <button
                  type="button"
                  disabled={
                    (stage === 1 && !canAdvance1) ||
                    (stage === 2 && !canAdvance2) ||
                    (stage === 3 && !canAdvance3) ||
                    (stage === 4 && !canAdvance4)
                  }
                  onClick={goNextStage}
                  className="rounded-xl border-2 border-violet-700 bg-violet-500 px-4 py-2 font-serif text-sm font-semibold text-white shadow-sm enabled:hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next stage →
                </button>
              ) : null}
            </div>
            {stageBar}
          </div>
        </div>
      </div>
    </section>
  );
}

function topJobFromDist(dist: Record<JobId, number>): DistrictId {
  let best: JobId = "artist";
  let p = -1;
  for (const j of JOB_IDS) {
    if (dist[j] > p) {
      p = dist[j];
      best = j;
    }
  }
  return best;
}

type McOption = { id: string; label: string; correct: boolean };

function EmbeddedQuestion({
  prompt,
  name,
  value,
  onChange,
  options,
}: {
  prompt: string;
  name: string;
  value: string | null;
  onChange: (id: string) => void;
  options: McOption[];
}) {
  return (
    <fieldset className="space-y-2 rounded-xl border border-violet-200 bg-white/60 p-3">
      <legend className="px-1 font-serif text-sm font-semibold text-violet-950">{prompt}</legend>
      <div className="space-y-2">
        {options.map((o) => {
          const picked = value === o.id;
          return (
            <label
              key={o.id}
              className={[
                "flex cursor-pointer items-start gap-2 rounded-lg border-2 px-3 py-2 font-serif text-sm transition",
                picked
                  ? o.correct
                    ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                    : "border-rose-400 bg-rose-50 text-rose-950"
                  : "border-transparent bg-white/80 hover:border-violet-200",
              ].join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={o.id}
                checked={picked}
                onChange={() => onChange(o.id)}
                className="mt-1"
              />
              <span>
                {o.label}
                {picked ? (
                  <span className="mt-1 block text-xs font-normal opacity-90">
                    {o.correct
                      ? "Yes — this matches the toy machine."
                      : "Think again: the machine matches old patterns."}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function DeltaReadout({ deltaPct }: { deltaPct: Record<JobId, number> }) {
  const rows = JOB_IDS.map((j) => ({ j, d: deltaPct[j] }))
    .filter((x) => Math.abs(x.d) >= 1)
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    .slice(0, 3);

  if (rows.length === 0) {
    return (
      <p className="font-serif text-sm text-violet-800/80">
        Compared with all clues on, shifts are small right now — try another toggle.
      </p>
    );
  }

  return (
    <div className="rounded-xl bg-white/70 p-3 ring-1 ring-violet-200/80">
      <p className="font-serif text-xs font-semibold uppercase tracking-wide text-violet-800">
        Change vs all clues on (percentage points)
      </p>
      <ul className="mt-2 space-y-1 font-serif text-sm text-violet-950">
        {rows.map(({ j, d }) => (
          <li key={j}>
            <span className="font-medium">{JOB_DISPLAY[j].title}</span>{" "}
            <span className={d > 0 ? "text-emerald-700" : "text-rose-700"}>
              {d > 0 ? "+" : ""}
              {d}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
