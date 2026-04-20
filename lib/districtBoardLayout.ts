import type { RedesignRegionId } from "@/types/city";

/** Image assets for the four job districts (2×2 grid + hub strip). */
export const DISTRICT_IMAGE: Record<"artist" | "community" | "engineer" | "manager", string> = {
  artist: "/district/artist.png",
  community: "/district/community.png",
  engineer: "/district/engineer.png",
  manager: "/district/manager.jpg",
};

/** 2×2 grid order: top row L→R, bottom row L→R. */
export const GRID_DISTRICT_ORDER = [
  "artist",
  "community",
  "engineer",
  "manager",
] as const;

export type GridDistrictId = (typeof GRID_DISTRICT_ORDER)[number];

const COLS = 3;

/**
 * Stable slot index within a region (same ordering as `step5Layout.slotIndexInRegion`).
 */
export function slotIndexInBoardRegion(
  animalId: string,
  region: RedesignRegionId,
  placements: Record<string, RedesignRegionId>,
): number {
  const ids = Object.entries(placements)
    .filter(([, r]) => r === region)
    .map(([id]) => id)
    .sort((a, b) => a.localeCompare(b));
  const idx = ids.indexOf(animalId);
  return idx >= 0 ? idx : ids.length;
}

/**
 * Position inside a district tile (0–100% of the tile) for avatar stacking.
 */
export function avatarPositionInTile(
  region: RedesignRegionId,
  slotIndex: number,
  totalInRegion: number,
): { leftPct: number; topPct: number } {
  const rows = Math.max(1, Math.ceil(Math.max(1, totalInRegion) / COLS));
  const col = slotIndex % COLS;
  const row = Math.floor(slotIndex / COLS);
  const pad = 8;
  const cellW = (100 - 2 * pad) / COLS;
  const cellH = (100 - 2 * pad) / rows;
  const leftPct = pad + col * cellW + cellW / 2;
  const topPct = pad + row * cellH + cellH / 2;
  return { leftPct, topPct };
}
