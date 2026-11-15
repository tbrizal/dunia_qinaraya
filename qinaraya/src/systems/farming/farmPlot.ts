import { getCropDef } from "../../data/crops.ts";

/**
 * Logic petak kebun yang murni. Pertumbuhan dihitung dari selisih waktu Game Clock
 * (menit game absolut), bukan timer per tanaman. Tanaman tidak pernah mati atau layu:
 * tanah kering hanya menjeda pertumbuhan, dan waktu dunia tidak berjalan saat game ditutup.
 */

export type PlotStatus = "empty" | "tilled" | "planted" | "growing" | "harvestable";

export const PLOT_STATUSES: readonly PlotStatus[] = ["empty", "tilled", "planted", "growing", "harvestable"];

export interface FarmPlot {
  id: string;
  status: PlotStatus;
  cropId: string | null;
  /** Menit game basah yang sudah terkumpul. */
  growthMinutes: number;
  /** Menit game absolut saat tanah mengering. 0 berarti kering. */
  wetUntil: number;
  /** Menit game absolut terakhir pertumbuhan dihitung. */
  lastSync: number;
}

export function createPlot(id: string): FarmPlot {
  return { id, status: "empty", cropId: null, growthMinutes: 0, wetUntil: 0, lastSync: 0 };
}

/** Setelah syncPlot, wetUntil 0 berarti kering. */
export function isWet(plot: FarmPlot): boolean {
  return plot.wetUntil > 0;
}

export function isGrowing(plot: FarmPlot): boolean {
  return plot.status === "planted" || plot.status === "growing";
}

/** 0..1. 0 untuk petak tanpa tanaman. */
export function getGrowthProgress(plot: FarmPlot): number {
  if (!plot.cropId) return 0;
  const crop = getCropDef(plot.cropId);
  if (!crop) return 0;
  return Math.min(1, plot.growthMinutes / crop.growthMinutes);
}

/**
 * Membawa petak ke waktu `now`. Aman dipanggil berulang dan untuk lompatan waktu besar.
 * Mengembalikan objek yang sama bila tidak ada perubahan (menghindari render berlebih).
 */
export function syncPlot(plot: FarmPlot, now: number): FarmPlot {
  let next = plot;

  if (isGrowing(plot)) {
    const crop = plot.cropId ? getCropDef(plot.cropId) : undefined;
    if (crop && now > plot.lastSync) {
      const wetMinutes = Math.max(0, Math.min(now, plot.wetUntil) - plot.lastSync);
      const growth = Math.min(crop.growthMinutes, plot.growthMinutes + wetMinutes);
      const status: PlotStatus = growth >= crop.growthMinutes ? "harvestable" : growth > 0 ? "growing" : "planted";
      next = { ...plot, growthMinutes: growth, status, lastSync: now };
    }
  }

  if (next.wetUntil > 0 && now >= next.wetUntil) next = { ...next, wetUntil: 0 };
  return next;
}

export function tillPlot(plot: FarmPlot): FarmPlot | null {
  if (plot.status !== "empty") return null;
  return { ...plot, status: "tilled" };
}

export function plantCrop(plot: FarmPlot, cropId: string, now: number): FarmPlot | null {
  if (plot.status !== "tilled" || !getCropDef(cropId)) return null;
  return { ...plot, status: "planted", cropId, growthMinutes: 0, lastSync: now };
}

/** Panggil syncPlot lebih dulu agar pertumbuhan sebelum disiram ikut terhitung. */
export function waterPlot(plot: FarmPlot, now: number, durationMinutes: number): FarmPlot | null {
  if (plot.status === "empty" || plot.status === "harvestable") return null;
  return { ...plot, wetUntil: now + durationMinutes };
}

/** Setelah panen tanah tetap terolah (tidak perlu dicangkul ulang). */
export function harvestPlot(plot: FarmPlot): { plot: FarmPlot; cropId: string } | null {
  if (plot.status !== "harvestable" || !plot.cropId) return null;
  return { plot: { ...plot, status: "tilled", cropId: null, growthMinutes: 0 }, cropId: plot.cropId };
}
