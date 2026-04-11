import type { DistrictId } from "@/types/city";

/** Walkable / street sample point; `scale` encodes depth (larger toward “foreground”). */
export type SceneAnchor = {
  id: string;
  x: number;
  y: number;
  scale: number;
};

/** Placed relative to an anchor; `scale` multiplies the anchor’s depth scale. */
export type SceneAnimal = {
  id: string;
  animal: string;
  anchorId: string;
  dx: number;
  dy: number;
  scale: number;
};

/** Pixel size of the background file — drives layout aspect; set to match each PNG. */
export type SceneIntrinsicSize = {
  width: number;
  height: number;
};

export type DistrictSceneData = {
  title: string;
  background: string;
  intrinsicSize: SceneIntrinsicSize;
  anchors: SceneAnchor[];
  animals: SceneAnimal[];
};

export const districtScenes: Record<DistrictId, DistrictSceneData> = {
  artist: {
    title: "Artist District",
    background: "/district/artistdistrict2.png",
    intrinsicSize: { width: 1920, height: 1080 },
    anchors: [
      { id: "art-plaza", x: 47, y: 65, scale: 3 },
      { id: "art-path-nw", x: 67, y: 70, scale: 2 },
      { id: "art-path-ne", x: 58, y: 65, scale: 1.8 },
      { id: "art-path-mid-w", x: 55, y: 90, scale: 2.5 },
      { id: "art-path-mid-e", x: 53, y: 55, scale: 1.2 },
      { id: "art-path-sw", x: 60, y: 90, scale: 2.5 },
      { id: "art-path-se", x: 40, y: 90, scale: 3.8 },
    ],
    animals: [
      { id: "art-r1", animal: "rabbit", anchorId: "art-path-mid-w", dx: 0, dy:0, scale: 1 },
      { id: "art-r2", animal: "rabbit", anchorId: "art-path-mid-e", dx: 0, dy: 0, scale:1 },
      { id: "art-d1", animal: "deer", anchorId: "art-plaza", dx: 0, dy: 0, scale: 1 },
      { id: "art-d2", animal: "deer", anchorId: "art-path-se", dx: 0, dy: 0, scale: 1 },
      { id: "art-p1", animal: "peacock", anchorId: "art-path-nw", dx: 0, dy: 0, scale: 1 },
      { id: "art-f1", animal: "fox", anchorId: "art-path-ne", dx: 0, dy: 0, scale: 1 },
      { id: "art-f2", animal: "fox", anchorId: "art-path-sw", dx: 0, dy: 0, scale: 1 },
    ],
  },
  engineer: {
    title: "Engineer Quarter",
    background: "/district/engineerdistrict1.png",
    intrinsicSize: { width: 1920, height: 1080 },
    anchors: [
      { id: "eng-fore-w", x: 50, y: 80, scale: 2 },
      { id: "eng-fore-e", x: 68, y: 60, scale: 1.5 },
      { id: "eng-mid-plaza", x: 48, y: 55, scale: 1.5 },
      { id: "eng-mid-e", x: 84, y: 70, scale: 2 },
      { id: "eng-rear-w", x: 41, y: 70, scale: 1.5 },
      { id: "eng-rear-m", x: 70, y: 85, scale: 2 },
      { id: "eng-high-w", x: 30, y: 80, scale: 3 },
      { id: "eng-high-m", x: 79, y: 87, scale: 3.5 },
    ],
    animals: [
      { id: "eng-b1", animal: "beaver", anchorId: "eng-fore-w", dx: 0, dy: 0, scale: 1 },
      { id: "eng-b2", animal: "beaver", anchorId: "eng-fore-e", dx: 0, dy: 0, scale: 1 },
      { id: "eng-o1", animal: "owl", anchorId: "eng-mid-plaza", dx: 0, dy: 0, scale: 1 },
      { id: "eng-o2", animal: "owl", anchorId: "eng-mid-e", dx: 0, dy: 0, scale: 1 },
      { id: "eng-rc1", animal: "raccoon", anchorId: "eng-rear-w", dx: 0, dy: 0, scale: 1 },
      { id: "eng-rc2", animal: "raccoon", anchorId: "eng-rear-m", dx: 0, dy: 0, scale: 1 },
      { id: "eng-br1", animal: "bear", anchorId: "eng-high-w", dx: 0, dy: 0, scale: 1 },
      { id: "eng-br2", animal: "bear", anchorId: "eng-high-m", dx: 0, dy: 0, scale: 1 },
    ],
  },
  manager: {
    title: "Manager Center",
    background: "/district/management1.png",
    intrinsicSize: { width: 1920, height: 1080 },
    anchors: [
      { id: "mgr-plaza", x: 50, y: 40, scale: 1.5 },
      { id: "mgr-w-wing", x: 50, y: 90, scale: 2 },
      { id: "mgr-ne", x: 65, y: 70, scale: 1.3 },
      { id: "mgr-s", x: 34, y: 37, scale: 1 },
      { id: "mgr-se", x: 76, y: 53, scale: 1.8 },
      { id: "mgr-nw", x: 25, y: 70, scale: 2},
      { id: "mgr-fore", x: 60, y: 56, scale: 1.5 },
      { id: "mgr-roofline", x: 28, y: 52, scale: 1.5 },
    ],
    animals: [
      { id: "mgr-l1", animal: "lion", anchorId: "mgr-plaza", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-l2", animal: "lion", anchorId: "mgr-w-wing", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-fx1", animal: "fox", anchorId: "mgr-ne", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-fx2", animal: "fox", anchorId: "mgr-s", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-br1", animal: "bear", anchorId: "mgr-se", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-br2", animal: "bear", anchorId: "mgr-nw", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-w1", animal: "wolf", anchorId: "mgr-fore", dx: 0, dy: 0, scale: 1 },
      { id: "mgr-w2", animal: "wolf", anchorId: "mgr-roofline", dx: 0, dy: 0, scale: 1 },
    ],
  },
  community: {
    title: "Community Support",
    background: "/district/community1.png",
    intrinsicSize: { width: 1920, height: 1080 },
    anchors: [
      { id: "com-green-w", x: 25, y: 58, scale: 2 },
      { id: "com-green-e", x: 90, y: 85, scale: 2.8 },
      { id: "com-path-s", x: 48, y: 75, scale: 1.5 },
      { id: "com-path-nw", x: 14, y: 61, scale: 1.5 },
      { id: "com-hill", x: 63, y: 80, scale: 1.5 },
      { id: "com-meadow-e", x: 75, y: 85, scale: 1.5 },
      { id: "com-orchard", x: 42, y: 24, scale: 0.84 },
      { id: "com-path-sw", x: 12, y: 62, scale: 1.02 },
    ],
    animals: [
      { id: "com-e1", animal: "elephant", anchorId: "com-green-w", dx: 0, dy: 0, scale: 1 },
      { id: "com-e2", animal: "elephant", anchorId: "com-green-e", dx: 0, dy: 0, scale: 1 },
      { id: "com-dg1", animal: "dog", anchorId: "com-path-s", dx: 0, dy: 0, scale: 1 },
      { id: "com-dg2", animal: "dog", anchorId: "com-path-nw", dx: 0, dy: 0, scale: 1 },
      { id: "com-sh1", animal: "sheep", anchorId: "com-hill", dx: 0, dy: 0, scale: 1 },
      { id: "com-sh2", animal: "sheep", anchorId: "com-meadow-e", dx: 0, dy: 0, scale: 1 },
      { id: "com-rb1", animal: "rabbit", anchorId: "com-orchard", dx: 0, dy: 0, scale: 1 },
      { id: "com-rb2", animal: "rabbit", anchorId: "com-path-sw", dx: 0, dy: 0, scale: 1 },
    ],
  },
};

export function getDistrictSceneData(districtId: DistrictId): DistrictSceneData {
  return districtScenes[districtId];
}

export function buildAnchorMap(data: DistrictSceneData): Map<string, SceneAnchor> {
  return new Map(data.anchors.map((a) => [a.id, a]));
}
