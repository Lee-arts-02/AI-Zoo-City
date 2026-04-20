"use client";

import { JOB_DISPLAY } from "@/lib/aiModel";
import { JOB_IDS } from "@/lib/step4Model";
import type { JobId } from "@/types/game";

export function DeltaReadout({ deltaPct }: { deltaPct: Record<JobId, number> }) {
  const rows = JOB_IDS.map((j) => ({ j, d: deltaPct[j] }))
    .filter((x) => Math.abs(x.d) >= 1)
    .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
    .slice(0, 3);

  if (rows.length === 0) {
    return (
      <p className="rounded-lg bg-violet-900/20 px-2 py-1.5 font-serif text-[0.7rem] text-violet-100/90">
        Small shifts vs “all clues on”—try another toggle on the left.
      </p>
    );
  }

  return (
    <div className="rounded-lg bg-violet-900/25 px-2 py-2 ring-1 ring-violet-400/30">
      <p className="font-serif text-[0.65rem] font-semibold uppercase tracking-wide text-violet-200/90">
        Shift vs all clues on (points)
      </p>
      <ul className="mt-1 space-y-0.5 font-serif text-[0.75rem] text-violet-50">
        {rows.map(({ j, d }) => (
          <li key={j}>
            <span className="font-medium">{JOB_DISPLAY[j].title}</span>{" "}
            <span className={d > 0 ? "text-emerald-300" : "text-rose-300"}>
              {d > 0 ? "+" : ""}
              {d}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
