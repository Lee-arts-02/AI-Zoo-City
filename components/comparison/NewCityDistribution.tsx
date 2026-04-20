"use client";

import { districtConfig } from "@/data/districtConfig";
import type { DistrictId } from "@/types/city";

export type NewCityDistributionProps = {
  title: string;
  subtitle?: string;
  counts: Record<DistrictId, number>;
  max: number;
  variant: "before" | "after";
};

export function NewCityDistribution({
  title,
  subtitle,
  counts,
  max,
  variant,
}: NewCityDistributionProps) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 shadow-sm ${
        variant === "after"
          ? "border-amber-200/90 bg-gradient-to-br from-amber-50 to-white"
          : "border-stone-200/90 bg-stone-50/80"
      }`}
    >
      <h3 className="font-serif text-lg font-bold text-amber-950">{title}</h3>
      {subtitle ? (
        <p className="mt-1 font-serif text-sm text-amber-900/75">{subtitle}</p>
      ) : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {districtConfig.map((d) => {
          const n = counts[d.id];
          const pct = max > 0 ? Math.round((n / max) * 100) : 0;
          return (
            <div key={d.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`font-serif text-sm font-semibold ${d.textClass}`}>
                  {d.shortLabel}
                </span>
                <span className="font-serif text-sm tabular-nums text-amber-950/90">
                  {n} animals
                </span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-stone-200/80">
                <div
                  className={`h-full rounded-full transition-all ${d.colorClass}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
