"use client";

import { JOB_IDS, toPercentages } from "@/lib/step4Model";
import type { JobId } from "@/types/game";
import type { Step4Token } from "@/lib/step4Tokens";
import { useMemo } from "react";
import { jobRadialXY, JOB_NODE_COLORS } from "./jobRadialLayout";
import { JobNodeWithOutsideLabel, jobShortLabel } from "./stageVisuals";

const HUB_X = 50;
/** Hub shifted up so role rings sit higher above the token tray (less overlap with Community + labels). */
const HUB_Y = 42;
const JOB_R = 26;
/** Token chips sit lower in the viewBox — more gap between districts and tokens. */
const TOKEN_Y = 97;

const TOKEN_LINE = ["rgb(167 139 250)", "rgb(251 191 36)", "rgb(52 211 153)", "rgb(248 113 113)"];

/**
 * Single-token pulse: one selected clue → faint pattern field → flow to four roles;
 * top role slightly emphasized + “More likely right now” (not a fixed job mapping).
 */
export function SingleTokenPulseVisual({
  tokens,
  selectedId,
  onSelectToken,
  dist,
  pulseKey,
}: {
  tokens: Step4Token[];
  selectedId: string;
  onSelectToken: (id: string) => void;
  dist: Record<JobId, number>;
  pulseKey: number;
}) {
  const show = useMemo(() => tokens.slice(0, 4), [tokens]);
  const maxP = Math.max(...JOB_IDS.map((j) => dist[j]), 1e-9);
  const topJ = JOB_IDS.reduce((a, j) => (dist[j] > dist[a] ? j : a), JOB_IDS[0]);
  const pctByJob = useMemo(() => toPercentages(dist), [dist]);
  const n = Math.max(show.length, 1);

  const tokenXs = show.map((_, i) => 14 + (72 / Math.max(n - 1, 1)) * (n === 1 ? 0.5 : i));

  return (
    <svg
      className="h-[min(80vw,520px)] w-full max-w-[540px] overflow-visible text-violet-200"
      viewBox="-6 -8 112 128"
      preserveAspectRatio="xMidYMid meet"
      aria-label="One token pulse toward possible roles"
    >
      <defs>
        <filter id="stp-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="stp-cloud" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="rgb(30 27 75)" stopOpacity="0.12" />
        </radialGradient>
      </defs>

      {/* Faint pattern field */}
      <ellipse
        cx={HUB_X}
        cy={HUB_Y}
        rx={14}
        ry={9}
        fill="url(#stp-cloud)"
        className="stroke-violet-400/25"
        strokeWidth={0.4}
        opacity={0.45}
      />

      {/* Role nodes — similar base sizes; top gets slight emphasis */}
      {JOB_IDS.map((j) => {
        const L = jobRadialXY(j, HUB_X, HUB_Y - 2, JOB_R);
        const strength = dist[j] / maxP;
        const isTop = j === topJ;
        const baseR = 4.8;
        const r = isTop ? baseR + 1.1 + strength * 1.8 : baseR + strength * 2.2;
        const c = JOB_NODE_COLORS[j];
        return (
          <g key={j}>
            <line
              x1={HUB_X}
              y1={HUB_Y + 8}
              x2={L.x}
              y2={L.y - r * 0.35}
              stroke={isTop ? "rgb(250 204 21)" : "rgb(139 92 246)"}
              strokeWidth={isTop ? 0.85 + strength * 0.9 : 0.35 + strength * 0.55}
              strokeLinecap="round"
              opacity={isTop ? 0.55 + strength * 0.4 : 0.12 + strength * 0.45}
              className="transition-all duration-700"
              style={{
                animation: pulseKey >= 0 ? "step4-pulse-line 1.4s ease-out forwards" : undefined,
              }}
            />
            <JobNodeWithOutsideLabel
              cx={L.x}
              cy={L.y}
              r={r}
              label={jobShortLabel(j)}
              fill={c.fill}
              stroke={isTop ? "rgb(250 204 21)" : c.stroke}
              strength={strength}
              centerX={HUB_X}
              centerY={HUB_Y}
              forceLabelInside
            />
            <text
              x={L.x}
              y={L.y + r + 4.2}
              textAnchor="middle"
              className="fill-violet-200/90 font-mono text-[2.15px] font-semibold tabular-nums"
            >
              {Math.round(pctByJob[j])}%
            </text>
            {isTop ? (
              <g>
                <text
                  x={L.x}
                  y={L.y + r + 7.8}
                  textAnchor="middle"
                  className="fill-amber-200/98 font-serif text-[2.15px] font-semibold"
                >
                  More likely
                </text>
                <text
                  x={L.x}
                  y={L.y + r + 10.6}
                  textAnchor="middle"
                  className="fill-amber-200/98 font-serif text-[2.15px] font-semibold"
                >
                  right now
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {/* Token row — clickable */}
      {show.map((t, i) => {
        const x = tokenXs[i] ?? 50;
        const sel = t.id === selectedId;
        const col = TOKEN_LINE[i % TOKEN_LINE.length];
        return (
          <g key={t.id}>
            <line
              x1={x}
              y1={TOKEN_Y - 5}
              x2={HUB_X}
              y2={HUB_Y + 9}
              stroke={sel ? col : "rgb(100 80 140)"}
              strokeWidth={sel ? 1.05 : 0.35}
              strokeLinecap="round"
              opacity={sel ? 0.85 : 0.15}
              className="transition-all duration-500"
            />
            <g
              className="cursor-pointer"
              onClick={() => onSelectToken(t.id)}
              style={{ transformOrigin: `${x}% ${TOKEN_Y}%` }}
            >
              <rect
                x={x - 9}
                y={TOKEN_Y - 5.5}
                width={18}
                height={11}
                rx={3}
                className={
                  sel
                    ? "fill-violet-200 stroke-amber-400 transition-all duration-300"
                    : "fill-violet-900/50 stroke-violet-500/40 transition-all duration-300"
                }
                strokeWidth={0.55}
                filter={sel ? "url(#stp-glow)" : undefined}
                style={{
                  transform: sel ? "scale(1.08)" : "scale(1)",
                  transformBox: "fill-box",
                }}
              />
              <text
                x={x}
                y={TOKEN_Y + 0.8}
                textAnchor="middle"
                className={
                  sel
                    ? "fill-violet-950 font-serif text-[2.8px] font-bold"
                    : "fill-violet-300/90 font-serif text-[2.6px] font-medium"
                }
              >
                {t.label.length > 10 ? `${t.label.slice(0, 9)}…` : t.label}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
