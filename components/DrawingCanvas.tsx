"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Internal drawing resolution (display scales via CSS). */
export const DRAWING_CANVAS_WIDTH = 500;
export const DRAWING_CANVAS_HEIGHT = 360;

const COLORS = [
  "#1a1a1a",
  "#c0392b",
  "#2980b9",
  "#27ae60",
  "#e67e22",
  "#8e44ad",
] as const;

export type DrawingCanvasProps = {
  /** Applied once when the component mounts (avoids feedback loops with onChange). */
  initialData: string | null;
  /** Latest PNG data URL, or null after a full clear. */
  onChange: (dataUrl: string | null) => void;
  variant: "step1" | "step7";
  /** Step 7 only: advances the story when the learner taps Done. */
  onDone?: (dataUrl: string) => void;
  className?: string;
};

/**
 * Simple brush / eraser canvas with preset colors, undo, and clear.
 * Pointer events for mouse + touch.
 */
export function DrawingCanvas({
  initialData,
  onChange,
  variant,
  onDone,
  className = "",
}: DrawingCanvasProps) {
  const [frozenInitial] = useState(() => initialData);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"draw" | "erase">("draw");
  const [color, setColor] = useState<string>(COLORS[0]);
  const [history, setHistory] = useState<ImageData[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const hydratedRef = useRef(false);

  const W = DRAWING_CANVAS_WIDTH;
  const H = DRAWING_CANVAS_HEIGHT;

  const pushHistory = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, W, H);
    setHistory((h) => [...h.slice(-24), snap]);
  }, [W, H]);

  const exportPng = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return null;
    return c.toDataURL("image/png");
  }, []);

  const emitChange = useCallback(() => {
    const url = exportPng();
    if (!url) return;
    onChange(url);
  }, [exportPng, onChange]);

  /** One-time hydrate from Step 1 / Step 7 initial snapshot. */
  useEffect(() => {
    const c = canvasRef.current;
    if (!c || hydratedRef.current) return;
    hydratedRef.current = true;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const finishWhite = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const snap = ctx.getImageData(0, 0, W, H);
      setHistory([snap]);
    };

    if (!frozenInitial) {
      finishWhite();
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.min(W / iw, H / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (W - dw) / 2;
      const dy = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      const snap = ctx.getImageData(0, 0, W, H);
      setHistory([snap]);
    };
    img.onerror = () => {
      if (cancelled) return;
      finishWhite();
    };
    img.src = frozenInitial;
    return () => {
      cancelled = true;
      // Strict Mode re-runs effects; allow the next run to hydrate again.
      hydratedRef.current = false;
    };
  }, [W, H, frozenInitial]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    const scaleX = W / r.width;
    const scaleY = H / r.height;
    return {
      x: (e.clientX - r.left) * scaleX,
      y: (e.clientY - r.top) * scaleY,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pos(e);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.save();
    if (mode === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.restore();
    last.current = p;
  };

  const endStroke = () => {
    if (drawing.current) {
      drawing.current = false;
      last.current = null;
      pushHistory();
      emitChange();
    }
  };

  const undo = () => {
    const c = canvasRef.current;
    if (!c || history.length < 2) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const prevStack = history.slice(0, -1);
    const prev = prevStack[prevStack.length - 1];
    setHistory(prevStack);
    if (prev) ctx.putImageData(prev, 0, 0);
    emitChange();
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    const snap = ctx.getImageData(0, 0, W, H);
    setHistory([snap]);
    onChange(null);
  };

  const done = () => {
    const c = canvasRef.current;
    if (!c || !onDone) return;
    onDone(c.toDataURL("image/png"));
  };

  const clearLabel = variant === "step7" ? "Clear all" : "Clear";

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-xs uppercase tracking-wider text-stone-600">
          Tool
        </span>
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={[
            "rounded-xl border px-3 py-1.5 font-serif text-sm",
            mode === "draw"
              ? "border-amber-700 bg-amber-100 text-amber-950"
              : "border-stone-200 bg-white text-stone-700",
          ].join(" ")}
        >
          Brush
        </button>
        <button
          type="button"
          onClick={() => setMode("erase")}
          className={[
            "rounded-xl border px-3 py-1.5 font-serif text-sm",
            mode === "erase"
              ? "border-amber-700 bg-amber-100 text-amber-950"
              : "border-stone-200 bg-white text-stone-700",
          ].join(" ")}
        >
          Eraser
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-serif text-xs uppercase tracking-wider text-stone-600">
          Colors
        </span>
        {COLORS.map((hex) => (
          <button
            key={hex}
            type="button"
            aria-label={`Color ${hex}`}
            onClick={() => {
              setMode("draw");
              setColor(hex);
            }}
            className={[
              "h-8 w-8 rounded-full border-2 shadow-sm transition",
              color === hex && mode === "draw"
                ? "border-amber-800 ring-2 ring-amber-400"
                : "border-stone-300",
            ].join(" ")}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        className="touch-none rounded-xl border-2 border-amber-200/90 bg-white shadow-inner"
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "560px",
          aspectRatio: `${W} / ${H}`,
        }}
      />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={undo}
          disabled={history.length < 2}
          className="rounded-2xl border border-stone-300 bg-white px-4 py-2 font-serif text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-2xl border border-stone-300 bg-white px-4 py-2 font-serif text-sm font-semibold text-stone-800 shadow-sm hover:bg-stone-50"
        >
          {clearLabel}
        </button>
        {variant === "step7" && onDone ? (
          <button
            type="button"
            onClick={done}
            className="rounded-2xl border-2 border-amber-800 bg-amber-400 px-5 py-2 font-serif text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-300"
          >
            Done
          </button>
        ) : null}
      </div>
    </div>
  );
}
