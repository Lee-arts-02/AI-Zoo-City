"use client";

import type { ReactNode } from "react";
import { getDistrictConfig } from "@/data/districtConfig";
import { JOB_DISPLAY } from "@/lib/aiModel";
import { JOB_IDS } from "@/lib/step4Model";
import type { Step4Token } from "@/lib/step4Tokens";
import type { JobId } from "@/types/game";
import type { DistrictId } from "@/types/city";

function rankedJobs(pct: Record<JobId, number>) {
  return [...JOB_IDS]
    .map((j) => ({ j, p: pct[j] ?? 0 }))
    .sort((a, b) => b.p - a.p);
}

type ScaffoldShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function ScaffoldShell({ title, subtitle, children }: ScaffoldShellProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-violet-300/60 bg-white/90 px-3 py-3 shadow-[4px_4px_0_0_rgba(167,139,250,0.2)]"
      aria-label={title}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-serif text-[0.65rem] font-semibold uppercase tracking-wide text-violet-800/95">
          {title}
        </p>
        <span className="shrink-0 rounded-full bg-violet-100/90 px-2 py-0.5 font-serif text-[0.58rem] text-violet-700/90">
          live demo
        </span>
      </div>
      {subtitle ? (
        <p className="mt-1 font-serif text-[0.72rem] leading-snug text-violet-900/88">{subtitle}</p>
      ) : null}
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

/** Phase 3 — gentle directional lean (top 2), minimal numbers. */
function GentlePatternLean({
  pct,
  topJob,
}: {
  pct: Record<JobId, number>;
  topJob: JobId;
}) {
  const ranked = rankedJobs(pct).slice(0, 2);
  const maxP = Math.max(1, ...ranked.map((r) => r.p));

  return (
    <ScaffoldShell
      title="Pattern lean"
      subtitle="A soft pull — not a final score. The memory layer nudges toward roles that showed up with similar clues before."
    >
      <ul className="space-y-2">
        {ranked.map(({ j, p }) => {
          const w = Math.round((p / maxP) * 100);
          const isTop = j === topJob;
          return (
            <li key={j}>
              <div className="flex items-center justify-between gap-2 font-serif text-[0.78rem] text-violet-950">
                <span className={isTop ? "font-semibold" : ""}>{JOB_DISPLAY[j].title}</span>
                <span className="text-[0.65rem] text-violet-600/90">
                  {isTop ? "stronger lean" : "lighter"}
                </span>
              </div>
              <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-violet-100/90">
                <div
                  className={
                    isTop
                      ? "h-full rounded-full bg-gradient-to-r from-amber-300 to-violet-500 transition-[width] duration-700 ease-out"
                      : "h-full rounded-full bg-violet-300/80 transition-[width] duration-700 ease-out"
                  }
                  style={{ width: `${w}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ScaffoldShell>
  );
}

function OneClueLeanView({
  pct,
  tokenLabel,
  topJob,
}: {
  pct: Record<JobId, number>;
  tokenLabel: string;
  topJob: JobId;
}) {
  const ranked = rankedJobs(pct).slice(0, 3);
  const maxP = Math.max(1, ...ranked.map((r) => r.p));

  return (
    <ScaffoldShell
      title="One clue only"
      subtitle={`If the machine only sees “${tokenLabel}”, the lean toward one role should jump out.`}
    >
      <ul className="space-y-2.5">
        {ranked.map(({ j, p }) => {
          const w = Math.round((p / maxP) * 100);
          const isTop = j === topJob;
          return (
            <li
              key={j}
              className={[
                "rounded-lg px-1.5 py-1 transition-all duration-500",
                isTop ? "bg-amber-100/85 ring-2 ring-amber-400/80" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2 font-serif text-[0.78rem] text-violet-950">
                <span className={isTop ? "font-bold" : ""}>{JOB_DISPLAY[j].title}</span>
                <span className="tabular-nums font-medium text-violet-800/95">{Math.round(p)}%</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-violet-100/90 ring-1 ring-violet-200/80">
                <div
                  className={
                    isTop
                      ? "h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-600 shadow-[0_0_12px_rgba(251,191,36,0.4)] transition-[width] duration-700 ease-out"
                      : "h-full rounded-full bg-violet-300/90 transition-[width] duration-700 ease-out"
                  }
                  style={{ width: `${w}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ScaffoldShell>
  );
}

function CombineLiveView({
  pct,
  deltaPct,
  emphasizeJob,
}: {
  pct: Record<JobId, number>;
  deltaPct: Record<JobId, number>;
  emphasizeJob: JobId;
}) {
  const ranked = rankedJobs(pct);
  const maxP = Math.max(1, ...ranked.map((r) => r.p));

  return (
    <ScaffoldShell
      title="Live shift"
      subtitle="Toggle clues on the left. The strongest pull should jump out — watch it move when you switch clues."
    >
      <ul className="space-y-2.5">
        {ranked.map(({ j, p }) => {
          const w = Math.round((p / maxP) * 100);
          const isTop = emphasizeJob === j || ranked[0]?.j === j;
          const d = deltaPct[j];
          const showDelta = Math.abs(d) >= 0.5;
          return (
            <li
              key={j}
              className={[
                "rounded-lg px-1.5 py-1 transition-all duration-500",
                isTop ? "bg-amber-100/80 ring-2 ring-amber-400/70" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2 font-serif text-[0.75rem] text-violet-950">
                <span className={isTop ? "font-bold" : ""}>{JOB_DISPLAY[j].title}</span>
                <span className="tabular-nums text-violet-800/95">
                  {Math.round(p)}%
                  {showDelta ? (
                    <span
                      className={
                        d > 0 ? " ml-1 font-semibold text-emerald-700" : d < 0 ? " ml-1 font-semibold text-rose-700" : " ml-1 text-stone-500"
                      }
                    >
                      ({d > 0 ? "+" : ""}
                      {Math.round(d)} vs all on)
                    </span>
                  ) : null}
                </span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-violet-100/90 ring-1 ring-violet-200/80">
                <div
                  className={[
                    "h-full rounded-full transition-[width] duration-700 ease-out",
                    isTop
                      ? "bg-gradient-to-r from-amber-400 via-orange-400 to-violet-600 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
                      : "bg-gradient-to-r from-violet-300 to-violet-400/90",
                  ].join(" ")}
                  style={{ width: `${w}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ScaffoldShell>
  );
}

function PredictionSpreadView({
  pct,
  emphasizeJob,
}: {
  pct: Record<JobId, number>;
  emphasizeJob: JobId;
}) {
  const ranked = rankedJobs(pct);
  const maxP = Math.max(1, ...ranked.map((r) => r.p));

  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-violet-400/55 bg-gradient-to-br from-stone-100/95 via-violet-50/90 to-indigo-50/85 px-3 py-3 shadow-[3px_6px_0_0_rgba(109,40,217,0.12)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 11px, rgb(76 29 149) 11px, rgb(76 29 149) 12px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-6 animate-step4-dossier-scan bg-gradient-to-b from-cyan-400/25 to-transparent"
        aria-hidden
      />
      <div className="relative">
        <p className="font-serif text-[0.58rem] font-semibold uppercase tracking-[0.28em] text-violet-700/90">
          Analysis output
        </p>
        <p className="mt-0.5 font-serif text-[0.72rem] leading-snug text-violet-900/88">
          Pattern file — likely roles ranked from processed clues (not a verdict).
        </p>
        <p className="mt-2 rounded border border-amber-400/45 bg-amber-100/80 px-2 py-1 text-center font-serif text-[0.65rem] font-semibold text-amber-950">
          More likely ≠ final decision
        </p>
        <ul className="mt-2.5 space-y-2">
          {ranked.map(({ j, p }, idx) => {
            const w = Math.round((p / maxP) * 100);
            const isTop = emphasizeJob === j || ranked[0]?.j === j;
            return (
              <li
                key={j}
                className="animate-step4-dossier-row"
                style={{ animationDelay: `${80 + idx * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-2 font-serif text-[0.72rem] text-violet-950">
                  <span className={isTop ? "font-semibold" : ""}>{JOB_DISPLAY[j].title}</span>
                  <span className="tabular-nums font-medium text-violet-900">{Math.round(p)}%</span>
                </div>
                <div className="mt-0.5 h-2.5 overflow-hidden rounded-full bg-violet-100/90 ring-1 ring-violet-300/40">
                  <div
                    className={
                      isTop
                        ? "h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-[900ms] ease-out"
                        : "h-full rounded-full bg-violet-300/85 transition-[width] duration-[900ms] ease-out"
                    }
                    style={{ width: `${w}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CityConsequenceView({
  districtId,
  topJob,
}: {
  districtId: DistrictId;
  topJob: JobId;
}) {
  const d = getDistrictConfig(districtId);
  const role = JOB_DISPLAY[topJob].title;

  return (
    <ScaffoldShell
      title="Mapping consequence"
      subtitle="Focus on what repeats across the map — not the numbers anymore."
    >
      <div className="rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50/95 to-violet-50/80 px-3 py-2.5">
        <p className="font-serif text-sm font-semibold text-violet-950">{d.title}</p>
        <p className="mt-1 font-serif text-[0.78rem] leading-snug text-violet-900/90">
          The system’s top pattern guess points toward <span className="font-semibold">{role}</span>.
          Repeated placements can make neighborhoods look alike — that is why people stay in the
          loop.
        </p>
      </div>
    </ScaffoldShell>
  );
}

export type Step4PossibilityScaffoldProps = {
  stage: number;
  beat: number;
  tokens: Step4Token[];
  oneCluePct: Record<JobId, number>;
  patternBridgePct: Record<JobId, number>;
  fusedPct: Record<JobId, number>;
  predictionPct: Record<JobId, number>;
  deltaPct: Record<JobId, number>;
  topJobOneClue: JobId;
  patternLeanTop: JobId;
  fusedTop: JobId;
  predTop: JobId;
  cityHighlight: DistrictId;
  tokenLabel: string;
};

/**
 * Right column: pattern lean + one-clue live views live on the left demo now.
 * Combine phase only: live shift summary.
 */
export function Step4PossibilityScaffold({
  stage,
  beat: _beat,
  tokens: _tokens,
  oneCluePct: _oneCluePct,
  patternBridgePct: _patternBridgePct,
  fusedPct,
  predictionPct: _predictionPct,
  deltaPct,
  topJobOneClue: _topJobOneClue,
  patternLeanTop: _patternLeanTop,
  fusedTop,
  predTop: _predTop,
  cityHighlight: _cityHighlight,
  tokenLabel: _tokenLabel,
}: Step4PossibilityScaffoldProps) {
  if (stage <= 4 || stage === 6 || stage === 7 || stage === 8) return null;

  if (stage === 5) {
    return <CombineLiveView pct={fusedPct} deltaPct={deltaPct} emphasizeJob={fusedTop} />;
  }

  return null;
}
