import { ZooCityClient } from "@/components/zoo-city/ZooCityClient";
import { GameProvider } from "@/lib/gameState";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Zoo City",
  description:
    "A seven-step storybook adventure about AI, cities, and fair choices for young learners.",
};

export default function ZooCityPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-amber-100/90 to-orange-50">
      <GameProvider>
        <ZooCityClient />
      </GameProvider>
    </div>
  );
}
