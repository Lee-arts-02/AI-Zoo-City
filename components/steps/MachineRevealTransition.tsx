"use client";

import Image from "next/image";
import { districtConfig } from "@/data/districtConfig";
import {
  STEP3_ARTWORK_IMAGE_CLASS,
  STEP3_ARTWORK_MAX_W_CLASS,
} from "@/components/city/Step3VisualFrame";
import { useAudio } from "@/lib/audio/AudioProvider";
import { useCallback, useEffect, useRef, useState } from "react";

const ZOO_MAP_INTRINSIC = { width: 1920, height: 1080 };

type Phase =
  | "narrative"
  | "fadeDistricts"
  | "holdMap"
  | "networkIn"
  | "networkZoom"
  | "morph"
  | "exiting"
  | "done";

/** Fade-out after video ends before Step 4 mounts (ms); matches CSS transition. */
const EXIT_FADE_MS = 1100;

export type MachineRevealTransitionProps = {
  onComplete: () => void;
};

/**
 * Step 3 → 4: city → hold → crossfade to machine video → zoom/morph into the machine chapter.
 */
export function MachineRevealTransition({ onComplete }: MachineRevealTransitionProps) {
  const [phase, setPhase] = useState<Phase>("narrative");
  const onCompleteRef = useRef(onComplete);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  /** True once video has ended (or error/failsafe): blocks phase timers and duplicate exit. */
  const exitStartedRef = useRef(false);
  const exitFinishTimerRef = useRef<number | null>(null);
  const [videoReady, setVideoReady] = useState(false);
  const { volume, muted: globalMuted, suppressBgm, releaseBgm } = useAudio();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  /** Phase schedule: +1s between beats (original + 1000ms) so extended fades can finish. Step 4 starts only after machine video fires `ended`. */
  useEffect(() => {
    const ids: number[] = [];
    const schedule = (ms: number, next: Phase) => {
      ids.push(
        window.setTimeout(() => {
          if (exitStartedRef.current) return;
          setPhase(next);
        }, ms),
      );
    };
    schedule(2600, "fadeDistricts");
    schedule(5000, "holdMap");
    schedule(6200, "networkIn");
    schedule(8200, "networkZoom");
    schedule(10000, "morph");

    return () => {
      ids.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  const showNarrative = phase === "narrative";
  const fadeDistricts =
    phase === "fadeDistricts" ||
    phase === "holdMap" ||
    phase === "networkIn" ||
    phase === "networkZoom" ||
    phase === "morph" ||
    phase === "exiting";
  const dimCity =
    phase === "fadeDistricts" ||
    phase === "holdMap" ||
    phase === "networkIn" ||
    phase === "networkZoom" ||
    phase === "morph" ||
    phase === "exiting";
  const cityOpaque =
    phase === "narrative" || phase === "fadeDistricts" || phase === "holdMap";
  const showNetwork =
    phase === "networkIn" ||
    phase === "networkZoom" ||
    phase === "morph" ||
    phase === "exiting";
  const networkZoomed =
    phase === "networkZoom" || phase === "morph" || phase === "exiting";
  const morphChrome = phase === "morph" || phase === "exiting";
  const isExitFade = phase === "exiting";

  /** Pause background music while the machine video layer is visible; resume when it ends or overlay unmounts. */
  useEffect(() => {
    if (!showNetwork) return;
    suppressBgm();
    return () => {
      releaseBgm();
    };
  }, [showNetwork, suppressBgm, releaseBgm]);

  const finalizeToStep4 = useCallback(() => {
    setPhase("done");
    onCompleteRef.current();
  }, []);

  const beginExitFade = useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setPhase("exiting");
    if (exitFinishTimerRef.current != null) {
      window.clearTimeout(exitFinishTimerRef.current);
    }
    exitFinishTimerRef.current = window.setTimeout(() => {
      exitFinishTimerRef.current = null;
      finalizeToStep4();
    }, EXIT_FADE_MS); // keep in sync with Tailwind duration-[1100ms] below
  }, [finalizeToStep4]);

  useEffect(() => {
    return () => {
      if (exitFinishTimerRef.current != null) {
        window.clearTimeout(exitFinishTimerRef.current);
      }
    };
  }, []);

  /** Match global volume / mute (same effective behaviour as BGM/SFX). */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const eff = globalMuted ? 0 : volume / 100;
    el.volume = Math.min(1, Math.max(0, eff));
    el.muted = globalMuted || eff === 0;
  }, [volume, globalMuted]);

  /** Autoplay once when the machine layer crossfades in; no loop. */
  useEffect(() => {
    if (!showNetwork) return;
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => {
      /* Autoplay with sound may be blocked until a prior user gesture. */
    });
  }, [showNetwork]);

  useEffect(() => {
    if (phase === "done" && videoRef.current) {
      videoRef.current.pause();
    }
  }, [phase]);

  /**
   * If autoplay is blocked or `ended` never fires, still advance after expected duration
   * so the flow cannot stall indefinitely.
   */
  useEffect(() => {
    if (!showNetwork || isExitFade) return;
    const el = videoRef.current;
    if (!el) return;
    let failsafeId: number | undefined;
    const armFailsafe = () => {
      const d = el.duration;
      if (!Number.isFinite(d) || d <= 0) return;
      if (failsafeId != null) window.clearTimeout(failsafeId);
      failsafeId = window.setTimeout(() => {
        if (!exitStartedRef.current) {
          beginExitFade();
        }
      }, Math.ceil(d * 1000) + 1000);
    };
    if (el.readyState >= 1) {
      armFailsafe();
    }
    el.addEventListener("loadedmetadata", armFailsafe);
    return () => {
      el.removeEventListener("loadedmetadata", armFailsafe);
      if (failsafeId != null) window.clearTimeout(failsafeId);
    };
  }, [showNetwork, isExitFade, beginExitFade]);

  return (
    <div
      className={[
        "fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-[2px] transition-colors ease-in-out",
        isExitFade
          ? "pointer-events-none bg-[#07030f] duration-[1100ms]"
          : "bg-stone-950/75 duration-300",
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-labelledby="machine-reveal-title"
      aria-busy={phase !== "done"}
    >
      {/*
        Step 4 aesthetic bridge: fades IN under the video/map stack so we crossfade into the same
        violet/indigo language as Step 4 instead of going transparent and flashing Step 3 behind.
      */}
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[101] bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950",
          "transition-opacity duration-[1100ms] ease-in-out",
          isExitFade ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[102]",
          "bg-[radial-gradient(ellipse_85%_55%_at_50%_38%,rgba(34,211,238,0.14),transparent_58%)]",
          "mix-blend-screen",
          "transition-opacity duration-[1100ms] ease-in-out",
          isExitFade ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[103] mix-blend-soft-light",
          "bg-[repeating-linear-gradient(180deg,transparent,transparent_3px,rgba(167,139,250,0.06)_3px,rgba(167,139,250,0.06)_4px)]",
          "transition-opacity duration-[1100ms] ease-in-out",
          isExitFade ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      <div
        className={[
          "pointer-events-none absolute inset-0 z-[104] bg-gradient-to-t from-cyan-500/5 via-transparent to-violet-400/10",
          "transition-opacity duration-[1100ms] ease-in-out",
          isExitFade ? "opacity-100" : "opacity-0",
        ].join(" ")}
        aria-hidden
      />
      {showNarrative ? (
        <div className="absolute inset-x-0 top-6 z-[110] px-4 text-center sm:top-8">
          <p
            id="machine-reveal-title"
            className="mx-auto max-w-xl rounded-xl border border-white/10 bg-stone-950/35 px-4 py-3 font-serif text-lg leading-relaxed text-amber-50 shadow-sm backdrop-blur-md sm:px-5 sm:text-xl"
          >
            The AI does not &apos;know&apos; you like a friend does. It breaks your words into
            pieces, checks old city patterns, and predicts where you belong.
          </p>
        </div>
      ) : null}

      <div
        className={[
          "relative z-[106] w-full px-4 ease-in-out",
          STEP3_ARTWORK_MAX_W_CLASS,
          isExitFade
            ? "scale-[1.03] opacity-0 transition-[transform,opacity] duration-[1100ms] ease-in-out"
            : [
                "transition-transform duration-[2s]",
                networkZoomed ? "scale-[1.06]" : "scale-100",
                "opacity-100",
              ].join(" "),
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full overflow-hidden rounded-2xl border-2 border-stone-700/50 shadow-2xl transition-[box-shadow,border-color] duration-[2.4s]",
            morphChrome
              ? "border-violet-500/70 shadow-[0_0_72px_rgba(139,92,246,0.45)]"
              : "",
          ].join(" ")}
        >
          {/* City map layer */}
          <div
            className={[
              "relative w-full leading-none transition-[opacity,filter] duration-[2800ms] ease-in-out",
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
                "absolute inset-0 transition-opacity duration-[2.4s] ease-out",
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

          {/* Machine video (replaces /map/network1.png); same layout + crossfade as image */}
          <div
            className={[
              "pointer-events-none absolute inset-0 transition-opacity duration-[2800ms] ease-in-out",
              showNetwork ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            <video
              ref={videoRef}
              className={[
                STEP3_ARTWORK_IMAGE_CLASS,
                "bg-stone-900",
                videoReady ? "opacity-100" : "opacity-0",
                "transition-opacity duration-200",
              ].join(" ")}
              playsInline
              preload="auto"
              muted={globalMuted}
              onLoadedData={() => setVideoReady(true)}
              onEnded={beginExitFade}
              onError={() => {
                /* If the file fails to decode, still advance so the user is not stuck. */
                beginExitFade();
              }}
            >
              <source src="/machine.mp4" type="video/mp4" />
            </video>
            <NetworkParticles active={showNetwork} />
          </div>

          <div
            className={[
              "pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-violet-950/25 via-transparent to-violet-950/15 transition-opacity duration-[2.2s]",
              showNetwork ? "opacity-100" : "opacity-0",
            ].join(" ")}
          />

          <div
            className={[
              "pointer-events-none absolute inset-0 rounded-2xl border-2 transition-opacity duration-[1700ms]",
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
