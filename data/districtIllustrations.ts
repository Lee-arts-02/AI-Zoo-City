import type { DistrictId } from "@/types/city";

/**
 * Single finished illustration per district (Step 3 detail view).
 * `width` / `height` are intrinsic pixel dimensions for Next/Image aspect ratio — update to match each file.
 */
export type DistrictIllustrationMeta = {
  src: string;
  width: number;
  height: number;
};

export const DISTRICT_ILLUSTRATIONS: Record<DistrictId, DistrictIllustrationMeta> = {
  artist: {
    src: "/district/artist-animal.png",
    width: 1920,
    height: 1080,
  },
  engineer: {
    src: "/district/Engineer-animal.png",
    width: 1920,
    height: 1080,
  },
  manager: {
    src: "/district/Manager-animal.png",
    width: 1920,
    height: 1080,
  },
  community: {
    src: "/district/Community-animal.png",
    width: 1920,
    height: 1080,
  },
};

export function getDistrictIllustration(districtId: DistrictId): DistrictIllustrationMeta {
  return DISTRICT_ILLUSTRATIONS[districtId];
}
