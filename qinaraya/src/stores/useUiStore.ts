import { create } from "zustand";
import { useSettingsStore } from "./useSettingsStore";

export interface ActiveDialogue {
  npcId: string;
  nodeId: string;
}

export interface ActiveLearning {
  contentId: string;
  page: number;
}

export interface ActiveActivity {
  activityId: string;
  /** 0..steps.length; indeks terakhir adalah halaman penutup. */
  step: number;
  /** Nama waktu salat yang sedang berlangsung saat aktivitas dibuka (untuk teks {prayer}). */
  prayerLabel: string;
}

interface UiStore {
  inventoryOpen: boolean;
  timePanelOpen: boolean;
  dialogue: ActiveDialogue | null;
  learning: ActiveLearning | null;
  activity: ActiveActivity | null;
  toast: { id: number; text: string } | null;
  prayerNotice: { id: number; text: string } | null;
  setInventoryOpen: (open: boolean) => void;
  toggleInventory: () => void;
  setTimePanelOpen: (open: boolean) => void;
  setDialogue: (dialogue: ActiveDialogue | null) => void;
  setLearning: (learning: ActiveLearning | null) => void;
  setActivity: (activity: ActiveActivity | null) => void;
  showToast: (text: string) => void;
  showPrayerNotice: (text: string) => void;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  inventoryOpen: false,
  timePanelOpen: false,
  dialogue: null,
  learning: null,
  activity: null,
  toast: null,
  prayerNotice: null,
  setInventoryOpen: (open) => set({ inventoryOpen: open }),
  toggleInventory: () => set((s) => ({ inventoryOpen: !s.inventoryOpen })),
  setTimePanelOpen: (open) => set({ timePanelOpen: open }),
  setDialogue: (dialogue) => set({ dialogue }),
  setLearning: (learning) => set({ learning }),
  setActivity: (activity) => set({ activity }),
  showToast: (text) => set({ toast: { id: ++toastCounter, text } }),
  showPrayerNotice: (text) => set({ prayerNotice: { id: ++toastCounter, text } }),
}));

/** Saat ada panel terbuka, gerakan dan waktu dunia dijeda. */
export function isModalOpen(): boolean {
  const ui = useUiStore.getState();
  return (
    useSettingsStore.getState().settingsOpen || ui.inventoryOpen || ui.timePanelOpen || ui.dialogue !== null || ui.learning !== null || ui.activity !== null
  );
}
