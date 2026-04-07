"use client";

import Image from "next/image";
import {
  buildAnchorMap,
  getDistrictSceneData,
  type SceneAnchor,
} from "@/data/districtScenes";
import { animalAssets } from "@/data/animalAssets";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  Step3VisualFrame,
} from "@/components/city/Step3VisualFrame";
import type { DistrictId } from "@/types/city";
import type { ReactNode } from "react";

const BASE_PX = 96;

/** Flip to `true` while tuning anchors; red dots + ids only render when on. */
const SHOW_DEBUG_ANCHORS = false;

export type DistrictSceneProps = {
  districtId: DistrictId;
  aside?: ReactNode;
};

export default function DistrictScene({ districtId, aside }: DistrictSceneProps) {
  const scene = getDistrictSceneData(districtId);
  const anchorById = buildAnchorMap(scene);
  const { width: iw, height: ih } = scene.intrinsicSize;

  return (
    <Step3VisualFrame
      aside={aside}
      image={
        <Image
          src={scene.background}
          alt=""
          width={iw}
          height={ih}
          className={STEP3_ARTWORK_IMAGE_CLASS}
          sizes="(max-width: 1500px) 100vw, 1500px"
          priority
        />
      }
      overlay={
        <>
          {SHOW_DEBUG_ANCHORS ? <DebugAnchorsLayer anchors={scene.anchors} /> : null}
          <ul
            className="absolute inset-0 m-0 list-none p-0"
            aria-label={`Residents in ${scene.title}`}
          >
            {scene.animals.map((a) => {
              const anchor = anchorById.get(a.anchorId);
              if (!anchor) return null;

              const finalX = anchor.x + a.dx;
              const finalY = anchor.y + a.dy;
              const finalScale = anchor.scale * a.scale;
              const asset = animalAssets[a.animal];
              const w = Math.round(BASE_PX * finalScale);

              return (
                <li
                  key={a.id}
                  className="absolute"
                  style={{
                    left: `${finalX}%`,
                    top: `${finalY}%`,
                    transform: "translate(-50%, -85%)",
                  }}
                >
                  <div
                    className="pointer-events-auto transition-transform duration-200 ease-out will-change-transform hover:scale-[1.08]"
                    style={{ width: w, height: w }}
                  >
                    <Image
                      src={asset?.image ?? "/globe.svg"}
                      alt={asset?.label ?? a.animal}
                      width={w}
                      height={w}
                      className="h-full w-full object-contain [filter:drop-shadow(0_6px_14px_rgba(0,0,0,0.35))]"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      }
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Debug: delete this block (and SHOW_DEBUG_ANCHORS) when anchor pass is done. */
/* -------------------------------------------------------------------------- */

function DebugAnchorsLayer({ anchors }: { anchors: SceneAnchor[] }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5]"
      aria-hidden
      data-debug="district-anchors"
    >
      {anchors.map((anchor) => (
        <div
          key={anchor.id}
          className="absolute"
          style={{
            left: `${anchor.x}%`,
            top: `${anchor.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white shadow-sm"
            title={anchor.id}
          />
          <span className="absolute left-3 top-1/2 max-w-[8rem] -translate-y-1/2 whitespace-nowrap rounded bg-white/90 px-1 py-0.5 font-mono text-[10px] font-medium text-red-700 shadow-sm">
            {anchor.id}
          </span>
        </div>
      ))}
    </div>
  );
}
