"use client";

import Image from "next/image";
import { getDistrictConfig } from "@/data/districtConfig";
import { animalAssets, isZooCityAnimalId } from "@/data/animalAssets";
import { getDistrictPercentages, getTopAnimals } from "@/lib/cityUtils";
import { animalTraits } from "@/data/animalTraits";
import type { DistrictId } from "@/types/city";
import type { ZooCityAnimalId } from "@/data/animalAssets";
import { useEffect, useState } from "react";

export type DistrictDashboardProps = {
  districtId: DistrictId;
  className?: string;
};

export default function DistrictDashboard({ districtId, className = "" }: DistrictDashboardProps) {
  const district = getDistrictConfig(districtId);
  const rows = getDistrictPercentages(districtId);
  const topAnimals = getTopAnimals(districtId, 3);
  const [selectedAnimal, setSelectedAnimal] = useState<ZooCityAnimalId | null>(null);
  const selectedAsset = selectedAnimal ? animalAssets[selectedAnimal] : null;
  const selectedFeatures = selectedAnimal ? animalTraits[selectedAnimal] : null;

  useEffect(() => {
    setSelectedAnimal(null);
  }, [districtId]);

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
              Animals placed here
            </p>
            <ul className="mt-3 space-y-3">
              {rows.map((row) => (
                <li key={row.animal}>
                  {isZooCityAnimalId(row.animal) ? (
                    <button
                      type="button"
                      onClick={() => setSelectedAnimal(row.animal)}
                      className="w-full rounded-xl border border-white/40 bg-white/35 px-3 py-2 text-left shadow-sm transition hover:bg-white/55"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-medium text-stone-900">
                        <span>{animalAssets[row.animal].emoji} {animalAssets[row.animal].label}</span>
                        <span className="text-xs text-stone-700">{row.count} animals</span>
                      </div>
                      <p className="mt-1 text-xs text-stone-700">
                        Size: {formatFeature(animalTraits[row.animal].size)} · Diet: {formatFeature(animalTraits[row.animal].diet)}
                      </p>
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {selectedAsset && selectedFeatures ? (
            <div className="rounded-2xl border border-white/50 bg-white/50 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-700/90">
                Animal observation
              </p>
              <p className="mt-2 text-lg font-bold text-stone-950">
                {selectedAsset.emoji} {selectedAsset.label}
              </p>
              <dl className="mt-3 space-y-1.5 text-sm text-stone-900">
                <InfoRow label="Size" value={formatFeature(selectedFeatures.size)} />
                <InfoRow label="Diet" value={formatFeature(selectedFeatures.diet)} />
                <InfoRow label="Placed in" value={district.title} />
              </dl>
            </div>
          ) : null}

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

function formatFeature(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-stone-700">{label}</dt>
      <dd className="text-right font-semibold">{value}</dd>
    </div>
  );
}
