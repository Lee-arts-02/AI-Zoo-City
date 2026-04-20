"use client";

import { districtConfig } from "@/data/districtConfig";
import type { Step4Token } from "@/lib/step4Tokens";
import { wordsFromSentence, wordMatchesKeyTokenExpanded } from "@/lib/tokenizeSentence";
import type { JobId } from "@/types/game";
import type { DistrictId } from "@/types/city";
import { JOB_IDS } from "@/lib/step4Model";
import { useMemo } from "react";
import { jobRadialXY, JOB_NODE_COLORS } from "./jobRadialLayout";
import { JobNodeWithOutsideLabel, jobShortLabel } from "./stageVisuals";

/** Welcome — calm centered backdrop (no door / gate animation). */
export function Phase1CalmIntroVisual() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 px-6 py-10">
      <div className="max-w-md rounded-[2rem] border border-violet-500/25 bg-gradient-to-b from-violet-900/40 to-indigo-950/80 px-8 py-10 text-center shadow-[0_0_60px_rgba(76,29,149,0.35)]">
        <p className="font-serif text-xs font-semibold uppercase tracking-[0.35em] text-violet-200/85">
          AI Career System
        </p>
        <p className="mt-4 font-serif text-lg leading-relaxed text-violet-50/95">
          A guided look at how guesses are built — calmly, step by step.
        </p>
      </div>
      <p className="max-w-sm text-center font-serif text-sm text-violet-300/80">
        The robot will walk you through each layer — take your time.
      </p>
    </div>
  );
}

/** Phase 2 — Tokens: parent controls full sentence vs broken tokens (demo-bound). */
export function Stage2NeutralTokensVisual({
  sentence,
  mode,
  tokens,
  highlightKeys,
}: {
  sentence: string;
  mode: "full" | "tokens";
  /** When set with `highlightKeys`, used to mark which word chips match machine key tokens. */
  tokens?: Step4Token[];
  /** Highlights key-token words (e.g. stage 3 “pattern / older examples” beat). */
  highlightKeys?: boolean;
}) {
  const words = useMemo(() => wordsFromSentence(sentence), [sentence]);
  const showKeyHighlight = Boolean(highlightKeys && tokens?.length);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 px-2">
      {mode === "full" ? (
        <p className="relative w-full overflow-hidden rounded-2xl border border-violet-400/45 bg-violet-950/50 px-4 py-6 text-center font-serif text-base leading-relaxed text-violet-50 sm:text-lg">
          {sentence}
          <span
            className="zoo-token-scanner-bar pointer-events-none absolute inset-y-3 w-[14%] rounded-md bg-gradient-to-r from-transparent via-cyan-300/85 to-transparent"
            style={{ mixBlendMode: "screen" }}
          />
        </p>
      ) : (
        <>
          <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {words.map((w, i) => {
              const isKey =
                showKeyHighlight && tokens?.length
                  ? wordMatchesKeyTokenExpanded(w, tokens)
                  : false;
              return (
                <span
                  key={`${w}-${i}`}
                  className={[
                    "rounded-full border-2 px-2.5 py-1 font-serif text-sm font-medium transition-all duration-500 sm:px-3 sm:text-base",
                    showKeyHighlight
                      ? isKey
                        ? "border-amber-400 bg-amber-200/95 text-amber-950 shadow-md ring-2 ring-amber-300/70"
                        : "border-violet-700/40 bg-violet-950/35 text-violet-400/90 opacity-80"
                      : "border-violet-300/80 bg-violet-900/45 text-violet-100",
                  ].join(" ")}
                >
                  {w}
                </span>
              );
            })}
          </div>
          <p className="text-center font-serif text-sm text-violet-200/85">
            Each piece is a <span className="font-semibold text-amber-200">token</span> — a handle the
            system can use, not your whole story yet.
          </p>
        </>
      )}
    </div>
  );
}

/** Phase 3 — only the animal word stays in focus (other tokens fade). */
export function Stage3AnimalOnlyVisual({
  sentence,
  animalWord,
}: {
  sentence: string;
  animalWord: string;
}) {
  const words = useMemo(() => wordsFromSentence(sentence), [sentence]);
  const focus = animalWord.trim().toLowerCase();

  return (
    <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-3 px-2">
      <p className="text-center font-serif text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300/90">
        One animal-type clue in focus
      </p>
      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5">
        {words.map((w, i) => {
          const isAnimal = w.toLowerCase() === focus || focus.includes(w.toLowerCase()) || w.toLowerCase().includes(focus);
          return (
            <span
              key={`${w}-${i}`}
              className={[
                "rounded-full border-2 px-2.5 py-1 font-serif text-sm font-medium transition-all duration-500 sm:px-3 sm:text-base",
                isAnimal
                  ? "border-amber-400 bg-amber-200/90 text-amber-950 shadow-lg ring-2 ring-amber-300/70"
                  : "scale-90 border-violet-700/30 bg-violet-950/30 text-violet-500/50 opacity-35",
              ].join(" ")}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
}

const P3_CX = 50;
const P3_CY = 44;
const P3_R = 30;
const P3_CHIP_Y = 88;

/** Phase 3 — One remembered word → pattern cloud → roles (simplified). */
export function Stage3PatternBridgeVisual({
  memoryWord,
  dist,
}: {
  memoryWord: string;
  dist: Record<JobId, number>;
}) {
  const maxP = Math.max(...JOB_IDS.map((j) => dist[j]), 1e-9);
  const topJ = JOB_IDS.reduce((a, j) => (dist[j] > dist[a] ? j : a), JOB_IDS[0]);
  const chip = memoryWord.length > 14 ? `${memoryWord.slice(0, 13)}…` : memoryWord;

  return (
    <svg
      className="h-[min(72vw,440px)] w-full max-w-[500px] text-violet-200"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Pattern memory connects one animal-type clue to roles"
    >
      <defs>
        <radialGradient id="pat-cloud" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.55" />
          <stop offset="70%" stopColor="rgb(76 29 149)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(30 27 75)" stopOpacity="0.2" />
        </radialGradient>
        <filter id="pat-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g>
        <circle
          cx={P3_CX}
          cy={P3_CHIP_Y}
          r={6}
          className="fill-amber-200 stroke-amber-500"
          strokeWidth={0.55}
          filter="url(#pat-glow)"
        />
        <text
          x={P3_CX}
          y={P3_CHIP_Y + 1.2}
          textAnchor="middle"
          className="fill-amber-950 font-serif text-[3.4px] font-bold"
        >
          {chip}
        </text>
        <text
          x={P3_CX}
          y={P3_CHIP_Y + 9}
          textAnchor="middle"
          className="fill-violet-200/90 font-serif text-[2.4px]"
        >
          one clue type
        </text>
      </g>
      <line
        x1={P3_CX}
        y1={P3_CHIP_Y - 6}
        x2={P3_CX}
        y2={P3_CY + 12}
        stroke="rgb(250 204 21)"
        strokeWidth={1.05}
        opacity={0.95}
      />
      <ellipse
        cx={P3_CX}
        cy={P3_CY}
        rx={15}
        ry={11}
        fill="url(#pat-cloud)"
        className="stroke-violet-300/50"
        strokeWidth={0.5}
      />
      <text
        x={P3_CX}
        y={P3_CY + 1}
        textAnchor="middle"
        className="fill-violet-100 font-serif text-[3px] font-medium"
      >
        pattern memory
      </text>
      <text
        x={P3_CX}
        y={P3_CY - 8}
        textAnchor="middle"
        className="fill-violet-200/80 font-serif text-[2.4px]"
      >
        repeated in old examples
      </text>
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, P3_CX, P3_CY, P3_R);
        const strength = dist[j] / maxP;
        const sw = 0.45 + strength * 1.35;
        return (
          <line
            key={`l-${j}`}
            x1={P3_CX}
            y1={P3_CY + 10}
            x2={L.x}
            y2={L.y}
            stroke={j === topJ ? "rgb(250 204 21)" : "currentColor"}
            strokeWidth={sw}
            opacity={0.3 + strength * 0.7}
            className="transition-all duration-700"
          />
        );
      })}
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, P3_CX, P3_CY, P3_R);
        const strength = dist[j] / maxP;
        const baseR = 4.8;
        const r = baseR + strength * 2.2;
        const c = JOB_NODE_COLORS[j];
        return (
          <JobNodeWithOutsideLabel
            key={j}
            cx={L.x}
            cy={L.y}
            r={r}
            label={jobShortLabel(j)}
            fill={c.fill}
            stroke={c.stroke}
            strength={strength}
            centerX={P3_CX}
            centerY={P3_CY}
          />
        );
      })}
    </svg>
  );
}

function emojiForAnimalLabel(label: string): string {
  const k = label.toLowerCase();
  const pairs: [string, string][] = [
    ["rabbit", "🐰"],
    ["fox", "🦊"],
    ["bear", "🐻"],
    ["lion", "🦁"],
    ["tiger", "🐯"],
    ["cat", "🐱"],
    ["wolf", "🐺"],
    ["deer", "🦌"],
    ["sheep", "🐑"],
    ["elephant", "🐘"],
    ["zebra", "🦓"],
    ["otter", "🦦"],
    ["capybara", "🦫"],
    ["squirrel", "🐿️"],
    ["hedgehog", "🦔"],
    ["chameleon", "🦎"],
  ];
  for (const [word, e] of pairs) {
    if (k.includes(word)) return e;
  }
  return "🐾";
}

const VOICE_BUBBLES = [
  "I do not feel I belong here.",
  "I want to try a new possibility.",
  "I follow my parents’ expectation.",
];

/** City — queue → sorter → district entry; optional “voices” phase with speech bubbles. */
export function Stage7CityFlowVisual({
  districtTitle,
  animalLabel,
  learnerDistrictId,
  phase,
}: {
  districtTitle: string;
  animalLabel: string;
  learnerDistrictId: DistrictId;
  phase: "routing" | "voices";
}) {
  const primary = emojiForAnimalLabel(animalLabel);

  if (phase === "voices") {
    return (
      <div className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-4 px-3 py-4">
        <p className="text-center font-serif text-sm font-semibold text-amber-200/95">
          Routed to {districtTitle} — different lives, same label
        </p>
        <div className="flex w-full max-w-md flex-col items-stretch gap-3 rounded-2xl border-2 border-amber-400/45 bg-gradient-to-b from-violet-950/80 to-indigo-950/90 px-4 py-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-start gap-2"
              style={{ animationDelay: `${i * 140}ms` }}
            >
              <span className="text-2xl leading-none" aria-hidden>
                {primary}
              </span>
              <div className="rounded-2xl rounded-tl-sm border border-violet-200/60 bg-violet-100/95 px-3 py-2 font-serif text-[0.72rem] leading-snug text-violet-950 shadow-sm">
                {VOICE_BUBBLES[i]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center gap-3 px-2 py-3">
      <div className="relative w-full max-w-2xl">
        <svg
          className="h-[200px] w-full text-violet-300/90"
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="flow-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.2" />
              <stop offset="50%" stopColor="rgb(250 204 21)" stopOpacity="0.85" />
              <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {[60, 140, 260, 340].map((x, i) => (
            <g key={i}>
              <line
                x1={200}
                y1={125}
                x2={x}
                y2={38}
                stroke="url(#flow-line)"
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.85}
              />
              <circle cx={x} cy={32} r={5} className="fill-amber-300/90" />
            </g>
          ))}
          <rect
            x={155}
            y={115}
            width={90}
            height={44}
            rx={10}
            className="fill-violet-800/90 stroke-cyan-400/60"
            strokeWidth={2}
          />
          <text x={200} y={142} textAnchor="middle" className="fill-violet-100 font-serif text-[11px]">
            Sorter
          </text>
        </svg>
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center gap-4">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="animate-step7-flow-pop text-2xl opacity-90"
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              {primary}
            </span>
          ))}
        </div>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-4 gap-1 text-center">
        {districtConfig.map((d) => (
          <div
            key={d.id}
            className={[
              "rounded-lg border px-0.5 py-2 font-serif text-[0.55rem] font-semibold leading-tight",
              d.id === learnerDistrictId
                ? "border-amber-400/80 bg-amber-950/50 text-amber-100"
                : "border-violet-500/35 bg-violet-950/45 text-violet-200/90",
            ].join(" ")}
          >
            {d.shortLabel}
          </div>
        ))}
      </div>
      <p className="max-w-md text-center font-serif text-[0.65rem] text-violet-200/90">
        Queue → sorter → <span className="font-semibold text-amber-200">{districtTitle}</span> — routing
        repeats and shapes the map.
      </p>
    </div>
  );
}
