"use client";

import { AnimalDecisionCarousel } from "@/components/step5/AnimalDecisionCarousel";
import { DistrictCityBoard } from "@/components/step5/DistrictCityBoard";
import { Step5SaveConfirmModal } from "@/components/steps/step5/Step5SaveConfirmModal";
import { Step5RetrainingOverlay } from "@/components/steps/step5/Step5RetrainingOverlay";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import { captureDistrictBoardDataUrl } from "@/lib/captureDistrictBoard";
import { useGameState } from "@/lib/gameState";
import { neutralPlacementToast } from "@/lib/step5NeutralToast";
import { pickRandomSubset, reflectiveLineForPlacement } from "@/lib/step5SpeechNotes";
import { buildInitialStep5Placements } from "@/lib/step5FromCityDistribution";
import type { RedesignRegionId } from "@/types/city";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const RETRAIN_MS = 2200;
const NOTE_THRESHOLD = 5;
const MAX_SPEECH_NOTES = 3;

function ensureFullPlacements(
  raw: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) {
    return raw;
  }
  return buildInitialStep5Placements() as Record<string, RedesignRegionId>;
}

function findNextUndecided(fromIdx: number, decided: Set<string>): number {
  const n = STEP5_ANIMALS.length;
  for (let k = 1; k <= n; k++) {
    const i = (fromIdx + k) % n;
    if (!decided.has(STEP5_ANIMALS[i]!.id)) return i;
  }
  return fromIdx;
}

function firstName(animal: (typeof STEP5_ANIMALS)[number]): string {
  return animal.name.split(" ")[0] ?? animal.name;
}

export function HiringAssignmentWorkspace() {
  const { state, dispatch } = useGameState();
  const locked = state.progress.redesignComplete;
  const rawPlacements = state.progress.redesignPlacements;

  const placements = useMemo(
    () => ensureFullPlacements(rawPlacements ?? undefined),
    [rawPlacements],
  );

  const [decidedIds, setDecidedIds] = useState<Set<string>>(() => new Set());
  const [centerIndex, setCenterIndex] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [pulseRegion, setPulseRegion] = useState<RedesignRegionId | null>(null);
  const [saving, setSaving] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [speechNotes, setSpeechNotes] = useState<Record<string, string>>({});
  const [bubblesHidden, setBubblesHidden] = useState(false);
  /** Animals the learner has explicitly placed or moved (district tap or drag). */
  const [interactedIds, setInteractedIds] = useState<Set<string>>(() => new Set());
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);

  const toastRef = useRef<number | null>(null);
  const pulseRef = useRef<number | null>(null);
  const advanceRef = useRef<number | null>(null);
  const notesInitRef = useRef(false);
  const noteSeedRef = useRef(
    typeof window !== "undefined" ? Date.now() % 1_000_000 : 42_001,
  );

  useEffect(() => {
    return () => {
      if (toastRef.current) window.clearTimeout(toastRef.current);
      if (pulseRef.current) window.clearTimeout(pulseRef.current);
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    };
  }, []);

  useEffect(() => {
    if (locked) return;
    const raw = state.progress.redesignPlacements;
    if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) return;
    dispatch({
      type: "MARK_PROGRESS",
      patch: {
        redesignPlacements: buildInitialStep5Placements() as Record<string, RedesignRegionId>,
      },
    });
  }, [locked, dispatch, state.progress.redesignPlacements]);

  const decidedCount = decidedIds.size;
  const decidedKey = useMemo(() => [...decidedIds].sort().join(","), [decidedIds]);

  /** Refresh reflective lines when placement changes for animals that have a bubble. */
  useEffect(() => {
    setSpeechNotes((prev) => {
      const keys = Object.keys(prev);
      if (keys.length === 0) return prev;
      const next = { ...prev };
      let changed = false;
      for (const id of keys) {
        const r = placements[id];
        if (!r) continue;
        const line = reflectiveLineForPlacement(id, r);
        if (next[id] !== line) {
          next[id] = line;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [placements]);

  /** After 5+ placement decisions, attach at most 3 speech bubbles (one-time pick). */
  useEffect(() => {
    if (locked || notesInitRef.current || decidedCount < NOTE_THRESHOLD) return;
    const pool = decidedKey.split(",").filter(Boolean);
    if (pool.length < 3) return;
    notesInitRef.current = true;
    const picked = pickRandomSubset(pool, MAX_SPEECH_NOTES, noteSeedRef.current);
    setSpeechNotes(
      Object.fromEntries(
        picked.map((id) => [id, reflectiveLineForPlacement(id, placements[id]!)]),
      ),
    );
  }, [decidedCount, decidedKey, placements, locked]);

  const updatePlacement = useCallback(
    (
      animalId: string,
      region: RedesignRegionId,
      options: { showToast: boolean; advanceCarouselFromIndex?: number },
    ) => {
      if (locked || saving || retraining) return;
      const animal = STEP5_ANIMALS.find((a) => a.id === animalId);
      if (!animal) return;

      const prev = ensureFullPlacements(state.progress.redesignPlacements);
      const sameDistrict = prev[animalId] === region;

      setInteractedIds((s) => new Set(s).add(animalId));

      if (!sameDistrict) {
        const nextPlacements = { ...prev, [animalId]: region };
        dispatch({
          type: "MARK_PROGRESS",
          patch: { redesignPlacements: nextPlacements },
        });
      }

      setPulseRegion(region);
      if (options.showToast) {
        const msg = sameDistrict
          ? `${firstName(animal)} stays here — let’s meet the next animal.`
          : neutralPlacementToast(firstName(animal), region);
        setToast(msg);
        if (toastRef.current) window.clearTimeout(toastRef.current);
        toastRef.current = window.setTimeout(() => {
          toastRef.current = null;
          setToast(null);
        }, 2800);
      }

      if (pulseRef.current) window.clearTimeout(pulseRef.current);
      pulseRef.current = window.setTimeout(() => {
        pulseRef.current = null;
        setPulseRegion(null);
      }, 650);

      const advanceIdx = options.advanceCarouselFromIndex;
      setDecidedIds((prevDecided) => {
        const next = new Set(prevDecided);
        next.add(animalId);
        if (advanceIdx !== undefined) {
          if (advanceRef.current) window.clearTimeout(advanceRef.current);
          advanceRef.current = window.setTimeout(() => {
            advanceRef.current = null;
            if (next.size >= STEP5_ANIMALS.length) return;
            setCenterIndex(findNextUndecided(advanceIdx, next));
          }, 320);
        }
        return next;
      });
    },
    [dispatch, locked, retraining, saving, state.progress.redesignPlacements],
  );

  const onChoose = useCallback(
    (animalId: string, region: RedesignRegionId) => {
      setInteractedIds((prev) => new Set(prev).add(animalId));
      const idx = STEP5_ANIMALS.findIndex((a) => a.id === animalId);
      updatePlacement(animalId, region, {
        showToast: true,
        advanceCarouselFromIndex: idx,
      });
    },
    [updatePlacement],
  );

  const onMoveAnimal = useCallback(
    (animalId: string, region: RedesignRegionId) => {
      updatePlacement(animalId, region, { showToast: true });
    },
    [updatePlacement],
  );

  const notAdjustedCount = STEP5_ANIMALS.length - interactedIds.size;

  const saveMyNewCity = useCallback(async () => {
    if (locked || saving || retraining) return;
    setSaving(true);
    try {
      const p = ensureFullPlacements(state.progress.redesignPlacements);
      const baseline = buildInitialStep5Placements() as Record<string, RedesignRegionId>;
      const before = await captureDistrictBoardDataUrl(baseline);
      const after = await captureDistrictBoardDataUrl(p);
      dispatch({
        type: "MARK_PROGRESS",
        patch: {
          beforeCityImageDataUrl: before,
          afterCityImageDataUrl: after,
          redesignPlacements: p,
          redesignComplete: true,
          finishingStep5Celebration: true,
          step6PredictionRevealed: true,
        },
      });
      setRetraining(true);
      window.setTimeout(() => {
        setRetraining(false);
        dispatch({ type: "MARK_PROGRESS", patch: { finishingStep5Celebration: false } });
        dispatch({ type: "SET_STEP", step: 6 });
      }, RETRAIN_MS);
    } catch {
      const p = ensureFullPlacements(state.progress.redesignPlacements);
      dispatch({
        type: "MARK_PROGRESS",
        patch: {
          redesignComplete: true,
          redesignPlacements: p,
          finishingStep5Celebration: true,
          step6PredictionRevealed: true,
        },
      });
      setRetraining(true);
      window.setTimeout(() => {
        setRetraining(false);
        dispatch({ type: "MARK_PROGRESS", patch: { finishingStep5Celebration: false } });
        dispatch({ type: "SET_STEP", step: 6 });
      }, RETRAIN_MS);
    } finally {
      setSaving(false);
    }
  }, [dispatch, locked, retraining, saving, state.progress.redesignPlacements]);

  const requestSaveCity = useCallback(() => {
    if (locked || saving || retraining) return;
    setSaveConfirmOpen(true);
  }, [locked, saving, retraining]);

  const cancelSaveCity = useCallback(() => {
    setSaveConfirmOpen(false);
  }, []);

  const confirmSaveCity = useCallback(() => {
    setSaveConfirmOpen(false);
    void saveMyNewCity();
  }, [saveMyNewCity]);

  const mapInteractive = !locked && !saving && !retraining;
  const showBubbles = !bubblesHidden && Object.keys(speechNotes).length > 0;

  const selectedAnimalId = STEP5_ANIMALS[centerIndex]?.id ?? null;

  const onMapAnimalClick = useCallback((animalId: string) => {
    const idx = STEP5_ANIMALS.findIndex((a) => a.id === animalId);
    if (idx >= 0) setCenterIndex(idx);
  }, []);

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col gap-3 px-4 pb-4 sm:gap-4 sm:px-6 lg:px-10"
      aria-labelledby="step5-title"
    >
      <div className="shrink-0 space-y-1 text-center sm:text-left">
        <p className="font-serif text-sm font-medium uppercase tracking-widest text-rose-800/80">
          Chapter 5
        </p>
        <h2 id="step5-title" className="font-serif text-xl font-bold text-rose-950 sm:text-2xl lg:text-3xl">
          Redesign the city, one animal at a time
        </h2>
        <p className="mx-auto max-w-prose font-serif text-xs leading-relaxed text-rose-950/85 sm:mx-0 sm:text-sm">
          Map and card stay together: tap an animal on the map to open their card. Drag to move
          districts before save. Bubbles after several placements are gentle thoughts, not scores.
        </p>
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-3 lg:max-h-[min(720px,calc(100dvh-200px))] lg:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] lg:items-stretch lg:gap-4">
        <div className="relative flex min-h-[280px] flex-col overflow-hidden rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50/80 to-white/90 p-2 shadow-inner sm:min-h-[320px] sm:p-3 lg:min-h-0">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <p className="font-serif text-[11px] font-semibold uppercase tracking-wide text-stone-600 sm:text-xs sm:text-left">
              City map ({decidedCount}/{STEP5_ANIMALS.length} placed · drag or tap)
            </p>
            {decidedCount >= NOTE_THRESHOLD && Object.keys(speechNotes).length > 0 ? (
              <button
                type="button"
                onClick={() => setBubblesHidden((h) => !h)}
                className="rounded-full border border-stone-300 bg-stone-100/90 px-2.5 py-0.5 font-serif text-[10px] font-medium text-stone-700 shadow-sm hover:bg-stone-200/90 sm:px-3 sm:py-1 sm:text-xs"
              >
                {bubblesHidden ? "Show note bubbles" : "Hide note bubbles"}
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
            <DistrictCityBoard
              placements={placements}
              pulseRegion={pulseRegion}
              speechNotes={speechNotes}
              showSpeechBubbles={showBubbles}
              interactive={mapInteractive}
              onMoveAnimal={onMoveAnimal}
              selectedAnimalId={selectedAnimalId}
              onAnimalClick={onMapAnimalClick}
            />
          </div>
        </div>

        <div className="relative flex min-h-[320px] flex-col overflow-visible rounded-2xl border-2 border-rose-200/70 bg-rose-50/40 px-1 py-3 sm:px-2 lg:min-h-0">
          <AnimalDecisionCarousel
            centerIndex={centerIndex}
            decidedIds={decidedIds}
            disabled={locked || saving || retraining}
            compactRail
            currentDistrict={placements[STEP5_ANIMALS[centerIndex]!.id]!}
            onPrev={() =>
              setCenterIndex((i) => (i - 1 + STEP5_ANIMALS.length) % STEP5_ANIMALS.length)
            }
            onNext={() => setCenterIndex((i) => (i + 1) % STEP5_ANIMALS.length)}
            onChoose={onChoose}
          />
        </div>
      </div>

      {toast ? (
        <div
          className="pointer-events-none fixed bottom-24 left-1/2 z-[400] max-w-sm -translate-x-1/2 rounded-2xl border border-stone-200/90 bg-stone-50/95 px-4 py-2 text-center font-serif text-sm text-stone-800 shadow-lg ring-1 ring-stone-300/40"
          role="status"
        >
          {toast}
        </div>
      ) : null}

      <div className="shrink-0 mt-2 border-t border-rose-200/80 bg-gradient-to-b from-rose-50/50 to-transparent pt-6 sm:mt-4 sm:pt-8">
        <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-rose-200/70 bg-white/90 p-4 shadow-[0_8px_28px_-12px_rgba(120,53,15,0.15)] ring-1 ring-rose-100/60 sm:p-5">
          <p className="text-center font-serif text-xs leading-relaxed text-stone-600">
            When you save, the story freezes here and the model updates from traits, dreams, and how your map differs from the old layout — not from headcounts alone.
          </p>
          <button
            type="button"
            disabled={locked || saving || retraining}
            onClick={requestSaveCity}
            className="w-full rounded-xl border-2 border-rose-800 bg-rose-500 px-4 py-3.5 font-serif text-sm font-semibold text-white shadow-md enabled:hover:bg-rose-400 disabled:opacity-40"
          >
            {saving ? "Saving…" : locked ? "City saved" : "Save City"}
          </button>
          {locked && !retraining ? (
            <p className="text-center font-serif text-sm text-stone-600">
              Your city is saved for Chapter 6.
            </p>
          ) : null}
        </div>
      </div>

      <Step5SaveConfirmModal
        open={saveConfirmOpen}
        notAdjustedCount={notAdjustedCount}
        onGoBack={cancelSaveCity}
        onContinueSaving={confirmSaveCity}
      />

      {retraining ? <Step5RetrainingOverlay /> : null}
    </section>
  );
}
