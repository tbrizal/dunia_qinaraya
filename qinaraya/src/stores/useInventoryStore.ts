import { create } from "zustand";
import { gameConfig } from "../config/gameConfig";
import { addItem, createInventory, removeItem } from "../systems/inventory/inventory";
import type { InventoryState } from "../systems/inventory/inventory";

interface InventoryStore {
  inventory: InventoryState;
  /** Mengembalikan jumlah yang benar-benar masuk. */
  add: (itemId: string, quantity: number) => number;
  /** Mengembalikan false bila jumlahnya tidak cukup. */
  remove: (itemId: string, quantity: number) => boolean;
  setInventory: (inventory: InventoryState) => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  inventory: createInventory(gameConfig.inventory.slots),
  add: (itemId, quantity) => {
    const result = addItem(get().inventory, itemId, quantity);
    if (result.added > 0) set({ inventory: result.inventory });
    return result.added;
  },
  remove: (itemId, quantity) => {
    const next = removeItem(get().inventory, itemId, quantity);
    if (!next) return false;
    set({ inventory: next });
    return true;
  },
  setInventory: (inventory) => set({ inventory }),
  reset: () => set({ inventory: createInventory(gameConfig.inventory.slots) }),
}));
