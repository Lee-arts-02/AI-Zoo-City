"use client";

export type OrganizerToggleProps = {
  open: boolean;
  onToggle: () => void;
};

/** Entry control for the two-axis organizer — sits on the district scene overlay (not fixed to viewport). */
export default function OrganizerToggle({ open, onToggle }: OrganizerToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="pointer-events-auto absolute top-3 left-3 z-[45] max-w-[min(14rem,calc(100%-1.5rem))] rounded-2xl border border-teal-700/35 bg-teal-600/92 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-teal-500/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 sm:top-4 sm:left-4"
      aria-expanded={open}
    >
      {open ? "Hide sorting space" : "Open sorting space"}
      <span className="mt-1 block text-xs font-normal text-teal-100/95">
        Think: small ↔ large, plant-eater ↔ meat-eater
      </span>
    </button>
  );
}
