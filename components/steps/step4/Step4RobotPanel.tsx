"use client";

import Image from "next/image";
import type { Step4Token } from "@/lib/step4Tokens";
import type { JobId } from "@/types/game";
import type { DistrictId } from "@/types/city";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toDialogueTypingParts } from "@/lib/textParser";
import {
  oneClueFeedback,
  tokWhyFeedback,
  welcomeFeedbackText,
  type DialogueKind,
} from "./step4PhaseDialogue";
import { Step4RobotBubbleReveal, type DialogueTypingPart } from "./Step4RobotBubbleReveal";

export type { DialogueTypingPart } from "./Step4RobotBubbleReveal";

export type { DialogueKind } from "./step4PhaseDialogue";

type McOpt = { id: string; label: string; correct: boolean };

/** Token quiz (stage 2): learner must mark all options — each can be a token in some systems. */
const TOK_QUIZ_IDS = ["whole", "character", "part", "chunk", "sym"] as const;
const TOK_QUIZ_LABELS: Record<(typeof TOK_QUIZ_IDS)[number], string> = {
  whole: "Apple",
  character: "a",
  part: "ing",
  chunk: "!",
  sym: "😄",
};

/**
 * One dialogue block.
 * - Prefer `text` with optional `<b>...</b>` and optional `|||` (segment pause). Parsed via `toDialogueTypingParts`.
 * - Or set `parts` manually to skip parsing.
 */
export type DialogueLine = {
  kind: DialogueKind;
  key: string;
  text?: string;
  parts?: DialogueTypingPart[];
};

/** Last beat index per stage (0-based). Continue on that beat advances to the next stage (no filler nav lines). */
const STAGE_LAST_BEAT: Record<number, number> = {
  1: 2,
  2: 6,
  3: 3,
  4: 2,
  5: 3,
  6: 1,
  7: 8,
  8: 0,
};

export type Step4RobotPanelProps = {
  stage: number;
  tokens: Step4Token[];
  topJobOneClue: JobId;
  cityHighlight: DistrictId;
  qWelcome: string | null;
  setQWelcome: (id: string) => void;
  qTokWhy: string | null;
  setQTokWhy: (id: string) => void;
  qPattern: string | null;
  setQPattern: (id: string) => void;
  qOne: string | null;
  setQOne: (id: string) => void;
  qCity2: string | null;
  setQCity2: (id: string) => void;
  stage2TokenId: string;
  setStage2TokenId: (id: string) => void;
  stage2Engaged: boolean;
  setStage2Engaged: (v: boolean) => void;
  selectedStage2Token: Step4Token | undefined;
  goNextStage: () => void;
  goPrevStage: () => void;
  onContinueToChapter5: () => void;
  deltaPct: Record<JobId, number>;
  fusedPct: Record<JobId, number>;
  oneCluePct: Record<JobId, number>;
  predictionPct: Record<JobId, number>;
  patternBridgePct: Record<JobId, number>;
  patternLeanTop: JobId;
  toggleToken: (id: string) => void;
  activeIds: Set<string>;
  onHoverToken: (id: string | null) => void;
  /** Centered intro / ending invitation layout. */
  welcomeLayout?: boolean;
  /** Notifies parent when the dialogue beat index changes (for demo binding). */
  onBeatChange?: (beat: number) => void;
  /** Step 1 given name (first word) — prefixed in the stage 8 invitation line. */
  learnerFirstName?: string;
};

/** Stable shell: same bubble chrome; `text` is parsed (`<b>`, `|||`) into typing parts unless `parts` is set. */
function Step4DialogueBeat({
  dialogue,
  lineKey,
  onBubbleContinue,
  onBubbleBack,
  continueDisabled,
  backDisabled,
  bubbleTextClassName,
  children,
}: {
  dialogue: DialogueLine;
  lineKey: string;
  onBubbleContinue: () => void;
  onBubbleBack: () => void;
  continueDisabled?: boolean;
  backDisabled?: boolean;
  bubbleTextClassName?: string;
  children: (revealed: boolean) => ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [lineKey]);

  const resolvedParts = useMemo(() => {
    if (dialogue.parts?.length) return dialogue.parts;
    if (typeof dialogue.text === "string" && dialogue.text.length > 0) {
      return toDialogueTypingParts(dialogue.text);
    }
    return undefined;
  }, [dialogue.parts, dialogue.text]);

  const hasBody = Boolean(resolvedParts?.length);
  const showBubbleContinue =
    dialogue.kind !== "question" && dialogue.kind !== "invitation" && hasBody;
  const showBubbleBack = revealed && hasBody;

  return (
    <>
      <Step4RobotBubbleReveal
        text=""
        parts={resolvedParts}
        lineKey={lineKey}
        textClassName={bubbleTextClassName}
        onRevealComplete={() => setRevealed(true)}
        showContinue={showBubbleContinue && revealed}
        onContinue={onBubbleContinue}
        continueDisabled={continueDisabled}
        showBack={showBubbleBack && revealed}
        onBack={onBubbleBack}
        backDisabled={backDisabled}
      />
      {children(revealed)}
    </>
  );
}

export function Step4RobotPanel({
  stage,
  tokens,
  topJobOneClue,
  cityHighlight,
  qWelcome,
  setQWelcome,
  qTokWhy,
  setQTokWhy,
  qPattern,
  setQPattern,
  qOne,
  setQOne,
  qCity2,
  setQCity2,
  stage2TokenId,
  setStage2TokenId,
  stage2Engaged,
  setStage2Engaged,
  selectedStage2Token,
  goNextStage,
  goPrevStage,
  onContinueToChapter5,
  deltaPct,
  fusedPct,
  oneCluePct,
  predictionPct,
  patternBridgePct,
  patternLeanTop,
  toggleToken,
  activeIds,
  onHoverToken,
  welcomeLayout = false,
  onBeatChange,
  learnerFirstName = "",
}: Step4RobotPanelProps) {
  const [beat, setBeat] = useState(0);
  const backFromBubbleRef = useRef(false);
  const [tokQuizPick, setTokQuizPick] = useState<Record<string, boolean>>({});
  const [tokQuizHint, setTokQuizHint] = useState(false);

  useLayoutEffect(() => {
    if (backFromBubbleRef.current) {
      backFromBubbleRef.current = false;
      setBeat(STAGE_LAST_BEAT[stage] ?? 0);
      return;
    }
    setBeat(0);
  }, [stage]);

  useEffect(() => {
    if (stage === 2 && beat === 2) {
      setTokQuizPick({});
      setTokQuizHint(false);
    }
  }, [stage, beat]);

  useEffect(() => {
    if (stage !== 2 || beat !== 2) return;
    const allOn = TOK_QUIZ_IDS.every((id) => tokQuizPick[id]);
    if (allOn) setBeat(3);
  }, [stage, beat, tokQuizPick]);

  useEffect(() => {
    onBeatChange?.(beat);
  }, [beat, onBeatChange]);

  const dialogue: DialogueLine = useMemo(() => {
    /* ========== 1 WELCOME ========== */
    if (stage === 1) {
      if (beat === 0)
        return {
          kind: "narration" as const,
          key: "1-0",
          text: "Welcome to the <b>AI Career System</b> — the machine Zoo City uses to suggest jobs.",
        };
      if (beat === 1)
        return {
          text:
            "I know it might seem mysterious from the outside…🤔 |||But how do you think this system decides each animal's job?",
          kind: "question" as const,
          key: "1-1",
        };
      if (beat === 2)
        return {
          text: welcomeFeedbackText(qWelcome),
          kind: "concept" as const,
          key: `1-2-${qWelcome ?? "x"}`,
        };
      return { text: "", kind: "narration" as const, key: "1-fallback" };
    }

    /* ========== 2 TOKENS ========== */
    if (stage === 2) {
      if (beat === 0)
        return {
          text:
            "Do you remember the sentence you wrote when you first entered Zoo City? That is the text the machine uses to learn about you! 📖",
          kind: "narration" as const,
          key: "2-0",
        };
      if (beat === 1)
        return {
          kind: "narration" as const,
          key: "2-1",
          text:
            "But the system does not hold your whole sentence all at once. Instead, it breaks your words into smaller pieces called <b>tokens</b>, such as a whole word, part of a word, or another small chunk of text.",
        };
      if (beat === 2)
        return {
          text: "Quick test 👀||| Which of these could be tokens?",
          kind: "question" as const,
          key: "2-2",
        };
      if (beat === 3)
        return {
          kind: "narration" as const,
          key: "2-3",
          text:
            "Haha yes!😝 All of these could be tokens. Different systems break text in different ways because they are <b>designed to</b> work with different kinds of pieces.",
        };
      if (beat === 4)
        return {
          text: "In our AI Career System, we keep it simple: each whole word is one.",
          kind: "narration" as const,
          key: "2-4",
        };
      if (beat === 5)
        return {
          text: "But... why do you think the system breaks a sentence into smaller pieces? 🤔",
          kind: "question" as const,
          key: "2-5",
        };
      if (beat === 6)
        return {
          text: tokWhyFeedback(qTokWhy),
          kind: "concept" as const,
          key: `2-6-${qTokWhy ?? "x"}`,
        };
      return { text: "", kind: "narration" as const, key: "2-fallback" };
    }

    /* ========== 3 PIECES → PATTERNS ========== */
    if (stage === 3) {
      if (beat === 0)
        return {
          kind: "narration" as const,
          key: "3-0",
          text:
            "Your sentence has been split into tokens.|||One token alone does not mean much. What matters is <b>the pattern</b> the system remembers from older examples.",
        };
      if (beat === 1)
        return {
          text:
            "If one token often appeared with one kind of role <b>before</b>, the system may start to lean that way again.",
          kind: "narration" as const,
          key: "3-1",
        };
      if (beat === 2)
        return {
          text:
            "So when the AI “decided” your job at the beginning, did that mean it really understood who you are?",
          kind: "question" as const,
          key: "3-2",
        };
      if (beat === 3)
        return {
          kind: "narration" as const,
          key: "3-3",
          text: "It is following the <b>old patterns</b>, not knowing your whole story.",
        };
      return { text: "", kind: "narration" as const, key: "3-fallback" };
    }

    /* ========== 4 ONE TOKEN AT A TIME ========== */
    if (stage === 4) {
      if (beat === 0)
        return {
          kind: "narration" as const,
          key: "4-0",
          text:
            "Let's test one token at a time now!|||Different tokens can make different roles seem more likely.",
        };
      if (beat === 1)
        return {
          text: "Watch the left: when you choose a token, which role starts to look more likely?",
          kind: "interaction" as const,
          key: "4-1",
        };
      if (beat === 2)
        return {
          text: oneClueFeedback(qOne),
          kind: "concept" as const,
          key: `4-2-${qOne ?? "x"}`,
        };
      return { text: "", kind: "narration" as const, key: "4-fallback" };
    }

    /* ========== 5 COMBINE ========== */
    if (stage === 5) {
      if (beat === 0)
        return {
          text: "So what happens when the system looks at more than one token? 🤔",
          kind: "narration" as const,
          key: "5-0",
        };
      if (beat === 1)
        return {
          kind: "narration" as const,
          key: "5-1",
          text:
            "Now it weighs the tokens together. Each token can tug the result a little, and some tugs matter more than others.",
        };
      if (beat === 2)
        return {
          text:
            "Go ahead! Try different token combinations.|||Turn tokens on and off and watch what changes.",
          kind: "narration" as const,
          key: "5-2",
        };
      if (beat === 3)
        return {
          text: "Do you see it? When the clues change, the pull changes too.",
          kind: "narration" as const,
          key: "5-3",
        };
      return { text: "", kind: "narration" as const, key: "5-fallback" };
    }

    /* ========== 6 PREDICTION ========== */
    if (stage === 6) {
      if (beat === 0)
        return {
          text: "The system turns those tokens and old patterns into a prediction.",
          kind: "narration" as const,
          key: "6-0",
        };
      if (beat === 1)
        return {
          text:
            "But wait… that is not a <b>confirmation</b>. It is just a <b>guess</b> about what seems more likely right now.",
          kind: "narration" as const,
          key: "6-1",
        };
      return { text: "", kind: "narration" as const, key: "6-fallback" };
    }

    /* ========== 7 BACK TO CITY ========== */
    if (stage === 7) {
      if (beat === 0)
        return {
          text: "Now let's zoom back out to the city.",
          kind: "narration" as const,
          key: "7-0",
        };
      if (beat === 1)
        return {
          text:
            "Watch the flow on the left. Animals line up, move through the sorting system, and get routed toward districts.",
          kind: "narration" as const,
          key: "7-1",
        };
      if (beat === 2)
        return {
          text:
            "When similar <b>tokens</b> keep getting sorted the same way again and again, parts of the city can start to look the same, even though <b>everyone is different</b>.",
          kind: "narration" as const,
          key: "7-2",
        };
      if (beat === 3)
        return {
          text:
            "Hmm… that doesn't feel quite right, does it? 🤔",
          kind: "narration" as const,
          key: "7-3",
        };
      if (beat === 4)
        return {
          text:
            "One prediction may seem small, but when the same kind of prediction <b>repeats</b>, it can shape the whole city.",
          kind: "narration" as const,
          key: "7-4",
        };
      if (beat === 5)
        return {
          text: "And that is exactly why <b>people</b> still need to stay in the loop.",
          kind: "narration" as const,
          key: "7-5",
        };
      if (beat === 6)
        return {
          text:
            "If a system keeps repeating patterns that do not feel right or fair, what should humans do?",
          kind: "question" as const,
          key: "7-6",
        };
      if (beat === 7)
        return {
          text:
            qCity2 === "intervene"
              ? "Yes! We can pause, look at the pattern, and ask, <b>“Does this really make sense?”</b>"
              : "We don't have to follow every guess. We can <b>question it</b> and help improve the system.",
          kind: "concept" as const,
          key: `7-7-${qCity2 ?? "x"}`,
        };
      if (beat === 8)
        return {
          text: "That part still belongs to us. 💛",
          kind: "narration" as const,
          key: "7-8",
        };
      return { text: "", kind: "narration" as const, key: "7-fallback" };
    }

    /* ========== 8 INVITATION → CHAPTER 5 ========== */
    if (stage === 8) {
      const lead =
        learnerFirstName.trim().length > 0
          ? `${learnerFirstName.trim()}, I see your potential.`
          : "I see your potential.";
      return {
        kind: "invitation" as const,
        key: `8-0-${learnerFirstName.trim() || "x"}`,
        text: `${lead}|||Will you help redesign Zoo City so the AI can make fairer choices?`,
      };
    }

    return { text: "", kind: "narration" as const, key: "fallback" };
  }, [stage, beat, tokens, qWelcome, qTokWhy, qOne, qCity2, learnerFirstName]);

  const dialogueLineKey = useMemo(
    () => [stage, beat, dialogue.key].join("|"),
    [stage, beat, dialogue.key],
  );

  const handleBubbleContinue = useCallback(() => {
    if (dialogue.kind === "nav") {
      goNextStage();
      return;
    }
    if (dialogue.kind === "question") {
      return;
    }
    const last = STAGE_LAST_BEAT[stage] ?? 0;
    if (beat >= last) {
      goNextStage();
      return;
    }
    setBeat((b) => b + 1);
  }, [dialogue.kind, stage, beat, goNextStage]);

  const handleBubbleBack = useCallback(() => {
    if (beat > 0) {
      if (stage === 4 && beat === 2) {
        setStage2Engaged(false);
      }
      setBeat((b) => b - 1);
      return;
    }
    if (stage > 1) {
      backFromBubbleRef.current = true;
      goPrevStage();
    }
  }, [beat, stage, goPrevStage, setStage2Engaged]);

  const bubbleContinueDisabled =
    stage === 4 && beat === 1 && !stage2Engaged && dialogue.kind === "interaction";

  const handlePickToken = useCallback(
    (id: string) => {
      setStage2TokenId(id);
      setStage2Engaged(true);
    },
    [setStage2TokenId, setStage2Engaged],
  );

  const mcBlock = (
    revealed: boolean,
    opts: McOpt[],
    value: string | null,
    setVal: (id: string) => void,
    afterPick: () => void,
  ) => (
    <div className="flex flex-col gap-2">
      {opts.map((o, i) => {
        const picked = value === o.id;
        const letter = String.fromCharCode(65 + Math.min(i, 25));
        return (
          <button
            key={o.id}
            type="button"
            disabled={!revealed}
            onClick={() => {
              setVal(o.id);
              afterPick();
            }}
            className={[
              "w-full rounded-xl border-2 px-4 py-3 text-left font-serif text-sm transition sm:text-base",
              !revealed && "opacity-50",
              picked
                ? o.correct
                  ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                  : "border-rose-400 bg-rose-50 text-rose-950"
                : "border-violet-200 bg-white hover:border-violet-400",
            ].join(" ")}
          >
            <span className="font-semibold text-violet-700">{letter}. </span>
            {o.label}
          </button>
        );
      })}
    </div>
  );

  const stagePips = (
    <div className="flex flex-wrap justify-center gap-1 border-t border-violet-200/50 pt-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
        <span
          key={n}
          className={[
            "h-2 w-6 rounded-full transition-colors sm:w-7",
            stage === n ? "bg-violet-600" : stage > n ? "bg-violet-300" : "bg-stone-200",
          ].join(" ")}
          title={`Phase ${n}`}
        />
      ))}
    </div>
  );

  function renderAfterBubble(revealed: boolean): ReactNode {
    /* 1 WELCOME */
    if (stage === 1) {
      if (beat === 1 && revealed)
        return mcBlock(
          revealed,
          [
            { id: "brain", label: "It has a human brain", correct: false },
            { id: "magic", label: "It uses magic", correct: false },
            { id: "patterns", label: "It looks for patterns in data", correct: true },
            { id: "secret", label: "Someone secretly controls every choice", correct: false },
          ],
          qWelcome,
          setQWelcome,
          () => setBeat(2),
        );
      return null;
    }

    /* 2 TOKENS — multi-select “all could be tokens” + tokWhy */
    if (stage === 2) {
      if (beat === 2 && revealed) {
        const nPicked = TOK_QUIZ_IDS.filter((id) => tokQuizPick[id]).length;
        const allOn = nPicked === TOK_QUIZ_IDS.length;
        const someOn = nPicked > 0;
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {TOK_QUIZ_IDS.map((id) => {
                const on = Boolean(tokQuizPick[id]);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={!revealed || allOn}
                    onClick={() => {
                      setTokQuizPick((p) => ({ ...p, [id]: !p[id] }));
                      setTokQuizHint(false);
                    }}
                    className={[
                      "w-full rounded-xl border-2 px-4 py-3 text-left font-serif text-sm transition sm:text-base",
                      !revealed && "opacity-50",
                      on
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                        : "border-violet-200 bg-white hover:border-violet-400",
                    ].join(" ")}
                  >
                    <span className="font-semibold text-violet-700">{on ? "✓ " : ""}</span>
                    {TOK_QUIZ_LABELS[id]}
                  </button>
                );
              })}
            </div>
            {tokQuizHint && !allOn ? (
              <p className="text-center font-serif text-sm leading-relaxed text-violet-800">
                Take another look 👀 There are more.
              </p>
            ) : null}
            <button
              type="button"
              disabled={!revealed || allOn || !someOn}
              onClick={() => {
                if (allOn || !someOn) return;
                setTokQuizHint(true);
              }}
              className="mx-auto rounded-xl border-2 border-violet-300 bg-violet-100/80 px-4 py-2 font-serif text-sm font-semibold text-violet-900 transition hover:bg-violet-200/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Check my choices
            </button>
          </div>
        );
      }
      if (beat === 5 && revealed)
        return mcBlock(
          revealed,
          [
            {
              id: "pieces",
              label: "Because small pieces are easier for the system to work with",
              correct: true,
            },
            {
              id: "pretty",
              label: "Because it wants to make the sentence prettier",
              correct: false,
            },
            {
              id: "long",
              label: "Because long sentences are not allowed",
              correct: false,
            },
          ],
          qTokWhy,
          setQTokWhy,
          () => setBeat(6),
        );
      return null;
    }

    /* 3 PATTERNS */
    if (stage === 3) {
      if (beat === 2 && revealed)
        return mcBlock(
          revealed,
          [
            {
              id: "understood",
              label: "Yes — it really understood me as a full person",
              correct: false,
            },
            {
              id: "pattern",
              label: "Mostly no — it was matching patterns from examples",
              correct: true,
            },
            {
              id: "mixed",
              label: "A little of both",
              correct: false,
            },
          ],
          qPattern,
          setQPattern,
          () => setBeat(3),
        );
      return null;
    }

    /* 4 ONE TOKEN */
    if (stage === 4) {
      if (beat === 1 && revealed)
        return (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              {tokens.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handlePickToken(t.id)}
                  className={[
                    "rounded-full border-2 px-4 py-2 font-serif text-sm font-semibold transition",
                    stage2TokenId === t.id
                      ? "border-amber-600 bg-amber-200 text-amber-950 ring-2 ring-amber-400/60"
                      : "border-violet-300 bg-white text-violet-900 hover:border-violet-500",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="text-center font-serif text-xs text-violet-600">
              Use <span className="font-semibold">Back</span> or{" "}
              <span className="font-semibold">Continue</span> in the bubble when you are ready.
            </p>
          </div>
        );
      return null;
    }

    /* 5 COMBINE — multi-select key tokens under the bubble */
    if (stage === 5) {
      if (beat === 2 && revealed) {
        return (
          <div className="flex flex-col gap-2">
            <p className="text-center font-serif text-xs text-violet-600">
              Tap to turn clues on or off — combine them and watch the pull change.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {tokens.map((t) => {
                const on = activeIds.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleToken(t.id)}
                    className={[
                      "rounded-full border-2 px-3 py-1.5 font-serif text-sm font-semibold transition",
                      on
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm ring-1 ring-emerald-400/50"
                        : "border-violet-300/80 bg-white/90 text-violet-700 hover:border-violet-500",
                    ].join(" ")}
                  >
                    {on ? "✓ " : ""}
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
      return null;
    }

    /* 7 CITY */
    if (stage === 7) {
      if (beat === 6 && revealed)
        return mcBlock(
          revealed,
          [
            { id: "follow", label: "Follow the system every time", correct: false },
            { id: "tech", label: "Throw away all technology forever", correct: false },
            {
              id: "intervene",
              label: "Step in, question the guess, and improve the system",
              correct: true,
            },
          ],
          qCity2,
          setQCity2,
          () => setBeat(7),
        );
      return null;
    }

    /* 8 INVITATION */
    if (stage === 8 && revealed) {
      return (
        <div className="mx-auto flex w-full max-w-xl flex-row flex-wrap items-stretch justify-center gap-4 pt-1">
          <button
            type="button"
            onClick={onContinueToChapter5}
            className="min-w-[10.5rem] max-w-[14rem] flex-1 rounded-2xl border-2 border-violet-500 bg-violet-600 py-3.5 font-serif text-base font-semibold text-white shadow-md transition hover:bg-violet-700"
          >
            Yes, let me try!
          </button>
          <button
            type="button"
            onClick={onContinueToChapter5}
            className="min-w-[10.5rem] max-w-[14rem] flex-1 rounded-2xl border-2 border-violet-400 bg-white py-3.5 font-serif text-base font-semibold text-violet-950 transition hover:bg-violet-50"
          >
            Yes, I’m ready!
          </button>
        </div>
      );
    }

    return null;
  }

  const afterEl = (revealed: boolean) => {
    const node = renderAfterBubble(revealed);
    return node != null ? <div className="flex flex-col gap-2 pt-1">{node}</div> : null;
  };

  return (
    <div
      className={[
        "flex min-h-0 w-full flex-col gap-4",
        welcomeLayout || stage === 8 ? "items-center text-center" : "",
      ].join(" ")}
    >
      <div
        className={[
          "flex w-full shrink-0 flex-col gap-3",
          welcomeLayout || stage === 8 ? "items-center" : "",
        ].join(" ")}
      >
        <div
          className={[
            "flex shrink-0",
            welcomeLayout || stage === 8 ? "justify-center" : "justify-center sm:justify-start",
          ].join(" ")}
        >
          <Image
            src="/robot.png"
            alt=""
            width={welcomeLayout || stage === 8 ? 120 : 96}
            height={welcomeLayout || stage === 8 ? 120 : 96}
            className={[
              "w-auto object-contain drop-shadow-md motion-reduce:animate-none",
              welcomeLayout || stage === 8
                ? "h-[7rem] sm:h-[7.75rem]"
                : "h-[5.25rem] sm:h-[6rem]",
            ].join(" ")}
            priority={welcomeLayout || stage === 8}
          />
        </div>

        <div
          className={[
            "flex min-h-0 min-w-0 w-full flex-1 flex-col gap-3",
            welcomeLayout || stage === 8 ? "items-center" : "",
          ].join(" ")}
        >
          <div className={welcomeLayout || stage === 8 ? "w-full max-w-xl" : "w-full"}>
          <Step4DialogueBeat
            dialogue={dialogue}
            lineKey={dialogueLineKey}
            onBubbleContinue={handleBubbleContinue}
            onBubbleBack={handleBubbleBack}
            continueDisabled={bubbleContinueDisabled}
            backDisabled={stage === 1 && beat === 0}
            bubbleTextClassName={welcomeLayout || stage === 8 ? "text-center" : undefined}
          >
            {(revealed) => (
              <>
                <div
                  className={[
                    "mt-1 flex flex-col gap-2",
                    welcomeLayout || stage === 8
                      ? "w-full max-w-lg items-center"
                      : "min-h-[9.5rem] sm:min-h-[10rem]",
                  ].join(" ")}
                >
                  {afterEl(revealed)}
                </div>
              </>
            )}
          </Step4DialogueBeat>
          </div>

        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 border-t border-violet-200/60 pt-3">
        {stagePips}
        <p className="text-center font-serif text-[0.65rem] text-violet-700/80">
          This is a simplified educational demo—not a literal map of every AI system.
        </p>
      </div>
    </div>
  );
}
