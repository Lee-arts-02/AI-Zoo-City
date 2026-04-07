import { districtConfig } from "@/data/districtConfig";
import type { OverviewHotspot } from "@/data/districtConfig";
import type { RedesignRegionId } from "@/types/city";

export type Step5RegionConfig = {
  id: RedesignRegionId;
  label: string;
  hotspot: OverviewHotspot;
  /** Tailwind accent for highlights */
  accentClass: string;
  glowClass: string;
};

/**
 * Drop zones on the overview maps. Four districts match Step 3 hotspots; Freelancer Hub
 * is positioned for zoo-map2.png (same canvas % as map1 — adjust if art shifts).
 */
export const STEP5_REGIONS: Step5RegionConfig[] = [
  ...districtConfig.map((d) => ({
    id: d.id,
    label: d.shortLabel,
    hotspot: d.overviewHotspot,
    accentClass:
      d.id === "artist"
        ? "border-rose-400/90 bg-rose-300/25 shadow-[0_0_24px_rgba(244,63,94,0.35)]"
        : d.id === "engineer"
          ? "border-sky-400/90 bg-sky-300/25 shadow-[0_0_24px_rgba(14,165,233,0.35)]"
          : d.id === "manager"
            ? "border-amber-400/90 bg-amber-300/25 shadow-[0_0_24px_rgba(245,158,11,0.35)]"
            : "border-emerald-400/90 bg-emerald-300/25 shadow-[0_0_24px_rgba(16,185,129,0.35)]",
    glowClass: "",
  })),
  {
    id: "freelancer",
    label: "Freelancer Hub",
    hotspot: { left: 6, top: 52, width: 20, height: 40 },
    accentClass:
      "border-violet-300/80 bg-violet-200/20 shadow-[0_0_32px_rgba(167,139,250,0.55)]",
    glowClass: "animate-step5-hub-pulse",
  },
];

export function getStep5Region(id: RedesignRegionId): Step5RegionConfig {
  const r = STEP5_REGIONS.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown region: ${id}`);
  return r;
}
