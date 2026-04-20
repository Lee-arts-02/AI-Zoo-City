/**
 * Parse typewriter dialogue written as a single string:
 * - `<b>...</b>` → emphasis segments (bold in the bubble)
 * - `|||` (optional) → split into major segments with the usual pause between parts (same as old `//`)
 *
 * @example
 * parseTypewriterText("Hello <b>world</b>!")
 * parseTypewriterText("First block.|||Second block with <b>bold</b>.")
 */
export function parseTypewriterText(rawText: string): {
  segments: string[];
  segmentBold: boolean[];
  /** True only for the first segment after a `|||` (paragraph gap in the bubble). */
  breakBefore: boolean[];
} {
  const segments: string[] = [];
  const segmentBold: boolean[] = [];
  const breakBefore: boolean[] = [];

  const majorChunks = rawText.split(/\s*\|\|\|\s*/);

  for (let mi = 0; mi < majorChunks.length; mi++) {
    const chunk = majorChunks[mi];
    if (!chunk) continue;

    const subParts = chunk.split(/(<b>[\s\S]*?<\/b>)/g);
    let firstInChunk = true;
    for (const part of subParts) {
      if (!part) continue;
      if (part.startsWith("<b>") && part.endsWith("</b>")) {
        segments.push(part.replace(/<\/?b>/g, ""));
        segmentBold.push(true);
      } else {
        segments.push(part);
        segmentBold.push(false);
      }
      breakBefore.push(mi > 0 && firstInChunk);
      firstInChunk = false;
    }
  }

  return { segments, segmentBold, breakBefore };
}

/** Zip into segments for the Step 4 bubble (matches `DialogueTypingPart`). */
export function toDialogueTypingParts(rawText: string): {
  text: string;
  emphasis: boolean;
  breakBefore?: boolean;
}[] {
  const { segments, segmentBold, breakBefore } = parseTypewriterText(rawText);
  return segments.map((text, i) => ({
    text,
    emphasis: segmentBold[i] ?? false,
    breakBefore: breakBefore[i] ? true : undefined,
  }));
}
