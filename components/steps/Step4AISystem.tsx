"use client";

import { DemoStageViewport } from "@/components/steps/step4/DemoStageViewport";
import { Step4CityRoutingVisual } from "@/components/steps/step4/Step4CityRoutingVisual";
import { Step4PredictionCardsVisual } from "@/components/steps/step4/Step4PredictionCardsVisual";
import { Step4RobotPanel } from "@/components/steps/step4/Step4RobotPanel";
import { SingleTokenPulseVisual } from "@/components/steps/step4/SingleTokenPulseVisual";
import { Stage2NeutralTokensVisual } from "@/components/steps/step4/step4PhaseVisuals";
import { Stage3CombineVisual } from "@/components/steps/step4/stageVisuals";
import { districtConfig } from "@/data/districtConfig";
import {
  distributionFromActiveTokens,
  distributionGivenSingleToken,
  JOB_IDS,
  toPercentages,
  pctDelta,
} from "@/lib/step4Model";
import { buildStep4Tokens } from "@/lib/step4Tokens";
import { useGameState } from "@/lib/gameState";
import {
  formatLearnerNameForDisplay,
  getAnimalDisplayName,
  getAnimalEmojiForLearner,
} from "@/lib/learnerUtils";
import type { JobId } from "@/types/game";
import type { DistrictId } from "@/types/city";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";

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
  const { state, dispatch } = useGameState();
  const sentence = state.learner.description;
  const tokens = useMemo(() => buildStep4Tokens(state.learner), [state.learner]);

  /** 1–8: Welcome … tokens … patterns … one token … combine … prediction … city … invitation */
  const [stage, setStage] = useState(1);
  const [panelBeat, setPanelBeat] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);

  const [qWelcome, setQWelcome] = useState<string | null>(null);
  const [qTokWhy, setQTokWhy] = useState<string | null>(null);
  const [qPattern, setQPattern] = useState<string | null>(null);
  const [qOne, setQOne] = useState<string | null>(null);
  const [qCity2, setQCity2] = useState<string | null>(null);

  const [stage2TokenId, setStage2TokenId] = useState(() => tokens[0]?.id ?? "");
  const [activeIds, setActiveIds] = useState(() => new Set(tokens.map((t) => t.id)));
  const [hoverTokenId, setHoverTokenId] = useState<string | null>(null);
  const [stage2Engaged, setStage2Engaged] = useState(false);

  useEffect(() => {
    setPulseKey((k) => k + 1);
  }, [stage2TokenId]);

  /** Keeps the left demo in sync with dialogue; avoids one frame of stale panelBeat after a stage change. */
  useLayoutEffect(() => {
    setPanelBeat(0);
  }, [stage]);

  const selectedStage2Token = tokens.find((t) => t.id === stage2TokenId) ?? tokens[0];
  const singleDist = useMemo(
    () => (selectedStage2Token ? distributionGivenSingleToken(selectedStage2Token) : null),
    [selectedStage2Token],
  );

  const patternBridgeToken = tokens[0];
  const patternBridgeDist = useMemo(
    () => (patternBridgeToken ? distributionGivenSingleToken(patternBridgeToken) : null),
    [patternBridgeToken],
  );

  const activeTokensList = tokens.filter((t) => activeIds.has(t.id));
  const fused = useMemo(
    () => distributionFromActiveTokens(activeTokensList),
    [activeTokensList],
  );
  const fusedPct = useMemo(() => toPercentages(fused), [fused]);

  const patternBridgePct = useMemo(
    () => (patternBridgeDist ? toPercentages(patternBridgeDist) : fusedPct),
    [patternBridgeDist, fusedPct],
  );
  const patternLeanTop = useMemo(
    () => (patternBridgeDist ? topJobFromDist(patternBridgeDist) : topJobFromDist(fused)),
    [patternBridgeDist, fused],
  );

  const oneCluePct = useMemo(
    () => (singleDist ? toPercentages(singleDist) : fusedPct),
    [singleDist, fusedPct],
  );

  const allOnList = tokens;
  const allOnPct = useMemo(
    () => toPercentages(distributionFromActiveTokens(allOnList)),
    [allOnList],
  );
  const deltaPct = useMemo(() => pctDelta(allOnPct, fusedPct), [allOnPct, fusedPct]);

  const [probSnapshot, setProbSnapshot] = useState<{
    pct: Record<JobId, number>;
    prob: Record<JobId, number>;
    top: DistrictId;
  } | null>(null);

  const stage4Pct = probSnapshot?.pct ?? fusedPct;
  const cityHighlight: DistrictId = probSnapshot?.top ?? topJobFromDist(fused);

  const animalRaw = getAnimalDisplayName(state.learner);
  const animalLabel =
    animalRaw !== "mystery animal"
      ? animalRaw.charAt(0).toUpperCase() + animalRaw.slice(1)
      : "—";
  const clueLabelsLine = useMemo(
    () =>
      tokens
        .filter((t) => activeIds.has(t.id))
        .map((t) => t.label)
        .join(" · "),
    [tokens, activeIds],
  );

  function goNextStage() {
    if (stage === 1) setStage2Engaged(false);
    if (stage === 3) setStage2Engaged(false);
    if (stage === 4) setStage2Engaged(false);
    if (stage === 5) {
      setStage2Engaged(false);
      const list = tokens;
      const dist = distributionFromActiveTokens(list);
      setProbSnapshot({
        pct: toPercentages(dist),
        prob: dist,
        top: topJobFromDist(dist),
      });
      setActiveIds(new Set(tokens.map((t) => t.id)));
    }
    setStage((s) => Math.min(8, s + 1));
  }

  function goPrevStage() {
    if (stage === 6) setStage2Engaged(false);
    if (stage === 5) setStage2Engaged(false);
    if (stage === 4) setStage2Engaged(false);
    setStage((s) => Math.max(1, s - 1));
  }

  const toggleToken = useCallback((id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const aiRecommendationJob = probSnapshot?.top ?? topJobFromDist(fused);
  const topJobOneClue = singleDist ? topJobFromDist(singleDist) : aiRecommendationJob;

  const districtTitle = useMemo(
    () => districtConfig.find((d) => d.id === cityHighlight)?.title ?? "a city quarter",
    [cityHighlight],
  );

  const cityRoutingBeat = stage === 7 ? (Math.min(3, panelBeat) as 0 | 1 | 2 | 3) : 0;
  const cityShowVoices = stage === 7 && panelBeat >= 3;

  const learnerFirstName = useMemo(() => {
    const formatted = formatLearnerNameForDisplay(state.learner.name);
    if (!formatted) return "";
    return formatted.split(/\s+/)[0] ?? "";
  }, [state.learner.name]);

  const animalEmoji = useMemo(
    () => getAnimalEmojiForLearner(state.learner),
    [state.learner],
  );

  const centered = stage === 1 || stage === 8;

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-10"
      aria-labelledby="step4-title"
    >
      <div className={centered ? "shrink-0 text-center" : "shrink-0 text-center sm:text-left"}>
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
          From words to patterns to guesses — then back to the city, with people still in the loop.
        </p>
      </div>

      {centered ? (
        <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-6 pb-4">
          <div className="order-1 flex w-full max-w-2xl min-h-0 flex-col rounded-2xl border-2 border-violet-200 bg-violet-50/90 p-6 shadow-[8px_8px_0_0_rgba(139,92,246,0.12)] sm:p-8">
            <Step4RobotPanel
              stage={stage}
              stage2Engaged={stage2Engaged}
              tokens={tokens}
              topJobOneClue={topJobOneClue}
              cityHighlight={cityHighlight}
              qWelcome={qWelcome}
              setQWelcome={setQWelcome}
              qTokWhy={qTokWhy}
              setQTokWhy={setQTokWhy}
              qPattern={qPattern}
              setQPattern={setQPattern}
              qOne={qOne}
              setQOne={setQOne}
              qCity2={qCity2}
              setQCity2={setQCity2}
              stage2TokenId={stage2TokenId}
              setStage2TokenId={setStage2TokenId}
              setStage2Engaged={setStage2Engaged}
              selectedStage2Token={selectedStage2Token}
              goNextStage={goNextStage}
              goPrevStage={goPrevStage}
              onContinueToChapter5={() => dispatch({ type: "SET_STEP", step: 5 })}
              deltaPct={deltaPct}
              fusedPct={fusedPct}
              oneCluePct={oneCluePct}
              predictionPct={stage4Pct}
              patternBridgePct={patternBridgePct}
              patternLeanTop={patternLeanTop}
              toggleToken={toggleToken}
              activeIds={activeIds}
              onHoverToken={setHoverTokenId}
              onBeatChange={setPanelBeat}
              welcomeLayout={stage === 1 || stage === 8}
              learnerFirstName={learnerFirstName}
            />
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 w-full flex-1 grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_min(24rem,100%)] xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div
            className={`relative w-full max-w-full shrink-0 overflow-hidden ${stage === 6 ? "" : DEMO_H}`}
          >
            {stage === 6 ? (
              <div
                className={`relative flex w-full max-w-full items-start justify-center overflow-y-auto rounded-2xl bg-gradient-to-b from-stone-900/35 via-violet-950/55 to-indigo-950/75 px-3 py-6 shadow-inner ${DEMO_H}`}
              >
                <Step4PredictionCardsVisual fusedPct={stage4Pct} clueLabelsLine={clueLabelsLine} />
              </div>
            ) : (
              <DemoStageViewport className="h-full border-violet-300/80 bg-gradient-to-b from-violet-950 via-indigo-950 to-stone-950 shadow-inner">
                {stage === 2 ? (
                  <Stage2NeutralTokensVisual
                    sentence={sentence}
                    mode={panelBeat >= 1 ? "tokens" : "full"}
                  />
                ) : null}
                {stage === 3 ? (
                  <Stage2NeutralTokensVisual
                    sentence={sentence}
                    mode="tokens"
                    tokens={tokens}
                    highlightKeys
                  />
                ) : null}
                {stage === 4 && singleDist && selectedStage2Token ? (
                  <SingleTokenPulseVisual
                    tokens={tokens}
                    selectedId={stage2TokenId}
                    onSelectToken={(id) => {
                      setStage2TokenId(id);
                      setStage2Engaged(true);
                    }}
                    dist={singleDist}
                    pulseKey={pulseKey}
                  />
                ) : null}
                {stage === 5 && panelBeat < 2 ? (
                  <Stage2NeutralTokensVisual
                    sentence={sentence}
                    mode="tokens"
                    tokens={tokens}
                    highlightKeys
                  />
                ) : null}
                {stage === 5 && panelBeat >= 2 ? (
                  <Stage3CombineVisual
                    tokens={tokens}
                    activeIds={activeIds}
                    hoverTokenId={hoverTokenId}
                    fused={fused}
                    fusedPct={fusedPct}
                    onHover={setHoverTokenId}
                    onToggleToken={toggleToken}
                  />
                ) : null}
                {stage === 7 ? (
                  <Step4CityRoutingVisual
                    animalLabel={animalLabel}
                    animalEmoji={animalEmoji}
                    districtTitle={districtTitle}
                    learnerDistrictId={cityHighlight}
                    routingBeat={cityRoutingBeat}
                    showVoices={cityShowVoices}
                  />
                ) : null}
              </DemoStageViewport>
            )}
          </div>

          <div className="flex min-h-0 w-full flex-col rounded-2xl border-2 border-violet-200 bg-violet-50/80 shadow-sm lg:max-h-[min(85vh,780px)] lg:overflow-y-auto lg:overscroll-contain lg:p-5 p-4">
            <Step4RobotPanel
              stage={stage}
              stage2Engaged={stage2Engaged}
              tokens={tokens}
              topJobOneClue={topJobOneClue}
              cityHighlight={cityHighlight}
              qWelcome={qWelcome}
              setQWelcome={setQWelcome}
              qTokWhy={qTokWhy}
              setQTokWhy={setQTokWhy}
              qPattern={qPattern}
              setQPattern={setQPattern}
              qOne={qOne}
              setQOne={setQOne}
              qCity2={qCity2}
              setQCity2={setQCity2}
              stage2TokenId={stage2TokenId}
              setStage2TokenId={setStage2TokenId}
              setStage2Engaged={setStage2Engaged}
              selectedStage2Token={selectedStage2Token}
              goNextStage={goNextStage}
              goPrevStage={goPrevStage}
              onContinueToChapter5={() => dispatch({ type: "SET_STEP", step: 5 })}
              deltaPct={deltaPct}
              fusedPct={fusedPct}
              oneCluePct={oneCluePct}
              predictionPct={stage4Pct}
              patternBridgePct={patternBridgePct}
              patternLeanTop={patternLeanTop}
              toggleToken={toggleToken}
              activeIds={activeIds}
              onHoverToken={setHoverTokenId}
              onBeatChange={setPanelBeat}
              welcomeLayout={false}
              learnerFirstName={learnerFirstName}
            />
          </div>
        </div>
      )}
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
