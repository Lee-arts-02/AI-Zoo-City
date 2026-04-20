"use client";

import { JOB_DISPLAY, JOB_IDS } from "@/lib/aiModel";
import { topAiJob } from "@/lib/step5Layout";
import type { Step5Animal } from "@/data/step5Animals";
import type { RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";
import { useEffect, useState } from "react";

const DECISIONS: { id: RedesignRegionId; label: string }[] = [
  { id: "artist", label: "Artist" },
  { id: "engineer", label: "Engineer" },
  { id: "manager", label: "Manager" },
  { id: "community", label: "Community" },
  { id: "freelancer", label: "Freelancer" },
];

const BTN: Record<string, string> = {
  artist: "border-rose-300 bg-rose-50/90 text-rose-950 hover:bg-rose-100",
  community: "border-teal-300 bg-teal-50/90 text-teal-950 hover:bg-teal-100",
  engineer: "border-sky-300 bg-sky-50/90 text-sky-950 hover:bg-sky-100",
  manager: "border-amber-300 bg-amber-50/90 text-amber-950 hover:bg-amber-100",
  freelancer:
    "border-violet-400 bg-violet-50/90 text-violet-950 hover:bg-violet-100 ring-1 ring-violet-300/50",
};

function splitAnimalTitle(fullName: string): { firstName: string; species: string } {
  const m = fullName.match(/^(.+?)\s+the\s+(.+)$/i);
  if (m) {
    return { firstName: m[1]!.trim(), species: m[2]!.trim() };
  }
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { firstName: parts[0]!, species: parts.slice(1).join(" ") };
  }
  return { firstName: fullName, species: "" };
}

export type ActiveDecisionCardProps = {
  animal: Step5Animal;
  decided: boolean;
  disabled: boolean;
  /** Current map district for this animal — used for subtle highlight on the matching option */
  currentDistrict: RedesignRegionId;
  /** Slightly denser layout when shown beside the map */
  compact?: boolean;
  onChoose: (region: RedesignRegionId) => void;
};

export function ActiveDecisionCard({
  animal,
  decided,
  disabled,
  currentDistrict,
  compact = false,
  onChoose,
}: ActiveDecisionCardProps) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(false);
  }, [animal.id]);
  const aiSorted = [...JOB_IDS].sort(
    (a, b) => animal.aiRecommendation[b] - animal.aiRecommendation[a],
  );
  const aiTop = topAiJob(animal.aiRecommendation);
  const { firstName, species } = splitAnimalTitle(animal.name);

  return (
    <div
      className={`relative flex min-h-0 w-[min(100%,320px)] shrink-0 flex-col overflow-visible rounded-3xl border-4 border-rose-200/90 bg-white p-3 shadow-[0_12px_40px_-8px_rgba(120,113,108,0.18)] ring-1 ring-stone-200/60 transition-transform sm:w-[340px] ${
        decided ? "scale-[0.98]" : "z-10"
      }`}
    >
      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={animal.avatar}
          alt=""
          className={`object-contain drop-shadow-md ${compact ? "h-28 w-28 sm:h-32 sm:w-32" : "h-36 w-36 sm:h-40 sm:w-40"}`}
        />
        <h3
          className={`font-serif font-bold text-rose-950 ${compact ? "mt-2 text-lg" : "mt-3 text-xl"}`}
        >
          {firstName}
        </h3>
        {species ? (
          <p className="mt-1 font-serif text-xs font-medium text-stone-600">{species}</p>
        ) : null}
        <p className="mt-2 w-full max-w-[280px] text-center font-serif text-sm leading-snug text-stone-800">
          <span className="font-semibold text-stone-800">Traits: </span>
          <span className="text-stone-700">{animal.traits.join(" · ")}</span>
        </p>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 rounded-xl border border-stone-200 bg-stone-50/90 px-3 py-2 font-serif text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-100"
      >
        {open ? "Hide details" : "View details"}
      </button>

      {open ? (
        <div className="mt-3 space-y-3 rounded-2xl border border-stone-200/80 bg-stone-50/80 p-3 text-left font-serif text-sm text-stone-800">
          <div>
            <p className="font-semibold">AI recommendation</p>
            <ul className="mt-1 list-inside list-disc space-y-0.5 text-stone-700">
              {aiSorted.map((j: JobId) => (
                <li key={j}>
                  {JOB_DISPLAY[j].title} {animal.aiRecommendation[j]}%
                </li>
              ))}
            </ul>
          </div>
          <p className="italic text-stone-700">“{animal.voice}”</p>
          <p className="font-medium text-stone-800">
            Where do YOU think {firstName} should go?
          </p>
          <p className="text-xs text-stone-500">
            One possible highlight: {JOB_DISPLAY[aiTop].title} ({animal.aiRecommendation[aiTop]}%).
          </p>
        </div>
      ) : null}

      <div className="mt-3 space-y-1.5">
        <p className="text-center font-serif text-[10px] font-semibold uppercase tracking-wide text-stone-600 sm:text-[11px]">
          Place or move to…
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {DECISIONS.slice(0, 4).map((d) => {
            const isHere = d.id === currentDistrict;
            return (
              <button
                key={d.id}
                type="button"
                disabled={disabled}
                onClick={() => onChoose(d.id)}
                className={[
                  "min-h-[38px] rounded-xl border-2 px-2 py-1.5 text-center font-serif text-xs font-semibold shadow-sm transition disabled:opacity-40 sm:min-h-[40px] sm:text-sm",
                  BTN[d.id] ?? "",
                  isHere
                    ? "ring-2 ring-orange-300/90 ring-offset-2 ring-offset-white shadow-[0_0_14px_rgba(234,179,127,0.35)]"
                    : "",
                ].join(" ")}
              >
                {d.label}
              </button>
            );
          })}
        </div>
        <div className="flex justify-center">
          {(() => {
            const d = DECISIONS[4]!;
            const isHere = d.id === currentDistrict;
            return (
              <button
                key={d.id}
                type="button"
                disabled={disabled}
                onClick={() => onChoose(d.id)}
                className={[
                  "min-h-[38px] w-full max-w-[11.5rem] rounded-xl border-2 px-2 py-1.5 text-center font-serif text-xs font-semibold shadow-sm transition disabled:opacity-40 sm:min-h-[40px] sm:text-sm",
                  BTN[d.id] ?? "",
                  isHere
                    ? "ring-2 ring-orange-300/90 ring-offset-2 ring-offset-white shadow-[0_0_14px_rgba(234,179,127,0.35)]"
                    : "",
                ].join(" ")}
              >
                {d.label}
              </button>
            );
          })()}
        </div>
        {decided ? (
          <p className="pt-1 text-center font-serif text-[10px] text-stone-500 sm:text-[11px]">
            You can also drag this animal on the map to try another district.
          </p>
        ) : null}
      </div>
    </div>
  );
}
