import { STEP5_REGIONS } from "@/data/step5Regions";
import type { RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";

const JOB_IDS: JobId[] = ["artist", "community", "engineer", "manager"];

const COLS = 4;

/** Highest AI role by percentage (ties: stable order artist → community → engineer → manager). */
export function topAiJob(rec: Record<JobId, number>): JobId {
  let best: JobId = "artist";
  let v = -1;
  for (const j of JOB_IDS) {
    if (rec[j] > v) {
      v = rec[j];
      best = j;
    }
  }
  return best;
}

export function jobToRegionId(job: JobId): Exclude<RedesignRegionId, "freelancer"> {
  return job;
}

/** Slot index within a region for stable grid layout (deterministic, not random). */
export function slotIndexInRegion(
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
 * Center of avatar in map % coordinates (0–100), inside region hotspot grid.
 * `totalInRegion` keeps cell height stable for all tokens in that region.
 */
export function slotCenterPercent(
  region: RedesignRegionId,
  slotIndex: number,
  totalInRegion: number,
): { x: number; y: number } {
  const cfg = STEP5_REGIONS.find((r) => r.id === region)!;
  const { left, top, width, height } = cfg.hotspot;
  const col = slotIndex % COLS;
  const row = Math.floor(slotIndex / COLS);
  const rows = Math.max(1, Math.ceil(Math.max(1, totalInRegion) / COLS));
  const padX = width * 0.06;
  const padY = height * 0.08;
  const cellW = (width - 2 * padX) / COLS;
  const cellH = (height - 2 * padY) / rows;
  const x = left + padX + col * cellW + cellW / 2;
  const y = top + padY + row * cellH + cellH / 2;
  return { x, y };
}

export function countInRegion(
  region: RedesignRegionId,
  placements: Record<string, RedesignRegionId>,
): number {
  return Object.values(placements).filter((r) => r === region).length;
}

export function uniqueCountInRegion(
  region: RedesignRegionId,
  placements: Record<string, RedesignRegionId>,
): number {
  return new Set(
    Object.entries(placements)
      .filter(([, r]) => r === region)
      .map(([id]) => id),
  ).size;
}
