import { create } from "zustand";

interface LearningStore {
  /** Id materi yang sudah selesai dibaca. Catatan belajar saja, bukan skor atau penilaian. */
  learned: string[];
  markLearned: (contentId: string) => void;
  setLearned: (ids: string[]) => void;
  reset: () => void;
}

export const useLearningStore = create<LearningStore>((set, get) => ({
  learned: [],
  markLearned: (contentId) => {
    if (!get().learned.includes(contentId)) set({ learned: [...get().learned, contentId] });
  },
  setLearned: (ids) => set({ learned: ids }),
  reset: () => set({ learned: [] }),
}));
