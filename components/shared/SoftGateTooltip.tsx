"use client";

import { STEP3_SOFT_GATE_MESSAGE } from "@/lib/step3SortingGate";
import type { ReactNode } from "react";

type SoftGateTooltipProps = {
  show: boolean;
  children: ReactNode;
  /** Defaults to the Step 3 friendly gate copy. */
  message?: string;
  /** Match nearby UI (violet = map CTA, amber = story nav). */
  tone?: "violet" | "amber";
};

const TONE: Record<NonNullable<SoftGateTooltipProps["tone"]>, string> = {
  violet:
    "border-violet-200/80 text-violet-950 ring-violet-100/80 bg-white/95",
  amber:
    "border-amber-200/85 text-amber-950 ring-amber-100/80 bg-amber-50/95",
};

/**
 * Speech-bubble style hint above a control; pair with local state + ~2s timer for fade behavior.
 */
export function SoftGateTooltip({
  show,
  children,
  message = STEP3_SOFT_GATE_MESSAGE,
  tone = "violet",
}: SoftGateTooltipProps) {
  const toneClass = TONE[tone];
  return (
    <div className="relative inline-flex w-full max-w-full flex-col items-center sm:w-auto">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-full left-1/2 z-[70] mb-2 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border px-3 py-2.5 text-center text-[0.8125rem] leading-snug shadow-md ring-1 transition-opacity duration-300 ease-out sm:text-sm ${toneClass} ${
          show ? "opacity-100" : "opacity-0"
        }`}
      >
        {message}
      </div>
      {children}
    </div>
  );
}
