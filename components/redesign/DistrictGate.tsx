"use client";

import type { DistrictId } from "@/types/city";

const GATE_STYLES: Record<
  DistrictId,
  { ring: string; bg: string; text: string; short: string }
> = {
  artist: {
    short: "Artist",
    ring: "ring-rose-300/90",
    bg: "bg-gradient-to-br from-rose-100 to-rose-50",
    text: "text-rose-950",
  },
  engineer: {
    short: "Engineer",
    ring: "ring-sky-300/90",
    bg: "bg-gradient-to-br from-sky-100 to-sky-50",
    text: "text-sky-950",
  },
  manager: {
    short: "Manager",
    ring: "ring-amber-300/90",
    bg: "bg-gradient-to-br from-amber-100 to-amber-50",
    text: "text-amber-950",
  },
  community: {
    short: "Community",
    ring: "ring-emerald-300/90",
    bg: "bg-gradient-to-br from-emerald-100 to-emerald-50",
    text: "text-emerald-950",
  },
};

export type DistrictGateProps = {
  district: DistrictId;
  title: string;
};

/** Large labeled “gate” card for the four districts (visual anchor + hiring context). */
export function DistrictGate({ district, title }: DistrictGateProps) {
  const s = GATE_STYLES[district];
  return (
    <div
      className={`flex min-h-[4.5rem] min-w-[140px] flex-1 flex-col justify-center rounded-2xl px-3 py-3 shadow-sm ring-2 ${s.ring} ${s.bg} sm:min-w-[160px]`}
    >
      <p className={`font-serif text-xs font-semibold uppercase tracking-wide ${s.text} opacity-80`}>
        {s.short}
      </p>
      <p className={`mt-0.5 font-serif text-sm font-bold leading-snug ${s.text}`}>{title}</p>
    </div>
  );
}
