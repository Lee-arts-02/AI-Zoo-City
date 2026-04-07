import { STEP5_ANIMALS_BY_ID } from "@/data/step5Animals";
import { STEP5_REGIONS } from "@/data/step5Regions";
import { slotCenterPercent, slotIndexInRegion } from "@/lib/step5Layout";
import type { RedesignRegionId } from "@/types/city";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Renders a full-size map PNG to a data URL (optional animal tokens).
 */
export async function captureMapDataUrl(
  mapSrc: string,
  placements: Record<string, RedesignRegionId> | null,
): Promise<string> {
  const base = await loadImage(absoluteUrl(mapSrc));
  const w = base.naturalWidth || base.width;
  const h = base.naturalHeight || base.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  ctx.drawImage(base, 0, 0, w, h);

  if (placements && Object.keys(placements).length > 0) {
    const avatarSize = Math.round(w * 0.042);
    for (const [animalId, region] of Object.entries(placements)) {
      const animal = STEP5_ANIMALS_BY_ID[animalId];
      if (!animal) continue;
      const slot = slotIndexInRegion(animalId, region, placements);
      const total = Object.values(placements).filter((r) => r === region).length;
      const { x, y } = slotCenterPercent(region, slot, total);
      const cx = (x / 100) * w;
      const cy = (y / 100) * h;
      try {
        const aimg = await loadImage(absoluteUrl(animal.avatar));
        ctx.drawImage(aimg, cx - avatarSize / 2, cy - avatarSize / 2, avatarSize, avatarSize);
      } catch {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,80,40,0.6)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  return canvas.toDataURL("image/png");
}
