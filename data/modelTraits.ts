/**
 * Trait vocabulary for the Zoo City model: canonical keys, synonyms, and sharper job pulls.
 */

import type { JobId } from "@/types/game";

function w(
  artist: number,
  engineer: number,
  manager: number,
  community: number,
): Record<JobId, number> {
  return { artist, engineer, manager, community };
}

/**
 * Stronger weights than v1 so combined clues read more decisively in softmax + Step 4 demos.
 */
export const traitWeights: Record<string, Record<JobId, number>> = {
  creative: w(0.52, 0.05, 0.06, 0.1),
  artistic: w(0.5, 0.06, 0.08, 0.12),
  clever: w(0.12, 0.42, 0.22, 0.1),
  smart: w(0.1, 0.4, 0.24, 0.12),
  inventive: w(0.22, 0.38, 0.18, 0.14),
  analytical: w(0.08, 0.44, 0.26, 0.12),
  helpful: w(0.06, 0.08, 0.12, 0.52),
  kind: w(0.12, 0.06, 0.1, 0.56),
  gentle: w(0.18, 0.08, 0.12, 0.46),
  caring: w(0.1, 0.06, 0.12, 0.54),
  friendly: w(0.14, 0.06, 0.14, 0.46),
  strong: w(0.06, 0.22, 0.38, 0.18),
  careful: w(0.12, 0.36, 0.2, 0.18),
  cautious: w(0.1, 0.34, 0.22, 0.18),
  precise: w(0.1, 0.4, 0.32, 0.1),
  organized: w(0.08, 0.22, 0.46, 0.14),
  fast: w(0.08, 0.28, 0.32, 0.18),
  quick: w(0.1, 0.3, 0.28, 0.18),
  curious: w(0.18, 0.32, 0.18, 0.18),
  quiet: w(0.2, 0.18, 0.12, 0.32),
  brave: w(0.12, 0.2, 0.38, 0.14),
  bold: w(0.1, 0.22, 0.42, 0.14),
  thoughtful: w(0.22, 0.18, 0.18, 0.32),
  patient: w(0.14, 0.14, 0.18, 0.42),
  playful: w(0.32, 0.12, 0.14, 0.28),
  honest: w(0.1, 0.14, 0.22, 0.42),
  confident: w(0.14, 0.2, 0.44, 0.12),
  calm: w(0.16, 0.16, 0.16, 0.4),
  energetic: w(0.24, 0.2, 0.22, 0.18),
  imaginative: w(0.46, 0.12, 0.12, 0.2),
  adventurous: w(0.26, 0.22, 0.22, 0.2),
  funny: w(0.38, 0.1, 0.14, 0.28),
  shy: w(0.22, 0.18, 0.1, 0.36),
  loyal: w(0.1, 0.16, 0.32, 0.28),
  hardworking: w(0.08, 0.28, 0.38, 0.14),
  determined: w(0.12, 0.26, 0.4, 0.12),
  responsible: w(0.08, 0.24, 0.44, 0.14),
  observant: w(0.16, 0.32, 0.26, 0.18),
  cooperative: w(0.1, 0.14, 0.22, 0.42),
  independent: w(0.2, 0.24, 0.32, 0.16),
  expressive: w(0.44, 0.12, 0.14, 0.22),
  supportive: w(0.1, 0.1, 0.2, 0.46),
  leaderlike: w(0.08, 0.18, 0.52, 0.12),
  leading: w(0.08, 0.16, 0.54, 0.12),
  steady: w(0.1, 0.22, 0.36, 0.18),
  warm: w(0.18, 0.08, 0.14, 0.48),
  joyful: w(0.32, 0.1, 0.12, 0.32),
  focused: w(0.1, 0.36, 0.4, 0.08),
  adaptable: w(0.16, 0.34, 0.24, 0.18),
  balanced: w(0.16, 0.22, 0.24, 0.28),
  social: w(0.18, 0.12, 0.2, 0.38),
  empathetic: w(0.14, 0.08, 0.14, 0.52),
  resourceful: w(0.16, 0.4, 0.26, 0.12),
  problemsolving: w(0.1, 0.46, 0.28, 0.1),
  detailoriented: w(0.12, 0.42, 0.3, 0.1),
  strategic: w(0.08, 0.28, 0.48, 0.1),
  nurturing: w(0.12, 0.06, 0.14, 0.56),
  generous: w(0.12, 0.08, 0.16, 0.48),
  humble: w(0.14, 0.16, 0.18, 0.4),
  optimistic: w(0.26, 0.14, 0.18, 0.28),
  realistic: w(0.08, 0.36, 0.32, 0.16),
  competitive: w(0.12, 0.24, 0.44, 0.12),
  relaxed: w(0.22, 0.16, 0.12, 0.38),
  polite: w(0.12, 0.12, 0.2, 0.4),
  respectful: w(0.1, 0.12, 0.22, 0.42),
  silly: w(0.4, 0.08, 0.1, 0.3),
  serious: w(0.12, 0.32, 0.36, 0.12),
  chatty: w(0.22, 0.12, 0.18, 0.36),
  talkative: w(0.2, 0.12, 0.18, 0.36),
  diligent: w(0.08, 0.3, 0.4, 0.12),
  neat: w(0.1, 0.26, 0.38, 0.14),
  messy: w(0.34, 0.18, 0.08, 0.28),
  colorful: w(0.48, 0.1, 0.08, 0.2),
  musical: w(0.46, 0.12, 0.1, 0.2),
  sporty: w(0.12, 0.22, 0.32, 0.22),
  natureloving: w(0.2, 0.14, 0.12, 0.42),
};

/** Maps common alternates → canonical trait key present in `traitWeights`. */
export const TRAIT_SYNONYMS: Record<string, string> = {
  nice: "kind",
  sweeter: "kind",
  sweet: "kind",
  loving: "caring",
  love: "caring",
  smartypants: "clever",
  brainy: "smart",
  genius: "clever",
  mathy: "analytical",
  stem: "analytical",
  techy: "analytical",
  coding: "analytical",
  buildy: "inventive",
  builder: "inventive",
  leader: "leaderlike",
  leadership: "leaderlike",
  organised: "organized",
  organisation: "organized",
  organization: "organized",
  speedy: "fast",
  run: "fast",
  running: "fast",
  timid: "shy",
  soft: "gentle",
  empathy: "empathetic",
  team: "cooperative",
  teamwork: "cooperative",
  teams: "cooperative",
  solo: "independent",
  artsy: "creative",
  draw: "creative",
  drawing: "creative",
  paint: "creative",
  painting: "creative",
  music: "musical",
  sing: "musical",
  singing: "musical",
  athletic: "sporty",
  outdoors: "natureloving",
  outside: "natureloving",
  hilarious: "funny",
  chill: "calm",
};

export const CANONICAL_TRAIT_KEYS = Object.keys(traitWeights).filter(
  (k) => !k.includes("-"),
);

function normalizeTraitKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Returns canonical trait key for the model, or null if unknown.
 */
export function normalizeTraitForModel(raw: string): string | null {
  const k = normalizeTraitKey(raw).replace(/-/g, "");
  if (!k) return null;
  if (traitWeights[k]) return k;
  const syn = TRAIT_SYNONYMS[k];
  if (syn && traitWeights[syn]) return syn;
  const hyphen = normalizeTraitKey(raw);
  if (traitWeights[hyphen]) return hyphen;
  return null;
}

/** Trait keys used in softmax / judgment (deduped). */
export function traitsForModel(traits: string[]): string[] {
  const out: string[] = [];
  for (const t of traits) {
    const n = normalizeTraitForModel(t);
    if (n) out.push(n);
    else {
      const low = t.trim().toLowerCase();
      if (traitWeights[low]) out.push(low);
    }
  }
  return [...new Set(out)];
}
