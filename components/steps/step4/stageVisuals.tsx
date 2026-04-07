"use client";

import { JOB_DISPLAY } from "@/lib/aiModel";
import {
  keyLabelSetFromTokens,
  wordMatchesKeyToken,
  wordsFromSentence,
} from "@/lib/tokenizeSentence";
import type { Step4Token } from "@/lib/step4Tokens";
import { JOB_IDS } from "@/lib/step4Model";
import type { DreamJob, JobId } from "@/types/game";
import { useEffect, useId, useMemo, useState } from "react";
import { jobRadialXY, JOB_NODE_COLORS } from "./jobRadialLayout";

export function jobShortLabel(id: JobId): string {
  switch (id) {
    case "manager":
      return "Manager";
    case "engineer":
      return "Engineer";
    case "artist":
      return "Artist";
    case "community":
      return "Community";
    default:
      return id;
  }
}

type S1Phase = "scan" | "allWords" | "keyOnly";

export function Stage1TokenizationVisual({
  sentence,
  tokens,
  onReachKeyPhase,
}: {
  sentence: string;
  tokens: Step4Token[];
  onReachKeyPhase?: () => void;
}) {
  const [phase, setPhase] = useState<S1Phase>("scan");
  const words = useMemo(() => wordsFromSentence(sentence), [sentence]);
  const keySet = useMemo(() => keyLabelSetFromTokens(tokens), [tokens]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("allWords"), 2800);
    const t2 = window.setTimeout(() => {
      setPhase("keyOnly");
      onReachKeyPhase?.();
    }, 6200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [sentence, onReachKeyPhase]);

  return (
    <div className="flex w-full max-w-2xl flex-col items-center justify-center gap-4 px-2">
      {phase === "scan" ? (
        <p className="relative w-full overflow-hidden rounded-2xl border border-violet-400/45 bg-violet-950/50 px-4 py-6 text-center font-serif text-base leading-relaxed text-violet-50 sm:text-lg">
          {sentence}
          <span
            className="zoo-token-scanner-bar pointer-events-none absolute inset-y-3 w-[14%] rounded-md bg-gradient-to-r from-transparent via-cyan-300/85 to-transparent"
            style={{ mixBlendMode: "screen" }}
          />
        </p>
      ) : null}

      {phase === "allWords" || phase === "keyOnly" ? (
        <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {words.map((w, i) => {
            const isKey = wordMatchesKeyToken(w, keySet);
            const ghost = phase === "keyOnly" && !isKey;
            return (
              <span
                key={`${w}-${i}`}
                className={[
                  "rounded-full border-2 px-2.5 py-1 font-serif text-sm font-medium transition-all duration-700 ease-out sm:px-3 sm:text-base",
                  ghost
                    ? "translate-y-4 scale-75 border-stone-700/40 bg-stone-900/30 text-stone-500 opacity-25"
                    : isKey && phase === "keyOnly"
                      ? "border-amber-400 bg-amber-200 text-amber-950 shadow-lg ring-2 ring-amber-300/60"
                      : "border-violet-300/70 bg-violet-900/40 text-violet-100",
                ].join(" ")}
              >
                {w}
              </span>
            );
          })}
        </div>
      ) : null}

      {phase === "keyOnly" ? (
        <p className="text-center font-serif text-sm text-violet-200/90">
          The machine keeps only the clues it will use for guessing. Other words fade into the
          background.
        </p>
      ) : null}
    </div>
  );
}

/** Hub shifted up so the bottom job node clears the clue label. */
const STAGE2_R = 33;
const STAGE2_CX = 50;
const STAGE2_CY = 44;

export function Stage2OneClueVisual({
  token,
  dist,
}: {
  token: Step4Token;
  dist: Record<JobId, number>;
}) {
  const maxP = Math.max(...JOB_IDS.map((j) => dist[j]));
  return (
    <svg
      className="h-[min(72vw,420px)] w-full max-w-[480px] text-violet-200"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-label="One clue connecting to possible jobs"
    >
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE2_CX, STAGE2_CY, STAGE2_R);
        const strength = maxP > 0 ? dist[j] / maxP : 0;
        const sw = 0.4 + strength * 1.35;
        return (
          <line
            key={j}
            x1={STAGE2_CX}
            y1={STAGE2_CY}
            x2={L.x}
            y2={L.y}
            stroke="currentColor"
            strokeWidth={sw}
            className="transition-all duration-500"
            opacity={0.2 + strength * 0.72}
          />
        );
      })}
      <circle
        cx={STAGE2_CX}
        cy={STAGE2_CY}
        r={7.2}
        className="fill-amber-300/95 stroke-amber-100"
        strokeWidth={0.55}
      />
      <text
        x={STAGE2_CX}
        y={STAGE2_CY + 11}
        textAnchor="middle"
        className="fill-amber-100 font-serif text-[4px] font-bold"
      >
        {token.label.length > 12 ? `${token.label.slice(0, 11)}…` : token.label}
      </text>
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE2_CX, STAGE2_CY, STAGE2_R);
        const strength = maxP > 0 ? dist[j] / maxP : 0;
        const baseR = 5.2;
        const r = baseR + strength * 2.4;
        const colors = JOB_NODE_COLORS[j];
        return (
          <JobNodeWithOutsideLabel
            key={j}
            cx={L.x}
            cy={L.y}
            r={r}
            label={jobShortLabel(j)}
            fill={colors.fill}
            stroke={colors.stroke}
            strength={strength}
            centerX={STAGE2_CX}
            centerY={STAGE2_CY}
          />
        );
      })}
    </svg>
  );
}

function JobNodeWithOutsideLabel({
  cx,
  cy,
  r,
  label,
  fill,
  stroke,
  strength,
  centerX,
  centerY,
}: {
  cx: number;
  cy: number;
  r: number;
  label: string;
  fill: string;
  stroke: string;
  strength: number;
  centerX: number;
  centerY: number;
}) {
  const fontSize = Math.max(2.85, Math.min(4.4, r * 0.62));
  const placeInside = r >= 5.8;
  const angle = Math.atan2(cy - centerY, cx - centerX);
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);
  const labelR = r + 5.5;
  const lx = cx + ux * labelR;
  const ly = cy + uy * labelR;
  const edgeX = cx + ux * r;
  const edgeY = cy + uy * r;

  return (
    <g className="transition-all duration-500">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={0.5}
        opacity={0.72 + strength * 0.26}
      />
      {placeInside ? (
        <text
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          className="fill-stone-900 font-serif font-semibold"
          style={{ fontSize: `${fontSize}px` }}
        >
          {label}
        </text>
      ) : (
        <>
          <line
            x1={edgeX}
            y1={edgeY}
            x2={lx}
            y2={ly}
            stroke="rgb(196 181 253)"
            strokeWidth={0.35}
            opacity={0.85}
          />
          <text
            x={lx}
            y={ly + fontSize * 0.35}
            textAnchor="middle"
            className="fill-violet-50 font-serif font-semibold"
            style={{ fontSize: `${fontSize}px` }}
          >
            {label}
          </text>
        </>
      )}
    </g>
  );
}

const STAGE3_CX = 50;
const STAGE3_CY = 50;
const STAGE3_JOB_R = 34;
const STAGE3_TOKEN_Y = 11;

export function Stage3CombineVisual({
  tokens,
  activeIds,
  hoverTokenId,
  fused,
  onHover,
}: {
  tokens: Step4Token[];
  activeIds: Set<string>;
  hoverTokenId: string | null;
  fused: Record<JobId, number>;
  onHover: (id: string | null) => void;
}) {
  const filterId = useId().replace(/:/g, "");
  const n = tokens.length || 1;
  const maxP = Math.max(...JOB_IDS.map((j) => fused[j]));

  const tokenPos = tokens.map((t, i) => ({
    t,
    x: 14 + (72 / Math.max(1, n - 1 || 1)) * (n === 1 ? 0.5 : i),
    y: STAGE3_TOKEN_Y,
  }));

  const fx = STAGE3_CX;
  const fy = STAGE3_CY;

  return (
    <svg
      className="h-[min(72vw,440px)] w-full max-w-[500px]"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => onHover(null)}
      aria-hidden
    >
      <defs>
        <filter id={`glow-${filterId}`}>
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {tokenPos.map(({ t, x, y }) => {
        const on = activeIds.has(t.id);
        const hover = hoverTokenId === t.id;
        const tr = hover ? 5.5 : 4.6;
        const fs = Math.max(2.6, Math.min(3.8, tr * 0.72));
        return (
          <g key={t.id} opacity={on ? 1 : 0.2} className="transition-opacity duration-500">
            <line
              x1={x}
              y1={y + tr}
              x2={fx}
              y2={fy - 7}
              stroke={hover ? "rgb(250 204 21)" : "rgb(196 181 253)"}
              strokeWidth={hover ? 1.05 : 0.42}
              className="transition-all duration-300"
              opacity={on ? 0.88 : 0.15}
            />
            <circle
              cx={x}
              cy={y}
              r={tr}
              className="fill-amber-200 stroke-amber-600 transition-all duration-300"
              strokeWidth={0.45}
            />
            <text
              x={x}
              y={y + fs * 0.32}
              textAnchor="middle"
              className="fill-amber-950 font-serif font-semibold"
              style={{ fontSize: `${fs}px` }}
            >
              {t.label.length > 11 ? `${t.label.slice(0, 10)}…` : t.label}
            </text>
          </g>
        );
      })}
      <circle
        cx={fx}
        cy={fy}
        r={8}
        className="fill-violet-400/45 stroke-violet-200 transition-all duration-500"
        strokeWidth={0.55}
        filter={hoverTokenId ? `url(#glow-${filterId})` : undefined}
      />
      <text
        x={fx}
        y={fy + 2.8}
        textAnchor="middle"
        className="fill-violet-50 font-serif text-[3px] font-medium"
      >
        combined
      </text>
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE3_CX, STAGE3_CY, STAGE3_JOB_R);
        const strength = maxP > 0 ? fused[j] / maxP : 0;
        return (
          <line
            key={`f-${j}`}
            x1={fx}
            y1={fy + 8}
            x2={L.x}
            y2={L.y - (5 + strength * 2.2)}
            stroke="rgb(167 139 250)"
            strokeWidth={0.32 + strength * 1.05}
            className="transition-all duration-500"
            opacity={0.28 + strength * 0.68}
          />
        );
      })}
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE3_CX, STAGE3_CY, STAGE3_JOB_R);
        const strength = maxP > 0 ? fused[j] / maxP : 0;
        const baseR = 4.2;
        const r = baseR + strength * 3.2;
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
            centerX={STAGE3_CX}
            centerY={STAGE3_CY}
          />
        );
      })}
    </svg>
  );
}

export function Stage4ReasoningReplayVisual({
  sentence,
  tokens,
  fusedPct,
  dreamJob,
  aiTopJob,
  animalLabel,
  traitsLine,
  dreamJobLabel,
}: {
  sentence: string;
  tokens: Step4Token[];
  fusedPct: Record<JobId, number>;
  dreamJob: DreamJob;
  aiTopJob: JobId;
  animalLabel: string;
  traitsLine: string;
  dreamJobLabel: string;
}) {
  const words = useMemo(() => wordsFromSentence(sentence), [sentence]);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const times = [500, 2200, 4000, 5800, 7400, 9000, 11000];
    const timers = times.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [sentence, tokens]);

  const dreamTitle = JOB_DISPLAY[dreamJob].title;
  const aiTitle = JOB_DISPLAY[aiTopJob].title;
  const mismatch = dreamJob !== aiTopJob;

  return (
    <div className="flex w-full max-w-lg flex-col gap-4 px-2 font-serif text-violet-50">
      {step >= 1 ? (
        <div className="rounded-xl border border-violet-400/40 bg-violet-950/55 p-3 text-sm shadow-inner">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300/90">
            Your profile (from earlier steps)
          </p>
          <ul className="mt-2 space-y-1 text-sm leading-relaxed">
            <li>
              <span className="text-violet-300">Animal:</span>{" "}
              <span className="font-semibold text-violet-50">{animalLabel}</span>
            </li>
            <li>
              <span className="text-violet-300">Key traits:</span>{" "}
              <span className="font-semibold text-violet-50">{traitsLine}</span>
            </li>
            <li>
              <span className="text-violet-300">Dream job you chose:</span>{" "}
              <span className="font-semibold text-amber-200">{dreamJobLabel}</span>
            </li>
          </ul>
        </div>
      ) : null}

      {step >= 2 ? (
        <div className="transition-opacity duration-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Full sentence
          </p>
          <p className="mt-1 text-sm leading-relaxed text-violet-100/95">{sentence}</p>
        </div>
      ) : null}

      {step >= 3 ? (
        <div className="transition-opacity duration-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Broken into pieces
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {words.map((w, i) => (
              <span
                key={i}
                className="rounded-md border border-violet-500/40 bg-violet-900/50 px-2 py-0.5 text-xs"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {step >= 4 ? (
        <div className="transition-opacity duration-500">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Clues the machine keeps
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {tokens.map((t) => (
              <span
                key={t.id}
                className="rounded-full border-2 border-amber-400 bg-amber-200 px-3 py-1 text-sm font-semibold text-amber-950"
              >
                {t.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {step >= 5 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm text-violet-200/90">
          <span className="rounded-full bg-violet-600/80 px-3 py-1 text-xs font-semibold">
            Clue signals
          </span>
          <span className="text-violet-400" aria-hidden>
            →
          </span>
          <span className="rounded-full bg-fuchsia-700/70 px-3 py-1 text-xs font-semibold">
            Pattern match
          </span>
          <span className="text-violet-400" aria-hidden>
            →
          </span>
          <span className="rounded-full bg-violet-500/70 px-3 py-1 text-xs font-semibold">
            Chances
          </span>
        </div>
      ) : null}

      {step >= 6 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Likely roles (not a final decision)
          </p>
          {JOB_IDS.map((j) => {
            const pct = fusedPct[j];
            return (
              <div key={j} className="space-y-0.5">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>{JOB_DISPLAY[j].title}</span>
                  <span className="tabular-nums font-semibold">{pct}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-violet-950/90 ring-1 ring-violet-500/25">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-300 transition-[width] duration-[1.2s] ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {step >= 7 ? (
        <div
          className={`mt-2 grid gap-3 rounded-xl border-2 p-3 sm:grid-cols-2 ${
            mismatch ? "border-amber-400/60 bg-amber-950/30" : "border-emerald-500/40 bg-emerald-950/25"
          }`}
        >
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300">
              Dream job (you)
            </p>
            <p className="mt-1 text-lg font-bold text-amber-200">{dreamTitle}</p>
          </div>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300">
              AI recommendation (guess)
            </p>
            <p className="mt-1 text-lg font-bold text-violet-100">{aiTitle}</p>
          </div>
          {mismatch ? (
            <p className="sm:col-span-2 text-xs leading-relaxed text-amber-100/90">
              The machine is not reading your heart. It outputs what past patterns make likely — so
              your dream and its guess can differ.
            </p>
          ) : (
            <p className="sm:col-span-2 text-xs leading-relaxed text-emerald-100/85">
              This time the pattern guess lines up with your dream — that can happen, but it is
              still a statistical guess, not a promise.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
