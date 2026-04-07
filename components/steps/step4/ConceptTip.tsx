"use client";

import { type ReactNode, useId, useState } from "react";

export type ConceptTipProps = {
  title: string;
  children: ReactNode;
};

export function ConceptTip({ title, children }: ConceptTipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-violet-200/80 bg-violet-50/50">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left font-serif text-sm font-semibold text-violet-950 transition hover:bg-violet-100/60"
      >
        <span>Concept tip: {title}</span>
        <span className="text-violet-600" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        hidden={!open}
        className={open ? "block border-t border-violet-200/60 px-3 py-3" : "hidden"}
      >
        <div className="space-y-2 font-serif text-sm leading-relaxed text-violet-950/90">
          {children}
        </div>
      </div>
    </div>
  );
}
