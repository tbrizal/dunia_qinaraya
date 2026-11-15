import { create } from "zustand";
import { createPlot, syncPlot } from "../systems/farming/farmPlot";
import type { FarmPlot } from "../systems/farming/farmPlot";

interface FarmStore {
  plots: Record<string, FarmPlot>;
  setPlot: (plot: FarmPlot) => void;
  /** Membawa semua petak ke waktu `now`. Hanya memicu update bila ada yang berubah. */
  syncAll: (now: number) => void;
  setPlots: (plots: readonly FarmPlot[]) => void;
  reset: (plotIds: readonly string[]) => void;
}

function toRecord(plots: readonly FarmPlot[]): Record<string, FarmPlot> {
  return Object.fromEntries(plots.map((p) => [p.id, p]));
}

export const useFarmStore = create<FarmStore>((set, get) => ({
  plots: {},
  setPlot: (plot) => set({ plots: { ...get().plots, [plot.id]: plot } }),
  syncAll: (now) => {
    const current = get().plots;
    let next: Record<string, FarmPlot> | null = null;
    for (const [id, plot] of Object.entries(current)) {
      const synced = syncPlot(plot, now);
      if (synced !== plot) {
        next ??= { ...current };
        next[id] = synced;
      }
    }
    if (next) set({ plots: next });
  },
  setPlots: (plots) => set({ plots: toRecord(plots) }),
  reset: (plotIds) => set({ plots: toRecord(plotIds.map((id) => createPlot(id))) }),
}));
