"use client";

import { useGameState } from "@/lib/gameState";
import { buildStep6Content } from "@/lib/step6Narrative";
import { useEffect, useMemo } from "react";

/**
 * Step 6 — Celebration and a calm before/after look at the city (no scores or analytics UI).
 */
export function Step6Comparison() {
  const { state, dispatch } = useGameState();
  const beforeSrc = state.progress.beforeCityImageDataUrl;
  const afterSrc = state.progress.afterCityImageDataUrl;

  useEffect(() => {
    if (!state.progress.comparisonSeen) {
      dispatch({ type: "MARK_PROGRESS", patch: { comparisonSeen: true } });
    }
  }, [dispatch, state.progress.comparisonSeen]);

  const content = useMemo(
    () =>
      buildStep6Content(
        state.progress.redesignPlacements,
        state.progress.freelancerHubDropCount,
      ),
    [state.progress.redesignPlacements, state.progress.freelancerHubDropCount],
  );

  const hasPair = Boolean(beforeSrc && afterSrc);
  const singleAfter = Boolean(!beforeSrc && afterSrc);

  return (
    <section
      className="step6-page-enter flex min-h-0 w-full flex-1 flex-col gap-8 px-4 pb-4 opacity-0 sm:px-6 lg:gap-10 lg:px-10"
      aria-labelledby="step6-title"
    >
      <header className="shrink-0 space-y-2 text-center">
        <p className="font-serif text-sm font-medium uppercase tracking-[0.2em] text-amber-800/75">
          Chapter 6
        </p>
        <h2
          id="step6-title"
          className="font-serif text-3xl font-bold tracking-tight text-amber-950 sm:text-4xl"
        >
          Your New Zoo City
        </h2>
        <p className="mx-auto max-w-lg font-serif text-sm text-amber-900/75 sm:text-base">
          See how your city has changed
        </p>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-8">
        {hasPair ? (
          <div className="flex flex-col items-stretch gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
            <figure className="group flex min-w-0 flex-1 flex-col items-center">
              <figcaption className="mb-2 font-serif text-xs font-medium uppercase tracking-wider text-amber-900/55">
                Old Zoo City
              </figcaption>
              <div className="relative w-full overflow-hidden rounded-2xl bg-stone-200/60 shadow-[0_12px_40px_-12px_rgba(120,53,15,0.2)] ring-1 ring-amber-900/10 transition duration-500 ease-out group-hover:shadow-[0_16px_44px_-10px_rgba(120,53,15,0.22)]">
                <div className="relative aspect-video w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL from canvas */}
                  <img
                    src={beforeSrc!}
                    alt="Zoo City as you first saw it in the story"
                    className="h-full w-full object-contain object-center"
                  />
                </div>
              </div>
            </figure>

            <div
              className="flex shrink-0 flex-row items-center justify-center gap-2 lg:flex-col lg:py-4"
              aria-hidden
            >
              <span className="font-serif text-sm font-medium text-amber-800/60 lg:hidden">Old</span>
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100/90 font-serif text-lg text-amber-900 shadow-sm ring-1 ring-amber-200/80 lg:h-12 lg:w-12"
                title="Old to new"
              >
                →
              </span>
              <span className="hidden font-serif text-xs font-medium uppercase tracking-wider text-amber-800/55 lg:block">
                Old → New
              </span>
              <span className="font-serif text-sm font-medium text-amber-800/60 lg:hidden">New</span>
            </div>

            <figure className="group flex min-w-0 flex-1 flex-col items-center">
              <figcaption className="mb-2 font-serif text-xs font-medium uppercase tracking-wider text-amber-900/55">
                Your New Zoo City
              </figcaption>
              <div className="relative w-full overflow-hidden rounded-2xl bg-stone-100 shadow-[0_14px_48px_-10px_rgba(251,191,36,0.35)] ring-1 ring-amber-200/40 transition duration-500 ease-out group-hover:shadow-[0_18px_52px_-8px_rgba(251,191,36,0.4)]">
                <div
                  className="pointer-events-none absolute inset-0 z-[1] rounded-2xl bg-gradient-to-br from-amber-100/25 via-transparent to-amber-50/20"
                  aria-hidden
                />
                <div className="relative aspect-video w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={afterSrc!}
                    alt="Your redesigned Zoo City"
                    className="relative z-0 h-full w-full object-contain object-center brightness-[1.04] contrast-[1.02]"
                  />
                </div>
              </div>
            </figure>
          </div>
        ) : singleAfter ? (
          <figure className="mx-auto w-full max-w-3xl">
            <figcaption className="mb-2 text-center font-serif text-xs font-medium uppercase tracking-wider text-amber-900/55">
              Your New Zoo City
            </figcaption>
            <div className="relative overflow-hidden rounded-2xl bg-stone-100 shadow-[0_14px_48px_-10px_rgba(251,191,36,0.3)] ring-1 ring-amber-200/40">
              <div className="pointer-events-none absolute inset-0 z-[1] rounded-2xl bg-gradient-to-t from-amber-50/30 to-transparent" />
              <div className="relative aspect-video w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={afterSrc!}
                  alt="Your redesigned Zoo City"
                  className="relative z-0 h-full w-full object-contain object-center brightness-[1.04]"
                />
              </div>
            </div>
          </figure>
        ) : (
          <div className="rounded-2xl bg-amber-50/80 px-6 py-10 text-center font-serif text-amber-950/85 ring-1 ring-amber-200/60">
            <p className="text-base">Your map will appear here after you save in Chapter 5.</p>
            <p className="mt-2 text-sm text-amber-900/70">
              Go back when you are ready to finish your city and tap Save My New City.
            </p>
          </div>
        )}

        <p className="mx-auto max-w-2xl text-center font-serif text-lg font-medium leading-relaxed text-amber-950 sm:text-xl">
          {content.summaryLine}
        </p>

        <ul className="mx-auto grid max-w-4xl list-none gap-3 sm:grid-cols-2 sm:gap-4">
          {content.cards.map((card) => (
            <li
              key={card.label}
              className="rounded-2xl bg-white/80 px-4 py-4 shadow-[0_4px_24px_-8px_rgba(120,53,15,0.12)] ring-1 ring-amber-900/8 transition duration-300 ease-out hover:shadow-[0_8px_28px_-6px_rgba(120,53,15,0.14)] hover:ring-amber-200/30"
            >
              <p className="font-serif text-xs font-semibold uppercase tracking-wider text-amber-800/70">
                {card.label}
              </p>
              <p className="mt-2 font-serif text-sm leading-relaxed text-amber-950/90 sm:text-[0.95rem]">
                {card.body}
              </p>
            </li>
          ))}
        </ul>

        <p className="mx-auto max-w-xl pt-2 text-center font-serif text-base italic text-amber-900/80">
          {content.reflectionTeaser}
        </p>
      </div>
    </section>
  );
}
