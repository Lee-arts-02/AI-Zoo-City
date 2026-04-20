"use client";

import { useGameState } from "@/lib/gameState";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import {
  AUDIO,
  BGM_FADE_MS,
  bgmSrcForTrack,
  type BgmTrackId,
  STORAGE_MUTED_KEY,
  STORAGE_VOLUME_KEY,
} from "./constants";
import { AudioControlPanel } from "@/components/audio/AudioControlPanel";

type AudioContextValue = {
  volume: number;
  muted: boolean;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  playDecisionSfx: (approved: boolean) => void;
  unlocked: boolean;
  /** Pause background music while e.g. transition video plays; ref-counted. */
  suppressBgm: () => void;
  releaseBgm: () => void;
  /** Smoothly ramp BGM volume to zero and pause (e.g. Step 3 “Open box”). */
  fadeBgmToSilence: (durationMs: number) => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

function readStoredVolume(): number {
  if (typeof window === "undefined") return 80;
  try {
    const raw = window.localStorage.getItem(STORAGE_VOLUME_KEY);
    if (raw == null) return 80;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 80;
    return Math.min(100, Math.max(0, Math.round(n)));
  } catch {
    return 80;
  }
}

function readStoredMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

function getDesiredBgmTrack(pathname: string, currentStep: number): BgmTrackId {
  if (pathname === "/") return "main";
  if (pathname.startsWith("/zoo-city")) {
    if (currentStep === 4) return "block4";
    /** `ending.mp3` only for Step 6; Step 7 returns to main BGM. */
    if (currentStep === 6) return "ending";
    return "main";
  }
  return "main";
}

/** Step 6 ending clip plays once (no loop); other BGM tracks loop. */
function shouldLoopBgm(track: BgmTrackId): boolean {
  return track !== "ending";
}

function linearRamp(
  from: number,
  to: number,
  ms: number,
  onFrame: (v: number) => void,
  shouldAbort: () => boolean,
): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      if (shouldAbort()) {
        resolve();
        return;
      }
      const t = ms <= 0 ? 1 : Math.min(1, (now - start) / ms);
      onFrame(from + (to - from) * t);
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    };
    requestAnimationFrame(step);
  });
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { state } = useGameState();
  const currentStep = state.currentStep;

  const [volume, setVolumeState] = useState(80);
  const [muted, setMuted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRef = useRef<HTMLAudioElement | null>(null);
  const currentBgmTrackRef = useRef<BgmTrackId | null>(null);
  const transitionGenRef = useRef(0);
  const unlockedRef = useRef(unlocked);
  useEffect(() => {
    unlockedRef.current = unlocked;
  }, [unlocked]);

  const bgmSuppressCountRef = useRef(0);
  const bgmWasPlayingBeforeSuppressRef = useRef(false);
  /** When true, `applyBgmVolume` does not overwrite manual fade ramp. */
  const bgmUserRampRef = useRef(false);
  const fadeBgmGenRef = useRef(0);

  const effectiveVolume = useMemo(
    () => (muted ? 0 : volume / 100),
    [muted, volume],
  );
  const effectiveVolumeRef = useRef(effectiveVolume);
  useEffect(() => {
    effectiveVolumeRef.current = effectiveVolume;
  }, [effectiveVolume]);

  useEffect(() => {
    setVolumeState(readStoredVolume());
    setMuted(readStoredMuted());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_VOLUME_KEY, String(volume));
    } catch {
      /* ignore */
    }
  }, [volume, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_MUTED_KEY, muted ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [muted, hydrated]);

  useEffect(() => {
    const bgm = new Audio();
    bgm.loop = true;
    bgm.preload = "auto";
    bgmRef.current = bgm;

    const sfx = new Audio();
    sfx.preload = "auto";
    sfxRef.current = sfx;

    return () => {
      bgm.pause();
      sfx.pause();
      bgm.src = "";
      sfx.src = "";
      bgmRef.current = null;
      sfxRef.current = null;
    };
  }, []);

  useEffect(() => {
    const onInteract = () => setUnlocked(true);
    window.addEventListener("pointerdown", onInteract, { passive: true });
    window.addEventListener("keydown", onInteract);
    window.addEventListener("touchstart", onInteract, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  const setVolume = useCallback((value: number) => {
    const v = Math.min(100, Math.max(0, Math.round(value)));
    setVolumeState(v);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  const applyBgmVolume = useCallback(() => {
    const bgm = bgmRef.current;
    if (!bgm || bgmUserRampRef.current) return;
    bgm.volume = effectiveVolumeRef.current;
  }, []);

  const fadeBgmToSilence = useCallback((durationMs: number) => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    if (mutedRef.current || effectiveVolumeRef.current <= 0) {
      bgm.pause();
      bgm.volume = effectiveVolumeRef.current;
      return;
    }
    fadeBgmGenRef.current += 1;
    const gen = fadeBgmGenRef.current;
    bgmUserRampRef.current = true;
    const startV = bgm.volume;
    void linearRamp(
      startV,
      0,
      Math.max(0, durationMs),
      (v) => {
        if (gen !== fadeBgmGenRef.current) return;
        const b = bgmRef.current;
        if (b) b.volume = v;
      },
      () => gen !== fadeBgmGenRef.current,
    ).then(() => {
      if (gen !== fadeBgmGenRef.current) return;
      bgmUserRampRef.current = false;
      const b = bgmRef.current;
      if (b) {
        b.pause();
        b.volume = effectiveVolumeRef.current;
      }
    });
  }, []);

  const suppressBgm = useCallback(() => {
    bgmSuppressCountRef.current += 1;
    if (bgmSuppressCountRef.current !== 1) return;
    const bgm = bgmRef.current;
    if (!bgm) {
      bgmWasPlayingBeforeSuppressRef.current = false;
      return;
    }
    bgmWasPlayingBeforeSuppressRef.current = !bgm.paused;
    bgm.pause();
  }, []);

  const releaseBgm = useCallback(() => {
    if (bgmSuppressCountRef.current === 0) return;
    bgmSuppressCountRef.current -= 1;
    if (bgmSuppressCountRef.current > 0) return;
    const bgm = bgmRef.current;
    if (!bgm) return;
    const shouldResume = bgmWasPlayingBeforeSuppressRef.current;
    bgmWasPlayingBeforeSuppressRef.current = false;
    if (!shouldResume || !unlockedRef.current) {
      applyBgmVolume();
      return;
    }
    bgm.volume = effectiveVolumeRef.current;
    void bgm.play().catch(() => {
      /* still blocked */
    });
    applyBgmVolume();
  }, [applyBgmVolume]);

  const playDecisionSfx = useCallback(
    (approved: boolean) => {
      const sfx = sfxRef.current;
      if (!sfx) return;

      /** Pauses BGM and blocks the BGM effect from calling `play()` until `releaseBgm`. */
      suppressBgm();

      const eff = mutedRef.current ? 0 : volumeRef.current / 100;
      sfx.volume = eff;
      sfx.src = approved ? AUDIO.approved : AUDIO.rejected;
      sfx.loop = false;
      sfx.currentTime = 0;

      let finished = false;
      const onSfxFinished = () => {
        if (finished) return;
        finished = true;
        releaseBgm();
      };

      sfx.addEventListener("ended", onSfxFinished, { once: true });
      void sfx.play().catch(() => {
        onSfxFinished();
      });
    },
    [suppressBgm, releaseBgm],
  );

  useEffect(() => {
    applyBgmVolume();
  }, [effectiveVolume, applyBgmVolume]);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;

    const desired = getDesiredBgmTrack(pathname, currentStep);
    const gen = ++transitionGenRef.current;

    const run = async () => {
      /** While approve/reject (or other) SFX holds a suppress, do not restart BGM. */
      const safePlayBgm = async (): Promise<boolean> => {
        if (bgmSuppressCountRef.current > 0) return false;
        try {
          await bgm.play();
          return true;
        } catch {
          return false;
        }
      };

      const sameTrack = currentBgmTrackRef.current === desired;
      if (sameTrack) {
        applyBgmVolume();
        if (unlocked) {
          /** Non-looping Step 6 ending: after it finishes, stay silent (no restart). */
          if (desired === "ending" && bgm.ended) {
            return;
          }
          await safePlayBgm();
        }
        return;
      }

      const hadTrack = currentBgmTrackRef.current !== null;
      if (hadTrack && !bgm.paused) {
        await linearRamp(
          bgm.volume,
          0,
          BGM_FADE_MS,
          (v) => {
            if (gen !== transitionGenRef.current) return;
            bgm.volume = v;
          },
          () => gen !== transitionGenRef.current,
        );
        if (gen !== transitionGenRef.current) return;
        bgm.pause();
      }

      bgm.src = bgmSrcForTrack(desired);
      bgm.loop = shouldLoopBgm(desired);
      currentBgmTrackRef.current = desired;
      bgm.load();
      applyBgmVolume();

      if (!unlocked) {
        bgm.volume = effectiveVolumeRef.current;
        return;
      }

      bgm.volume = 0;
      const started = await safePlayBgm();
      if (!started) {
        applyBgmVolume();
        return;
      }
      if (gen !== transitionGenRef.current) return;

      const target = effectiveVolumeRef.current;
      await linearRamp(
        0,
        target,
        BGM_FADE_MS,
        (v) => {
          if (gen !== transitionGenRef.current) return;
          bgm.volume = v;
        },
        () => gen !== transitionGenRef.current,
      );
      if (gen !== transitionGenRef.current) return;
      bgm.volume = target;
    };

    void run();

    return () => {
      transitionGenRef.current += 1;
    };
  }, [pathname, currentStep, unlocked, applyBgmVolume]);

  const value = useMemo<AudioContextValue>(
    () => ({
      volume,
      muted,
      setVolume,
      toggleMute,
      playDecisionSfx,
      unlocked,
      suppressBgm,
      releaseBgm,
      fadeBgmToSilence,
    }),
    [
      volume,
      muted,
      setVolume,
      toggleMute,
      playDecisionSfx,
      unlocked,
      suppressBgm,
      releaseBgm,
      fadeBgmToSilence,
    ],
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
      <AudioControlPanel />
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    throw new Error("useAudio must be used inside AudioProvider");
  }
  return ctx;
}
