"use client";

import Image from "next/image";
import { getDistrictIllustration } from "@/data/districtIllustrations";
import { getDistrictConfig } from "@/data/districtConfig";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  Step3VisualFrame,
} from "@/components/city/Step3VisualFrame";
import type { DistrictId } from "@/types/city";
import type { ReactNode } from "react";

export type DistrictSceneProps = {
  districtId: DistrictId;
  aside?: ReactNode;
  /** Interactive layer on top of the district illustration (e.g. axis organizer). */
  overlay?: ReactNode;
};

export default function DistrictScene({ districtId, aside, overlay }: DistrictSceneProps) {
  const illo = getDistrictIllustration(districtId);
  const district = getDistrictConfig(districtId);

  return (
    <Step3VisualFrame
      aside={aside}
      overlay={overlay}
      image={
        <Image
          src={illo.src}
          alt={`Illustration: ${district.title}`}
          width={illo.width}
          height={illo.height}
          className={STEP3_ARTWORK_IMAGE_CLASS}
          sizes="(max-width: 1500px) 100vw, 1500px"
          priority
        />
      }
    />
  );
}
