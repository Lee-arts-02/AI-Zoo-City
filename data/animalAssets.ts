/**
 * Zoo City — animal keys, display labels, images, and emoji (from `zooAnimalDataset`).
 */

import {
  type ZooCityAnimalKey,
  ZOO_ANIMAL_DATA,
} from "@/data/zooAnimalDataset";

export { ZOO_CITY_ANIMAL_IDS } from "@/data/zooAnimalDataset";
export type { ZooCityAnimalKey };

export type ZooCityAnimalId = ZooCityAnimalKey;

export const animalAssets: Record<
  ZooCityAnimalId,
  { label: string; image: string; emoji: string }
> = Object.fromEntries(
  ZOO_ANIMAL_DATA.map((a) => [
    a.key,
    { label: a.label, image: a.image, emoji: a.emoji },
  ]),
) as Record<ZooCityAnimalId, { label: string; image: string; emoji: string }>;

export function isZooCityAnimalId(s: string): s is ZooCityAnimalId {
  return s in animalAssets;
}
