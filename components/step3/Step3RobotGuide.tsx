"use client";

import Image from "next/image";
import {
  STEP3_BETWEEN_SENTENCES_MS,
  STEP3_CHAR_MS,
} from "@/components/step3/step3RobotScripts";
import { useEffect, useRef, useState } from "react";

export type Step3RobotAnchor = "overview" | "info" | "sort" | "organizer";

const ANCHOR_CLASS: Record<Step3RobotAnchor, string> = {
  overview:
    "fixed top-[5rem] left-1/2 z-[60] w-[min(94vw,30rem)] -translate-x-1/2 max-sm:top-[4.25rem]",
  info: "fixed top-24 right-2 z-[60] w-[min(88vw,20rem)] sm:top-28 sm:right-6 md:right-10",
  /**
   * Beside the Sorting space button (top-left ~10–11rem): start after the button + gap, do not cover it.
   */
  sort: "fixed left-[11rem] top-3 z-[60] w-[min(18rem,calc(100vw-12rem))] max-sm:left-[10.5rem] max-sm:top-2 sm:left-[12rem] sm:top-4 md:left-[12.5rem]",
  organizer:
    "fixed bottom-[min(42vh,22rem)] left-3 z-[60] w-[min(92vw,24rem)] sm:left-6 md:max-w-[26rem]",
};

/**
 * Reveal ask / post-reveal: upper band, horizontally in the “right-center” slice (~53–58% from left —
 * between the midline and ~60%, i.e. right half toward 右五分之二), clear of Sorting space on the left.
 * Exported so parents can align stacked controls (e.g. choice buttons) under the same column.
 */
export const STEP3_CENTER_INTERLUDE_OUTER_CLASS =
  "fixed left-[53%] top-[min(7rem,14vh)] z-[60] min-w-[12rem] w-[min(36vw,28rem)] max-w-[calc(100vw-2rem)] -translate-x-1/2 sm:left-[56%] sm:top-[min(8.25rem,13vh)] md:left-[58%]";

/** “Let’s open the box!” — sits just above the overview Open Box button. */
const OPEN_BOX_ABOVE_CLASS =
  "fixed left-1/2 bottom-[max(6.75rem,19vh)] z-[60] w-[min(94vw,30rem)] -translate-x-1/2 max-sm:bottom-[max(6rem,21vh)]";

export type Step3RobotSentence =
  | string
  | {
      text: string;
      anchor: Step3RobotAnchor;
    };

function sentenceText(s: Step3RobotSentence): string {
  return typeof s === "string" ? s : s.text;
}

function sentenceAnchor(s: Step3RobotSentence, fallback: Step3RobotAnchor): Step3RobotAnchor {
  return typeof s === "string" ? fallback : s.anchor;
}

/** Default / district / organizer robot scale. */
const ROBOT_DEFAULT_CLASS = "h-[4.2rem] w-auto sm:h-[4.85rem]";
/** +50% vs default overview scale (4.2 × 1.5 = 6.3). */
const ROBOT_OVERVIEW_CLASS = "h-[6.3rem] w-auto sm:h-[7.28rem]";
/** Another +50% on top of overview scale — only for reveal ask / post-reveal interludes. */
const ROBOT_CENTER_INTERLUDE_XL_CLASS = "h-[9.45rem] w-auto sm:h-[10.92rem]";

type Step3RobotGuideProps = {
  anchor?: Step3RobotAnchor;
  sentences: Step3RobotSentence[];
  onSequenceComplete?: () => void;
  visible?: boolean;
  /** Larger robot for Step 3 overview + bridge; centerInterlude = XL + panel; openBoxAbove = above Open Box CTA. */
  variant?: "default" | "overview" | "centerInterlude" | "openBoxAbove";
  /** Image under /public (default /robot.png). */
  robotSrc?: string;
  /**
   * Milliseconds to wait after sentence `i` finishes typing before starting sentence `i + 1`.
   * Length must be `sentences.length - 1` when provided; omitted entries use STEP3_BETWEEN_SENTENCES_MS.
   */
  msBeforeNextSentence?: number[];
  /**
   * When `variant` is centerInterlude, render only the inner card (no fixed outer) so a parent can
   * wrap dialogue + controls in one column.
   */
  embedCenterInterlude?: boolean;
};

export default function Step3RobotGuide({
  anchor: defaultAnchor = "overview",
  sentences,
  onSequenceComplete,
  visible = true,
  variant = "default",
  robotSrc = "/robot.png",
  msBeforeNextSentence,
  embedCenterInterlude = false,
}: Step3RobotGuideProps) {
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const onCompleteRef = useRef(onSequenceComplete);
  const sequenceDoneRef = useRef(false);
  onCompleteRef.current = onSequenceComplete;

  const current = sentences[sentenceIdx];
  const anchor = current
    ? sentenceAnchor(current, defaultAnchor)
    : defaultAnchor;

  const robotSizeClass =
    variant === "centerInterlude"
      ? ROBOT_CENTER_INTERLUDE_XL_CLASS
      : variant === "overview" || variant === "openBoxAbove"
        ? ROBOT_OVERVIEW_CLASS
        : ROBOT_DEFAULT_CLASS;

  const imgSize =
    variant === "centerInterlude" ? 194 : variant === "overview" || variant === "openBoxAbove" ? 129 : 86;

  const centerInterludeOuterClass = embedCenterInterlude
    ? "w-full max-w-full pointer-events-none transition-all duration-500 ease-out"
    : `${STEP3_CENTER_INTERLUDE_OUTER_CLASS} pointer-events-none transition-all duration-500 ease-out`;

  const outerClass =
    variant === "centerInterlude"
      ? centerInterludeOuterClass
      : variant === "openBoxAbove"
        ? `${OPEN_BOX_ABOVE_CLASS} pointer-events-none transition-all duration-500 ease-out`
        : `pointer-events-none transition-all duration-500 ease-out ${ANCHOR_CLASS[anchor]}`;

  /** Content-based keys so parent re-renders that pass new `[]` instances do not restart typing. */
  const sentencesContentKey = sentences.map(sentenceText).join("\u0001");
  const gapsContentKey = msBeforeNextSentence?.join("\u0001") ?? "";

  /* sentences / msBeforeNextSentence read inside; sentencesContentKey + gapsContentKey avoid restarts on new [] refs */
  useEffect(() => {
    if (!visible || sentences.length === 0) return;

    sequenceDoneRef.current = false;

    const full = sentenceText(sentences[sentenceIdx] ?? "");
    if (full.length === 0) return;

    let char = 0;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const gapBeforeNext = (i: number) =>
      msBeforeNextSentence?.[i] ?? STEP3_BETWEEN_SENTENCES_MS;

    const runChar = () => {
      if (cancelled) return;
      char += 1;
      setDisplayed(full.slice(0, char));
      if (char < full.length) {
        timers.push(setTimeout(runChar, STEP3_CHAR_MS));
        return;
      }
      const isLast = sentenceIdx >= sentences.length - 1;
      if (!isLast) {
        timers.push(
          setTimeout(() => {
            if (!cancelled) setSentenceIdx((i) => i + 1);
          }, gapBeforeNext(sentenceIdx))
        );
        return;
      }
      timers.push(
        setTimeout(() => {
          if (cancelled || sequenceDoneRef.current) return;
          sequenceDoneRef.current = true;
          onCompleteRef.current?.();
        }, STEP3_BETWEEN_SENTENCES_MS)
      );
    };

    setDisplayed("");
    timers.push(setTimeout(runChar, STEP3_CHAR_MS));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [visible, sentencesContentKey, gapsContentKey, sentenceIdx]);

  if (!visible || sentences.length === 0) return null;

  const bubbleBase =
    "pointer-events-none min-w-0 max-w-[min(100%,20rem)] rounded-2xl border px-3 py-2.5 text-sm leading-snug text-stone-800 shadow-lg sm:max-w-none sm:flex-1 sm:px-4 sm:py-3 sm:text-[0.95rem]";

  const bubble = (
    <div
      className={`${bubbleBase} border-sky-200/90 bg-white/95 ring-1 ring-sky-100/80`}
      role="status"
    >
      <p className="min-h-[2.75rem] whitespace-pre-wrap">{displayed}</p>
    </div>
  );

  const bubbleInterlude = (
    <div
      className={`${bubbleBase} border-sky-200/60 bg-white/55 ring-1 ring-white/50 backdrop-blur-[1px]`}
      role="status"
    >
      <p className="min-h-[2.75rem] whitespace-pre-wrap">{displayed}</p>
    </div>
  );

  const robotImg = (
    <div className="shrink-0">
      <Image
        src={robotSrc}
        alt=""
        width={imgSize}
        height={imgSize}
        className={`${robotSizeClass} object-contain drop-shadow-md`}
      />
    </div>
  );

  if (variant === "centerInterlude") {
    return (
      <div className={centerInterludeOuterClass}>
        <div className="rounded-3xl border border-white/50 bg-white/35 px-3 py-3 shadow-sm ring-1 ring-white/40 backdrop-blur-[3px] sm:px-4 sm:py-4">
          <div className="flex max-w-full flex-row items-end justify-center gap-2 sm:gap-3">
            {bubbleInterlude}
            {robotImg}
          </div>
        </div>
      </div>
    );
  }

  if (variant === "openBoxAbove") {
    return (
      <div className={outerClass}>
        <div className="flex flex-row items-end justify-center gap-2 sm:gap-3">
          {robotImg}
          {bubble}
        </div>
      </div>
    );
  }

  const pair =
    anchor === "sort" ? (
      <>
        {bubble}
        {robotImg}
      </>
    ) : (
      <>
        {robotImg}
        {bubble}
      </>
    );

  return (
    <div className={outerClass}>
      <div
        className={`flex flex-row gap-2 sm:gap-3 ${anchor === "sort" ? "items-start" : "items-end"}`}
      >
        {pair}
      </div>
    </div>
  );
}
