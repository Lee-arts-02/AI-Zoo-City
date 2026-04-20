"use client";

import { useAudio } from "@/lib/audio/AudioProvider";
import { useEffect, useId, useRef, useState } from "react";

function IconSpeakerOn(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M17.66 6.34a8 8 0 0 1 0 11.32" />
    </svg>
  );
}

function IconSpeakerOff(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden
    >
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="m22 9-6 6" />
      <path d="m16 9 6 6" />
    </svg>
  );
}

export function AudioControlPanel() {
  const { volume, muted, setVolume, toggleMute } = useAudio();
  const id = useId();
  const sliderId = `${id}-vol`;
  const [volumeOpen, setVolumeOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!volumeOpen) return;
    const onDocPointerDown = (e: PointerEvent) => {
      const el = panelRef.current;
      if (!el || el.contains(e.target as Node)) return;
      setVolumeOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVolumeOpen(false);
    };
    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [volumeOpen]);

  return (
    <div
      ref={panelRef}
      className="pointer-events-auto fixed right-3 top-3 z-[500] flex items-center gap-0 rounded-2xl border border-amber-900/15 bg-white/70 py-2 pl-2 pr-2 shadow-md backdrop-blur-md sm:right-4 sm:top-4 sm:pl-3 sm:pr-3"
      role="region"
      aria-label="Audio controls"
    >
      <button
        type="button"
        onClick={() => setVolumeOpen((o) => !o)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-amber-950/90 transition hover:bg-amber-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700"
        aria-expanded={volumeOpen}
        aria-controls={volumeOpen ? sliderId : undefined}
        aria-label={volumeOpen ? "Hide volume" : "Show volume"}
      >
        {muted ? (
          <IconSpeakerOff className="h-5 w-5" />
        ) : (
          <IconSpeakerOn className="h-5 w-5" />
        )}
      </button>

      {volumeOpen && (
        <div className="flex min-w-[120px] max-w-[180px] flex-col gap-0.5 border-l border-amber-900/10 pl-2 sm:min-w-[140px] sm:pl-3">
          <div className="flex items-center justify-between gap-2 pb-1">
            <span className="font-sans text-[10px] font-medium uppercase tracking-wide text-amber-900/60">
              Volume
            </span>
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg px-2 py-0.5 font-sans text-[11px] font-semibold text-amber-900/80 hover:bg-amber-100/90"
              aria-pressed={muted}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
          </div>
          <label htmlFor={sliderId} className="sr-only">
            Volume level
          </label>
          <input
            id={sliderId}
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-amber-200/80 accent-amber-700"
          />
        </div>
      )}
    </div>
  );
}
