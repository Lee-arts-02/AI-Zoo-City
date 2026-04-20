"use client";

export type OrganizerToggleProps = {
  open: boolean;
  onToggle: () => void;
};

/** Compact entry control on the district scene overlay (copy lives in robot dialogue). */
export default function OrganizerToggle({ open, onToggle }: OrganizerToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="pointer-events-auto absolute top-3 left-3 z-[45] max-w-[9.5rem] rounded-xl border border-teal-700/40 bg-teal-600/92 px-2.5 py-1.5 text-left text-[0.7rem] font-semibold leading-tight text-white shadow-md backdrop-blur-sm transition hover:bg-teal-500/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300 sm:top-4 sm:left-4 sm:max-w-[10rem] sm:px-3 sm:py-2 sm:text-xs"
      aria-expanded={open}
    >
      {open ? "Hide sorting space" : "Sorting space"}
    </button>
  );
}
