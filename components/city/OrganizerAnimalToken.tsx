"use client";

import Image from "next/image";
import { animalAssets, type ZooCityAnimalId } from "@/data/animalAssets";
import {
  organizerDistrictChipClass,
  organizerNeutralChipClass,
} from "@/components/city/organizerDistrictStyles";
import type { DistrictId } from "@/types/city";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

const DISTRICT_SWATCHES: { id: DistrictId; short: string; className: string }[] = [
  { id: "artist", short: "A", className: "bg-rose-400 hover:ring-rose-300" },
  { id: "engineer", short: "E", className: "bg-sky-500 hover:ring-sky-300" },
  { id: "community", short: "C", className: "bg-emerald-500 hover:ring-emerald-300" },
  { id: "manager", short: "M", className: "bg-amber-500 hover:ring-amber-300" },
];

/** Matches min-w-[9rem] for initial horizontal placement. */
const MENU_W_PX = 144;

/** Above organizer panel chrome, resize handle, scene overlays. */
const MENU_Z = 10050;

export type OrganizerAnimalTokenProps = {
  instanceId: string;
  animal: ZooCityAnimalId;
  /** Learner-chosen district color; null = neutral (no district encoded). */
  assignedDistrict: DistrictId | null;
  onAssignDistrict: (district: DistrictId | null) => void;
};

export default function OrganizerAnimalToken({
  instanceId,
  animal,
  assignedDistrict,
  onAssignDistrict,
}: OrganizerAnimalTokenProps) {
  const asset = animalAssets[animal];
  const chipClass =
    assignedDistrict === null
      ? organizerNeutralChipClass()
      : organizerDistrictChipClass(assignedDistrict);

  const [pickerOpen, setPickerOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null);

  const computePosition = useCallback(() => {
    const btn = triggerRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const w = Math.max(MENU_W_PX, menuRef.current?.offsetWidth ?? MENU_W_PX);
    let left = rect.right - w;
    left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
    let top = rect.bottom + 4;
    const h = menuRef.current?.offsetHeight ?? 0;
    if (h > 0 && top + h > window.innerHeight - 8) {
      top = Math.max(8, rect.top - h - 4);
    }
    setMenuPos({ top, left });
  }, []);

  useLayoutEffect(() => {
    if (!pickerOpen) {
      setMenuPos(null);
      return;
    }
    computePosition();
    const id = requestAnimationFrame(() => computePosition());
    return () => cancelAnimationFrame(id);
  }, [pickerOpen, computePosition]);

  useLayoutEffect(() => {
    if (!pickerOpen || !menuPos) return;
    const menu = menuRef.current;
    const btn = triggerRef.current;
    if (!menu || !btn) return;
    const rect = btn.getBoundingClientRect();
    const h = menu.offsetHeight;
    let top = rect.bottom + 4;
    if (top + h > window.innerHeight - 8) {
      top = Math.max(8, rect.top - h - 4);
    }
    setMenuPos((prev) => (prev && prev.top !== top ? { ...prev, top } : prev));
  }, [pickerOpen, menuPos]);

  useEffect(() => {
    if (!pickerOpen) return;
    const onScrollOrResize = () => computePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [pickerOpen, computePosition]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setPickerOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [pickerOpen]);

  const menuContent = (
    <div
      ref={menuRef}
      id={`${menuId}-menu`}
      role="dialog"
      aria-label="District color"
      className="flex min-w-[9rem] flex-col gap-1 rounded-lg border border-stone-200 bg-white p-2 shadow-xl ring-1 ring-black/10"
      style={
        menuPos
          ? {
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              zIndex: MENU_Z,
            }
          : undefined
      }
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-stone-500">
        District (your guess)
      </p>
      <div className="flex flex-wrap gap-1">
        {DISTRICT_SWATCHES.map((d) => (
          <button
            key={d.id}
            type="button"
            draggable={false}
            onClick={() => {
              onAssignDistrict(d.id);
              setPickerOpen(false);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[0.65rem] font-bold text-white shadow ring-2 ring-transparent ${d.className} ${
              assignedDistrict === d.id ? "ring-stone-800" : ""
            }`}
            title={d.id}
          >
            {d.short}
          </button>
        ))}
      </div>
      <button
        type="button"
        draggable={false}
        onClick={() => {
          onAssignDistrict(null);
          setPickerOpen(false);
        }}
        className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 text-[0.65rem] text-stone-700 hover:bg-stone-100"
      >
        Clear (neutral)
      </button>
    </div>
  );

  return (
    <div
      ref={wrapRef}
      className={`relative z-20 flex w-max max-w-[14rem] select-none items-stretch gap-0.5 rounded-full border text-xs font-medium ${chipClass}`}
    >
      <div
        draggable
        data-organizer-token={instanceId}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", instanceId);
          e.dataTransfer.effectAllowed = "move";
          setPickerOpen(false);
        }}
        className="flex min-w-0 flex-1 cursor-grab items-center gap-1.5 rounded-l-full py-1 pl-2 pr-1 active:cursor-grabbing"
        title={asset.label}
      >
        <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-white/90 ring-1 ring-black/5">
          <Image
            src={asset.image}
            alt=""
            fill
            sizes="28px"
            className="object-contain p-0.5"
          />
        </span>
        <span className="max-w-[5rem] truncate">{asset.label}</span>
      </div>

      <div className="relative flex shrink-0 items-center pr-1">
        <button
          ref={triggerRef}
          type="button"
          draggable={false}
          id={`${menuId}-trigger`}
          aria-expanded={pickerOpen}
          aria-haspopup="dialog"
          aria-controls={pickerOpen ? `${menuId}-menu` : undefined}
          onClick={() => setPickerOpen((o) => !o)}
          className="relative z-30 rounded-full border border-stone-400/50 bg-white/90 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-stone-600 shadow-sm transition hover:bg-white hover:text-stone-900"
          title="Choose district color"
        >
          Color
        </button>

        {pickerOpen && menuPos && typeof document !== "undefined"
          ? createPortal(menuContent, document.body)
          : null}
      </div>
    </div>
  );
}
