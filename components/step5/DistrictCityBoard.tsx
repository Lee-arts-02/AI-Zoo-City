"use client";

import { STEP5_ANIMALS } from "@/data/step5Animals";
import {
  avatarPositionInTile,
  DISTRICT_IMAGE,
  GRID_DISTRICT_ORDER,
  slotIndexInBoardRegion,
} from "@/lib/districtBoardLayout";
import type { RedesignRegionId } from "@/types/city";
import Image from "next/image";
import { useState } from "react";

const DND_TYPE = "application/zoo-city-animal";

export type DistrictCityBoardProps = {
  placements: Record<string, RedesignRegionId>;
  pulseRegion?: RedesignRegionId | null;
  compact?: boolean;
  /** Speech-bubble lines keyed by animal id — neutral, reflective */
  speechNotes?: Record<string, string>;
  /** When false, bubbles are hidden but placements stay */
  showSpeechBubbles?: boolean;
  /** Allow drag-and-drop between districts */
  interactive?: boolean;
  onMoveAnimal?: (animalId: string, toRegion: RedesignRegionId) => void;
  /** Highlights the token for the active card animal */
  selectedAnimalId?: string | null;
  /** Tap a placed animal to sync the decision card (desktop / touch) */
  onAnimalClick?: (animalId: string) => void;
};

function animalsInRegion(
  placements: Record<string, RedesignRegionId>,
  region: RedesignRegionId,
) {
  return STEP5_ANIMALS.filter((a) => placements[a.id] === region);
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-[4] mb-1 w-[140px] -translate-x-1/2 sm:w-[160px]">
      <div className="relative rounded-2xl border border-stone-200/90 bg-stone-50/95 px-2.5 py-1.5 text-left shadow-md ring-1 ring-stone-300/40">
        <p className="font-serif text-[10px] leading-snug text-stone-700 sm:text-[11px]">“{text}”</p>
        <div
          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-stone-200/90 bg-stone-50"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function DistrictCityBoard({
  placements,
  pulseRegion,
  compact = false,
  speechNotes = {},
  showSpeechBubbles = true,
  interactive = false,
  onMoveAnimal,
  selectedAnimalId = null,
  onAnimalClick,
}: DistrictCityBoardProps) {
  const hub = animalsInRegion(placements, "freelancer");
  const [dragOver, setDragOver] = useState<RedesignRegionId | null>(null);

  const handleDragStart = (e: React.DragEvent, animalId: string) => {
    if (!interactive) return;
    e.dataTransfer.setData(DND_TYPE, animalId);
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: React.DragEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, region: RedesignRegionId) => {
    if (!interactive || !onMoveAnimal) return;
    e.preventDefault();
    const id = e.dataTransfer.getData(DND_TYPE);
    setDragOver(null);
    if (id && placements[id] !== region) {
      onMoveAnimal(id, region);
    }
  };

  return (
    <div
      className={`mx-auto w-full max-w-3xl ${compact ? "max-w-xl" : ""}`}
      aria-label="Zoo City districts with animal placements"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {GRID_DISTRICT_ORDER.map((district, i) => {
          const list = animalsInRegion(placements, district);
          const src = DISTRICT_IMAGE[district];
          const pulse = pulseRegion === district;
          const isOver = dragOver === district;
          return (
            <div
              key={district}
              onDragOver={allowDrop}
              onDragEnter={() => interactive && setDragOver(district)}
              onDragLeave={() => setDragOver((d) => (d === district ? null : d))}
              onDrop={(e) => handleDrop(e, district)}
              className={`relative overflow-hidden rounded-2xl border-2 border-stone-200/90 bg-stone-100 shadow-inner ring-1 ring-black/5 transition duration-300 ${
                pulse ? "ring-2 ring-stone-300/90 shadow-[0_0_20px_rgba(120,113,108,0.25)]" : ""
              } ${isOver && interactive ? "ring-2 ring-sky-300/70 bg-sky-50/30" : ""}`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  draggable={false}
                  sizes="(max-width: 768px) 45vw, 360px"
                  priority={i < 2}
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/35 to-transparent px-2 py-1.5">
                  <span className="font-serif text-[10px] font-semibold uppercase tracking-wide text-white drop-shadow sm:text-xs">
                    {district === "artist"
                      ? "Artist"
                      : district === "community"
                        ? "Community"
                        : district === "engineer"
                          ? "Engineer"
                          : "Manager"}
                  </span>
                </div>
                {list.map((a) => {
                  const slot = slotIndexInBoardRegion(a.id, district, placements);
                  const { leftPct, topPct } = avatarPositionInTile(
                    district,
                    slot,
                    list.length,
                  );
                  const note = speechNotes[a.id];
                  const showBubble = showSpeechBubbles && note;
                  const selected = selectedAnimalId === a.id;
                  return (
                    <div
                      key={a.id}
                      className="absolute z-[3] h-[22%] w-[22%] min-h-[36px] min-w-[36px] max-h-[56px] max-w-[56px] -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                    >
                      {showBubble ? <SpeechBubble text={note} /> : null}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.avatar}
                        alt=""
                        draggable={interactive}
                        onDragStart={(e) => handleDragStart(e, a.id)}
                        onClick={() => interactive && onAnimalClick?.(a.id)}
                        className={`h-full w-full rounded-full border-2 object-contain shadow-md ${
                          selected
                            ? "border-orange-300/90 ring-2 ring-orange-300/75 ring-offset-2 ring-offset-black/25"
                            : "border-white"
                        } ${interactive ? "cursor-pointer active:cursor-grabbing" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        onDragOver={allowDrop}
        onDragEnter={() => interactive && setDragOver("freelancer")}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setDragOver((d) => (d === "freelancer" ? null : d));
          }
        }}
        onDrop={(e) => handleDrop(e, "freelancer")}
        className={`relative mt-2 overflow-hidden rounded-2xl border-2 border-violet-300/70 bg-gradient-to-r from-violet-200/40 via-fuchsia-100/30 to-violet-200/40 shadow-inner ring-1 ring-violet-400/20 transition duration-300 ${
          pulseRegion === "freelancer"
            ? "ring-2 ring-stone-300/80 shadow-[0_0_16px_rgba(120,113,108,0.2)]"
            : ""
        } ${dragOver === "freelancer" && interactive ? "ring-2 ring-sky-300/70 bg-violet-100/40" : ""}`}
      >
        <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
          <span className="font-serif text-xs font-bold uppercase tracking-wide text-violet-950 sm:text-sm">
            Freelancer Hub
          </span>
          <span className="font-serif text-[10px] text-violet-900/75 sm:text-xs">
            A new kind of place in the city
          </span>
        </div>
        <div className="relative flex min-h-[64px] flex-wrap items-center gap-2 px-3 pb-3 sm:px-4">
          {hub.length === 0 ? (
            <span className="font-serif text-xs italic text-violet-900/60">
              Drop someone here to try the hub…
            </span>
          ) : (
            hub.map((a, i) => {
              const note = speechNotes[a.id];
              const showBubble = showSpeechBubbles && note;
              const selected = selectedAnimalId === a.id;
              return (
                <div
                  key={a.id}
                  className="relative z-[1] h-12 w-12 sm:h-14 sm:w-14"
                  style={{ marginLeft: i > 0 ? -8 : 0 }}
                >
                  {showBubble ? (
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-[4] mb-1 w-[140px] -translate-x-1/2 sm:w-[160px]">
                      <div className="relative rounded-2xl border border-stone-200/90 bg-stone-50/95 px-2.5 py-1.5 text-left shadow-md ring-1 ring-stone-300/40">
                        <p className="font-serif text-[10px] leading-snug text-stone-700 sm:text-[11px]">
                          “{note}”
                        </p>
                        <div
                          className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-stone-200/90 bg-stone-50"
                          aria-hidden
                        />
                      </div>
                    </div>
                  ) : null}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={a.avatar}
                    alt=""
                    draggable={interactive}
                    onDragStart={(e) => handleDragStart(e, a.id)}
                    onClick={() => interactive && onAnimalClick?.(a.id)}
                    className={`h-full w-full rounded-full border-2 object-contain shadow-md ${
                      selected
                        ? "ring-2 border-orange-300/90 ring-orange-300/75 ring-offset-2 ring-offset-violet-100/40"
                        : "ring-2 border-white ring-violet-300/60"
                    } ${interactive ? "cursor-pointer active:cursor-grabbing" : ""}`}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
