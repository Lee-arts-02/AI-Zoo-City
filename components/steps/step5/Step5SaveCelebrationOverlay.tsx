"use client";

type Step5SaveCelebrationOverlayProps = {
  headline: string;
};

/**
 * Minimal celebration layer after Save My New City: soft particles, no game-like confetti.
 */
export function Step5SaveCelebrationOverlay({
  headline,
}: Step5SaveCelebrationOverlayProps) {
  const spots = [
    { left: "12%", top: "78%", delay: "0s", size: 4 },
    { left: "22%", top: "62%", delay: "0.4s", size: 3 },
    { left: "48%", top: "88%", delay: "0.2s", size: 5 },
    { left: "58%", top: "70%", delay: "0.6s", size: 3 },
    { left: "72%", top: "82%", delay: "0.1s", size: 4 },
    { left: "84%", top: "58%", delay: "0.5s", size: 3 },
    { left: "38%", top: "52%", delay: "0.3s", size: 2 },
    { left: "66%", top: "48%", delay: "0.55s", size: 2 },
  ];

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[500] flex flex-col items-center justify-center bg-gradient-to-b from-amber-950/15 via-stone-900/30 to-stone-950/50 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-label={headline}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {spots.map((s, i) => (
          <span
            key={i}
            className="step5-save-spark absolute rounded-full bg-amber-200/90 shadow-[0_0_10px_rgba(253,230,138,0.7)]"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
      <p className="relative z-[1] max-w-md px-6 text-center font-serif text-2xl font-semibold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:text-3xl">
        {headline}
      </p>
    </div>
  );
}
