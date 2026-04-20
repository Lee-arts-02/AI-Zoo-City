"use client";

import { STEP5_ANIMALS } from "@/data/step5Animals";
import { animalTraits } from "@/data/animalTraits";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import { organizerDistrictDotClass } from "@/components/city/organizerDistrictStyles";
import type { RedesignRegionId } from "@/types/city";

export type Step6QuadrantOrganizerProps = {
  placements: Record<string, RedesignRegionId>;
};

function dotClassForRegion(region: RedesignRegionId): string {
  if (region === "freelancer") return "bg-violet-500 ring-2 ring-violet-200/80";
  return organizerDistrictDotClass(region);
}

/**
 * Four-quadrant thinking map: Herbivore↔Carnivore × Small↔Large (matches Step 3 organizer idea).
 */
export function Step6QuadrantOrganizer({ placements }: Step6QuadrantOrganizerProps) {
  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-amber-200/70 bg-white/90 p-4 shadow-inner ring-1 ring-amber-900/5 sm:p-5">
      <h3 className="text-center font-serif text-lg font-bold text-amber-950">
        City pattern map
      </h3>
      <p className="mt-1 text-center font-serif text-sm text-amber-900/75">
        Where animals fall on two axes after your redesign — a simple lens, not a grade.
      </p>

      <div className="relative mx-auto mt-5 aspect-square w-full max-w-[420px]">
        {/* Quadrant backgrounds */}
        <div className="absolute inset-[12%] grid grid-cols-2 grid-rows-2 overflow-hidden rounded-xl border border-stone-200/90">
          <div className="bg-rose-50/50" />
          <div className="bg-sky-50/50" />
          <div className="bg-emerald-50/50" />
          <div className="bg-amber-50/50" />
        </div>
        {/* Axes */}
        <div className="pointer-events-none absolute inset-[12%] flex items-center justify-center">
          <div className="absolute h-[1px] w-[76%] bg-stone-300/90" />
          <div className="absolute h-[76%] w-[1px] bg-stone-300/90" />
        </div>
        {/* Axis labels */}
        <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 font-serif text-[11px] font-medium text-stone-600">
          Herbivore ← → Carnivore
        </span>
        <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 font-serif text-[11px] font-medium text-stone-600">
          Small ← → Large
        </span>
        <span className="pointer-events-none absolute right-2 top-[13%] font-serif text-[10px] text-stone-500">
          Large + herbivore
        </span>
        <span className="pointer-events-none absolute bottom-[14%] left-2 font-serif text-[10px] text-stone-500">
          Small + carnivore
        </span>

        {/* Points */}
        <div className="absolute inset-[12%]">
          {STEP5_ANIMALS.map((a) => {
            const t = animalTraits[a.id as ZooCityAnimalId];
            const herb = t.diet === "herbivore";
            const leftPct = herb
              ? 20 + (a.id.charCodeAt(0) % 12)
              : 80 - (a.id.charCodeAt(0) % 12);
            let topPct = 75;
            if (t.size === "small") topPct = 78;
            else if (t.size === "medium") topPct = 50;
            else topPct = 22;
            topPct += (a.id.charCodeAt(1) ?? 0) % 7;
            const region = placements[a.id] ?? "artist";
            return (
              <div
                key={a.id}
                title={a.name}
                className={`absolute h-2.5 w-2.5 rounded-full ${dotClassForRegion(region)}`}
                style={{
                  left: `${Math.min(94, Math.max(6, leftPct))}%`,
                  top: `${Math.min(94, Math.max(6, topPct))}%`,
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 0 0 1px rgba(255,255,255,0.9)",
                }}
              />
            );
          })}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 font-serif text-xs text-amber-900/85">
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
        <li className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-500" /> Freelancer Hub
        </li>
      </ul>
    </div>
  );
}
