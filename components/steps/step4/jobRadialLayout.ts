import type { JobId } from "@/types/game";

/** Degrees from +x axis, SVG y-down (0° = right, 90° = down). */
const JOB_DEG: Record<JobId, number> = {
  manager: -90,
  engineer: 0,
  artist: 180,
  community: 90,
};

export function jobRadialXY(
  j: JobId,
  cx: number,
  cy: number,
  radius: number,
): { x: number; y: number } {
  const rad = (JOB_DEG[j] * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export const JOB_NODE_COLORS: Record<
  JobId,
  { fill: string; stroke: string }
> = {
  manager: { fill: "rgb(254 243 199)", stroke: "rgb(180 83 9)" },
  engineer: { fill: "rgb(224 242 254)", stroke: "rgb(2 132 199)" },
  artist: { fill: "rgb(255 228 230)", stroke: "rgb(225 29 72)" },
  community: { fill: "rgb(209 250 229)", stroke: "rgb(5 122 85)" },
};
