"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const ZOOM_MIN = 0.55;
const ZOOM_MAX = 2.4;
const ZOOM_STEP = 0.18;

export type DemoStageViewportProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Fixed-size stage: zoom / pan do not affect sibling layout. Content scales inside a clipping viewport.
 */
export function DemoStageViewport({ children, className = "" }: DemoStageViewportProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const drag = useRef<{
    active: boolean;
    px: number;
    py: number;
    startPan: { x: number; y: number };
  } | null>(null);

  const clampZoom = useCallback((z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z)), []);

  const onWheel = useCallback(
    (e: WheelEvent<HTMLDivElement>) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => clampZoom(z + delta));
    },
    [clampZoom],
  );

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      active: true,
      px: e.clientX,
      py: e.clientY,
      startPan: { ...panRef.current },
    };
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d?.active) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    setPan({ x: d.startPan.x + dx, y: d.startPan.y + dy });
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    drag.current = null;
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/80 bg-violet-950/90 font-serif text-lg font-bold text-violet-100 shadow-sm transition hover:bg-violet-800/95 hover:text-white";

  return (
    <div
      className={`relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border-2 border-violet-400/50 bg-violet-950/40 ${className}`}
    >
      <div className="pointer-events-none absolute right-2 top-2 z-20 flex flex-col gap-1">
        <div className="pointer-events-auto flex gap-1 rounded-lg bg-stone-950/75 p-1 shadow-md backdrop-blur-sm">
          <button type="button" className={btn} aria-label="Zoom in" onClick={() => setZoom((z) => clampZoom(z + ZOOM_STEP))}>
            +
          </button>
          <button type="button" className={btn} aria-label="Zoom out" onClick={() => setZoom((z) => clampZoom(z - ZOOM_STEP))}>
            −
          </button>
          <button type="button" className={`${btn} w-auto px-2 text-xs font-semibold`} onClick={resetView}>
            Reset
          </button>
        </div>
      </div>
      <p className="pointer-events-none absolute left-2 top-2 z-20 max-w-[11rem] rounded-md bg-stone-950/60 px-2 py-1 font-serif text-[10px] leading-snug text-violet-100/90 backdrop-blur-sm sm:text-xs">
        Drag to pan · scroll or +/− to zoom
      </p>
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <div
          className="absolute left-1/2 top-1/2 h-full w-full cursor-grab touch-none active:cursor-grabbing"
          style={{
            transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div className="flex h-full min-h-[280px] w-full items-center justify-center px-2 py-4 sm:min-h-[320px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
