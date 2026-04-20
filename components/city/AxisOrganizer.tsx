"use client";

import OrganizerAnimalToken from "@/components/city/OrganizerAnimalToken";
import OrganizerColorLegend from "@/components/city/OrganizerColorLegend";
import OrganizerQuadrant, {
  type OrganizerQuadrantId,
} from "@/components/city/OrganizerQuadrant";
import OrganizerScatterMarkers from "@/components/city/OrganizerScatterMarkers";
import { buildOrganizerRevealScatter } from "@/data/organizerRevealScatter";
import type { OrganizerTokenDef } from "@/data/organizerTokens";
import type { DistrictId } from "@/types/city";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SCATTER_SEED = 982_451;
const SIZE_STORAGE_KEY = "zoo-city-step3-organizer-size";
const MIN_W = 300;
const MIN_H = 320;
const MAX_W = 900;
const MAX_H = 720;
const DEFAULT_W = 560;
const DEFAULT_H = 640;

export type OrganizerSlotId = OrganizerQuadrantId | "bank";

export type AxisOrganizerProps = {
  open: boolean;
  onClose: () => void;
  starterTokens: OrganizerTokenDef[];
  placements: Record<string, OrganizerSlotId>;
  setPlacements: Dispatch<SetStateAction<Record<string, OrganizerSlotId>>>;
  /** Learner-assigned district per token (null = neutral white token). */
  learnerDistrictColors: Record<string, DistrictId | null>;
  setLearnerDistrictColors: Dispatch<SetStateAction<Record<string, DistrictId | null>>>;
  visitedDistricts: DistrictId[];
  revealActivated: boolean;
  /** After reveal: show or hide learner tokens without clearing placements. */
  learnerSortingVisible: boolean;
  setLearnerSortingVisible: Dispatch<SetStateAction<boolean>>;
  sortingMachineUnlocked: boolean;
};

function tokensInSlot(
  defs: OrganizerTokenDef[],
  placements: Record<string, OrganizerSlotId>,
  slot: OrganizerSlotId
) {
  return defs.filter((t) => placements[t.instanceId] === slot);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export default function AxisOrganizer({
  open,
  onClose,
  starterTokens,
  placements,
  setPlacements,
  learnerDistrictColors,
  setLearnerDistrictColors,
  visitedDistricts,
  revealActivated,
  learnerSortingVisible,
  setLearnerSortingVisible,
  sortingMachineUnlocked,
}: AxisOrganizerProps) {
  const [panelW, setPanelW] = useState(DEFAULT_W);
  const [panelH, setPanelH] = useState(DEFAULT_H);
  const liveSizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H });
  const resizeHandleRef = useRef<HTMLButtonElement | null>(null);
  const resizeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(SIZE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { w?: number; h?: number };
      if (typeof parsed.w === "number") setPanelW(clamp(parsed.w, MIN_W, MAX_W));
      if (typeof parsed.h === "number") setPanelH(clamp(parsed.h, MIN_H, MAX_H));
    } catch {
      /* ignore */
    }
  }, []);

  const persistSize = useCallback((w: number, h: number) => {
    try {
      sessionStorage.setItem(SIZE_STORAGE_KEY, JSON.stringify({ w, h }));
    } catch {
      /* ignore */
    }
  }, []);

  const scatter = useMemo(() => buildOrganizerRevealScatter(SCATTER_SEED), []);

  const onResizePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startW: liveSizeRef.current.w,
      startH: liveSizeRef.current.h,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    liveSizeRef.current = { w: panelW, h: panelH };
  }, [panelW, panelH]);

  useEffect(() => {
    if (!open) return;

    const onMove = (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r || e.pointerId !== r.pointerId) return;
      const dw = e.clientX - r.startX;
      const dh = e.clientY - r.startY;
      const nw = clamp(r.startW + dw, MIN_W, MAX_W);
      const nh = clamp(r.startH + dh, MIN_H, MAX_H);
      liveSizeRef.current = { w: nw, h: nh };
      setPanelW(nw);
      setPanelH(nh);
    };

    const onUp = (e: PointerEvent) => {
      const r = resizeRef.current;
      if (!r || e.pointerId !== r.pointerId) return;
      resizeRef.current = null;
      const handle = resizeHandleRef.current;
      try {
        handle?.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const { w, h } = liveSizeRef.current;
      persistSize(w, h);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [open, persistSize]);

  const assignDistrict = useCallback(
    (instanceId: string, district: DistrictId | null) => {
      setLearnerDistrictColors((prev) => ({ ...prev, [instanceId]: district }));
    },
    [setLearnerDistrictColors]
  );

  if (!open) return null;

  const uniqueVisited = visitedDistricts.length;

  function moveToken(instanceId: string, slot: OrganizerSlotId) {
    setPlacements((prev) => ({ ...prev, [instanceId]: slot }));
  }

  const bankDropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      if (id) moveToken(id, "bank");
    },
  };

  const quadrants = [
    ["HL", "Herbivore · large"] as const,
    ["HR", "Carnivore · large"] as const,
    ["SL", "Herbivore · small"] as const,
    ["SR", "Carnivore · small"] as const,
  ] as const;

  const renderToken = (t: OrganizerTokenDef) => (
    <OrganizerAnimalToken
      key={t.instanceId}
      instanceId={t.instanceId}
      animal={t.animal}
      assignedDistrict={learnerDistrictColors[t.instanceId] ?? null}
      onAssignDistrict={(d) => assignDistrict(t.instanceId, d)}
    />
  );

  return (
    <div
      className="pointer-events-auto absolute bottom-5 left-3 z-30 flex max-h-[min(78vh,720px)] max-w-[min(calc(100%-1.5rem),900px)] flex-col overflow-hidden rounded-2xl border border-teal-800/25 bg-white/72 shadow-2xl backdrop-blur-md sm:bottom-7 sm:left-5"
      style={{
        width: panelW,
        height: panelH,
      }}
      role="dialog"
      aria-label="Two-axis animal organizer"
    >
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-teal-900/10 px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-xs font-semibold text-teal-950 sm:text-sm">Sorting space</p>
        </div>
        <div className="hidden shrink-0 sm:block sm:scale-95">
          <OrganizerColorLegend />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-teal-800 hover:bg-teal-100/80"
        >
          Close
        </button>
      </div>

      <div className="border-b border-teal-900/5 px-3 py-2 sm:hidden">
        <OrganizerColorLegend />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-10 pt-2">
        <p className="text-center text-[0.7rem] font-semibold uppercase tracking-wide text-stone-600">
          Large
        </p>
        <div className="mt-1 flex gap-1.5">
          <p className="w-11 shrink-0 self-center text-right text-[0.65rem] font-semibold leading-tight text-stone-600 sm:w-12">
            Herbivore
          </p>
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
            {quadrants.map(([qid, title]) => {
              const dots = revealActivated
                ? scatter.dots.filter((d) => d.quadrant === qid)
                : [];
              const icons = revealActivated
                ? scatter.icons.filter((i) => i.quadrant === qid)
                : [];
              return (
                <OrganizerQuadrant
                  key={qid}
                  id={qid}
                  title={title}
                  onDropToken={(instanceId) => moveToken(instanceId, qid)}
                  scatterBehind={
                    revealActivated ? (
                      <OrganizerScatterMarkers dots={dots} icons={icons} />
                    ) : undefined
                  }
                >
                  {learnerSortingVisible
                    ? tokensInSlot(starterTokens, placements, qid).map(renderToken)
                    : null}
                </OrganizerQuadrant>
              );
            })}
          </div>
          <p className="w-11 shrink-0 self-center text-[0.65rem] font-semibold leading-tight text-stone-600 sm:w-12">
            Carnivore
          </p>
        </div>
        <p className="mt-1 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-stone-600">
          Small
        </p>

        <div
          className="mt-3 rounded-xl border border-dashed border-stone-400/60 bg-stone-50/55 px-2 py-2"
          {...bankDropHandlers}
        >
          <p className="text-center text-[0.6rem] font-medium text-stone-500">Bank</p>
          <div className="relative z-10 mt-2 flex flex-wrap justify-center gap-1.5">
            {learnerSortingVisible
              ? tokensInSlot(starterTokens, placements, "bank").map(renderToken)
              : null}
          </div>
        </div>

        {revealActivated ? (
          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => setLearnerSortingVisible((v) => !v)}
              className="w-full rounded-xl border border-stone-400/80 bg-white/90 px-3 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50"
            >
              {learnerSortingVisible ? "Hide my sorting" : "Show my sorting"}
            </button>
          </div>
        ) : null}

        {sortingMachineUnlocked ? (
          <div className="mt-2 rounded-lg bg-teal-50/80 px-2 py-1.5 text-center text-[0.65rem] text-teal-900">
            Map: City Sorting Machine ready
          </div>
        ) : !revealActivated && uniqueVisited < 3 ? (
          <div className="mt-2 text-center text-[0.6rem] text-stone-500">
            {uniqueVisited}/3 districts
          </div>
        ) : null}
      </div>

      <button
        ref={resizeHandleRef}
        type="button"
        aria-label="Resize organizer panel"
        onPointerDown={onResizePointerDown}
        className="absolute bottom-1 right-1 z-[50] h-4 w-4 cursor-nwse-resize rounded-sm border border-teal-700/40 bg-teal-200/90 shadow touch-none hover:bg-teal-300/95"
      />
    </div>
  );
}
