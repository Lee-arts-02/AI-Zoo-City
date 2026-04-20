import { STEP5_ANIMALS_BY_ID } from "@/data/step5Animals";
import {
  avatarPositionInTile,
  DISTRICT_IMAGE,
  GRID_DISTRICT_ORDER,
  slotIndexInBoardRegion,
} from "@/lib/districtBoardLayout";
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

const W = 1200;
const H = 780;
const GAP = 12;
const HUB_H = 120;
const PAD = 16;
const gridTop = PAD;
const gridH = H - HUB_H - GAP - 2 * PAD;
const cellW = (W - 2 * PAD - GAP) / 2;
const cellH = (gridH - GAP) / 2;

function cellRect(index: number): { x: number; y: number; w: number; h: number } {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    x: PAD + col * (cellW + GAP),
    y: gridTop + row * (cellH + GAP),
    w: cellW,
    h: cellH,
  };
}

/**
 * Raster snapshot of the district image board + animals (before/after city for progress).
 */
export async function captureDistrictBoardDataUrl(
  placements: Record<string, RedesignRegionId> | null,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");
  const g = ctx;

  g.fillStyle = "#faf8f5";
  g.fillRect(0, 0, W, H);

  for (let i = 0; i < GRID_DISTRICT_ORDER.length; i++) {
    const id = GRID_DISTRICT_ORDER[i]!;
    const r = cellRect(i);
    try {
      const img = await loadImage(absoluteUrl(DISTRICT_IMAGE[id]));
      g.drawImage(img, r.x, r.y, r.w, r.h);
    } catch {
      g.fillStyle = "#e7e5e4";
      g.fillRect(r.x, r.y, r.w, r.h);
    }
    g.strokeStyle = "rgba(120,53,15,0.12)";
    g.lineWidth = 2;
    g.strokeRect(r.x, r.y, r.w, r.h);
  }

  const hubY = gridTop + gridH + GAP;
  const hubW = W - 2 * PAD;
  const hubX = PAD;
  const grd = g.createLinearGradient(hubX, hubY, hubX + hubW, hubY + HUB_H);
  grd.addColorStop(0, "rgba(167,139,250,0.35)");
  grd.addColorStop(1, "rgba(139,92,246,0.25)");
  g.fillStyle = grd;
  g.fillRect(hubX, hubY, hubW, HUB_H);
  g.strokeStyle = "rgba(109,40,217,0.35)";
  g.lineWidth = 2;
  g.strokeRect(hubX, hubY, hubW, HUB_H);
  g.fillStyle = "rgba(76,29,149,0.9)";
  g.font = "600 18px Georgia, serif";
  g.fillText("Freelancer Hub", hubX + 14, hubY + 28);

  if (placements && Object.keys(placements).length > 0) {
    const layout = placements;
    const avatarPx = 44;

    async function drawInCell(
      district: (typeof GRID_DISTRICT_ORDER)[number],
      cellIndex: number,
    ) {
      const rect = cellRect(cellIndex);
      const inRegion = Object.entries(layout)
        .filter(([, reg]) => reg === district)
        .map(([id]) => id)
        .sort((a, b) => a.localeCompare(b));
      for (const animalId of inRegion) {
        const animal = STEP5_ANIMALS_BY_ID[animalId];
        if (!animal) continue;
        const slot = slotIndexInBoardRegion(animalId, district, layout);
        const total = inRegion.length;
        const { leftPct, topPct } = avatarPositionInTile(district, slot, total);
        const cx = rect.x + (leftPct / 100) * rect.w;
        const cy = rect.y + (topPct / 100) * rect.h;
        try {
          const aimg = await loadImage(absoluteUrl(animal.avatar));
          g.save();
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.clip();
          g.drawImage(
            aimg,
            cx - avatarPx / 2,
            cy - avatarPx / 2,
            avatarPx,
            avatarPx,
          );
          g.restore();
          g.strokeStyle = "rgba(255,255,255,0.95)";
          g.lineWidth = 2;
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.stroke();
        } catch {
          g.fillStyle = "rgba(255,255,255,0.9)";
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    async function drawFreelancerHub() {
      const inHub = Object.entries(layout)
        .filter(([, reg]) => reg === "freelancer")
        .map(([id]) => id)
        .sort((a, b) => a.localeCompare(b));
      const n = inHub.length;
      let i = 0;
      for (const animalId of inHub) {
        const animal = STEP5_ANIMALS_BY_ID[animalId];
        if (!animal) continue;
        const t = i / Math.max(1, n - 1 || 1);
        const cx = hubX + 80 + t * (hubW - 160);
        const cy = hubY + HUB_H / 2 + 8;
        try {
          const aimg = await loadImage(absoluteUrl(animal.avatar));
          g.save();
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.clip();
          g.drawImage(
            aimg,
            cx - avatarPx / 2,
            cy - avatarPx / 2,
            avatarPx,
            avatarPx,
          );
          g.restore();
          g.strokeStyle = "rgba(255,255,255,0.95)";
          g.lineWidth = 2;
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.stroke();
        } catch {
          g.fillStyle = "rgba(255,255,255,0.9)";
          g.beginPath();
          g.arc(cx, cy, avatarPx / 2, 0, Math.PI * 2);
          g.fill();
        }
        i += 1;
      }
    }

    for (let i = 0; i < GRID_DISTRICT_ORDER.length; i++) {
      await drawInCell(GRID_DISTRICT_ORDER[i]!, i);
    }
    await drawFreelancerHub();
  }

  return canvas.toDataURL("image/png");
}
