"use client";

import { ZooCityBeginBackdrop } from "@/components/shared/ZooCityBeginBackdrop";
import Link from "next/link";
import { HOME_BETWEEN_SENTENCE_MS, HOME_CHAR_MS } from "@/lib/narrativePacing";
import { useEffect, useRef, useState } from "react";

const INTRO_SENTENCES = [
  "Welcome to Zoo City!",
  "You are now a new resident looking for a job that fits your unique skills and personality.",
  "Will the city’s AI Career System see your true potential? Your career adventure starts right here!",
] as const;

export function HomePageContent() {
  const [storyStarted, setStoryStarted] = useState(false);
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [currentTypedText, setCurrentTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sequenceComplete, setSequenceComplete] = useState(false);
  const [heroOpacity, setHeroOpacity] = useState(0.2);
  const [heroBlurPx, setHeroBlurPx] = useState(3);

  const pauseAfterSentenceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!storyStarted) return;
    setHeroOpacity(0.28);
    setHeroBlurPx(0);
  }, [storyStarted]);

  useEffect(() => {
    if (!storyStarted) return;
    if (sentenceIndex >= INTRO_SENTENCES.length) return;

    const full = INTRO_SENTENCES[sentenceIndex];
    let i = 0;
    setCurrentTypedText("");
    setIsTyping(true);

    const id = window.setInterval(() => {
      i += 1;
      setCurrentTypedText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(id);
        setIsTyping(false);
        const pauseId = window.setTimeout(() => {
          if (sentenceIndex < INTRO_SENTENCES.length - 1) {
            setSentenceIndex((s) => s + 1);
          } else {
            setSequenceComplete(true);
          }
        }, HOME_BETWEEN_SENTENCE_MS);
        pauseAfterSentenceRef.current =
          typeof pauseId === "number" ? pauseId : null;
      }
    }, HOME_CHAR_MS);

    return () => {
      window.clearInterval(id);
      const p = pauseAfterSentenceRef.current;
      if (p != null) window.clearTimeout(p);
      pauseAfterSentenceRef.current = null;
    };
  }, [storyStarted, sentenceIndex]);

  const startStory = () => {
    if (storyStarted) return;
    setStoryStarted(true);
  };

  return (
    <div className="relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden bg-amber-50 px-6 py-16 font-sans">
      <ZooCityBeginBackdrop
        placement="hero"
        heroOpacity={heroOpacity}
        heroBlurPx={heroBlurPx}
      />

      {!storyStarted ? (
        <main className="relative z-10 w-full max-w-lg rounded-3xl border-4 border-amber-200/90 bg-white/75 p-10 text-center shadow-[8px_8px_0_0_rgba(251,191,36,0.35)] backdrop-blur-md backdrop-saturate-150">
          <h1 className="font-serif text-3xl font-bold text-amber-950">
            AI Zoo City
          </h1>
          <p className="mt-4 font-serif text-lg leading-relaxed text-amber-900/85">
            A seven-step story for young learners about AI, cities, and fair
            choices.
          </p>
          <button
            type="button"
            onClick={startStory}
            className="mt-8 inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl border-2 border-amber-800 bg-amber-400 px-6 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.25)] transition hover:translate-y-px hover:bg-amber-300"
          >
            Start the story →
          </button>
        </main>
      ) : (
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-stretch gap-8 px-4 py-6 md:gap-10 md:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex flex-1 justify-center lg:max-w-md lg:justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/robot.png"
              alt="Friendly robot guide"
              className="animate-home-robot-enter h-auto max-h-[min(360px,40vh)] w-auto max-w-full object-contain"
            />
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center lg:max-w-xl">
            <div
              className="rounded-3xl border-2 border-amber-200/90 bg-amber-50/90 p-6 shadow-[6px_6px_0_0_rgba(251,191,36,0.25)] backdrop-blur-sm md:p-8"
              aria-live="polite"
            >
              <p className="sr-only">Story introduction</p>
              <p className="min-h-[5rem] font-serif text-lg leading-relaxed text-amber-950 md:text-xl md:leading-relaxed">
                {currentTypedText}
                {isTyping ? (
                  <span
                    className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-amber-700 align-middle"
                    aria-hidden
                  />
                ) : null}
              </p>
            </div>
            {sequenceComplete ? (
              <div className="mt-6 flex justify-center lg:justify-end">
                <Link
                  href="/zoo-city"
                  className="inline-flex min-h-[48px] min-w-[200px] items-center justify-center rounded-2xl border-2 border-amber-800 bg-amber-400 px-6 font-serif text-lg font-semibold text-amber-950 shadow-[4px_4px_0_0_rgba(120,53,15,0.25)] transition hover:translate-y-px hover:bg-amber-300"
                >
                  Enter Zoo City →
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
