"use client";

const ROWS = [
  { swatch: "bg-rose-400", label: "Artist District" },
  { swatch: "bg-sky-500", label: "Engineer Quarter" },
  { swatch: "bg-emerald-500", label: "Community Support" },
  { swatch: "bg-amber-500", label: "Manager Center" },
] as const;

export default function OrganizerColorLegend() {
  return (
    <div
      className="rounded-lg border border-stone-200/80 bg-white/60 px-2 py-1.5 text-[0.65rem] text-stone-700 shadow-sm"
      aria-label="District colors on the map"
    >
      <p className="mb-1 font-semibold uppercase tracking-wide text-stone-600">District colors</p>
      <ul className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-1">
        {ROWS.map((r) => (
          <li key={r.label} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.swatch} ring-1 ring-black/10`} />
            <span className="leading-tight">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
