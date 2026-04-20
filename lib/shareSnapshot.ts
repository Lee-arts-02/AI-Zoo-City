import { STEP5_ANIMALS } from "@/data/step5Animals";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { GameState, LearnerProfile } from "@/types/game";
import type { RedesignRegionId } from "@/types/city";
import type { DreamJob, JobId } from "@/types/game";
import { isZooCityAnimalKey } from "@/data/zooAnimalDataset";
import {
  formatLearnerNameForDisplay,
  getAnimalDisplayName,
} from "@/lib/learnerUtils";

export const SHARE_MODEL_VERSION = 1 as const;

/** Serializable payload for URL sharing — no server, no accounts. */
export type ShareSnapshotV1 = {
  v: typeof SHARE_MODEL_VERSION;
  cityName: string;
  creatorName: string;
  createdAt: string;
  supportsFreelancer: boolean;
  placements: Record<string, RedesignRegionId>;
  creatorSummary: {
    presetAnimal: string | null;
    customAnimal: string;
    traits: string[];
    dreamJob: DreamJob | null;
    customDreamJob: string;
  };
  /**
   * Learner name from Step 1 (trimmed, max 30). Omitted in older share links.
   * When present as empty string, prefer neutral share title (see `getSharePageTitle`).
   */
  learnerName?: string;
  /** Path on this site (e.g. /zoo-city) — joined with origin for CTA */
  originalGamePath: string;
  modelStyle: "retrained-v1";
};

const VALID_REGIONS = new Set<RedesignRegionId>([
  "artist",
  "community",
  "engineer",
  "manager",
  "freelancer",
]);

/**
 * Main headline for shared links: `"[Name]'s Zoo City"` or neutral / legacy animal title.
 */
export function getSharePageTitle(snapshot: ShareSnapshotV1): string {
  const hasLearnerKey = Object.prototype.hasOwnProperty.call(
    snapshot,
    "learnerName",
  );
  if (hasLearnerKey && typeof snapshot.learnerName === "string") {
    const formatted = formatLearnerNameForDisplay(snapshot.learnerName);
    if (formatted.length > 0) return `${formatted}'s Zoo City`;
    return "A Zoo City design";
  }
  const raw = snapshot.creatorName.trim();
  if (raw && raw !== "Zoo City Friend") {
    const cd = raw.charAt(0).toUpperCase() + raw.slice(1);
    return `${cd}'s ${snapshot.cityName}`;
  }
  return "A Zoo City design";
}

function certificateStyleName(learner: LearnerProfile): string {
  const raw = getAnimalDisplayName(learner);
  if (raw === "mystery animal") return "Zoo City Friend";
  return raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function ensurePlacementsMap(
  raw: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) return raw;
  return buildInitialStep5Placements() as Record<string, RedesignRegionId>;
}

export function buildShareSnapshotFromGameState(
  state: GameState,
  options?: { cityName?: string; originalGamePath?: string },
): ShareSnapshotV1 {
  const learner = state.learner;
  const placements = ensurePlacementsMap(state.progress.redesignPlacements ?? undefined);
  const supportsFreelancer = Object.values(placements).some((r) => r === "freelancer");

  return {
    v: SHARE_MODEL_VERSION,
    cityName: options?.cityName ?? "Zoo City",
    creatorName: certificateStyleName(learner),
    createdAt: new Date().toISOString(),
    supportsFreelancer,
    placements,
    creatorSummary: {
      presetAnimal: learner.presetAnimal,
      customAnimal: learner.customAnimal,
      traits: [...learner.traits],
      dreamJob: learner.dreamJob,
      customDreamJob: learner.customDreamJob,
    },
    learnerName: learner.name.trim().slice(0, 30),
    originalGamePath: options?.originalGamePath ?? "/zoo-city",
    modelStyle: "retrained-v1",
  };
}

function utf8ToBase64Url(json: string): string {
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToUtf8(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  return decodeURIComponent(
    Array.from(bin, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join(""),
  );
}

export function encodeShareSnapshot(snapshot: ShareSnapshotV1): string {
  return utf8ToBase64Url(JSON.stringify(snapshot));
}

export function decodeSharePayload(encoded: string): ShareSnapshotV1 | null {
  if (!encoded || encoded.length < 8) return null;
  try {
    const json = base64UrlToUtf8(encoded.trim());
    const data = JSON.parse(json) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.cityName !== "string" || typeof o.creatorName !== "string") return null;
    if (typeof o.createdAt !== "string") return null;
    if (typeof o.supportsFreelancer !== "boolean") return null;
    if (typeof o.placements !== "object" || o.placements === null) return null;
    const pl = o.placements as Record<string, unknown>;
    const animalIds = new Set(STEP5_ANIMALS.map((a) => a.id));
    for (const id of animalIds) {
      const r = pl[id];
      if (typeof r !== "string" || !VALID_REGIONS.has(r as RedesignRegionId)) return null;
    }
    if (o.modelStyle !== "retrained-v1") return null;
    if (typeof o.originalGamePath !== "string" || !o.originalGamePath.startsWith("/"))
      return null;

    const cs = o.creatorSummary;
    if (!cs || typeof cs !== "object") return null;
    const summary = cs as Record<string, unknown>;
    if (summary.presetAnimal !== null) {
      if (typeof summary.presetAnimal !== "string") return null;
      if (!isZooCityAnimalKey(summary.presetAnimal)) return null;
    }
    if (typeof summary.customAnimal !== "string") return null;
    if (!Array.isArray(summary.traits)) return null;
    if (!summary.traits.every((t) => typeof t === "string")) return null;
    if (summary.dreamJob !== null) {
      if (typeof summary.dreamJob !== "string") return null;
      const jobs: JobId[] = ["artist", "engineer", "manager", "community"];
      if (!jobs.includes(summary.dreamJob as JobId)) return null;
    }
    if (typeof summary.customDreamJob !== "string") return null;

    if (Object.prototype.hasOwnProperty.call(o, "learnerName")) {
      if (typeof o.learnerName !== "string") return null;
      if ((o.learnerName as string).length > 30) return null;
    }

    return o as unknown as ShareSnapshotV1;
  } catch {
    return null;
  }
}
