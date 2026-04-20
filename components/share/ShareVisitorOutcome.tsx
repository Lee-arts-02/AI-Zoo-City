"use client";

import type { VisitorInferenceResult, VisitorProbabilityRow } from "@/lib/shareVisitorInference";
import { useState } from "react";

function ProbabilityBar({ row }: { row: VisitorProbabilityRow }) {
  const width = Math.min(100, Math.max(0, row.pct));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 font-serif text-sm text-amber-950">
        <span className="font-medium">{row.label}</span>
        <span className="tabular-nums text-amber-900/85">{row.pct}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-amber-100/90 ring-1 ring-amber-900/8">
        <div
          className="h-full min-w-[2px] rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-[width]"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export type ShareVisitorOutcomeProps = {
  result: VisitorInferenceResult;
  visitorLabel: string;
  dreamLabel: string;
};

export function ShareVisitorOutcome({ result, visitorLabel, dreamLabel }: ShareVisitorOutcomeProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div className="mt-10 space-y-6">
      <div
        className={`overflow-hidden rounded-3xl border-2 shadow-md ring-1 ${
          result.approved
            ? "border-emerald-300/90 bg-gradient-to-b from-emerald-50/95 to-white ring-emerald-900/10"
            : "border-rose-300/85 bg-gradient-to-b from-rose-50/90 to-white ring-rose-900/10"
        }`}
      >
        <div className="px-5 pb-5 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
          <div className="flex flex-col items-center text-center">
            <span
              className={`inline-flex rounded-full px-4 py-1 font-serif text-xs font-bold uppercase tracking-[0.18em] ${
                result.approved
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-rose-700 text-white shadow-sm"
              }`}
            >
              {result.approved ? "Approved" : "Rejected"}
            </span>
            {!result.approved ? (
              <p className="mt-2 font-serif text-xs font-medium text-rose-900/75">
                Rejected by this Zoo City model
              </p>
            ) : (
              <p className="mt-3 font-serif text-sm font-semibold text-emerald-900/85">
                Approved for
              </p>
            )}
            <p
              className={`font-serif text-2xl font-bold leading-tight text-amber-950 sm:text-3xl ${
                result.approved ? "mt-1" : "mt-4"
              }`}
            >
              {result.outcomeLabel}
            </p>
            <p className="mt-4 max-w-md font-serif text-base leading-relaxed text-amber-950/95">
              {result.summaryLine}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-900/10 bg-white/90 px-4 py-3 text-center font-serif text-sm text-amber-900/85 shadow-inner">
        <span className="font-semibold text-amber-950">{visitorLabel}</span>
        <span className="text-amber-800/70"> · </span>
        <span>{dreamLabel}</span>
      </div>

      <div className="rounded-2xl border border-amber-200/80 bg-white/95 p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setDetailsOpen((o) => !o)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-serif text-sm font-semibold text-amber-950 transition hover:bg-amber-50/90"
          aria-expanded={detailsOpen}
          aria-controls="share-model-reasoning-panel"
          id="share-model-reasoning-toggle"
        >
          {detailsOpen ? "Hide details" : "See model reasoning"}
          <span
            className={`inline-block text-amber-700 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
            aria-hidden
          >
            ▼
          </span>
        </button>

        {detailsOpen ? (
          <div
            id="share-model-reasoning-panel"
            role="region"
            aria-labelledby="share-model-reasoning-toggle"
            className="space-y-5 border-t border-amber-100 px-4 pb-5 pt-4 sm:px-5"
          >
            <ul className="space-y-1.5 font-serif text-xs leading-relaxed text-amber-900/88">
              {result.framingLines.map((line) => (
                <li key={line} className="flex gap-2 text-left">
                  <span className="mt-[0.35em] h-1 w-1 shrink-0 rounded-full bg-amber-500/80" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <p className="font-serif text-xs font-semibold uppercase tracking-wide text-amber-800/80">
                Model probabilities
              </p>
              <div className="space-y-3.5">
                {result.probabilities.map((row) => (
                  <ProbabilityBar key={row.id} row={row} />
                ))}
              </div>
            </div>

            <p className="rounded-xl bg-amber-50/90 px-3 py-2.5 font-serif text-xs leading-relaxed text-amber-950/90 ring-1 ring-amber-900/8">
              {result.approved
                ? "Approved means one path had enough probability mass and enough lead over the runner-up for this shared model to call a clear match."
                : "Rejected means no path reached that bar — the distribution stayed too close to pick one district with confidence."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
