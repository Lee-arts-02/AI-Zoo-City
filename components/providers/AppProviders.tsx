"use client";

import { AudioProvider } from "@/lib/audio/AudioProvider";
import { GameProvider } from "@/lib/gameState";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <GameProvider>
      <AudioProvider>{children}</AudioProvider>
    </GameProvider>
  );
}
