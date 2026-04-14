"use client";

import type { ReactNode } from "react";

export type OrganizerQuadrantId = "HL" | "HR" | "SL" | "SR";

type OrganizerQuadrantProps = {
  id: OrganizerQuadrantId;
  title: string;
  /** City scatter (dots + icons) drawn behind learner tokens. */
  scatterBehind?: ReactNode;
  children?: ReactNode;
  onDropToken: (instanceId: string, quadrantId: OrganizerQuadrantId) => void;
};

export default function OrganizerQuadrant({
  id,
  title,
  scatterBehind,
  children,
  onDropToken,
}: OrganizerQuadrantProps) {
  return (
    <div
      className="flex min-h-[5.5rem] flex-col rounded-xl border border-dashed border-stone-400/50 bg-white/35 p-2 transition-colors hover:border-amber-400/60 hover:bg-white/50"
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData("text/plain");
        if (raw) onDropToken(raw, id);
      }}
    >
      <p className="mb-1 text-center text-[0.65rem] font-medium uppercase tracking-wide text-stone-600">
        {title}
      </p>
      <div className="relative min-h-[4.75rem] flex-1">
        {scatterBehind}
        <div className="relative z-10 flex min-h-[4.5rem] flex-1 flex-wrap content-start justify-center gap-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
