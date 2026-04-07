import type { DistrictId } from "@/types/city";

/** Percent positions for clickable regions on the city overview image (0–100). */
export type OverviewHotspot = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export const districtConfig = [
  {
    id: "artist" as const,
    title: "Artist District",
    shortLabel: "Artist District",
    colorClass: "bg-rose-200/90",
    borderClass: "border-rose-300",
    textClass: "text-rose-900",
    overviewHotspot: { left: 2, top: 6, width: 42, height: 38 } satisfies OverviewHotspot,
    dashboardDescription:
      "Arts and crafts corners attract expressive animals who enjoy color, shape, and storytelling.",
  },
  {
    id: "engineer" as const,
    title: "Engineer Quarter",
    shortLabel: "Engineer Quarter",
    colorClass: "bg-sky-200/90",
    borderClass: "border-sky-300",
    textClass: "text-sky-900",
    overviewHotspot: { left: 58, top: 6, width: 40, height: 42 } satisfies OverviewHotspot,
    dashboardDescription:
      "Workshops and labs favor curious problem-solvers who like to build and tinker.",
  },
  {
    id: "manager" as const,
    title: "Manager Center",
    shortLabel: "Manager Center",
    colorClass: "bg-amber-200/90",
    borderClass: "border-amber-300",
    textClass: "text-amber-900",
    overviewHotspot: { left: 54, top: 60, width: 42, height: 34 } satisfies OverviewHotspot,
    dashboardDescription:
      "Planning hubs and meeting spaces draw animals who organize groups and speak up.",
  },
  {
    id: "community" as const,
    title: "Community Support",
    shortLabel: "Community Support",
    colorClass: "bg-emerald-200/95",
    borderClass: "border-emerald-300",
    textClass: "text-emerald-900",
    overviewHotspot: { left: 24, top: 38, width: 34, height: 26 } satisfies OverviewHotspot,
    dashboardDescription:
      "Care stations and gathering places welcome animals who nurture others and work in teams.",
  },
] as const;

export type DistrictConfigEntry = (typeof districtConfig)[number];

export function getDistrictConfig(id: DistrictId): DistrictConfigEntry {
  const d = districtConfig.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown district: ${id}`);
  return d;
}
