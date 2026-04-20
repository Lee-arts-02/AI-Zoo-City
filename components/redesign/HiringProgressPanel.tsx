"use client";

import type { DistrictDeltaLine } from "@/lib/hiringStats";

export type HiringProgressPanelProps = {
  processedCount: number;
  total: number;
  showMidFeedback: boolean;
  deltaLines: DistrictDeltaLine[];
  biasLines: string[];
};

export function HiringProgressPanel({
  processedCount,
  total,
  showMidFeedback,
  deltaLines,
  biasLines,
}: HiringProgressPanelProps) {
  return (
    <div className="space-y-3 rounded-2xl border border-rose-200/90 bg-rose-50/50 px-4 py-3 font-serif text-rose-950">
      <p className="text-sm font-semibold">
        Progress: {processedCount} / {total} candidates reviewed
      </p>

      {showMidFeedback ? (
        <div className="space-y-2 border-t border-rose-200/70 pt-3 text-sm">
          <p className="font-semibold text-rose-900">How the city is shifting</p>
          <ul className="list-inside list-disc space-y-1 text-rose-900/90">
            {deltaLines.map((l) => (
              <li key={l.label}>{l.label}</li>
            ))}
          </ul>
          {biasLines.length > 0 ? (
            <div>
              <p className="mt-2 font-medium text-rose-900/90">Quick read</p>
              <ul className="mt-1 list-inside list-disc space-y-1 text-rose-900/85">
                {biasLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="border-t border-rose-200/70 pt-3 text-xs text-rose-800/75">
          After you review 8 candidates, you’ll see a light summary of how district counts and
          patterns are changing.
        </p>
      )}
    </div>
  );
}
