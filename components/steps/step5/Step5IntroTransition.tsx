"use client";

import { captureMapDataUrl } from "@/lib/step5Capture";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import { useGameState } from "@/lib/gameState";
import { useEffect, useState } from "react";

const MAP1 = "/map/zoo-map1.png";
const MAP2 = "/map/zoo-map2.png";

const MACHINE_MS = 700;
const MAP1_MS = 750;
const CROSSFADE_MS = 850;

const COPY_LINES = [
  "The system has been using past patterns to make predictions.",
  "Update from Zoo City: A new Freelancer Hub has opened.",
  "The city now wants to support more possibilities.",
  "Can you help redesign where animals belong?",
] as const;

const PAUSES_MS = [2200, 2800, 2400, 3200] as const;

export function Step5IntroTransition() {
  const { dispatch, state } = useGameState();
  const [machineOp, setMachineOp] = useState(1);
  const [map1Op, setMap1Op] = useState(0);
  const [map2Op, setMap2Op] = useState(0);
  const [lineIdx, setLineIdx] = useState(-1);

  useEffect(() => {
    const ids: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      ids.push(setTimeout(fn, ms));
    };

    t(() => setMachineOp(0), 40);
    t(() => setMap1Op(1), MACHINE_MS);
    t(() => {
      setMap1Op(0);
      setMap2Op(1);
    }, MACHINE_MS + MAP1_MS);
    t(() => setLineIdx(0), MACHINE_MS + MAP1_MS + CROSSFADE_MS);

    let acc = MACHINE_MS + MAP1_MS + CROSSFADE_MS;
    for (let i = 0; i < COPY_LINES.length; i++) {
      acc += PAUSES_MS[i] ?? 2600;
      const idx = i + 1;
      t(() => setLineIdx(idx), acc);
    }

    t(() => {
      void (async () => {
        try {
          let before = state.progress.beforeCityImageDataUrl;
          if (!before) {
            before = await captureMapDataUrl(MAP1, buildInitialStep5Placements());
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
    }, acc + 600);

    return () => ids.forEach(clearTimeout);
  }, [dispatch, state.progress.beforeCityImageDataUrl]);

  const displayLine =
    lineIdx < 0
      ? null
      : lineIdx >= COPY_LINES.length
        ? COPY_LINES[COPY_LINES.length - 1]
        : COPY_LINES[lineIdx];

  const showCopy = lineIdx >= 0;

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-6 px-4 py-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-full max-w-[1500px]">
        <p className="mb-2 text-center font-serif text-sm font-medium uppercase tracking-widest text-rose-800/80">
          Chapter 5
        </p>
        <h2 className="mb-6 text-center font-serif text-3xl font-bold text-rose-950">
          Redesign Zoo City
        </h2>

        <div
          className="relative mx-auto h-[min(52vh,480px)] min-h-[280px] w-full max-w-[1500px] overflow-hidden rounded-2xl border-2 border-rose-200 bg-stone-900 shadow-inner"
          style={{ aspectRatio: "1920 / 1080" }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="relative h-full w-full max-h-full max-w-full">
              <img
                src={MAP1}
                alt=""
                className="absolute inset-0 m-auto max-h-full max-w-full object-contain object-center transition-opacity ease-out"
                style={{
                  opacity: map1Op,
                  transitionDuration: `${map2Op > 0 && map1Op === 0 ? CROSSFADE_MS : MAP1_MS}ms`,
                }}
                draggable={false}
              />
              <img
                src={MAP2}
                alt="Zoo City map with Freelancer Hub"
                className="absolute inset-0 m-auto max-h-full max-w-full object-contain object-center transition-opacity ease-out"
                style={{
                  opacity: map2Op,
                  transitionDuration: `${CROSSFADE_MS}ms`,
                }}
                draggable={false}
              />
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-violet-950 via-indigo-950 to-stone-950 transition-opacity ease-out"
            style={{
              opacity: machineOp,
              transitionDuration: `${MACHINE_MS}ms`,
            }}
            aria-hidden
          />

          {showCopy ? (
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-stone-950/95 via-stone-950/75 to-transparent px-4 py-8 pt-24 sm:px-8">
              <p className="mx-auto max-w-2xl text-center font-serif text-lg leading-relaxed text-white drop-shadow-md sm:text-xl">
                {displayLine}
              </p>
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-center font-serif text-sm text-rose-900/70">
          Preparing your redesign workspace…
        </p>
      </div>
    </section>
  );
}
