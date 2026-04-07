import { STEP5_ANIMALS } from "@/data/step5Animals";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import { countInRegion, jobToRegionId, topAiJob } from "@/lib/step5Layout";
import type { RedesignRegionId } from "@/types/city";

export type Step6InsightCard = {
  label: string;
  body: string;
};

export type Step6Content = {
  /** Shown briefly when leaving Step 5 after save. */
  celebrationHeadline: string;
  summaryLine: string;
  cards: Step6InsightCard[];
  reflectionTeaser: string;
};

function ensurePlacements(
  p: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (p && Object.keys(p).length >= STEP5_ANIMALS.length) return p;
  return buildInitialStep5Placements();
}

/** Headline on the save celebration overlay (before Step 6). */
export function buildStep6CelebrationHeadline(
  placements: Record<string, RedesignRegionId> | null | undefined,
): string {
  const final = ensurePlacements(placements);
  const initial = buildInitialStep5Placements();
  let changed = 0;
  for (const a of STEP5_ANIMALS) {
    if (final[a.id] !== initial[a.id]) changed += 1;
  }
  if (changed >= 3) return "You redesigned the city.";
  return "Your new Zoo City is ready.";
}

export function buildStep6Content(
  placements: Record<string, RedesignRegionId> | null | undefined,
  freelancerHubDropCount: number,
): Step6Content {
  const final = ensurePlacements(placements);
  const initial = buildInitialStep5Placements();
  const total = STEP5_ANIMALS.length;

  let changedFromInitial = 0;
  let dreamMatch = 0;
  let aiFollow = 0;
  let aiAway = 0;
  let inFreelancer = 0;

  const initialMaxCrowd = Math.max(
    ...(["artist", "community", "engineer", "manager"] as const).map((r) =>
      countInRegion(r, initial),
    ),
  );
  const finalMaxCrowd = Math.max(
    ...(["artist", "community", "engineer", "manager", "freelancer"] as const).map(
      (r) => countInRegion(r, final),
    ),
  );

  const regionsUsed = new Set(Object.values(final)).size;

  for (const a of STEP5_ANIMALS) {
    const region = final[a.id];
    const aiRegion = jobToRegionId(topAiJob(a.aiRecommendation));
    const dreamRegion = jobToRegionId(a.dreamJob);

    if (final[a.id] !== initial[a.id]) changedFromInitial += 1;
    if (region === dreamRegion) dreamMatch += 1;
    if (region === aiRegion) aiFollow += 1;
    else aiAway += 1;
    if (region === "freelancer") inFreelancer += 1;
  }

  const celebrationHeadline = buildStep6CelebrationHeadline(final);

  let summaryLine: string;
  const aiShare = aiFollow / total;
  const changeShare = changedFromInitial / total;
  if (aiShare >= 0.58) {
    summaryLine = "You followed many of the system's patterns.";
  } else if (changeShare >= 0.42) {
    summaryLine = "You changed how the city works.";
  } else {
    summaryLine = "You balanced the system and your own choices.";
  }

  const cards: Step6InsightCard[] = [];

  if (dreamMatch >= Math.ceil(total / 2)) {
    cards.push({
      label: "Dream Match",
      body: "More animals can follow their dreams.",
    });
  } else if (dreamMatch >= 1) {
    cards.push({
      label: "Dream Match",
      body: "Some animals are closer to what they want.",
    });
  } else {
    cards.push({
      label: "Dream Match",
      body: "The city still holds room for many different hopes.",
    });
  }

  if (aiAway >= 5) {
    cards.push({
      label: "AI Agreement",
      body: "You chose differently from the system's strongest pattern for several animals.",
    });
  } else if (aiAway >= 2) {
    cards.push({
      label: "AI Agreement",
      body: `You changed ${aiAway} of the system's suggestions.`,
    });
  } else if (aiFollow >= 7) {
    cards.push({
      label: "AI Agreement",
      body: "You often kept the system's suggestions in mind.",
    });
  } else {
    cards.push({
      label: "AI Agreement",
      body: "You followed some of the system's suggestions.",
    });
  }

  if (regionsUsed >= 5 || finalMaxCrowd < initialMaxCrowd) {
    cards.push({
      label: "Diversity",
      body: "Your city is more mixed now.",
    });
  } else {
    cards.push({
      label: "Diversity",
      body: "Animals are more spread across places.",
    });
  }

  if (inFreelancer > 0) {
    cards.push({
      label: "Freelancer Hub",
      body:
        freelancerHubDropCount >= 2
          ? "Some animals now belong in a new kind of place."
          : "You created new possibilities.",
    });
  }

  const reflectionTeaser =
    (freelancerHubDropCount + changedFromInitial) % 2 === 0
      ? "If you lived in this city…"
      : "What would you choose in your city?";

  return {
    celebrationHeadline,
    summaryLine,
    cards,
    reflectionTeaser,
  };
}
