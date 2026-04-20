"use client";

/**
 * Short beat between Step 5 save and Step 6 — suggests the model updated from learner data.
 */
export function Step5RetrainingOverlay() {
  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[520] flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/90 via-violet-950/88 to-stone-950/92 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute left-1/4 top-1/3 h-32 w-32 animate-pulse rounded-full bg-violet-400/30 blur-2xl" />
        <div className="absolute right-1/4 bottom-1/3 h-40 w-40 animate-pulse rounded-full bg-sky-400/25 blur-3xl [animation-delay:200ms]" />
      </div>

      <div className="relative z-[1] flex max-w-md flex-col items-center px-8 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/50 bg-violet-500/20 shadow-[0_0_32px_rgba(167,139,250,0.45)]">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-violet-200 border-t-transparent" aria-hidden />
        </div>
        <p className="font-serif text-xl font-semibold leading-snug text-white drop-shadow-md sm:text-2xl">
          Your AI model is retrained…
        </p>
        <p className="mt-3 font-serif text-sm text-violet-100/85">
          The city is learning new patterns from your choices.
        </p>
        <div className="mt-8 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-full animate-pulse rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-300 to-amber-200" />
        </div>
      </div>
    </div>
  );
}
