import type { Step4Token } from "@/lib/step4Tokens";
import { TRAIT_SYNONYMS } from "@/data/modelTraits";
import { ZOO_ANIMAL_DATA } from "@/data/zooAnimalDataset";

/**
 * Demo tokenization: split learner text into visible word-like units (simplified vs real LLM tokenizers).
 */
export function wordsFromSentence(s: string): string[] {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^["'([{]+|["')\]},.:;!?]+$/g, ""))
    .filter((w) => w.length > 0);
}

/** Lowercase alphanumerics only — matches how we compare learner words to token keys. */
export function normalizeTokenWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function addKeyForms(s: Set<string>, raw: string) {
  const n = normalizeTokenWord(raw);
  if (n.length >= 2) s.add(n);
}

/**
 * Labels + modelKey parts (traits, preset ids) so more sentence words map to “key” chips.
 */
export function keyLabelSetFromTokens(
  tokens: { label: string; modelKey?: string }[],
): Set<string> {
  const s = new Set<string>();
  for (const t of tokens) {
    const L = t.label.toLowerCase().trim();
    if (L) {
      addKeyForms(s, L);
      for (const part of L.split(/\s+/)) addKeyForms(s, part);
    }
    if (t.modelKey) {
      addKeyForms(s, t.modelKey);
      for (const part of t.modelKey.split(/[-_\s]+/)) addKeyForms(s, part);
    }
  }
  return s;
}

export function wordMatchesKeyToken(word: string, keyLabels: Set<string>): boolean {
  const w = normalizeTokenWord(word);
  if (!w) return false;
  if (keyLabels.has(w)) return true;
  // Plural / possessive-ish: "fox"/"foxes", "artist"/"artists" (require key length ≥3 so "an" ≠ "and")
  if (w.length >= 4) {
    for (const k of keyLabels) {
      if (k.length < 3) continue;
      if (w.startsWith(k) && w.length - k.length <= 2) return true;
    }
  }
  return false;
}

/**
 * Extra normalized strings per machine token (zoo aliases, trait synonyms) so animal + all traits can highlight.
 */
function normalizedFormsForKeyToken(t: Step4Token): string[] {
  const out: string[] = [];
  const add = (raw: string) => {
    const n = normalizeTokenWord(raw);
    if (n.length >= 2) out.push(n);
  };
  add(t.label);
  for (const part of t.label.split(/\s+/)) add(part);
  add(t.modelKey);
  for (const part of t.modelKey.split(/[-_\s]+/)) add(part);

  if (t.kind === "animal") {
    const entry = ZOO_ANIMAL_DATA.find((x) => x.key === t.modelKey);
    if (entry) {
      add(entry.label);
      add(entry.key);
      for (const a of entry.aliases) add(a);
    }
  }
  if (t.kind === "trait") {
    for (const [syn, canon] of Object.entries(TRAIT_SYNONYMS)) {
      if (canon === t.modelKey) add(syn);
    }
  }
  return out;
}

/** Superset of labels used to mark sentence words that belong to any {@link Step4Token}. */
export function expandedKeyLabelSetFromTokens(tokens: Step4Token[]): Set<string> {
  const s = keyLabelSetFromTokens(tokens);
  for (const t of tokens) {
    for (const x of normalizedFormsForKeyToken(t)) {
      s.add(x);
    }
  }
  return s;
}

/**
 * True if this surface word matches at least one key token (animal, traits), including aliases/synonyms.
 */
export function wordMatchesKeyTokenExpanded(word: string, tokens: Step4Token[]): boolean {
  const mega = expandedKeyLabelSetFromTokens(tokens);
  if (wordMatchesKeyToken(word, mega)) return true;
  const w = normalizeTokenWord(word);
  const canon = TRAIT_SYNONYMS[w];
  if (canon) {
    for (const t of tokens) {
      if (t.kind === "trait" && t.modelKey === canon) return true;
    }
  }
  return false;
}
