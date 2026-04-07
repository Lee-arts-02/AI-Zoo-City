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

/** Labels and word-parts derived from key tokens (animal name may be two words). */
export function keyLabelSetFromTokens(
  tokens: { label: string }[],
): Set<string> {
  const s = new Set<string>();
  for (const t of tokens) {
    const L = t.label.toLowerCase().trim();
    if (!L) continue;
    s.add(L);
    for (const part of L.split(/\s+/)) {
      if (part.length >= 2) s.add(part);
    }
  }
  return s;
}

export function wordMatchesKeyToken(word: string, keyLabelsLower: Set<string>): boolean {
  const w = word.toLowerCase().replace(/[^a-z']/g, "");
  if (!w) return false;
  return keyLabelsLower.has(w);
}
