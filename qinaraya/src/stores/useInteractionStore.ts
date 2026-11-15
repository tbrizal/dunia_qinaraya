import { create } from "zustand";
import type { TargetRef } from "../systems/interaction/interactables";

interface InteractionStore {
  target: TargetRef | null;
  /** Hanya memperbarui state bila target benar-benar berganti (dipanggil tiap frame). */
  setTarget: (target: TargetRef | null) => void;
}

export const useInteractionStore = create<InteractionStore>((set, get) => ({
  target: null,
  setTarget: (target) => {
    const current = get().target;
    if (current?.id === target?.id && current?.kind === target?.kind) return;
    set({ target });
  },
}));
