import type { Step7CareerChoice } from "@/types/game";

export const REFLECTION_BASE: Record<Step7CareerChoice, string> = {
  follow_ai:
    "I would follow the system, knowing it is based on past patterns.",
  own_path:
    "I would choose my own path, even when the system suggests something else.",
  new_path: "I would create a path that the system did not imagine.",
};

/** Alternate phrasings for Shuffle (same meaning per case). */
export const REFLECTION_VARIANTS: Record<Step7CareerChoice, string[]> = {
  follow_ai: [
    REFLECTION_BASE.follow_ai,
    "I would trust the patterns the system has learned from the past.",
    "I would stay with the system’s suggestion, grounded in what came before.",
  ],
  own_path: [
    REFLECTION_BASE.own_path,
    "I would pick my own direction, even if the system points elsewhere.",
    "I would follow my own compass, not only the system’s map.",
  ],
  new_path: [
    REFLECTION_BASE.new_path,
    "I would invent a route the system never pictured.",
    "I would open a path outside what the model expected.",
  ],
};

/** Short line for the certificate (derived from choice + reflection theme). */
export const CERTIFICATE_SHORT: Record<Step7CareerChoice, string> = {
  follow_ai: "You moved with the patterns the system knows.",
  own_path: "You chose your own direction over the default.",
  new_path: "You created possibilities beyond the system.",
};

export const CHOICE_LABEL: Record<Step7CareerChoice, string> = {
  follow_ai: "Followed the AI suggestion",
  own_path: "Chose my own path",
  new_path: "Created a new path",
};

/**
 * Certificate — intro paragraph (plain text). On-screen / PNG use
 * `CertificateIntroParagraph` in Step7Reflection with **predictions** bolded.
 */
export const CERTIFICATE_INTRO =
  "You audited our AI system, learned how it makes predictions, and constructed your own way to make it better.";

/** Certificate — personalized line after identity fields (by Step 7 choice). */
export const CERTIFICATE_PERSONALIZED: Record<Step7CareerChoice, string> = {
  follow_ai:
    "You chose to move with the patterns the system already knows — and that choice still belongs to you.",
  own_path:
    "You chose to follow your own path, even when the system pointed somewhere else.",
  new_path: "You chose to create a path the system did not imagine.",
};

/** Certificate — closing reflective line (by Step 7 choice). */
export const CERTIFICATE_CLOSING: Record<Step7CareerChoice, string> = {
  follow_ai:
    "You created continuity with what came before — and you still made it yours.",
  own_path: "You created possibilities beyond what the system expected.",
  new_path: "You created possibilities beyond what the system expected.",
};
