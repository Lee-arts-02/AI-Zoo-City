"use client";

import { JOB_DISPLAY } from "@/lib/aiModel";
import { JOB_IDS } from "@/lib/step4Model";
import type { JobId } from "@/types/game";
import { useEffect, useMemo, useState } from "react";

/**
 * Phase 5 — dossier-style prediction: role cards, clue line, soft stagger + top float.
 */
export function Step4PredictionCardsVisual({
  fusedPct,
  clueLabelsLine,
}: {
  fusedPct: Record<JobId, number>;
  clueLabelsLine: string;
}) {
  const ranked = useMemo(
    () =>
      [...JOB_IDS]
        .map((j) => ({ j, p: fusedPct[j] ?? 0 }))
        .sort((a, b) => b.p - a.p),
    [fusedPct],
  );
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    const timers: number[] = [];
    ranked.forEach((_, idx) => {
      timers.push(
        window.setTimeout(() => setVisibleCount((c) => Math.max(c, idx + 1)), 380 + idx * 320),
      );
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [ranked]);

  return (
    <div className="flex w-full max-w-md flex-col gap-5 px-3 py-6 font-serif text-violet-50">
      <p className="text-center font-serif text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-violet-300/90">
        Prediction
      </p>
      <p className="text-center font-serif text-lg font-semibold text-violet-100/95 sm:text-xl">
        Most likely right now
      </p>
      <ul className="flex flex-col gap-2.5">
        {ranked.map(({ j, p }, idx) => {
          const isTop = idx === 0;
          const on = visibleCount > idx;
          if (!on) return null;
          return (
            <li
              key={j}
              className={[
                "rounded-xl border px-4 py-3",
                isTop
                  ? "border-amber-400/50 bg-gradient-to-r from-violet-900/80 to-indigo-900/75 shadow-[0_0_24px_rgba(251,191,36,0.12)]"
                  : "border-violet-500/35 bg-violet-950/50",
              ].join(" ")}
              style={{ animation: "step4-pred-card-in 0.55s ease-out both" }}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className={[
                    "text-sm sm:text-base",
                    isTop ? "font-semibold text-amber-100/95" : "font-medium text-violet-100/90",
                  ].join(" ")}
                  style={
                    isTop
                      ? { animation: "step4-pred-top-float 4.5s ease-in-out infinite" }
                      : undefined
                  }
                >
                  {JOB_DISPLAY[j].title}
                </span>
                <span className="tabular-nums text-sm font-semibold text-violet-200/95">
                  {Math.round(p)}%
                </span>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-center font-serif text-[0.72rem] leading-relaxed text-violet-300/90">
        Based on current clues: {clueLabelsLine}
      </p>
      <p className="text-center font-serif text-[0.68rem] text-violet-400/85">
        A likely role is not a final decision.
      </p>
    </div>
  );
}
