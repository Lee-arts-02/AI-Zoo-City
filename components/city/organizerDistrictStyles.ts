import type { DistrictId } from "@/types/city";

/** Solid fill for scatter dots (district color). */
export function organizerDistrictDotClass(district: DistrictId): string {
  switch (district) {
    case "artist":
      return "bg-rose-500";
    case "engineer":
      return "bg-sky-500";
    case "community":
      return "bg-emerald-500";
    case "manager":
      return "bg-amber-500";
    default:
      return "bg-stone-400";
  }
}

/** Learner has not chosen a district color yet. */
export function organizerNeutralChipClass(): string {
  return "border-stone-300/90 bg-white/95 text-stone-800 ring-1 ring-stone-200/90 shadow-sm";
}

/** Chip / token accents for the two-axis organizer (learner-assigned district). */
export function organizerDistrictChipClass(district: DistrictId): string {
  switch (district) {
    case "artist":
      return "border-rose-400/90 bg-rose-100/95 text-rose-950 ring-1 ring-rose-300/80";
    case "engineer":
      return "border-sky-400/90 bg-sky-100/95 text-sky-950 ring-1 ring-sky-300/80";
    case "community":
      return "border-emerald-400/90 bg-emerald-100/95 text-emerald-950 ring-1 ring-emerald-300/80";
    case "manager":
      return "border-amber-400/90 bg-amber-100/95 text-amber-950 ring-1 ring-amber-300/80";
    default:
      return "border-stone-300 bg-stone-100 text-stone-900";
  }
}
