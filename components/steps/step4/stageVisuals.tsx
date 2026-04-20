"use client";

import { JOB_DISPLAY } from "@/lib/aiModel";
import { wordsFromSentence, wordMatchesKeyTokenExpanded } from "@/lib/tokenizeSentence";
import type { Step4Token } from "@/lib/step4Tokens";
import { JOB_IDS, toPercentages } from "@/lib/step4Model";
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
            const isKey = wordMatchesKeyTokenExpanded(w, tokens);
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
  const maxP = Math.max(...JOB_IDS.map((j) => dist[j]), 1e-9);
  const topJ = JOB_IDS.reduce((a, j) => (dist[j] > dist[a] ? j : a), JOB_IDS[0]);
  const filterId = useId().replace(/:/g, "");

  return (
    <svg
      className="h-[min(72vw,440px)] w-full max-w-[480px] text-violet-200"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      aria-label="One clue connecting to possible jobs"
    >
      <defs>
        <filter id={`one-glow-${filterId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.8" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE2_CX, STAGE2_CY, STAGE2_R);
        const strength = dist[j] / maxP;
        const isTop = j === topJ;
        const sw = isTop ? 1.35 + strength * 0.85 : 0.35 + strength * 0.95;
        return (
          <line
            key={j}
            x1={STAGE2_CX}
            y1={STAGE2_CY}
            x2={L.x}
            y2={L.y}
            stroke={isTop ? "rgb(250 204 21)" : "rgb(167 139 250)"}
            strokeWidth={sw}
            strokeLinecap="round"
            className="transition-all duration-500"
            opacity={isTop ? 0.92 : 0.18 + strength * 0.55}
            filter={isTop ? `url(#one-glow-${filterId})` : undefined}
          />
        );
      })}
      <circle
        cx={STAGE2_CX}
        cy={STAGE2_CY}
        r={8.4}
        className="animate-step4-one-clue-pulse fill-amber-300/95 stroke-amber-100"
        strokeWidth={0.75}
      />
      <text
        x={STAGE2_CX}
        y={STAGE2_CY + 12}
        textAnchor="middle"
        className="fill-amber-100 font-serif text-[4px] font-bold"
      >
        {token.label.length > 12 ? `${token.label.slice(0, 11)}…` : token.label}
      </text>
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, STAGE2_CX, STAGE2_CY, STAGE2_R);
        const strength = dist[j] / maxP;
        const baseR = 5.2;
        const r = baseR + strength * 2.85;
        const colors = JOB_NODE_COLORS[j];
        const isTop = j === topJ;
        return (
          <JobNodeWithOutsideLabel
            key={j}
            cx={L.x}
            cy={L.y}
            r={r}
            label={jobShortLabel(j)}
            fill={colors.fill}
            stroke={isTop ? "rgb(250 204 21)" : colors.stroke}
            strength={strength}
            centerX={STAGE2_CX}
            centerY={STAGE2_CY}
          />
        );
      })}
    </svg>
  );
}

export function JobNodeWithOutsideLabel({
  cx,
  cy,
  r,
  label,
  fill,
  stroke,
  strength,
  centerX,
  centerY,
  /** Keep the job name inside the circle; shrink type to fit (e.g. single-token pulse districts). */
  forceLabelInside,
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
  forceLabelInside?: boolean;
}) {
  const fontSize = forceLabelInside
    ? Math.max(1.3, Math.min(2.15, r * 0.32 + strength * 0.22))
    : Math.max(2.85, Math.min(4.4, r * 0.62));
  const placeInside = forceLabelInside || r >= 5.8;
  const shortLabel =
    forceLabelInside && label.length > 9 ? `${label.slice(0, 8)}…` : label;
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
          {shortLabel}
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
            {shortLabel}
          </text>
        </>
      )}
    </g>
  );
}

/** Pull-line color by token meaning (animal / trait cues). */
function pullLineColorForToken(t: Step4Token, i: number): string {
  const s = `${t.label} ${t.modelKey}`.toLowerCase();
  if (s.includes("fox")) return "#e8c547";
  if (s.includes("fast")) return "#facc15";
  if (s.includes("helpful")) return "#5eead4";
  if (t.kind === "animal") return "#e8c547";
  return ["#c4b5fd", "#fbbf24", "#6ee7b7", "#fda4af"][i % 4];
}

/** Combine clues: bottom token tray → middle likelihood cloud → top role anchors (fixed three-layer layout). */
const COMB_ANCHOR_CX = 50;
/** Slightly lower so the top role (Manager) ring + label stay inside the viewBox; Community stays fully visible. */
const COMB_ANCHOR_CY = 17;
const COMB_ANCHOR_R = 14;
const COMB_CHIP_Y = 91;

export function Stage3CombineVisual({
  tokens,
  activeIds,
  hoverTokenId,
  fused,
  fusedPct: _fusedPct,
  onHover,
  onToggleToken,
}: {
  tokens: Step4Token[];
  activeIds: Set<string>;
  hoverTokenId: string | null;
  fused: Record<JobId, number>;
  fusedPct?: Record<JobId, number>;
  onHover: (id: string | null) => void;
  onToggleToken: (id: string) => void;
}) {
  const filterId = useId().replace(/:/g, "");
  const n = Math.max(1, tokens.length);

  const pctByJob = useMemo(() => {
    if (_fusedPct) return _fusedPct;
    return toPercentages(fused);
  }, [fused, _fusedPct]);

  const { cloudX, cloudY } = useMemo(() => {
    let sx = 0;
    let sy = 0;
    let wsum = 0;
    for (const j of JOB_IDS) {
      const L = jobRadialXY(j, COMB_ANCHOR_CX, COMB_ANCHOR_CY, COMB_ANCHOR_R);
      const wt = fused[j];
      sx += L.x * wt;
      sy += L.y * wt;
      wsum += wt;
    }
    if (wsum < 1e-12) {
      return { cloudX: 50, cloudY: 47 };
    }
    const mx = sx / wsum;
    const my = sy / wsum;
    return {
      cloudX: 50 + (mx - 50) * 0.5,
      cloudY: 47 + (my - COMB_ANCHOR_CY) * 0.38,
    };
  }, [fused]);

  const tokenPos = useMemo(
    () =>
      tokens.map((t, i) => ({
        t,
        x: 12 + (76 / Math.max(1, n - 1)) * (n === 1 ? 0.5 : i),
        y: COMB_CHIP_Y,
      })),
    [tokens, n],
  );

  /** District emphasis + ring strength from fused probabilities (same numbers as % labels). */
  const roleStrength = useMemo(() => {
    const out: Record<JobId, number> = {
      artist: 0,
      engineer: 0,
      manager: 0,
      community: 0,
    };
    for (const j of JOB_IDS) {
      out[j] = Math.min(1, Math.max(0, pctByJob[j] / 100));
    }
    return out;
  }, [pctByJob]);

  const topPctJob = useMemo(
    () => JOB_IDS.reduce((a, j) => (pctByJob[j] > pctByJob[a] ? j : a), JOB_IDS[0]),
    [pctByJob],
  );

  return (
    <svg
      className="h-[min(78vw,480px)] w-full max-w-[520px] max-h-[min(78vh,520px)]"
      viewBox="0 2 100 114"
      overflow="visible"
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => onHover(null)}
      aria-hidden
    >
      <defs>
        <filter id={`cb-glow-${filterId}`}>
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id={`cb-cloud-${filterId}`} cx="42%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgb(196 181 253)" stopOpacity="0.62" />
          <stop offset="55%" stopColor="rgb(139 92 246)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(49 46 129)" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* Layer 3 — top: light role anchors (directional, not dominant) */}
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, COMB_ANCHOR_CX, COMB_ANCHOR_CY, COMB_ANCHOR_R);
        const hi = roleStrength[j];
        const c = JOB_NODE_COLORS[j];
        const isTop = j === topPctJob;
        const ringOp = isTop ? 0.45 + hi * 0.5 : 0.22 + hi * 0.58;
        const labelOp = isTop ? 0.92 : 0.42 + hi * 0.5;
        const pct = Math.round(pctByJob[j]);
        return (
          <g key={`anchor-${j}`} className="pointer-events-none">
            {isTop ? (
              <circle
                cx={L.x}
                cy={L.y}
                r={7.2 + hi * 0.5}
                fill="none"
                stroke="rgb(250 204 21)"
                strokeWidth={1.1}
                opacity={0.55}
                className="transition-all duration-500"
              />
            ) : null}
            <circle
              cx={L.x}
              cy={L.y}
              r={4.6 + hi * 0.9 + (isTop ? 0.85 : 0)}
              fill="none"
              stroke={isTop ? "rgb(250 204 21)" : c.stroke}
              strokeWidth={isTop ? 0.95 + hi * 0.65 : 0.35 + hi * 0.55}
              opacity={ringOp}
              className="transition-all duration-500"
              filter={isTop ? `url(#cb-glow-${filterId})` : undefined}
            />
            <circle
              cx={L.x}
              cy={L.y}
              r={2.1 + hi * 0.55 + (isTop ? 0.45 : 0)}
              fill={c.fill}
              opacity={isTop ? 0.55 + hi * 0.35 : 0.35 + hi * 0.35}
            />
            <text
              x={L.x}
              y={L.y - 5.2}
              textAnchor="middle"
              className={[
                "font-serif text-[2.5px]",
                isTop ? "font-bold" : "font-medium",
              ].join(" ")}
              fill={isTop ? "rgb(254 243 199)" : "rgb(237 233 254)"}
              opacity={labelOp}
            >
              {jobShortLabel(j)}
            </text>
            <text
              x={L.x}
              y={L.y + 6.4}
              textAnchor="middle"
              className="font-mono text-[2.35px] font-semibold tabular-nums"
              fill={isTop ? "rgb(254 252 232)" : "rgb(254 243 199)"}
              opacity={isTop ? 1 : 0.88}
            >
              {pct}%
            </text>
          </g>
        );
      })}

      {/* Pull lines — behind cloud; grow/retract with dash offset */}
      {tokenPos.map(({ t, x, y }, ti) => {
        const on = activeIds.has(t.id);
        const col = pullLineColorForToken(t, ti);
        const y0 = y - 3.2;
        const len = Math.hypot(cloudX - x, cloudY - y0) || 0.01;
        return (
          <line
            key={`pull-${t.id}`}
            x1={x}
            y1={y0}
            x2={cloudX}
            y2={cloudY}
            stroke={col}
            strokeWidth={0.55}
            strokeLinecap="round"
            opacity={0.82}
            strokeDasharray={`${len} ${len}`}
            strokeDashoffset={on ? 0 : len}
            className="transition-[stroke-dashoffset] duration-[480ms] ease-out"
            style={{ pointerEvents: "none" }}
          />
        );
      })}

      {/* Layer 2 — middle: likelihood / pull field (shifts with fused blend) */}
      <ellipse
        cx={cloudX}
        cy={cloudY}
        rx={12.5}
        ry={8.2}
        fill={`url(#cb-cloud-${filterId})`}
        className="stroke-violet-200/35 transition-all duration-500 ease-out"
        strokeWidth={0.5}
        filter={`url(#cb-glow-${filterId})`}
      />

      {/* Layer 1 — bottom: toggle chips */}
      {tokenPos.map(({ t, x, y }, ti) => {
        const on = activeIds.has(t.id);
        const hover = hoverTokenId === t.id;
        const col = pullLineColorForToken(t, ti);
        const label =
          t.label.length > 9 ? `${t.label.slice(0, 8)}…` : t.label;
        const bw = Math.min(22, 7 + label.length * 1.85);
        const bh = 5.2;
        const lift = hover ? -0.55 : 0;
        const scale = on ? 1.06 : 1;
        return (
          <g
            key={t.id}
            role="button"
            tabIndex={0}
            transform={`translate(${x}, ${y + lift}) scale(${scale})`}
            className="cursor-pointer outline-none transition-transform duration-200 ease-out"
            onMouseEnter={() => onHover(t.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onToggleToken(t.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggleToken(t.id);
              }
            }}
          >
            <title>{`${on ? "On" : "Off"}: ${t.label}. Click to toggle.`}</title>
            <rect
              x={-bw / 2}
              y={-bh / 2}
              width={bw}
              height={bh}
              rx={1.4}
              fill={
                on
                  ? "rgba(76, 29, 149, 0.92)"
                  : "rgba(41, 37, 58, 0.42)"
              }
              stroke={on ? col : "rgba(120, 113, 108, 0.45)"}
              strokeWidth={on ? 0.65 : 0.4}
              opacity={on ? 1 : 0.52}
              className="transition-all duration-300"
              style={
                on
                  ? {
                      filter: `drop-shadow(0 0 3px ${col})`,
                    }
                  : undefined
              }
            />
            <text
              x={0}
              y={1.1}
              textAnchor="middle"
              className="font-serif font-semibold"
              fill={on ? "rgb(250 250 255)" : "rgb(180 170 200)"}
              style={{ fontSize: "2.65px" }}
            >
              {label}
            </text>
          </g>
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
    const times = [700, 2600, 4800, 7000, 9200, 11200, 13400];
    const timers = times.map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [sentence, tokens]);

  const dreamTitle = JOB_DISPLAY[dreamJob].title;
  const aiTitle = JOB_DISPLAY[aiTopJob].title;
  const mismatch = dreamJob !== aiTopJob;

  return (
    <div className="relative flex w-full max-w-lg flex-col gap-4 overflow-hidden rounded-2xl border border-dashed border-violet-400/45 bg-gradient-to-b from-stone-200/15 via-violet-950/65 to-indigo-950/85 px-3 py-4 font-serif text-violet-50 shadow-[inset_0_0_40px_rgba(76,29,149,0.35)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgb(76 29 149) 11px, rgb(76 29 149) 12px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-7 animate-step4-dossier-scan bg-gradient-to-b from-cyan-400/22 to-transparent"
        aria-hidden
      />
      <p className="relative z-10 font-serif text-[0.58rem] font-semibold uppercase tracking-[0.35em] text-violet-200/90">
        Case file / machine readout
      </p>
      <div className="relative z-10 flex flex-col gap-4">
      {step >= 1 ? (
        <div className="rounded-xl border border-violet-400/35 bg-violet-950/45 p-3 text-sm shadow-sm backdrop-blur-[2px]">
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300/90">
            Subject profile (from earlier steps)
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
          className={`mt-1 grid gap-3 rounded-xl border border-dashed p-3 sm:grid-cols-2 ${
            mismatch
              ? "border-amber-400/55 bg-amber-950/35 shadow-[0_0_24px_rgba(251,191,36,0.15)]"
              : "border-emerald-500/45 bg-emerald-950/30"
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
    </div>
  );
}
