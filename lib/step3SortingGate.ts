import type { DistrictId } from "@/types/city";

export const STEP3_SOFT_GATE_MESSAGE =
  "Finish the sorting task first 👀 There's an interesting pattern waiting for you.";

/** After sorting + robot guidance: still need the City Sorting Machine animation before Next page. */
export const STEP3_SOFT_GATE_OPEN_MACHINE_MESSAGE =
  "Open the City Sorting Machine from the map (Open Box) to finish this chapter — then Next page will unlock.";

type TokenLike = { instanceId: string };

/** Map + organizer: 3+ districts visited, all tokens on axes, every token has a district color. */
export function isStep3PhysicalSortingComplete(
  visitedLength: number,
  starterTokens: TokenLike[],
  placements: Record<string, string>,
  learnerDistrictColors: Record<string, DistrictId | null>
): boolean {
  if (visitedLength < 3) return false;
  if (!starterTokens.every((t) => placements[t.instanceId] !== "bank")) return false;
  if (!starterTokens.every((t) => learnerDistrictColors[t.instanceId] != null)) return false;
  return true;
}

/** Robot guidance after sorting: reveal flow, bridge, or progress flags. */
export function isStep3RobotGuidanceAfterSorting(
  robotPhase: string,
  revealActivated: boolean,
  bridgeUnlocked: boolean
): boolean {
  if (revealActivated || bridgeUnlocked) return true;
  return (
    robotPhase === "reveal_ask" ||
    robotPhase === "post_reveal" ||
    robotPhase === "bridge" ||
    robotPhase === "bridge_open_box"
  );
}

/**
 * Open Box / nav: allowed when the machine chapter is done, or earlier when the story says so.
 *
 * **Unlock as soon as the map bridge runs** (“Do you want to know more about how the City
 * Sorting Machine works?”) — `bridge` / `bridge_open_box` / `bridgeUnlocked` — without
 * re-checking organizer placement state (that can lag or differ after returning to overview).
 *
 * Otherwise: physical sorting complete AND earlier robot guidance (reveal ask, etc.).
 */
export function isStep3PrimaryActionsUnlocked(
  machineReady: boolean,
  visitedLength: number,
  starterTokens: TokenLike[],
  placements: Record<string, string>,
  learnerDistrictColors: Record<string, DistrictId | null>,
  robotPhase: string,
  revealActivated: boolean,
  bridgeUnlocked: boolean
): boolean {
  if (machineReady) return true;
  if (
    bridgeUnlocked ||
    robotPhase === "bridge" ||
    robotPhase === "bridge_open_box"
  ) {
    return true;
  }
  if (
    !isStep3PhysicalSortingComplete(
      visitedLength,
      starterTokens,
      placements,
      learnerDistrictColors
    )
  ) {
    return false;
  }
  return isStep3RobotGuidanceAfterSorting(robotPhase, revealActivated, bridgeUnlocked);
}

/**
 * Legacy: full task + organizer progress flag (requires city reveal confirmation).
 * Prefer {@link isStep3PrimaryActionsUnlocked} for Open Box / UX gates.
 */
export function isStep3SortingTaskComplete(
  organizerSortingReady: boolean,
  starterTokens: TokenLike[],
  placements: Record<string, string>,
  learnerDistrictColors: Record<string, DistrictId | null>
): boolean {
  if (!organizerSortingReady) return false;
  if (!starterTokens.every((t) => placements[t.instanceId] !== "bank")) return false;
  if (!starterTokens.every((t) => learnerDistrictColors[t.instanceId] != null)) return false;
  return true;
}
