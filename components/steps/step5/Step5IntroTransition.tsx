"use client";

import { captureDistrictBoardDataUrl } from "@/lib/captureDistrictBoard";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { RedesignRegionId } from "@/types/city";
import { useGameState } from "@/lib/gameState";
import Image from "next/image";
import { useEffect, useState } from "react";

const ZOO_MAP = { width: 1920, height: 1080 };

const MACHINE_MS = 600;
const MAP_CROSS_MS = 1400;
const LINE1_MS = 2600;
const HUB_MS = 2800;
const POSS_MS = 2600;

export function Step5IntroTransition() {
  const { dispatch, state } = useGameState();
  const [machineOp, setMachineOp] = useState(1);
  /** false = zoo-map1, true = zoo-map2 */
  const [mapOnB, setMapOnB] = useState(false);
  const [caption, setCaption] = useState<string | null>(null);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      ids.push(setTimeout(fn, ms));
    };

    t(() => setMachineOp(0), 40);
    t(() => setCaption("Now you can change the dataset — who belongs in which district?"), MACHINE_MS);
    t(() => setMapOnB(true), MACHINE_MS + LINE1_MS);
    t(
      () => setCaption("Zoo City has added a new Freelancer Hub."),
      MACHINE_MS + LINE1_MS + MAP_CROSS_MS + 400,
    );
    t(
      () => setCaption("The city now supports more possibilities."),
      MACHINE_MS + LINE1_MS + MAP_CROSS_MS + HUB_MS,
    );

    let acc = MACHINE_MS + LINE1_MS + MAP_CROSS_MS + HUB_MS + POSS_MS + 500;

    t(() => {
      void (async () => {
        try {
          let before = state.progress.beforeCityImageDataUrl;
          if (!before) {
            before = await captureDistrictBoardDataUrl(
              buildInitialStep5Placements() as Record<string, RedesignRegionId>,
            );
          }
          dispatch({
            type: "MARK_PROGRESS",
            patch: {
              step5IntroSeen: true,
              beforeCityImageDataUrl: before,
            },
          });
        } catch {
          dispatch({
            type: "MARK_PROGRESS",
            patch: { step5IntroSeen: true },
          });
        }
      })();
    }, acc);

    return () => ids.forEach(clearTimeout);
  }, [dispatch, state.progress.beforeCityImageDataUrl]);

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-6 sm:py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-[1500px]">
        <p className="mb-1 text-center font-serif text-sm font-medium uppercase tracking-widest text-rose-800/80">
          Chapter 5
        </p>
        <h2 className="mb-4 text-center font-serif text-2xl font-bold text-rose-950 sm:text-3xl">
          Zoo City Hiring / Assignment
        </h2>

        <div
          className="relative mx-auto w-full max-w-[1500px] overflow-hidden rounded-2xl border-2 border-rose-200 bg-stone-900 shadow-inner"
          style={{ aspectRatio: "1920 / 1080" }}
        >
          <div className="absolute inset-0">
            <Image
              src="/map/zoo-map1.png"
              alt=""
              width={ZOO_MAP.width}
              height={ZOO_MAP.height}
              className="absolute inset-0 h-full w-full object-contain transition-opacity ease-out"
              style={{
                opacity: mapOnB ? 0 : 1,
                transitionDuration: `${MAP_CROSS_MS}ms`,
              }}
              priority
              draggable={false}
            />
            <Image
              src="/map/zoo-map2.png"
              alt=""
              width={ZOO_MAP.width}
              height={ZOO_MAP.height}
              className="absolute inset-0 h-full w-full object-contain transition-opacity ease-out"
              style={{
                opacity: mapOnB ? 1 : 0,
                transitionDuration: `${MAP_CROSS_MS}ms`,
              }}
              draggable={false}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-violet-950 via-indigo-950 to-stone-950 transition-opacity ease-out"
            style={{
              opacity: machineOp,
              transitionDuration: `${MACHINE_MS}ms`,
            }}
            aria-hidden
          />

          {caption ? (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-stone-950/95 via-stone-950/75 to-transparent px-4 py-8 pt-20 sm:px-8">
              <p className="mx-auto max-w-2xl text-center font-serif text-base leading-relaxed text-white drop-shadow-md sm:text-xl">
                {caption}
              </p>
            </div>
          ) : null}
        </div>

        <p className="mt-3 text-center font-serif text-sm text-rose-900/70">
          The city updates — then your hiring workspace opens.
        </p>
      </div>
    </section>
  );
}
