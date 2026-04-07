"use client";

import type { ReactNode } from "react";

/**
 * Shared Step 3 artwork stack: overview map + district scenes use the same layout.
 * The raster sets its own height (intrinsic aspect); no fixed-height box, no panel fill.
 */
export const STEP3_ARTWORK_MAX_W_CLASS = "max-w-[1500px]";

/** Responsive image: full width of stack, capped by max-w; height follows aspect ratio. */
export const STEP3_ARTWORK_IMAGE_CLASS = "block h-auto w-full max-w-full";

const OUTER = "flex w-full justify-center px-4 py-3 md:px-6 md:py-4";

export type Step3VisualFrameProps = {
  image: ReactNode;
  /** Same box as the image (percent positions match the visible bitmap). */
  overlay?: ReactNode;
  /** Full height of the artwork stack, right edge (e.g. info drawer). */
  aside?: ReactNode;
  className?: string;
};

export function Step3VisualFrame({
  image,
  overlay,
  aside,
  className = "",
}: Step3VisualFrameProps) {
  return (
    <div className={`${OUTER} ${className}`}>
      <div className={`relative w-full ${STEP3_ARTWORK_MAX_W_CLASS}`}>
        <div className="relative w-full leading-none">
          {image}
          {overlay ? <div className="absolute inset-0 z-[2]">{overlay}</div> : null}
        </div>

        {aside ? (
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20">
            <div className="pointer-events-auto flex h-full flex-row-reverse items-stretch">
              {aside}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
