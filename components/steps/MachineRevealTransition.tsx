"use client";

import Image from "next/image";
import { districtConfig } from "@/data/districtConfig";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  STEP3_ARTWORK_MAX_W_CLASS,
} from "@/components/city/Step3VisualFrame";
import { useEffect, useRef, useState } from "react";

const ZOO_MAP_INTRINSIC = { width: 1920, height: 1080 };
/** Match asset aspect if different — adjust when `network.png` dimensions are known. */
const NETWORK_INTRINSIC = { width: 1920, height: 1080 };

type Phase =
  | "narrative"
  | "fadeDistricts"
  | "holdMap"
  | "networkIn"
  | "networkZoom"
  | "morph"
  | "done";

export type MachineRevealTransitionProps = {
  onComplete: () => void;
};

/**
 * Step 3 → 4: city → hold → crossfade to network.png → zoom/morph into the machine chapter.
 */
export function MachineRevealTransition({ onComplete }: MachineRevealTransitionProps) {
  const [phase, setPhase] = useState<Phase>("narrative");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("fadeDistricts"), 2600);
    const t2 = window.setTimeout(() => setPhase("holdMap"), 4000);
    const t3 = window.setTimeout(() => setPhase("networkIn"), 5200);
    const t4 = window.setTimeout(() => setPhase("networkZoom"), 7200);
    const t5 = window.setTimeout(() => setPhase("morph"), 9000);
    const t6 = window.setTimeout(() => {
      setPhase("done");
      onCompleteRef.current();
    }, 11200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      window.clearTimeout(t5);
      window.clearTimeout(t6);
    };
  }, []);

  const showNarrative = phase === "narrative";
  const fadeDistricts =
    phase === "fadeDistricts" ||
    phase === "holdMap" ||
    phase === "networkIn" ||
    phase === "networkZoom" ||
    phase === "morph";
  const dimCity =
    phase === "fadeDistricts" ||
    phase === "holdMap" ||
    phase === "networkIn" ||
    phase === "networkZoom" ||
    phase === "morph";
  const cityOpaque =
    phase === "narrative" || phase === "fadeDistricts" || phase === "holdMap";
  const showNetwork =
    phase === "networkIn" || phase === "networkZoom" || phase === "morph";
  const networkZoomed = phase === "networkZoom" || phase === "morph";
  const morphChrome = phase === "morph";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-stone-950/75 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="machine-reveal-title"
      aria-busy={phase !== "done"}
    >
      {showNarrative ? (
        <div className="absolute inset-x-0 top-6 z-[110] px-4 text-center sm:top-8">
          <p
            id="machine-reveal-title"
            className="mx-auto max-w-xl font-serif text-lg leading-relaxed text-amber-50 sm:text-xl"
          >
            The AI does not &apos;know&apos; you like a friend does. It breaks your words into
            pieces, checks old city patterns, and predicts where you belong.
          </p>
        </div>
      ) : null}

      <div
        className={[
          "relative w-full px-4 transition-transform duration-[2s] ease-in-out",
          STEP3_ARTWORK_MAX_W_CLASS,
          networkZoomed ? "scale-[1.06]" : "scale-100",
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full overflow-hidden rounded-2xl border-2 border-stone-700/50 shadow-2xl transition-[box-shadow,border-color] duration-[1.4s]",
            morphChrome
              ? "border-violet-500/70 shadow-[0_0_72px_rgba(139,92,246,0.45)]"
              : "",
          ].join(" ")}
        >
          {/* City map layer */}
          <div
            className={[
              "relative w-full leading-none transition-[opacity,filter] duration-[1.8s] ease-in-out",
              dimCity ? "brightness-[0.5] contrast-[1.06]" : "",
              cityOpaque ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <Image
              src="/map/zoo-map1.png"
              alt=""
              width={ZOO_MAP_INTRINSIC.width}
              height={ZOO_MAP_INTRINSIC.height}
              className={STEP3_ARTWORK_IMAGE_CLASS}
              sizes="(max-width: 1500px) 100vw, 1500px"
              priority
            />
            <div
              className={[
                "absolute inset-0 transition-opacity duration-[1.4s] ease-out",
                fadeDistricts ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              {districtConfig.map((d) => {
                const r = d.overviewHotspot;
                return (
                  <div
                    key={d.id}
                    className="absolute rounded-2xl border-2 border-amber-400/50 bg-amber-200/20"
                    style={{
                      left: `${r.left}%`,
                      top: `${r.top}%`,
                      width: `${r.width}%`,
                      height: `${r.height}%`,
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Hidden system: network image */}
          <div
            className={[
              "pointer-events-none absolute inset-0 transition-opacity duration-[1.8s] ease-in-out",
              showNetwork ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <Image
              src="/map/network1.png"
              alt=""
              width={NETWORK_INTRINSIC.width}
              height={NETWORK_INTRINSIC.height}
              className={STEP3_ARTWORK_IMAGE_CLASS}
              sizes="(max-width: 1500px) 100vw, 1500px"
            />
            <NetworkParticles active={showNetwork} />
          </div>

          <div
            className={[
              "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-violet-950/25 via-transparent to-violet-950/15 transition-opacity duration-[1.2s]",
              showNetwork ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "pointer-events-none absolute inset-0 rounded-2xl border-2 transition-opacity duration-700",
              morphChrome ? "border-violet-400/85 opacity-100" : "opacity-0",
            ].join(" ")}
          />
        </div>
      </div>
    </div>
  );
}

function NetworkParticles({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="zoo-machine-particle absolute block h-1 w-1 rounded-full bg-violet-200/60 shadow-[0_0_6px_rgba(196,181,253,0.85)]"
          style={{
            left: `${10 + (i * 41) % 80}%`,
            top: `${15 + (i * 23) % 70}%`,
            animationDuration: `${3 + (i % 4) * 0.35}s`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}
