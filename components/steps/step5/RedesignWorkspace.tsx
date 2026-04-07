"use client";

import { Step5SaveCelebrationOverlay } from "@/components/steps/step5/Step5SaveCelebrationOverlay";
import { STEP5_ANIMALS } from "@/data/step5Animals";
import { STEP5_REGIONS } from "@/data/step5Regions";
import { JOB_DISPLAY } from "@/lib/aiModel";
import { useGameState } from "@/lib/gameState";
import { captureMapDataUrl } from "@/lib/step5Capture";
import { buildStep6CelebrationHeadline } from "@/lib/step6Narrative";
import { buildInitialStep5Placements, originalDistrictForAnimal } from "@/lib/step5FromCityDistribution";
import {
  countInRegion,
  jobToRegionId,
  slotCenterPercent,
  slotIndexInRegion,
  topAiJob,
  uniqueCountInRegion,
} from "@/lib/step5Layout";
import type { DistrictId, RedesignRegionId } from "@/types/city";
import type { JobId } from "@/types/game";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MAP1 = "/map/zoo-map1.png";
const MAP2 = "/map/zoo-map2.png";
/** Celebration overlay before advancing to Step 6 (ms). */
const SAVE_CELEBRATION_MS = 2900;
const ZOO_MAP_INTRINSIC = { width: 1920, height: 1080 };
const MIN_SCALE = 0.55;
const MAX_SCALE = 2.8;
const ZOOM_STEP = 0.2;

type FeedbackVariant = "ai-match" | "ai-differ" | "hub-first" | "hub-repeat" | "neutral";

type FeedbackState = {
  id: number;
  lines: string[];
  variant: FeedbackVariant;
} | null;

function ensureFullPlacements(
  raw: Record<string, RedesignRegionId> | null | undefined,
): Record<string, RedesignRegionId> {
  if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) {
    return raw;
  }
  return buildInitialStep5Placements();
}

export function RedesignWorkspace() {
  const { state, dispatch } = useGameState();
  const locked = state.progress.redesignComplete;
  const rawPlacements = state.progress.redesignPlacements;

  const placements = useMemo(
    () => ensureFullPlacements(rawPlacements ?? undefined),
    [rawPlacements],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState<{ animalId: string } | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const [hoverRegion, setHoverRegion] = useState<RedesignRegionId | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [settleTick, setSettleTick] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [postSaveCelebration, setPostSaveCelebration] = useState(false);
  const [celebrationHeadline, setCelebrationHeadline] = useState("");
  const [panning, setPanning] = useState(false);
  const feedbackId = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const panRef = useRef<{ px: number; py: number; tx0: number; ty0: number } | null>(null);
  const celebrationGoStep6Ref = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (celebrationGoStep6Ref.current) {
        clearTimeout(celebrationGoStep6Ref.current);
        celebrationGoStep6Ref.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (locked) return;
    const raw = state.progress.redesignPlacements;
    if (raw && Object.keys(raw).length >= STEP5_ANIMALS.length) return;
    dispatch({
      type: "MARK_PROGRESS",
      patch: { redesignPlacements: buildInitialStep5Placements() },
    });
  }, [locked, dispatch, state.progress.redesignPlacements]);

  const showFeedback = useCallback((lines: string[], variant: FeedbackVariant) => {
    feedbackId.current += 1;
    const id = feedbackId.current;
    setFeedback({ id, lines, variant });
    window.setTimeout(() => {
      setFeedback((f) => (f?.id === id ? null : f));
    }, 6200);
  }, []);

  const applyDrop = useCallback(
    (animalId: string, region: RedesignRegionId) => {
      const animal = STEP5_ANIMALS.find((a) => a.id === animalId);
      if (!animal || locked || saving) return;

      const prev = ensureFullPlacements(state.progress.redesignPlacements);
      const current = prev[animalId];
      if (current === region) {
        setDrag(null);
        setGhost(null);
        setHoverRegion(null);
        return;
      }

      const next = { ...prev, [animalId]: region };
      const hubCount = state.progress.freelancerHubDropCount;

      const patch: {
        redesignPlacements: Record<string, RedesignRegionId>;
        freelancerHubDropCount?: number;
      } = { redesignPlacements: next };
      if (region === "freelancer") {
        patch.freelancerHubDropCount = hubCount + 1;
      }
      dispatch({ type: "MARK_PROGRESS", patch });

      setSettleTick((t) => ({ ...t, [animalId]: (t[animalId] ?? 0) + 1 }));

      const lines: string[] = [];
      let variant: FeedbackVariant = "neutral";

      if (region === "freelancer") {
        if (hubCount === 0) {
          lines.push("The system did not originally have this option.");
          lines.push("You added a new way for animals to belong.");
          variant = "hub-first";
        } else {
          lines.push("You are creating new possibilities.");
          variant = "hub-repeat";
        }
      } else {
        const top = topAiJob(animal.aiRecommendation);
        const aiRegion = jobToRegionId(top);
        if (region === aiRegion) {
          lines.push("You followed the system’s suggestion.");
          variant = "ai-match";
        } else {
          lines.push("You chose differently from the system.");
          variant = "ai-differ";
        }
      }

      const crowded = countInRegion(region, next);
      if (crowded >= 4) {
        lines.push("This area is getting crowded.");
      }
      const diverse = uniqueCountInRegion(region, next);
      if (diverse >= 3) {
        lines.push("This area now has many different animals.");
      }

      showFeedback(lines, variant);
    },
    [
      dispatch,
      locked,
      saving,
      showFeedback,
      state.progress.freelancerHubDropCount,
      state.progress.redesignPlacements,
    ],
  );

  const saveMyNewCity = useCallback(async () => {
    if (locked || saving) return;
    setSaving(true);
    try {
      const p = ensureFullPlacements(state.progress.redesignPlacements);
      const baseline = buildInitialStep5Placements();
      const before = await captureMapDataUrl(MAP1, baseline);
      const after = await captureMapDataUrl(MAP2, p);
      const headline = buildStep6CelebrationHeadline(p);
      dispatch({
        type: "MARK_PROGRESS",
        patch: {
          beforeCityImageDataUrl: before,
          afterCityImageDataUrl: after,
          redesignPlacements: p,
          redesignComplete: true,
          finishingStep5Celebration: true,
        },
      });
      setCelebrationHeadline(headline);
      setPostSaveCelebration(true);
      if (celebrationGoStep6Ref.current) clearTimeout(celebrationGoStep6Ref.current);
      celebrationGoStep6Ref.current = window.setTimeout(() => {
        celebrationGoStep6Ref.current = null;
        dispatch({ type: "MARK_PROGRESS", patch: { finishingStep5Celebration: false } });
        dispatch({ type: "SET_STEP", step: 6 });
        setPostSaveCelebration(false);
      }, SAVE_CELEBRATION_MS);
    } catch {
      const p = ensureFullPlacements(state.progress.redesignPlacements);
      dispatch({
        type: "MARK_PROGRESS",
        patch: {
          redesignComplete: true,
          redesignPlacements: p,
          finishingStep5Celebration: true,
        },
      });
      setCelebrationHeadline(buildStep6CelebrationHeadline(p));
      setPostSaveCelebration(true);
      if (celebrationGoStep6Ref.current) clearTimeout(celebrationGoStep6Ref.current);
      celebrationGoStep6Ref.current = window.setTimeout(() => {
        celebrationGoStep6Ref.current = null;
        dispatch({ type: "MARK_PROGRESS", patch: { finishingStep5Celebration: false } });
        dispatch({ type: "SET_STEP", step: 6 });
        setPostSaveCelebration(false);
      }, SAVE_CELEBRATION_MS);
    } finally {
      setSaving(false);
    }
  }, [dispatch, locked, saving, state.progress.redesignPlacements]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.0012;
      setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, []);

  const onPanPointerDown = (e: React.PointerEvent) => {
    if (locked || saving || postSaveCelebration || drag) return;
    if ((e.target as HTMLElement).closest("[data-animal-token]")) return;
    if ((e.target as HTMLElement).closest("[data-zoom-control]")) return;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    setPanning(true);
    panRef.current = { px: e.clientX, py: e.clientY, tx0: tx, ty0: ty };
  };

  const onPanPointerMove = (e: React.PointerEvent) => {
    if (!panRef.current) return;
    const { px, py, tx0, ty0 } = panRef.current;
    setTx(tx0 + (e.clientX - px));
    setTy(ty0 + (e.clientY - py));
  };

  const onPanPointerUp = (e: React.PointerEvent) => {
    try {
      (e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    panRef.current = null;
    setPanning(false);
  };

  const startDrag = (animalId: string, clientX: number, clientY: number) => {
    if (locked || saving || postSaveCelebration) return;
    setDrag({ animalId });
    setGhost({ x: clientX, y: clientY });
  };

  const onAnimalPointerDown = (animalId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (locked || saving || postSaveCelebration) return;
    if (selectedId !== animalId) {
      setSelectedId(animalId);
      return;
    }
    startDrag(animalId, e.clientX, e.clientY);
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => {
      setGhost({ x: e.clientX, y: e.clientY });
      const stack = document.elementsFromPoint(e.clientX, e.clientY);
      const hit = stack.find(
        (el) => el instanceof HTMLElement && el.dataset.dropRegion,
      ) as HTMLElement | undefined;
      setHoverRegion((hit?.dataset.dropRegion as RedesignRegionId) ?? null);
    };
    const up = (e: PointerEvent) => {
      const stack = document.elementsFromPoint(e.clientX, e.clientY);
      const hit = stack.find(
        (el) => el instanceof HTMLElement && el.dataset.dropRegion,
      ) as HTMLElement | undefined;
      const region = hit?.dataset.dropRegion as RedesignRegionId | undefined;
      if (region) {
        applyDrop(drag.animalId, region);
      }
      setDrag(null);
      setGhost(null);
      setHoverRegion(null);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [drag, applyDrop]);

  const feedbackStyles = (v: FeedbackVariant) => {
    switch (v) {
      case "ai-match":
        return "border-emerald-300/80 bg-emerald-50/95 text-emerald-950";
      case "ai-differ":
        return "border-indigo-300/80 bg-indigo-50/95 text-indigo-950";
      case "hub-first":
      case "hub-repeat":
        return "border-violet-400/90 bg-violet-50/95 text-violet-950 shadow-[0_0_24px_rgba(167,139,250,0.4)]";
      default:
        return "border-stone-200 bg-white/95 text-stone-900";
    }
  };

  const selectedDistrict = selectedId ? placements[selectedId] : null;

  const mapLayer = useMemo(
    () => (
      <div className="relative w-full max-w-[1500px]">
        <Image
          src={MAP2}
          alt="Zoo City map with Freelancer Hub — animals show how the city was arranged; drag to redesign"
          width={ZOO_MAP_INTRINSIC.width}
          height={ZOO_MAP_INTRINSIC.height}
          className="block h-auto w-full max-w-full select-none"
          draggable={false}
          priority
        />
        <div className="absolute inset-0">
          {STEP5_REGIONS.map((r) => {
            const h = r.hotspot;
            const active = hoverRegion === r.id;
            const selectedHere = !drag && selectedDistrict === r.id;
            const base =
              r.id === "freelancer"
                ? `rounded-[2rem] border-2 border-dashed ${r.accentClass} ${r.glowClass}`
                : `rounded-2xl border-2 ${r.accentClass}`;
            const dragIdle =
              drag && !active
                ? r.id === "freelancer"
                  ? "opacity-55"
                  : "opacity-40"
                : "";
            const dragActive = drag && active ? "z-[5] scale-[1.02] opacity-100" : "";
            const noDrag = !drag ? (selectedHere ? "opacity-[0.28]" : "opacity-0") : "";
            return (
              <div
                key={r.id}
                data-drop-region={r.id}
                className={[
                  "absolute transition-all duration-300 ease-out",
                  drag ? "pointer-events-auto" : "pointer-events-none",
                  base,
                  drag ? [dragActive || dragIdle].join(" ") : noDrag,
                  active
                    ? "ring-2 ring-amber-300/95 ring-offset-2 ring-offset-stone-900/20 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
                    : "",
                  !drag && selectedHere
                    ? "ring-2 ring-sky-400/70 ring-offset-2 ring-offset-stone-900/10"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  left: `${h.left}%`,
                  top: `${h.top}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                }}
                aria-hidden
              />
            );
          })}
          {STEP5_REGIONS.map((r) => {
            if (drag) return null;
            const h = r.hotspot;
            const selectedHere = selectedDistrict === r.id;
            return (
              <div
                key={`label-${r.id}`}
                className={[
                  "pointer-events-none absolute rounded-2xl border border-white/20 bg-black/10",
                  r.id === "freelancer"
                    ? "rounded-[2rem] border-violet-200/30 bg-violet-500/10"
                    : "",
                  selectedHere ? "border-sky-300/50 bg-sky-500/15" : "",
                ].join(" ")}
                style={{
                  left: `${h.left}%`,
                  top: `${h.top}%`,
                  width: `${h.width}%`,
                  height: `${h.height}%`,
                }}
              >
                <span className="absolute left-1 top-1 max-w-[90%] rounded-md bg-black/45 px-1.5 py-0.5 font-serif text-[10px] font-semibold text-white backdrop-blur-sm sm:text-xs">
                  {r.label}
                </span>
              </div>
            );
          })}
          {STEP5_ANIMALS.map((animal) => {
            const region = placements[animal.id];
            if (!region) return null;
            const total = countInRegion(region, placements);
            const slot = slotIndexInRegion(animal.id, region, placements);
            const { x, y } = slotCenterPercent(region, slot, total);
            const st = settleTick[animal.id] ?? 0;
            const isSelected = selectedId === animal.id;
            return (
              <button
                key={animal.id}
                type="button"
                data-animal-token
                disabled={locked || saving || postSaveCelebration}
                className={[
                  "absolute z-[6] w-[7.5%] min-w-[36px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white/95 shadow-md transition-[box-shadow,transform] duration-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-amber-500",
                  isSelected
                    ? "border-amber-400 ring-2 ring-amber-300/90 ring-offset-2 ring-offset-stone-900/30"
                    : "border-amber-100",
                  postSaveCelebration
                    ? "z-[8] border-amber-200/90 shadow-[0_0_20px_rgba(253,224,71,0.55),0_0_36px_rgba(251,191,36,0.35)] ring-2 ring-amber-100/80"
                    : "",
                  locked ? "cursor-default opacity-90" : "cursor-grab hover:shadow-lg active:cursor-grabbing",
                  drag ? "pointer-events-none" : "",
                ].join(" ")}
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-label={
                  isSelected
                    ? `Drag ${animal.name} to a new district, or tap another animal`
                    : `Select ${animal.name} to read their story, then tap again to drag`
                }
                onPointerDown={(e) => onAnimalPointerDown(animal.id, e)}
              >
                <span
                  className={[
                    "block overflow-hidden rounded-full",
                    st > 0 ? "step5-drop-settle" : "",
                  ].join(" ")}
                >
                  <Image
                    src={animal.avatar}
                    alt=""
                    width={64}
                    height={64}
                    className="h-auto w-full rounded-full object-cover"
                    draggable={false}
                  />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    ),
    [
      drag,
      hoverRegion,
      locked,
      placements,
      postSaveCelebration,
      selectedDistrict,
      selectedId,
      settleTick,
      saving,
    ],
  );

  const selectedAnimal = selectedId
    ? STEP5_ANIMALS.find((a) => a.id === selectedId) ?? null
    : null;

  return (
    <section
      className="flex min-h-0 w-full flex-1 flex-col gap-4 px-4 sm:px-6 lg:px-10"
      aria-labelledby="step5-title"
    >
      <div className="shrink-0 text-center sm:text-left">
        <p className="font-serif text-sm font-medium uppercase tracking-widest text-rose-800/80">
          Chapter 5
        </p>
        <h2
          id="step5-title"
          className="mt-1 font-serif text-3xl font-bold text-rose-950"
        >
          Redesign Zoo City
        </h2>
        <p className="mt-2 max-w-prose font-serif text-base text-rose-950/85">
          This is the city shaped by earlier patterns — the same layout you explored. The update adds
          a <span className="font-semibold text-violet-800">Freelancer Hub</span> so the city can grow
          beyond old categories. Tap an animal to learn their story, then tap again to move them.
          Nothing is final until you choose Save.
        </p>
      </div>

      <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_min(22rem,100%)] xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div
          ref={viewportRef}
          className="relative h-[min(52vh,500px)] min-h-[300px] shrink-0 overflow-hidden rounded-2xl border-2 border-rose-200 bg-stone-900 shadow-inner lg:h-[500px]"
          onPointerDown={onPanPointerDown}
          onPointerMove={onPanPointerMove}
          onPointerUp={onPanPointerUp}
          onPointerCancel={onPanPointerUp}
        >
          <div className="pointer-events-auto absolute right-3 top-3 z-[40] flex gap-2" data-zoom-control>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={locked || saving || postSaveCelebration}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-200 bg-stone-900/90 font-serif text-lg font-bold text-white shadow-md backdrop-blur-sm enabled:hover:bg-stone-800 disabled:opacity-40"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP))}
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              disabled={locked || saving || postSaveCelebration}
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-rose-200 bg-stone-900/90 font-serif text-lg font-bold text-white shadow-md backdrop-blur-sm enabled:hover:bg-stone-800 disabled:opacity-40"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP))}
            >
              −
            </button>
          </div>

          <div
            className={[
              "flex h-full w-full touch-none items-center justify-center",
              postSaveCelebration
                ? "cursor-default brightness-110 contrast-[1.02]"
                : "cursor-grab active:cursor-grabbing",
            ].join(" ")}
            style={{
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: panning
                ? "none"
                : postSaveCelebration
                  ? "transform 0.1s ease-out, filter 0.8s ease-out"
                  : "transform 0.1s ease-out",
            }}
          >
            {mapLayer}
          </div>
          {ghost && drag ? (
            <Ghost animalId={drag.animalId} x={ghost.x} y={ghost.y} />
          ) : null}
        </div>

        <aside className="flex min-h-0 max-h-[min(85vh,780px)] flex-col rounded-2xl border-2 border-rose-200 bg-rose-50/90 shadow-sm">
          <div className="shrink-0 border-b border-rose-200/80 px-4 py-3">
            <p className="font-serif text-sm font-semibold text-rose-950">City update &amp; your choices</p>
            <p className="mt-1 font-serif text-xs leading-relaxed text-rose-800/85">
              Explore who lives where, listen to each voice, and redesign freely. Save only when you want
              this layout to count for the next chapter.
            </p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            {!selectedAnimal ? (
              <p className="font-serif text-base leading-relaxed text-rose-900/90">
                Tap an animal on the map to see their name, dream job, AI recommendation, and personal
                voice. Tap the same animal again to drag them to a new district — including the
                Freelancer Hub.
              </p>
            ) : (
              <SelectedAnimalDetail
                animal={selectedAnimal}
                currentDistrict={placements[selectedAnimal.id]}
                originalDistrict={originalDistrictForAnimal(
                  selectedAnimal.id,
                  selectedAnimal.aiRecommendation,
                )}
                locked={locked}
              />
            )}

            {feedback ? (
              <div
                role="status"
                aria-live="polite"
                className={[
                  "mt-4 rounded-2xl border-2 px-3 py-3 font-serif text-sm leading-relaxed",
                  feedbackStyles(feedback.variant),
                ].join(" ")}
              >
                {feedback.lines.map((line) => (
                  <p key={line} className="mb-1 last:mb-0">
                    {line}
                  </p>
                ))}
              </div>
            ) : null}

            {locked && !postSaveCelebration ? (
              <div className="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-center font-serif text-amber-950 shadow-sm">
                <p className="font-semibold">Your new city has been saved.</p>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-rose-200/80 p-4">
            <button
              type="button"
              disabled={locked || saving}
              onClick={() => void saveMyNewCity()}
              className="w-full rounded-xl border-2 border-rose-800 bg-rose-500 px-4 py-3 font-serif text-sm font-semibold text-white shadow-sm enabled:hover:bg-rose-400 disabled:opacity-40"
            >
              {saving ? "Saving…" : locked ? "City saved" : "Save My New City"}
            </button>
          </div>
        </aside>
      </div>

      {postSaveCelebration && celebrationHeadline ? (
        <Step5SaveCelebrationOverlay headline={celebrationHeadline} />
      ) : null}
    </section>
  );
}

function Ghost({ animalId, x, y }: { animalId: string; x: number; y: number }) {
  const animal = STEP5_ANIMALS.find((a) => a.id === animalId);
  if (!animal) return null;
  return (
    <div
      className="pointer-events-none fixed z-[200] w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-200 bg-white/95 p-0.5 shadow-xl"
      style={{ left: x, top: y }}
    >
      <Image
        src={animal.avatar}
        alt=""
        width={64}
        height={64}
        className="h-full w-full rounded-full object-cover"
        draggable={false}
      />
    </div>
  );
}

function SelectedAnimalDetail({
  animal,
  currentDistrict,
  originalDistrict,
  locked,
}: {
  animal: (typeof STEP5_ANIMALS)[number];
  currentDistrict: RedesignRegionId;
  originalDistrict: DistrictId;
  locked: boolean;
}) {
  const rec = animal.aiRecommendation;
  const jobs: JobId[] = ["artist", "community", "engineer", "manager"];
  const sorted = [...jobs].sort((a, b) => rec[b] - rec[a]);
  const regionLabel = STEP5_REGIONS.find((r) => r.id === currentDistrict)?.label ?? currentDistrict;
  const originLabel =
    STEP5_REGIONS.find((r) => r.id === originalDistrict)?.label ?? originalDistrict;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Image
          src={animal.avatar}
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-rose-200"
          draggable={false}
        />
        <div>
          <p className="font-serif text-lg font-bold text-rose-950">{animal.name}</p>
          <p className="font-serif text-xs text-rose-800/80">
            Step 3 starting place: {originLabel}
            {currentDistrict !== originalDistrict ? (
              <span className="font-medium text-rose-900"> · Now: {regionLabel}</span>
            ) : (
              <span> · Now: {regionLabel}</span>
            )}
          </p>
        </div>
      </div>
      <p className="font-serif text-sm text-rose-900">
        <span className="font-semibold">Dream job:</span> {JOB_DISPLAY[animal.dreamJob].title}
      </p>
      <div>
        <p className="mb-1 font-serif text-xs font-semibold uppercase tracking-wide text-rose-800/80">
          AI recommendation
        </p>
        <ul className="space-y-0.5 font-serif text-sm text-rose-900">
          {sorted.map((j) => (
            <li key={j}>
              {JOB_DISPLAY[j].title} {rec[j]}%
            </li>
          ))}
        </ul>
      </div>
      <p className="rounded-lg bg-white/80 p-2 font-serif text-sm italic text-rose-900/95 ring-1 ring-rose-100">
        Personal voice: “{animal.voice}”
      </p>
      <p className="font-serif text-sm font-medium text-violet-900">
        Where do YOU think {animal.name.split(" ")[0]} should go?
      </p>
      {!locked ? (
        <p className="rounded-lg border border-dashed border-amber-300/80 bg-amber-50/60 px-3 py-2 font-serif text-xs text-amber-950">
          Tap this animal on the map again, then drag to a district. Pan and zoom with the map
          controls.
        </p>
      ) : null}
    </div>
  );
}
