"use client";

import Image from "next/image";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Step4RobotBubbleReveal } from "@/components/steps/step4/Step4RobotBubbleReveal";
import {
  DREAM_DISTRICT_LABELS,
  getDreamDisplayLabel,
  getResolvedAnimalKey,
} from "@/lib/learnerUtils";
import { useGameState } from "@/lib/gameState";
import {
  buildLearnerProfileCardData,
} from "@/lib/profileFeatures";
import { JOB_IDS } from "@/lib/step4Model";
import type { AnimalDiet, AnimalSize, JobId, LearnerProfile } from "@/types/game";

type SceneId = 0 | 1 | 2 | 3 | 4;

type HistoryCard = {
  id: string;
  name: string;
  animalKey: string;
  animal: string;
  emoji: string;
  diet: AnimalDiet;
  size: AnimalSize;
  label: JobId;
  voice?: string;
};

type RouteVars = CSSProperties & {
  "--route-y"?: string;
  "--input-y"?: string;
  "--district-x"?: string;
  "--district-y"?: string;
  "--bin-y"?: string;
  "--settle-x"?: string;
  "--settle-y"?: string;
  "--delay"?: string;
  "--packet-delay"?: string;
  "--route-color"?: string;
};

const SCENE_LINES: Record<SceneId, string[]> = {
  0: [
    "Remember the old pattern you found in Zoo City?",
    "The classifier learned from old animal cards like those.",
    "This is an animal profile card.",
    "A feature is one piece of information the machine can use.",
    "In Zoo City, this classifier only sees two features: size and diet.",
  ],
  1: [
    "This is one old Zoo City record.",
    "It shows two features: size and diet.",
    "The old city result was stamped as the training label.",
    "The label is not part of the animal. It is the old city's saved result.",
    "What is a label here?",
    "Yes. In Zoo City, the label comes from an old sorting result.",
  ],
  2: [
    "Now many old records enter the learning machine.",
    "The machine reads size, diet, and the saved label.",
    "When the same feature pair was sorted the same way again and again, the pattern became stronger.",
  ],
  3: [
    "Now your profile enters the system.",
    "The classifier compares your size and diet with old labeled patterns.",
    "Then it sorts your profile into a district.",
  ],
  4: [
    "One classification may seem small.",
    "But repeated classifications can shape the whole city.",
    "That is why people still need to stay in the loop.",
    "Will you help redesign Zoo City?",
  ],
};

const DISTRICT_POS: Record<JobId, { x: number; y: number; color: string }> = {
  artist: { x: 20, y: 24, color: "rgb(244 114 182)" },
  engineer: { x: 79, y: 24, color: "rgb(56 189 248)" },
  manager: { x: 78, y: 72, color: "rgb(251 191 36)" },
  community: { x: 22, y: 69, color: "rgb(52 211 153)" },
};

const FALLBACK_HISTORY: HistoryCard[] = [
  {
    id: "rabbit-history",
    name: "Rumi the Rabbit",
    animalKey: "rabbit",
    animal: "Rabbit",
    emoji: "🐰",
    diet: "Herbivore",
    size: "Small",
    label: "artist",
  },
  {
    id: "fox-history",
    name: "Rex the Fox",
    animalKey: "fox",
    animal: "Fox",
    emoji: "🦊",
    diet: "Carnivore",
    size: "Small",
    label: "engineer",
  },
  {
    id: "elephant-history",
    name: "Ella the Elephant",
    animalKey: "elephant",
    animal: "Elephant",
    emoji: "🐘",
    diet: "Herbivore",
    size: "Large",
    label: "community",
  },
  {
    id: "bear-history",
    name: "Bram the Bear",
    animalKey: "bear",
    animal: "Bear",
    emoji: "🐻",
    diet: "Omnivore",
    size: "Large",
    label: "manager",
  },
];

type FeaturePairGroup = {
  id: string;
  featureLabel: string;
  label: JobId;
  animals: HistoryCard[];
};

const FEATURE_PAIR_GROUPS: FeaturePairGroup[] = [
  {
    id: "small-herbivore",
    featureLabel: "Small + Herbivore",
    label: "artist",
    animals: [
      makeHistoryAnimal("rabbit", "Rumi the Rabbit", "🐰", "Rabbit", "Small", "Herbivore", "artist"),
      makeHistoryAnimal("squirrel", "Sage the Squirrel", "🐿️", "Squirrel", "Small", "Herbivore", "artist"),
      makeHistoryAnimal("mouse", "Mina the Mouse", "🐭", "Mouse", "Small", "Herbivore", "artist"),
    ],
  },
  {
    id: "small-carnivore",
    featureLabel: "Small + Carnivore",
    label: "manager",
    animals: [
      makeHistoryAnimal("fox", "Rex the Fox", "🦊", "Fox", "Small", "Carnivore", "manager"),
      makeHistoryAnimal("cat", "Cleo the Cat", "🐱", "Cat", "Small", "Carnivore", "manager"),
      makeHistoryAnimal("wolf", "Willa the Wolf", "🐺", "Wolf", "Small", "Carnivore", "manager"),
    ],
  },
  {
    id: "large-herbivore",
    featureLabel: "Large + Herbivore",
    label: "community",
    animals: [
      makeHistoryAnimal("elephant", "Ella the Elephant", "🐘", "Elephant", "Large", "Herbivore", "community"),
      makeHistoryAnimal("cow", "Cora the Cow", "🐄", "Cow", "Large", "Herbivore", "community"),
      makeHistoryAnimal("giraffe", "Gia the Giraffe", "🦒", "Giraffe", "Large", "Herbivore", "community"),
    ],
  },
  {
    id: "large-carnivore",
    featureLabel: "Large + Carnivore",
    label: "engineer",
    animals: [
      makeHistoryAnimal("lion", "Lio the Lion", "🦁", "Lion", "Large", "Carnivore", "engineer"),
      makeHistoryAnimal("tiger", "Tara the Tiger", "🐯", "Tiger", "Large", "Carnivore", "engineer"),
      makeHistoryAnimal("bear", "Bram the Bear", "🐻", "Bear", "Large", "Carnivore", "engineer"),
    ],
  },
];

function makeHistoryAnimal(
  animalKey: string,
  name: string,
  emoji: string,
  animal: string,
  size: AnimalSize,
  diet: AnimalDiet,
  label: JobId,
): HistoryCard {
  return {
    id: `${animalKey}-${size.toLowerCase()}-${diet.toLowerCase()}-${label}`,
    animalKey,
    name,
    animal,
    emoji,
    size,
    diet,
    label,
  };
}

export function Step4AISystem() {
  const { state, dispatch } = useGameState();
  const learner = state.learner;
  const [scene, setScene] = useState<SceneId>(0);
  const [beat, setBeat] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [labelAnswer, setLabelAnswer] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<HistoryCard | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const learnerCard = useMemo(() => buildLearnerProfileCardData(learner), [learner]);
  const firstCard = useMemo(() => storyOldRecordForLearner(learner), [learner]);
  const matchedGroup = featureGroupForProfile(learnerCard.size, learnerCard.diet);
  const groupedHistoryCards = useMemo(
    () => FEATURE_PAIR_GROUPS.flatMap((group) => group.animals),
    [],
  );

  const lines = SCENE_LINES[scene];
  const line = captionLine(scene, beat, lines[beat] ?? lines[0], labelAnswer);
  const isQuestion = scene === 1 && beat === 4;
  const isInvitation = scene === 4 && beat === 3;

  function goNext() {
    if (isQuestion) return;
    setSelectedCard(null);
    setSelectedFeatureId(null);
    setRevealed(false);
    if (beat < lines.length - 1) {
      setBeat((b) => b + 1);
      return;
    }
    if (scene < 4) {
      setScene((s) => (s + 1) as SceneId);
      setBeat(0);
    }
  }

  function goBack() {
    setSelectedCard(null);
    setSelectedFeatureId(null);
    setRevealed(false);
    if (beat > 0) {
      setBeat((b) => b - 1);
      return;
    }
    if (scene > 0) {
      const prev = (scene - 1) as SceneId;
      setScene(prev);
      setBeat(SCENE_LINES[prev].length - 1);
    }
  }

  function answerLabelQuestion(answer: string) {
    setLabelAnswer(answer);
    setRevealed(false);
    setBeat(5);
  }

  return (
    <section
      className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden px-3 pb-4 sm:px-6 lg:px-8"
      aria-labelledby="step4-title"
    >
      <div className="sr-only">
        <h2 id="step4-title">AI Career Classifier</h2>
      </div>

      <div className="relative min-h-[560px] flex-1 overflow-hidden rounded-[2rem] border-2 border-violet-300/70 bg-gradient-to-br from-indigo-950 via-violet-950 to-stone-950 shadow-[0_24px_60px_rgba(49,46,129,0.35)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(250,204,21,0.16),transparent_30%),radial-gradient(circle_at_78%_70%,rgba(34,211,238,0.16),transparent_32%),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:auto,auto,56px_56px,56px_56px]" />
        <div className="pointer-events-none absolute left-5 top-5 z-40 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-serif text-xs font-bold uppercase tracking-[0.2em] text-violet-100 backdrop-blur-md">
          Chapter 4 · AI Career Classifier
        </div>
        <SceneProgress scene={scene} />

        <div className="absolute inset-0 transition-opacity duration-500" key={scene}>
          {scene === 0 ? (
            <FeatureIntroScene card={firstCard} onInspect={setSelectedCard} />
          ) : null}
          {scene === 1 ? (
            <OneAnimalScene card={firstCard} onInspect={setSelectedCard} />
          ) : null}
          {scene === 2 ? (
            <ManyAnimalsScene onInspect={setSelectedCard} />
          ) : null}
          {scene === 3 ? (
            <YourProfileScene
              learnerCard={learnerCard}
              selectedFeatureId={selectedFeatureId}
              matchedGroup={matchedGroup}
              onSelectFeature={(id) => setSelectedFeatureId((prev) => (prev === id ? null : id))}
              dream={getDreamDisplayLabel(learner)}
            />
          ) : null}
          {scene === 4 ? (
            <CityConsequenceScene cards={groupedHistoryCards} topJob={matchedGroup.label} />
          ) : null}
        </div>

        {selectedCard ? (
          <CardInspector card={selectedCard} onClose={() => setSelectedCard(null)} />
        ) : null}

      </div>
      <RobotCaption
        line={line}
        lineKey={`${scene}-${beat}-${labelAnswer ?? "none"}`}
        revealed={revealed}
        setRevealed={setRevealed}
        showBack={scene > 0 || beat > 0}
        onBack={goBack}
        showContinue={!isQuestion && !isInvitation}
        onContinue={goNext}
      >
        {isQuestion && revealed ? (
          <LabelQuestion answer={labelAnswer} onAnswer={answerLabelQuestion} />
        ) : null}
        {isInvitation && revealed ? (
          <div className="mt-3 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_STEP", step: 5 })}
              className="rounded-2xl border-2 border-violet-300 bg-violet-600 px-5 py-3 font-serif text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Yes, let me try!
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_STEP", step: 5 })}
              className="rounded-2xl border-2 border-amber-300 bg-amber-100 px-5 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Yes, I&apos;m ready!
            </button>
          </div>
        ) : null}
      </RobotCaption>
    </section>
  );
}

function OneAnimalScene({
  card,
  onInspect,
}: {
  card: HistoryCard;
  onInspect: (card: HistoryCard) => void;
}) {
  const labeledCard = card;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <DistrictConstellation highlight={labeledCard.label} muted />
      <div className="absolute left-1/2 top-[46%] z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/20 bg-amber-200/10 blur-sm" />
      <button
        type="button"
        onClick={() => onInspect(labeledCard)}
        aria-label={`Inspect ${card.animal} profile`}
        className="step4-one-record-card absolute left-1/2 top-[43%] z-30 w-[min(92%,30rem)] rounded-[2.25rem] border-4 border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-6 text-left font-serif text-violet-950 shadow-[0_22px_58px_rgba(0,0,0,0.34)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
      >
        <div className="flex items-center gap-5">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border-4 border-amber-200 bg-white text-7xl shadow-inner" aria-hidden>
            {labeledCard.emoji}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Old Zoo City Record</p>
            <p className="mt-2 text-3xl font-black">{labeledCard.animal}</p>
            <p className="mt-1 text-sm font-semibold text-violet-700">{labeledCard.name}</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="step4-one-feature rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
            <p className="text-[0.62rem] font-black uppercase tracking-wide text-cyan-700">Feature</p>
            <p className="text-lg font-black text-cyan-950">Size: {labeledCard.size}</p>
          </div>
          <div className="step4-one-feature rounded-2xl border-2 border-cyan-300 bg-cyan-50 px-4 py-3">
            <p className="text-[0.62rem] font-black uppercase tracking-wide text-cyan-700">Feature</p>
            <p className="text-lg font-black text-cyan-950">Diet: {labeledCard.diet}</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-violet-700">Click to inspect the old record</p>
        <TrainingLabelStamp label={labeledCard.label} />
      </button>
      <div className="step4-old-result-tag absolute left-[66%] top-[18%] z-30 rounded-2xl border-2 border-amber-300 bg-amber-50 px-5 py-3 text-center font-serif font-black text-amber-950 shadow-xl">
        <p className="text-[0.65rem] uppercase tracking-[0.18em] text-amber-700">Old city result</p>
        <p className="mt-1 text-lg">{DREAM_DISTRICT_LABELS[labeledCard.label]}</p>
      </div>
      <div className="step4-one-record-sheet absolute bottom-[16%] left-1/2 z-20 w-[min(88%,44rem)] -translate-x-1/2 rounded-[2rem] border-2 border-emerald-200/80 bg-emerald-50/95 px-5 py-4 text-center font-serif text-sm font-bold text-emerald-950 shadow-lg">
        The label is not part of the animal profile. It is the old city result saved onto the training record.
      </div>
    </div>
  );
}

function TrainingLabelStamp({ label }: { label: JobId }) {
  return (
    <div className="step4-training-label-stamp pointer-events-none absolute -right-5 bottom-7 z-40 rounded-[1.2rem] border-[0.45rem] border-emerald-500/80 bg-emerald-100/80 px-7 py-5 text-center font-serif font-black uppercase tracking-[0.16em] text-emerald-900 shadow-[0_18px_34px_rgba(6,78,59,0.28)]">
      <div className="pointer-events-none absolute inset-1 rounded-xl border-2 border-emerald-700/30" />
      <p className="text-[0.7rem]">Label Saved</p>
      <p className="mt-1 text-xl">{DREAM_DISTRICT_LABELS[label]}</p>
      <span className="step4-stamp-dust absolute -right-3 -top-3 h-3 w-3 rounded-full bg-amber-200/80" aria-hidden />
      <span className="step4-stamp-dust absolute -bottom-2 left-5 h-2 w-2 rounded-full bg-emerald-200/80" aria-hidden />
    </div>
  );
}

function FeatureIntroScene({
  card,
  onInspect,
}: {
  card: HistoryCard;
  onInspect: (card: HistoryCard) => void;
}) {
  const storyCard = card;
  return (
    <div className="absolute inset-0 overflow-hidden">
      <DistrictConstellation highlight={storyCard.label} muted />
      <button
        type="button"
        onClick={() => onInspect(storyCard)}
        className="absolute left-1/2 top-1/2 z-30 w-[min(90%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border-4 border-amber-300 bg-white/95 p-6 text-left font-serif text-violet-950 shadow-[0_20px_50px_rgba(0,0,0,0.32)] transition hover:-translate-y-[52%] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          Animal profile card
        </p>
        <p className="mt-3 text-3xl font-black">
          <span aria-hidden>{storyCard.emoji}</span> {storyCard.name}
        </p>
        <div className="mt-5 grid gap-3">
          <div className="rounded-2xl border-4 border-cyan-300 bg-cyan-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Feature</p>
            <p className="text-xl font-black text-cyan-950">Size: {storyCard.size}</p>
          </div>
          <div className="rounded-2xl border-4 border-cyan-300 bg-cyan-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-800">Feature</p>
            <p className="text-xl font-black text-cyan-950">Diet: {storyCard.diet}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-violet-700">
          The machine ignores the name. It only uses size and diet.
        </p>
      </button>
    </div>
  );
}

function ManyAnimalsScene({ onInspect }: { onInspect: (card: HistoryCard) => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-6 top-20 z-20 rounded-2xl border border-amber-200/70 bg-amber-50/95 px-4 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg">
        Old records enter from the left. Click a card to inspect it.
      </div>
      <LearningMachine />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {FEATURE_PAIR_GROUPS.map((group, groupIndex) => {
          const y = patternBinY(groupIndex);
          return (
            <path
              key={group.id}
              d={`M 48 50 C 57 50, 63 ${y}, 72 ${y}`}
              fill="none"
              stroke={DISTRICT_POS[group.label].color}
              strokeWidth="1.25"
              strokeLinecap="round"
              className="step4-learning-route"
              style={{ "--delay": `${groupIndex * 1.3}s` } as RouteVars}
            />
          );
        })}
      </svg>
      <div className="absolute right-[4%] top-[13%] z-30 grid w-[min(25rem,35vw)] gap-3">
        {FEATURE_PAIR_GROUPS.map((group, groupIndex) => (
          <PatternBin key={group.id} group={group} groupIndex={groupIndex} />
        ))}
      </div>
      {FEATURE_PAIR_GROUPS.flatMap((group, groupIndex) =>
        group.animals.map((card, animalIndex) => {
          const globalIndex = groupIndex * 3 + animalIndex;
          const color = DISTRICT_POS[group.label].color;
          const style: RouteVars = {
            "--input-y": `${24 + groupIndex * 15 + animalIndex * 2.2}%`,
            "--bin-y": `${patternBinY(groupIndex)}%`,
            "--route-color": color,
            "--delay": `${globalIndex * 0.78}s`,
            "--packet-delay": `${globalIndex * 0.78 + 4.6}s`,
          };
          return (
            <div key={card.id}>
              <button
                type="button"
                onClick={() => onInspect(card)}
                aria-label={`Inspect ${card.animal} old record`}
                className="step4-old-record-flow absolute z-30 w-44 rounded-2xl border-2 border-amber-200 bg-white/95 p-3 text-left font-serif text-violet-950 shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
                style={style}
              >
                <p className="text-[0.62rem] font-black uppercase tracking-wide text-amber-700">Old record</p>
                <p className="mt-1 text-base font-black">
                  <span aria-hidden>{card.emoji}</span> {card.animal}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1">
                  <span className="step4-card-feature rounded-lg bg-cyan-50 px-2 py-1 text-[0.68rem] font-black text-cyan-950">
                    Size: {card.size}
                  </span>
                  <span className="step4-card-feature rounded-lg bg-cyan-50 px-2 py-1 text-[0.68rem] font-black text-cyan-950">
                    Diet: {card.diet}
                  </span>
                </div>
                <span className="step4-card-saved-label absolute -bottom-3 right-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[0.58rem] font-black uppercase tracking-wide text-emerald-900">
                  Saved label read
                </span>
              </button>
              <span className="step4-data-packet absolute z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-white text-2xl shadow-lg" style={style} aria-hidden>
                {card.emoji}
              </span>
            </div>
          );
        })
      )}
      <div className="absolute bottom-8 left-1/2 z-20 w-[min(88%,42rem)] -translate-x-1/2 rounded-3xl border border-emerald-200/70 bg-emerald-50/95 px-5 py-3 text-center font-serif text-sm font-bold text-emerald-950 shadow-lg">
        Same feature pair + same saved label = a learned pattern bin.
      </div>
    </div>
  );
}

function LearningMachine() {
  return (
    <div className="absolute left-[45%] top-1/2 z-20 w-60 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border-4 border-cyan-300 bg-cyan-100 px-5 py-5 text-center font-serif text-cyan-950 shadow-[0_0_44px_rgba(34,211,238,0.42)]">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.2em]">Pattern Finder</p>
      <p className="mt-2 text-2xl font-black">Learning Machine</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-black">
        <span className="rounded-xl bg-white/80 px-3 py-2">Size</span>
        <span className="rounded-xl bg-white/80 px-3 py-2">Diet</span>
      </div>
      <div className="mt-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-950">
        Reads saved label
      </div>
      <div className="pointer-events-none absolute inset-x-5 top-4 h-1 rounded-full bg-white/85 shadow-[0_0_22px_rgba(255,255,255,0.85)] step4-scanner-light" />
      <div className="step4-machine-glow pointer-events-none absolute inset-0 rounded-[1.7rem] border border-white/60" />
    </div>
  );
}

function PatternBin({
  group,
  groupIndex,
}: {
  group: FeaturePairGroup;
  groupIndex: number;
}) {
  const color = DISTRICT_POS[group.label].color;
  return (
    <div
      className="step4-pattern-bin rounded-3xl border-2 bg-white/95 px-4 py-3 font-serif text-violet-950 shadow-xl"
      style={
        {
          borderColor: color,
          "--delay": `${groupIndex * 1.3 + 4.8}s`,
          "--route-color": color,
        } as RouteVars
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-violet-700">
            {group.featureLabel}
          </p>
          <p className="mt-1 text-sm font-black">
            Saved Label: {DREAM_DISTRICT_LABELS[group.label]}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-[0.6rem] font-black uppercase tracking-wide text-amber-950">
          pattern bin
        </span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1.5">
        {group.animals.map((animal, i) => (
          <span
            key={`${group.id}-bin-${animal.id}`}
            className="step4-bin-emoji inline-flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white text-xl shadow-sm"
            style={{ "--delay": `${groupIndex * 2.34 + i * 0.78 + 6.4}s` } as RouteVars}
            aria-hidden
          >
            {animal.emoji}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-1">
        {group.animals.map((animal, i) => (
          <span
            key={`${group.id}-strength-${animal.id}`}
            className="step4-strength-mark h-1.5 flex-1 rounded-full"
            style={{ backgroundColor: color, "--delay": `${groupIndex * 2.34 + i * 0.78 + 6.6}s` } as RouteVars}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

function patternBinY(index: number): number {
  return 21 + index * 18;
}

function YourProfileScene({
  learnerCard,
  selectedFeatureId,
  matchedGroup,
  dream,
  onSelectFeature,
}: {
  learnerCard: ReturnType<typeof buildLearnerProfileCardData>;
  selectedFeatureId: string | null;
  matchedGroup: FeaturePairGroup;
  dream: string;
  onSelectFeature: (id: string) => void;
}) {
  const top = DISTRICT_POS[matchedGroup.label];
  const featureRows = featureRowsForLearnerCard(learnerCard);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <DistrictConstellation highlight={matchedGroup.label} muted />
      <ClassifierGate label="Career Model" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d={`M 28 58 C 42 54, 46 50, 50 50 S ${top.x - 8} ${top.y + 6}, ${top.x} ${top.y}`}
          fill="none"
          stroke={top.color}
          strokeWidth="1.2"
          strokeLinecap="round"
          className="step4-story-route"
        />
      </svg>
      <div
        className="step4-matched-pattern absolute z-30 w-56 rounded-3xl border-4 bg-white/95 px-4 py-3 text-center font-serif text-violet-950 shadow-[0_0_30px_rgba(250,204,21,0.42)]"
        style={{
          right: "5%",
          bottom: "16%",
          borderColor: top.color,
        }}
      >
        <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-violet-700">
          Matching old category
        </p>
        <p className="mt-1 text-lg font-black">{matchedGroup.featureLabel}</p>
        <p className="mt-2 rounded-2xl bg-amber-100 px-3 py-2 text-xs font-bold text-amber-950">
          Saved labels connect to {DREAM_DISTRICT_LABELS[matchedGroup.label]}
        </p>
      </div>
      <div className="step4-user-card absolute left-[5%] top-[19%] z-30 w-[min(28rem,42vw)] rounded-[2rem] border-4 border-amber-300 bg-gradient-to-br from-white via-amber-50 to-orange-50 p-5 font-serif text-amber-950 shadow-[0_20px_50px_rgba(0,0,0,0.32)]">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Your Profile</p>
        <p className="mt-3 text-3xl font-black">
          <span aria-hidden>{learnerCard.emoji}</span> {learnerCard.animal}
        </p>
        <div className="mt-4 grid gap-2">
          {featureRows.map((feature) => (
            <button
              type="button"
              key={feature.id}
              onClick={() => onSelectFeature(feature.id)}
              className={[
                "rounded-2xl border-2 px-3 py-2 text-left text-sm font-bold transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200",
                selectedFeatureId === feature.id
                  ? "border-cyan-300 bg-cyan-100 text-cyan-950 shadow-[0_0_18px_rgba(34,211,238,0.45)]"
                  : "border-sky-200 bg-sky-50 text-sky-950",
              ].join(" ")}
            >
              {feature.label}: {feature.value}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border-2 border-orange-200 bg-orange-50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-orange-800">Your Dream</p>
          <p className="mt-1 text-sm font-black text-orange-950">{dream}</p>
          <p className="mt-1 text-xs font-semibold text-orange-800">
            Dream stays separate. The classifier uses size and diet.
          </p>
        </div>
      </div>
      <div className="absolute right-[5%] top-[17%] z-30 w-[min(24rem,38vw)] rounded-[2rem] border-2 border-white/50 bg-white/95 p-5 font-serif text-violet-950 shadow-[0_20px_50px_rgba(0,0,0,0.26)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">
          Classification Output
        </p>
        <p className="mt-3 text-lg font-black">District classification</p>
        <p className="mt-1 rounded-2xl px-4 py-3 text-2xl font-black text-white" style={{ backgroundColor: top.color }}>
          {DREAM_DISTRICT_LABELS[matchedGroup.label]}
        </p>
        <div className="mt-4 rounded-2xl bg-violet-100 px-4 py-3 text-left text-sm font-bold text-violet-950">
          <p>Matched pattern bin:</p>
          <p className="mt-1 text-lg">
            {matchedGroup.featureLabel}
          </p>
        </div>
        <p className="mt-4 rounded-xl bg-violet-100 px-3 py-2 text-sm font-bold text-violet-900">
          A classification is not a final decision.
        </p>
      </div>
      {selectedFeatureId ? (
        <div className="absolute bottom-10 left-1/2 z-40 w-[min(90%,36rem)] -translate-x-1/2 rounded-3xl border border-cyan-200 bg-cyan-50/95 px-5 py-4 text-center font-serif text-cyan-950 shadow-xl">
          <p className="text-sm font-black">
            This feature is part of the matched pattern: {matchedGroup.featureLabel}.
          </p>
          <p className="mt-1 text-xs font-semibold">
            Click another feature to see a different glow. Your dream stays separate.
          </p>
              </div>
                ) : null}
          </div>
  );
}

function CityConsequenceScene({
  cards,
  topJob,
}: {
  cards: HistoryCard[];
  topJob: JobId;
}) {
  const voices = [
    "I do not feel I belong here.",
    "I want to try another path.",
    "I followed what others expected.",
  ];
  return (
    <div className="absolute inset-0 overflow-hidden">
      <DistrictConstellation highlight={topJob} cityMode patternGroups={FEATURE_PAIR_GROUPS} />
      <ClassifierGate label="Classifier" small />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {JOB_IDS.map((job) => {
          const pos = DISTRICT_POS[job];
          return (
            <path
              key={job}
              d={`M 50 50 C 55 48, ${pos.x - 10} ${pos.y}, ${pos.x} ${pos.y}`}
              fill="none"
              stroke={pos.color}
              strokeWidth={job === topJob ? "1.6" : "0.8"}
              strokeLinecap="round"
              className="step4-repeated-route"
            />
          );
        })}
      </svg>
      {cards.concat(cards.slice(0, 4)).map((card, i) => {
        const pos = DISTRICT_POS[card.label];
        const style: RouteVars = {
          "--route-y": `${40 + (i % 5) * 4}%`,
          "--district-x": `${pos.x}%`,
          "--district-y": `${pos.y}%`,
          "--delay": `${i * 0.38}s`,
        };
        return (
          <span
            key={`${card.id}-city-${i}`}
            className="step4-city-flow absolute z-30 text-2xl drop-shadow-lg"
            style={style}
            aria-hidden
          >
            {card.emoji}
          </span>
        );
      })}
      <div className="absolute right-[7%] top-[24%] z-40 flex w-72 flex-col gap-3">
        {voices.map((voice, i) => (
          <p
            key={voice}
            className="step4-voice-bubble rounded-3xl border-2 border-white/70 bg-white/95 px-4 py-3 font-serif text-sm font-bold text-violet-950 shadow-lg"
            style={{ "--delay": `${i * 1.1}s` } as RouteVars}
          >
            “{voice}”
          </p>
        ))}
      </div>
      <div className="absolute bottom-8 left-8 z-30 w-[min(90%,34rem)] rounded-3xl border border-amber-200/70 bg-amber-50/95 px-5 py-4 font-serif text-amber-950 shadow-lg">
        <p className="text-sm font-black">
          If old labels shaped the classifier, people can redesign what it learns from.
        </p>
      </div>
    </div>
  );
}

function RobotCaption({
  line,
  lineKey,
  revealed,
  setRevealed,
  showBack,
  onBack,
  showContinue,
  onContinue,
  children,
}: {
  line: string;
  lineKey: string;
  revealed: boolean;
  setRevealed: (value: boolean) => void;
  showBack: boolean;
  onBack: () => void;
  showContinue: boolean;
  onContinue: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="relative z-50 mx-auto mt-3 flex w-full max-w-5xl items-end justify-center gap-3 rounded-[1.75rem] border-2 border-stone-200 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(120,113,108,0.22)] backdrop-blur-md">
      <div className="hidden shrink-0 sm:block">
        <Image
          src="/robot.png"
          alt=""
          width={92}
          height={92}
          className="h-20 w-auto drop-shadow-lg"
          priority
        />
      </div>
      <div className="min-w-0 flex-1">
        <Step4RobotBubbleReveal
          text={line}
          lineKey={lineKey}
          onRevealComplete={() => setRevealed(true)}
          showBack={revealed && showBack}
          onBack={onBack}
          showContinue={revealed && showContinue}
          onContinue={onContinue}
          textClassName="text-base sm:text-lg"
        />
        {children}
      </div>
    </div>
  );
}

function LabelQuestion({
  answer,
  onAnswer,
}: {
  answer: string | null;
  onAnswer: (answer: string) => void;
}) {
  const options = [
    { id: "past", label: "The old city sorting result", correct: true },
    { id: "dream", label: "The animal's dream", correct: false },
    { id: "identity", label: "The animal's whole identity", correct: false },
  ];
  return (
    <div className="mt-3 grid gap-2">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onAnswer(option.id)}
          className={[
            "rounded-2xl border-2 bg-white/95 px-4 py-3 text-left font-serif text-sm font-bold shadow-md transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
            answer === option.id
              ? option.correct
                ? "border-emerald-400 text-emerald-950"
                : "border-rose-400 text-rose-950"
              : "border-violet-200 text-violet-950",
          ].join(" ")}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function CardInspector({
  card,
  onClose,
}: {
  card: HistoryCard;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-violet-950/45 p-4 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" type="button" onClick={onClose} aria-label="Close profile details" />
      <article className="relative w-full max-w-md rounded-[2rem] border-4 border-amber-300 bg-white p-6 font-serif text-violet-950 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 transition hover:bg-violet-200"
        >
          Close
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Old animal profile card</p>
        <p className="mt-3 text-2xl font-black">
          <span aria-hidden>{card.emoji}</span> {card.name}
        </p>
        <dl className="mt-4 space-y-2 text-sm">
          <InfoRow label="Animal" value={card.animal} />
          <InfoRow label="Diet" value={card.diet} />
          <InfoRow label="Size" value={card.size} />
        </dl>
      </article>
      <div className="absolute left-1/2 top-[calc(50%+15rem)] z-[61] w-[min(90%,26rem)] -translate-x-1/2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-center font-serif text-sm font-bold text-emerald-950 shadow-xl">
        <p className="text-xs uppercase tracking-wide text-emerald-800/75">Training label</p>
        <p className="mt-1">Old sorting result: {DREAM_DISTRICT_LABELS[card.label]}</p>
        <p className="mt-2 text-xs font-semibold text-emerald-900/80">
          This is not a profile feature. It was saved as the label the classifier learns from.
        </p>
      </div>
    </div>
  );
}

function SceneProgress({ scene }: { scene: SceneId }) {
  const labels = ["Feature", "One", "Many", "You", "City"];
  return (
    <div className="absolute right-5 top-5 z-40 flex gap-2">
      {labels.map((label, i) => (
        <span
          key={label}
          className={[
            "rounded-full border px-3 py-1 font-serif text-[0.65rem] font-bold uppercase tracking-wide backdrop-blur-md",
            scene === i
              ? "border-amber-200 bg-amber-100 text-amber-950"
              : "border-white/20 bg-white/10 text-violet-100",
          ].join(" ")}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

function ClassifierGate({
  label = "AI Career Classifier",
  small = false,
}: {
  label?: string;
  small?: boolean;
}) {
  return (
    <div
      className={[
        "absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-[2.2rem] border-4 border-cyan-300 bg-cyan-100 text-center font-serif text-cyan-950 shadow-[0_0_42px_rgba(34,211,238,0.45)]",
        small ? "w-40 px-4 py-4" : "w-56 px-5 py-6",
      ].join(" ")}
    >
      <p className="text-[0.62rem] font-black uppercase tracking-[0.18em]">Scanner Gate</p>
      <p className={small ? "mt-1 text-base font-black" : "mt-2 text-xl font-black"}>{label}</p>
      <div className="pointer-events-none absolute inset-x-4 top-3 h-1 rounded-full bg-white/80 shadow-[0_0_22px_rgba(255,255,255,0.85)] step4-scanner-light" />
    </div>
  );
}

function DistrictConstellation({
  highlight,
  muted = false,
  cityMode = false,
  patternGroups,
}: {
  highlight?: JobId;
  muted?: boolean;
  cityMode?: boolean;
  patternGroups?: FeaturePairGroup[];
}) {
  return (
    <>
      {JOB_IDS.map((job) => {
        const pos = DISTRICT_POS[job];
        const active = highlight === job;
        const patternGroup = patternGroups?.find((group) => group.label === job) ?? null;
        return (
          <div
            key={job}
            className={[
              "absolute z-10 rounded-[2rem] border-2 px-4 py-3 text-center font-serif font-black shadow-xl transition-all duration-500",
              cityMode ? "w-56" : "min-w-40",
              active
                ? "border-amber-200 bg-white text-violet-950 scale-105"
                : muted
                  ? "border-white/20 bg-white/12 text-violet-100/70"
                  : "border-white/35 bg-white/18 text-violet-50",
            ].join(" ")}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              boxShadow: active ? `0 0 34px ${pos.color}` : undefined,
            }}
          >
            <p className="text-xs uppercase tracking-wide opacity-70">District</p>
            <p className="mt-1 text-sm">{DREAM_DISTRICT_LABELS[job]}</p>
            {cityMode && patternGroup ? (
              <DistrictPatternSummary group={patternGroup} />
            ) : cityMode ? (
              <DistrictCluster job={job} />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function DistrictPatternSummary({ group }: { group: FeaturePairGroup }) {
  return (
    <div className="mt-3 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-violet-950 shadow-inner">
      <p className="text-[0.62rem] font-black uppercase tracking-[0.14em] text-violet-700">
        {group.featureLabel}
      </p>
      <p className="mt-1 text-[0.68rem] font-black text-emerald-900">
        Saved label here
      </p>
      <div className="mt-2 flex justify-center -space-x-1">
        {group.animals.map((animal) => (
          <span
            key={`${group.id}-district-${animal.id}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-base shadow-sm"
            aria-hidden
          >
            {animal.emoji}
          </span>
        ))}
      </div>
    </div>
  );
}

function DistrictCluster({ job }: { job: JobId }) {
  const icons: Record<JobId, string[]> = {
    artist: ["🐰", "🦔", "🐿️", "🎨"],
    engineer: ["🐻", "🦊", "🦦", "⚙️"],
    manager: ["🦊", "🦁", "🐯", "📋", "🐺"],
    community: ["🐘", "🦌", "🐑", "🤝"],
  };
  return (
    <div className="mt-2 flex justify-center -space-x-1">
      {icons[job].map((icon, i) => (
        <span
          key={`${job}-${icon}-${i}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-white text-base shadow-sm"
        >
          {icon}
        </span>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-violet-100 pb-1">
      <dt className="font-bold text-violet-700">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
        </div>
  );
}

function captionLine(
  scene: SceneId,
  beat: number,
  fallback: string,
  labelAnswer: string | null,
): string {
  if (scene === 1 && beat === 5 && labelAnswer !== "past") {
    return "Almost. Here, a label means the old city sorting result.";
  }
  return fallback;
}

function featureGroupForProfile(
  size: string | null | undefined,
  diet: string | null | undefined,
): FeaturePairGroup {
  const sizeHalf = size === "Small" ? "Small" : "Large";
  const dietHalf = diet === "Herbivore" ? "Herbivore" : "Carnivore";
  const featureLabel = `${sizeHalf} + ${dietHalf}`;
  return FEATURE_PAIR_GROUPS.find((group) => group.featureLabel === featureLabel) ?? FEATURE_PAIR_GROUPS[0]!;
}

function storyOldRecordForLearner(learner: LearnerProfile): HistoryCard {
  const learnerKey = getResolvedAnimalKey(learner);
  const examples = FEATURE_PAIR_GROUPS.flatMap((group) => group.animals);
  return examples.find((card) => card.animalKey === learnerKey) ?? examples[1] ?? FALLBACK_HISTORY[0]!;
}

function featureRowsForLearnerCard(
  learnerCard: ReturnType<typeof buildLearnerProfileCardData>,
): { id: string; label: string; value: string }[] {
  return [
    { id: "size", label: "Size", value: learnerCard.size ?? "Unknown size" },
    { id: "diet", label: "Diet", value: learnerCard.diet ?? "Unknown diet" },
  ];
}

