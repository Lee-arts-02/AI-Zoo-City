"use client";

import Image from "next/image";
import { districtConfig } from "@/data/districtConfig";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  Step3VisualFrame,
} from "@/components/city/Step3VisualFrame";
import type { DistrictId } from "@/types/city";

/** Intrinsic aspect for Next/Image — update if the overview asset pixel size differs. */
const ZOO_MAP_INTRINSIC = { width: 1920, height: 1080 };

export type OverviewMapProps = {
  onSelectDistrict: (id: DistrictId) => void;
};

export default function OverviewMap({ onSelectDistrict }: OverviewMapProps) {
  return (
    <Step3VisualFrame
      image={
        <Image
          src="/map/zoo-map1.png"
          alt="Zoo City overview map — choose a district to explore"
          width={ZOO_MAP_INTRINSIC.width}
          height={ZOO_MAP_INTRINSIC.height}
          className={STEP3_ARTWORK_IMAGE_CLASS}
          sizes="(max-width: 1500px) 100vw, 1500px"
          priority
        />
      }
      overlay={
        <>
          {districtConfig.map((d) => {
            const r = d.overviewHotspot;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onSelectDistrict(d.id)}
                className="group absolute cursor-pointer rounded-2xl border-2 border-white/30 bg-white/5 outline-none ring-amber-900/0 transition-all duration-200 hover:border-amber-400/90 hover:bg-amber-200/25 hover:ring-2 hover:ring-amber-500/40 focus-visible:border-amber-500 focus-visible:ring-2 focus-visible:ring-amber-600"
                style={{
                  left: `${r.left}%`,
                  top: `${r.top}%`,
                  width: `${r.width}%`,
                  height: `${r.height}%`,
                }}
                aria-label={`Enter ${d.title}`}
              >
                <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-stone-950/55 px-2 py-1 text-center text-xs font-medium text-white opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 sm:text-sm">
                  {d.shortLabel}
                </span>
              </button>
            );
          })}
        </>
      }
    />
  );
}
