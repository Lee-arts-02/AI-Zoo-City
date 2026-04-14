"use client";

import Image from "next/image";
import { animalAssets } from "@/data/animalAssets";
import { organizerDistrictDotClass } from "@/components/city/organizerDistrictStyles";
import type { ScatterDot, ScatterIcon } from "@/data/organizerRevealScatter";

type OrganizerScatterMarkersProps = {
  dots: ScatterDot[];
  icons: ScatterIcon[];
};

/** Non-interactive city distribution overlay (dots + a few icons). */
export default function OrganizerScatterMarkers({ dots, icons }: OrganizerScatterMarkersProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-visible">
      {dots.map((d) => (
        <div
          key={d.id}
          className={`absolute h-1.5 w-1.5 rounded-full ${organizerDistrictDotClass(d.district)}`}
          style={{
            left: `${d.leftPct}%`,
            top: `${d.topPct}%`,
            transform: "translate(-50%, -50%)",
            opacity: d.opacity,
          }}
        />
      ))}
      {icons.map((ic) => {
        const asset = animalAssets[ic.animal];
        return (
          <div
            key={ic.id}
            className="absolute z-[2]"
            style={{
              left: `${ic.leftPct}%`,
              top: `${ic.topPct}%`,
              transform: "translate(-50%, -50%)",
              opacity: ic.opacity,
            }}
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-full border border-white/50 bg-white/70 shadow-sm ring-1 ring-black/10">
              <Image
                src={asset.image}
                alt=""
                fill
                sizes="32px"
                className="object-contain p-0.5"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
