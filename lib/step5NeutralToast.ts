import type { RedesignRegionId } from "@/types/city";

const DISTRICT_LABEL: Record<Exclude<RedesignRegionId, "freelancer">, string> = {
  artist: "Artist District",
  community: "Community Support",
  engineer: "Engineer Quarter",
  manager: "Manager Center",
};

/** Short, neutral placement confirmation — no correctness framing. */
export function neutralPlacementToast(
  firstName: string,
  region: RedesignRegionId,
): string {
  if (region === "freelancer") {
    return `${firstName} is now in Freelancer Hub — a new path is opening here.`;
  }
  return `${firstName} is now part of ${DISTRICT_LABEL[region]}.`;
}
