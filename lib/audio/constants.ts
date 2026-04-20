export const AUDIO = {
  main: "/sound/main.mp3",
  ending: "/sound/ending.mp3",
  block4: "/sound/block4.mp3",
  approved: "/sound/approved.mp3",
  rejected: "/sound/rejected.mp3",
} as const;

export type BgmTrackId = "main" | "ending" | "block4";

export function bgmSrcForTrack(track: BgmTrackId): string {
  switch (track) {
    case "main":
      return AUDIO.main;
    case "ending":
      return AUDIO.ending;
    case "block4":
      return AUDIO.block4;
  }
}

export const STORAGE_VOLUME_KEY = "zoo-city-audio-v";
export const STORAGE_MUTED_KEY = "zoo-city-audio-m";

/** Crossfade duration when switching BGM tracks (ms) */
export const BGM_FADE_MS = 400;

/** BGM duck when learner opens the Step 3 → machine transition (ms) */
export const OPEN_BOX_BGM_FADE_MS = 2000;
