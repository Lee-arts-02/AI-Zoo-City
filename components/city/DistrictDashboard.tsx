"use client";

import Image from "next/image";
import { getDistrictConfig } from "@/data/districtConfig";
import { animalAssets, isZooCityAnimalId } from "@/data/animalAssets";
import { getDistrictPercentages, getTopAnimals } from "@/lib/cityUtils";
import type { DistrictId } from "@/types/city";

export type DistrictDashboardProps = {
  districtId: DistrictId;
  className?: string;
};

export default function DistrictDashboard({ districtId, className = "" }: DistrictDashboardProps) {
  const district = getDistrictConfig(districtId);
  const rows = getDistrictPercentages(districtId);
  const topAnimals = getTopAnimals(districtId, 3);

  return (
    <div
      className={`flex h-full max-h-full min-h-0 w-full flex-col overflow-hidden rounded-l-2xl border border-white/40 bg-white/25 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div
        id="district-dashboard-scroll"
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-5 py-5 sm:px-6 sm:py-6"
      >
        <div className="flex flex-col gap-5 pb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-700/90">
              District snapshot
            </p>
            <h3 className={`mt-1 font-serif text-2xl font-bold ${district.textClass} drop-shadow-sm`}>
              {district.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-800/95">
              {district.dashboardDescription}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-700/90">
              Distribution (by headcount)
            </p>
            <ul className="mt-3 space-y-3">
              {rows.map((row) => (
                <li key={row.animal}>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-stone-900">
                    <span>
                      {isZooCityAnimalId(row.animal)
                        ? animalAssets[row.animal].label
                        : row.animal}
                    </span>
                    <span>{row.percentage}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-900/10">
                    <div
                      className={`h-full rounded-full ${district.colorClass}`}
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-700/90">
              Top animals here
            </p>
            <ul className="mt-3 flex flex-wrap gap-6">
              {topAnimals.map((item) => {
                if (!isZooCityAnimalId(item.animal)) return null;
                const asset = animalAssets[item.animal];
                return (
                  <li key={item.animal} className="flex flex-col items-center gap-1.5 text-center">
                    <Image
                      src={asset.image}
                      alt={asset.label}
                      width={64}
                      height={64}
                      className="object-contain [filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.2))]"
                    />
                    <span className="max-w-[6rem] text-xs font-medium text-stone-900">
                      {asset.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
