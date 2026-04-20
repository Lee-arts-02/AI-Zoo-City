"use client";

import { ActiveDecisionCard } from "@/components/step5/ActiveDecisionCard";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import type { Step5Animal } from "@/data/step5Animals";
import type { RedesignRegionId } from "@/types/city";

export type AnimalDecisionCarouselProps = {
  centerIndex: number;
  decidedIds: Set<string>;
  disabled: boolean;
  onPrev: () => void;
  onNext: () => void;
  onChoose: (animalId: string, region: RedesignRegionId) => void;
  /** District the center animal is in (map + card options stay in sync). */
  currentDistrict: RedesignRegionId;
  /** Narrow rail: center card + arrows only (fits beside map) */
  compactRail?: boolean;
};

function SideCard({
  animal,
  side,
  decided,
}: {
  animal: Step5Animal;
  side: "left" | "right";
  decided: boolean;
}) {
  return (
    <div
      className={`flex w-[72px] shrink-0 flex-col items-center rounded-2xl border-2 border-rose-200/70 bg-white/90 p-1.5 shadow sm:w-[88px] ${
        side === "left" ? "-rotate-2 opacity-85" : "rotate-2 opacity-85"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={animal.avatar} alt="" className="h-12 w-12 object-contain sm:h-14 sm:w-14" />
      <p className="mt-0.5 line-clamp-2 text-center font-serif text-[9px] font-semibold text-rose-950 sm:text-[10px]">
        {animal.name}
      </p>
      {decided ? (
        <span className="mt-0.5 font-serif text-[8px] text-stone-500">Placed</span>
      ) : null}
    </div>
  );
}

const NAV_BTN =
  "z-[35] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-rose-400 bg-white text-xl font-bold text-rose-900 shadow-md ring-2 ring-white/90 transition hover:bg-rose-50 disabled:opacity-40 sm:h-12 sm:w-12 sm:text-2xl";

export function AnimalDecisionCarousel({
  centerIndex,
  decidedIds,
  disabled,
  onPrev,
  onNext,
  onChoose,
  currentDistrict,
  compactRail = false,
}: AnimalDecisionCarouselProps) {
  const n = STEP5_ANIMALS.length;
  const prevIdx = (centerIndex - 1 + n) % n;
  const nextIdx = (centerIndex + 1) % n;
  const leftFarIdx = (centerIndex - 2 + n) % n;
  const rightFarIdx = (centerIndex + 2) % n;

  const center = STEP5_ANIMALS[centerIndex]!;
  const decided = decidedIds.has(center.id);

  if (compactRail) {
    return (
      <div className="flex min-h-0 w-full flex-col">
        <div className="relative min-h-0 w-full flex-1 py-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={disabled}
            className={`absolute left-0 top-[42%] -translate-y-1/2 ${NAV_BTN}`}
            aria-label="Previous animal"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={disabled}
            className={`absolute right-0 top-[42%] -translate-y-1/2 ${NAV_BTN}`}
            aria-label="Next animal"
          >
            ›
          </button>
          <div className="mx-auto w-full overflow-visible px-[3.25rem] sm:px-14">
            <div className="mx-auto flex w-full max-w-[340px] justify-center pb-1 pt-0.5">
              <ActiveDecisionCard
                animal={center}
                decided={decided}
                disabled={disabled}
                currentDistrict={currentDistrict}
                compact
                onChoose={(region) => onChoose(center.id, region)}
              />
            </div>
          </div>
        </div>
        <p className="mt-2 text-center font-serif text-[11px] leading-snug text-rose-800/75 sm:text-xs">
          Tap an animal on the map to jump here — or use the arrows to browse (always visible).
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-xl font-bold text-rose-900 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 sm:h-11 sm:w-11 sm:text-2xl"
          aria-label="Previous animal"
        >
          ‹
        </button>

        <div className="hidden sm:block">
          <SideCard
            animal={STEP5_ANIMALS[leftFarIdx]!}
            side="left"
            decided={decidedIds.has(STEP5_ANIMALS[leftFarIdx]!.id)}
          />
        </div>
        <div className="hidden md:block">
          <SideCard
            animal={STEP5_ANIMALS[prevIdx]!}
            side="left"
            decided={decidedIds.has(STEP5_ANIMALS[prevIdx]!.id)}
          />
        </div>

        <ActiveDecisionCard
          animal={center}
          decided={decided}
          disabled={disabled}
          currentDistrict={currentDistrict}
          onChoose={(region) => onChoose(center.id, region)}
        />

        <div className="hidden md:block">
          <SideCard
            animal={STEP5_ANIMALS[nextIdx]!}
            side="right"
            decided={decidedIds.has(STEP5_ANIMALS[nextIdx]!.id)}
          />
        </div>
        <div className="hidden sm:block">
          <SideCard
            animal={STEP5_ANIMALS[rightFarIdx]!}
            side="right"
            decided={decidedIds.has(STEP5_ANIMALS[rightFarIdx]!.id)}
          />
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-rose-300 bg-white text-xl font-bold text-rose-900 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 sm:h-11 sm:w-11 sm:text-2xl"
          aria-label="Next animal"
        >
          ›
        </button>
      </div>
      <p className="mt-3 text-center font-serif text-xs text-rose-800/75">
        Swipe the arrows to peek at neighbors — place the center animal to grow your city.
      </p>
    </div>
  );
}
