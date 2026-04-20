import type { RedesignRegionId } from "@/types/city";

/** First-person, reflective lines — not evaluative. */
const LINES: Record<RedesignRegionId, readonly string[]> = {
  artist: [
    "I’m trying something new here.",
    "This place feels different from what I expected.",
    "I wonder what colors I’ll find in this corner.",
    "Quiet enough here to hear my own ideas.",
  ],
  engineer: [
    "I think I can build a lot here.",
    "Tools and puzzles everywhere — I want to explore.",
    "This corner hums with plans.",
    "I’m curious what we’ll fix together.",
  ],
  manager: [
    "Lots of voices to weave into one story.",
    "I’m learning how groups move here.",
    "This feels like a crossroads for plans.",
    "I wonder who I’ll stand beside.",
  ],
  community: [
    "Warm faces — I’m hoping to belong.",
    "I want to listen more in this part of town.",
    "This neighborhood asks for patience.",
    "Sharing space feels both new and familiar.",
  ],
  freelancer: [
    "I’m walking a path the old map didn’t draw.",
    "Somewhere between labels — that’s where I am.",
    "A new kind of room to grow in.",
    "I’m not sure the name yet, but I’m here.",
  ],
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Stable pick for session variety. */
export function reflectiveLineForPlacement(
  animalId: string,
  region: RedesignRegionId,
): string {
  const pool = LINES[region];
  const i = hashString(`${animalId}|${region}`) % pool.length;
  return pool[i]!;
}

/** Fisher–Yates shuffle with seeded RNG for reproducible “random” picks. */
export function pickRandomSubset<T>(items: T[], count: number, seed: number): T[] {
  if (items.length <= count) return [...items];
  const arr = [...items];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, count);
}
