import { STEP5_ANIMALS } from "@/data/step5Animals";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { RedesignRegionId } from "@/types/city";

export type LightInsight = { title: string; body: string };

/** Two or three short celebratory lines — not a dashboard. */
export function buildLightStep6Insights(
  placements: Record<string, RedesignRegionId>,
): LightInsight[] {
  const initial = buildInitialStep5Placements() as Record<string, RedesignRegionId>;
  let changed = 0;
  let freelancer = 0;
  for (const a of STEP5_ANIMALS) {
    if (placements[a.id] !== initial[a.id]) changed += 1;
    if (placements[a.id] === "freelancer") freelancer += 1;
  }

  const cards: LightInsight[] = [];

  if (freelancer >= 1) {
    cards.push({
      title: "New possibilities",
      body:
        freelancer >= 2
          ? "Some animals now belong in a path the old city didn’t name."
          : "You opened a door beyond the four big districts.",
    });
  }

  if (changed >= Math.ceil(STEP5_ANIMALS.length * 0.35)) {
    cards.push({
      title: "A different city",
      body: "You changed how the system’s map lines up with real lives.",
    });
  } else if (changed >= 1) {
    cards.push({
      title: "Gentle shifts",
      body: "Even a few moves can reshape what the city looks like.",
    });
  } else {
    cards.push({
      title: "Steady hands",
      body: "You kept the city’s old shape — and that is a choice too.",
    });
  }

  cards.push({
    title: "Shared hopes",
    body: "More animals can picture a future that fits who they are.",
  });

  while (cards.length < 3) {
    cards.push({
      title: "Your story",
      body: "The city remembers the paths you opened.",
    });
  }

  return cards.slice(0, 3);
}
