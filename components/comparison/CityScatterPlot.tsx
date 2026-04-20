"use client";

import { organizerDistrictDotClass } from "@/components/city/organizerDistrictStyles";
import type { Step6ScatterPoint } from "@/lib/step6Scatter";

export type CityScatterPlotProps = {
  points: Step6ScatterPoint[];
};

/**
 * Read-only two-axis map: Herbivore ↔ Carnivore (horizontal), Small ↔ Large (vertical).
 */
export function CityScatterPlot({ points }: CityScatterPlotProps) {
  return (
    <div className="rounded-2xl border-2 border-amber-200/80 bg-white/90 p-4 shadow-inner ring-1 ring-amber-900/5">
      <h3 className="font-serif text-lg font-bold text-amber-950">City pattern map</h3>
      <p className="mt-1 font-serif text-sm text-amber-900/75">
        Each point is an animal, colored by district after your hiring choices.
      </p>
      <div className="relative mx-auto mt-4 aspect-[10/9] w-full max-w-lg">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-stone-50 to-amber-50/40 ring-1 ring-stone-200/80" />
        {/* Axes labels */}
        <span className="absolute bottom-1 left-1/2 z-[2] -translate-x-1/2 font-serif text-[11px] font-medium text-stone-600">
          Herbivore ← → Carnivore
        </span>
        <span className="absolute left-1 top-1/2 z-[2] -translate-y-1/2 -rotate-90 font-serif text-[11px] font-medium text-stone-600">
          Small ← → Large
        </span>
        <div className="pointer-events-none absolute inset-[12%] z-[1] border-l border-b border-stone-300/90" />
        {points.map((p) => (
          <div
            key={p.id}
            className={`absolute z-[3] h-2.5 w-2.5 rounded-full ${organizerDistrictDotClass(p.district)}`}
            style={{
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.85)",
            }}
            title={p.id}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-serif text-xs text-amber-900/85">
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Artist
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> Engineer
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Manager
        </li>
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Community
        </li>
      </ul>
    </div>
  );
}
