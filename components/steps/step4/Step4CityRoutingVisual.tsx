"use client";

import { districtConfig } from "@/data/districtConfig";
import type { DistrictId } from "@/types/city";
import { useMemo } from "react";

function emojiForAnimalLabel(label: string): string {
  const k = label.toLowerCase();
  const pairs: [string, string][] = [
    ["rabbit", "🐰"],
    ["fox", "🦊"],
    ["bear", "🐻"],
    ["lion", "🦁"],
    ["tiger", "🐯"],
    ["cat", "🐱"],
    ["wolf", "🐺"],
    ["deer", "🦌"],
    ["sheep", "🐑"],
    ["elephant", "🐘"],
    ["zebra", "🦓"],
    ["otter", "🦦"],
    ["capybara", "🦫"],
    ["squirrel", "🐿️"],
    ["hedgehog", "🦔"],
    ["chameleon", "🦎"],
  ];
  for (const [word, e] of pairs) {
    if (k.includes(word)) return e;
  }
  return "🐾";
}

const VOICES = [
  "I do not feel I belong here.",
  "I want to try a new possibility.",
  "I follow my parents’ expectation.",
];

/**
 * City: beat1 hero path → beat2 followers + trail → beat3 cluster density → hold frozen;
 * `showVoices` keeps three speech bubbles in the learner district through PEOPLE line.
 */
export function Step4CityRoutingVisual({
  animalLabel,
  animalEmoji,
  learnerDistrictId,
  districtTitle,
  routingBeat,
  showVoices,
}: {
  animalLabel: string;
  /** From `getAnimalEmojiForLearner` / zoo dataset (preferred over label heuristics). */
  animalEmoji?: string;
  learnerDistrictId: DistrictId;
  districtTitle: string;
  routingBeat: 0 | 1 | 2 | 3;
  showVoices: boolean;
}) {
  const emoji = animalEmoji?.trim() || emojiForAnimalLabel(animalLabel);
  const target = useMemo(
    () => districtConfig.find((d) => d.id === learnerDistrictId),
    [learnerDistrictId],
  );

  const showTrail = routingBeat >= 1;
  const showCluster = routingBeat >= 2;
  const frozen = routingBeat >= 3;

  return (
    <div className="flex h-full min-h-[320px] w-full flex-col items-center justify-between gap-3 px-2 py-4">
      <div className="relative w-full max-w-xl flex-1 rounded-2xl border border-violet-500/35 bg-gradient-to-b from-violet-950/90 to-indigo-950/95 px-3 py-4">
        <p className="text-center font-serif text-[0.65rem] font-semibold uppercase tracking-wide text-violet-300/90">
          Sorting line
        </p>
        {/* Entrance → gate → path */}
        <div className="relative mt-3 h-[120px] w-full">
          <div className="absolute left-[4%] top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
            <span className="font-serif text-[0.6rem] text-violet-400">Entrance</span>
            <span
              className={[
                "text-4xl transition-all duration-700",
                routingBeat >= 0 ? "opacity-100 scale-100" : "opacity-40 scale-90",
              ].join(" ")}
            >
              {emoji}
            </span>
          </div>
          <div className="absolute left-[28%] top-1/2 -translate-y-1/2 rounded-lg border border-cyan-400/50 bg-violet-900/80 px-3 py-2 font-serif text-[0.65rem] text-cyan-100">
            Gate
          </div>
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id="city-path-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(167 139 250)" stopOpacity="0.15" />
                <stop offset="50%" stopColor="rgb(250 204 21)" stopOpacity="0.95" />
                <stop offset="100%" stopColor="rgb(167 139 250)" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <path
              d="M 55 60 Q 140 20 220 60 T 360 60"
              fill="none"
              stroke="url(#city-path-glow)"
              strokeWidth={frozen ? 4 : 5}
              strokeLinecap="round"
              className={showTrail ? "opacity-95" : "opacity-35"}
              style={{
                filter: showTrail ? "drop-shadow(0 0 10px rgba(250,204,21,0.55))" : undefined,
              }}
            />
            {showTrail ? (
              <>
                {[0, 1, 2, 3, 4].map((i) => (
                  <circle
                    key={i}
                    cx={120 + i * 42}
                    cy={48 + (i % 2) * 8}
                    r={5}
                    fill="rgb(250 204 21)"
                    opacity={0.15 + i * 0.12}
                    className="motion-safe:animate-pulse"
                  />
                ))}
              </>
            ) : null}
          </svg>
          {showTrail ? (
            <div className="absolute bottom-2 left-[32%] flex gap-3 opacity-80">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="text-lg opacity-40"
                  style={{ opacity: 0.25 + i * 0.12, transform: "scale(0.85)" }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {districtConfig.map((d) => {
            const active = d.id === learnerDistrictId;
            const density = active && showCluster ? 6 : active ? 2 : 0;
            return (
              <div
                key={d.id}
                className={[
                  "flex min-h-[88px] flex-col rounded-xl border px-1 py-2 text-center transition-all duration-500",
                  active
                    ? "border-amber-400/70 bg-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                    : "border-violet-600/30 bg-violet-950/40 opacity-80",
                ].join(" ")}
              >
                <span className="font-serif text-[0.55rem] font-semibold leading-tight text-violet-100">
                  {d.shortLabel}
                </span>
                <div className="mt-1 flex flex-1 flex-wrap items-center justify-center gap-0.5">
                  {active && density > 0
                    ? Array.from({ length: Math.min(density, 9) }).map((_, i) => (
                        <span key={i} className="text-sm opacity-90">
                          {emoji}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-center font-serif text-[0.62rem] text-violet-300/85">
          {target?.title ?? districtTitle}
        </p>
      </div>

      {showVoices ? (
        <div className="w-full max-w-lg rounded-2xl border border-amber-400/40 bg-violet-950/80 px-3 py-4">
          <p className="mb-2 text-center font-serif text-[0.65rem] font-semibold text-amber-200/95">
            Voices from inside the district
          </p>
          <div className="flex flex-col gap-2.5">
            {VOICES.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-xl leading-none">{emoji}</span>
                <div className="rounded-2xl rounded-tl-sm border border-violet-200/50 bg-violet-100/95 px-3 py-2 font-serif text-[0.72rem] leading-snug text-violet-950">
                  {line}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
