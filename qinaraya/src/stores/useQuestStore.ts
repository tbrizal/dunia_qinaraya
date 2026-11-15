import { create } from "zustand";
import { createQuestState } from "../systems/quest/questEngine";
import type { QuestState } from "../systems/quest/questEngine";

interface QuestStore {
  quests: QuestState;
  setQuests: (quests: QuestState) => void;
  reset: () => void;
}

export const useQuestStore = create<QuestStore>((set) => ({
  quests: createQuestState(),
  setQuests: (quests) => set({ quests }),
  reset: () => set({ quests: createQuestState() }),
}));
