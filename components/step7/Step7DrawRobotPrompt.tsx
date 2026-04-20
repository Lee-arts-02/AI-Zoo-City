"use client";

import { STEP4_CHAR_MS } from "@/lib/narrativePacing";
import Image from "next/image";
import { useEffect, useState } from "react";

const DRAW_PROMPT = "Draw yourself in your Zoo City.";

function delay(ms: number) {
  return new Promise<void>((r) => {
    window.setTimeout(r, ms);
  });
}

export type Step7DrawRobotPromptProps = {
  /** Change to restart typing (e.g. when re-entering the draw phase). */
  lineKey: string;
};

/**
 * Step 7 draw phase: wide sky bubble on top, robot below with gentle float — typewriter line stays after complete.
 */
export function Step7DrawRobotPrompt({ lineKey }: Step7DrawRobotPromptProps) {
  const [displayed, setDisplayed] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDisplayed("");
    setTypingDone(false);

    (async () => {
      for (let c = 1; c <= DRAW_PROMPT.length; c++) {
        if (cancelled) return;
        await delay(STEP4_CHAR_MS);
        if (cancelled) return;
        setDisplayed(DRAW_PROMPT.slice(0, c));
      }
      if (!cancelled) setTypingDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [lineKey]);

  return (
    <div className="flex w-full flex-col items-stretch gap-5 sm:gap-6">
      <div className="relative mx-auto w-full min-w-0 max-w-2xl sm:max-w-3xl lg:max-w-[40rem] xl:max-w-[44rem]">
        <div
          className="relative z-10 w-full rounded-3xl border-2 border-sky-200/90 bg-white/95 px-5 py-4 shadow-[6px_6px_0_0_rgba(14,165,233,0.14)] sm:px-8 sm:py-5"
          role="status"
          aria-live="polite"
        >
          <p className="min-h-[3.25rem] font-serif text-base leading-relaxed text-amber-950 sm:min-h-[3.5rem] sm:text-lg sm:leading-relaxed">
            {displayed}
            {!typingDone ? (
              <span
                className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-sky-500 align-middle sm:h-5"
                aria-hidden
              />
            ) : null}
          </p>
        </div>
        {/* Tail pointing down toward the robot */}
        <div
          className="pointer-events-none absolute -bottom-2 left-1/2 z-0 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-sky-200/90 bg-white/95 shadow-[3px_3px_0_0_rgba(14,165,233,0.1)]"
          aria-hidden
        />
      </div>

      <div className="flex justify-center pt-1">
        <div className="animate-step7-draw-robot-float motion-reduce:animate-none">
          <Image
            src="/robot.png"
            alt=""
            width={102}
            height={102}
            className="h-[4.75rem] w-auto object-contain drop-shadow-md sm:h-[5.5rem]"
          />
        </div>
      </div>
    </div>
  );
}
