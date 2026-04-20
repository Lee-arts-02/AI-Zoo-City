"use client";

import {
  STEP4_BETWEEN_AUTO_SEGMENTS_MS,
  STEP4_CHAR_MS,
} from "@/lib/narrativePacing";
import { Fragment, useEffect, useRef, useState } from "react";

function delay(ms: number) {
  return new Promise<void>((r) => window.setTimeout(r, ms));
}

/** One typed segment; pause between segments = old `//` behavior. */
export type DialogueTypingPart = {
  text: string;
  /** Renders as <strong className="font-bold"> for this segment’s revealed text. */
  emphasis?: boolean;
  /** When true, insert a paragraph gap before this segment (e.g. after `|||` in authored copy). */
  breakBefore?: boolean;
};

export type Step4RobotBubbleRevealProps = {
  /** Single block: character-at-a-time (no inline bold). */
  text?: string;
  /** Multiple segments: type each part char-by-char, pause between parts; optional emphasis. */
  parts?: DialogueTypingPart[];
  lineKey: string;
  onRevealComplete: () => void;
  textClassName?: string;
  showContinue?: boolean;
  onContinue?: () => void;
  continueLabel?: string;
  continueDisabled?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  backDisabled?: boolean;
};

/**
 * Character-at-a-time reveal. `parts` adds segment breaks + optional bold spans (typewriter preserved).
 */
export function Step4RobotBubbleReveal({
  text = "",
  parts,
  lineKey,
  onRevealComplete,
  textClassName = "",
  showContinue = false,
  onContinue,
  continueLabel = "Continue",
  continueDisabled = false,
  showBack = false,
  onBack,
  backDisabled = false,
}: Step4RobotBubbleRevealProps) {
  const [displayed, setDisplayed] = useState("");
  const [richParts, setRichParts] = useState<
    { text: string; emphasis: boolean; breakBefore: boolean }[] | null
  >(null);
  const [isTyping, setIsTyping] = useState(false);
  const doneRef = useRef(false);
  const onRevealCompleteRef = useRef(onRevealComplete);
  onRevealCompleteRef.current = onRevealComplete;

  const hasParts = Boolean(parts && parts.length > 0);
  const textSig = text;
  const partsSig =
    parts
      ?.map(
        (p) =>
          `${p.text}\u0000${p.emphasis ? "1" : "0"}\u0000${p.breakBefore ? "1" : "0"}`,
      )
      .join("\u0001") ?? "";

  useEffect(() => {
    doneRef.current = false;
    let cancelled = false;

    if (hasParts && parts) {
      setDisplayed("");
      setRichParts(
        parts.map((p) => ({
          text: "",
          emphasis: Boolean(p.emphasis),
          breakBefore: Boolean(p.breakBefore),
        })),
      );
      setIsTyping(true);

      (async () => {
        for (let i = 0; i < parts.length; i++) {
          if (cancelled) return;
          // Only pause between `|||` paragraphs — not between inline plain / <b> fragments.
          if (i > 0 && parts[i].breakBefore) {
            await delay(STEP4_BETWEEN_AUTO_SEGMENTS_MS);
            if (cancelled) return;
          }
          const segment = parts[i];
          const em = Boolean(segment.emphasis);
          const br = Boolean(segment.breakBefore);
          for (let c = 1; c <= segment.text.length; c++) {
            if (cancelled) return;
            const slice = segment.text.slice(0, c);
            setRichParts((prev) => {
              if (!prev) return prev;
              const next = [...prev];
              next[i] = { text: slice, emphasis: em, breakBefore: br };
              return next;
            });
            await delay(STEP4_CHAR_MS);
          }
        }
        if (!cancelled && !doneRef.current) {
          doneRef.current = true;
          setIsTyping(false);
          onRevealCompleteRef.current();
        }
      })();

      return () => {
        cancelled = true;
      };
    }

    const effectiveSegments =
      textSig.length > 0 ? [textSig] : [];

    if (effectiveSegments.length === 0) {
      setDisplayed("");
      setRichParts(null);
      setIsTyping(false);
      onRevealCompleteRef.current();
      return;
    }

    setDisplayed("");
    setRichParts(null);
    setIsTyping(true);

    (async () => {
      let built = "";
      for (let i = 0; i < effectiveSegments.length; i++) {
        if (cancelled) return;
        if (i > 0) {
          await delay(STEP4_BETWEEN_AUTO_SEGMENTS_MS);
          if (cancelled) return;
        }
        const part = effectiveSegments[i];
        const prefix = i === 0 ? "" : `${built}\n\n`;
        for (let c = 1; c <= part.length; c++) {
          if (cancelled) return;
          built = prefix + part.slice(0, c);
          setDisplayed(built);
          await delay(STEP4_CHAR_MS);
        }
      }
      if (!cancelled && !doneRef.current) {
        doneRef.current = true;
        setIsTyping(false);
        onRevealCompleteRef.current();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lineKey, textSig, partsSig, hasParts]);

  const showCaret =
    isTyping &&
    (richParts
      ? richParts.some((p) => p.text.length > 0)
      : displayed.length > 0);

  return (
    <div className="relative max-w-full pl-1">
      <div
        className="pointer-events-none absolute -left-1 top-6 z-0 h-4 w-4 rotate-45 rounded-sm border-l-2 border-b-2 border-violet-200/90 bg-violet-50/95 shadow-[-3px_3px_0_0_rgba(139,92,246,0.12)]"
        aria-hidden
      />
      <div
        className="relative z-10 rounded-3xl border-2 border-violet-200/90 bg-violet-50/95 pb-10 pl-5 pr-5 pt-4 shadow-[6px_6px_0_0_rgba(139,92,246,0.22)] backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <p
          className={[
            "min-h-[3.25rem] whitespace-pre-wrap font-serif text-sm leading-relaxed text-violet-950 sm:min-h-[3.5rem] sm:text-[0.95rem] sm:leading-relaxed",
            textClassName,
          ].join(" ")}
        >
          {richParts ? (
            <>
              {richParts.map((p, i) => (
                <Fragment key={i}>
                  {p.breakBefore && p.text.length > 0 ? (
                    <>
                      <br />
                      <br />
                    </>
                  ) : null}
                  <span className="inline">
                    {p.emphasis ? (
                      <strong className="font-bold">{p.text}</strong>
                    ) : (
                      p.text
                    )}
                  </span>
                </Fragment>
              ))}
            </>
          ) : (
            displayed
          )}
          {showCaret ? (
            <span
              className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-violet-600 align-middle sm:h-5"
              aria-hidden
            />
          ) : null}
        </p>
        <div className="pointer-events-auto absolute bottom-2 left-3 right-3 flex items-center justify-between gap-2">
          {showBack && onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={backDisabled || isTyping}
              className="rounded-md px-2 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-wide text-violet-500/95 underline decoration-violet-300/80 underline-offset-2 transition hover:text-violet-800 hover:decoration-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          {showContinue && onContinue ? (
            <button
              type="button"
              onClick={onContinue}
              disabled={continueDisabled || isTyping}
              className="rounded-md px-2 py-1 font-sans text-[0.65rem] font-medium uppercase tracking-wide text-violet-600/90 underline decoration-violet-300/80 underline-offset-2 transition hover:text-violet-800 hover:decoration-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {continueLabel} →
            </button>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
