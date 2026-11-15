import { create } from "zustand";
import { useSettingsStore } from "./useSettingsStore";

export interface ActiveDialogue {
  npcId: string;
  nodeId: string;
}

interface UiStore {
  inventoryOpen: boolean;
  dialogue: ActiveDialogue | null;
  toast: { id: number; text: string } | null;
  setInventoryOpen: (open: boolean) => void;
  toggleInventory: () => void;
  setDialogue: (dialogue: ActiveDialogue | null) => void;
  showToast: (text: string) => void;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  inventoryOpen: false,
  dialogue: null,
  toast: null,
  setInventoryOpen: (open) => set({ inventoryOpen: open }),
  toggleInventory: () => set((s) => ({ inventoryOpen: !s.inventoryOpen })),
  setDialogue: (dialogue) => set({ dialogue }),
  showToast: (text) => set({ toast: { id: ++toastCounter, text } }),
}));

/** Saat ada panel terbuka, gerakan dan waktu dunia dijeda. */
export function isModalOpen(): boolean {
  const ui = useUiStore.getState();
  return useSettingsStore.getState().settingsOpen || ui.inventoryOpen || ui.dialogue !== null;
}
