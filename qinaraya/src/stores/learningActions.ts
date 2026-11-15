import { getVisibleLearningContent } from "../data/learning";
import { recordQuestEvent } from "./gameActions";
import { useLearningStore } from "./useLearningStore";
import { useUiStore } from "./useUiStore";

/** Membuka materi edukasi. Materi yang belum boleh tampil pada build ini ditolak dengan sopan. */
export function openLearning(contentId: string): void {
  const ui = useUiStore.getState();
  if (!getVisibleLearningContent(contentId)) {
    ui.showToast("Materi ini belum tersedia");
    return;
  }
  ui.setTimePanelOpen(false);
  ui.setLearning({ contentId, page: 0 });
}

export function closeLearning(): void {
  useUiStore.getState().setLearning(null);
}

export function learningPrev(): void {
  const { learning, setLearning } = useUiStore.getState();
  if (learning && learning.page > 0) setLearning({ ...learning, page: learning.page - 1 });
}

/** Halaman berikutnya, atau selesai bila sudah di halaman terakhir. */
export function learningNext(): void {
  const { learning, setLearning } = useUiStore.getState();
  if (!learning) return;
  const content = getVisibleLearningContent(learning.contentId);
  if (!content) return closeLearning();
  if (learning.page < content.pages.length - 1) setLearning({ ...learning, page: learning.page + 1 });
  else finishLearning();
}

export function finishLearning(): void {
  const { learning, showToast } = useUiStore.getState();
  if (!learning) return;
  const content = getVisibleLearningContent(learning.contentId);
  closeLearning();
  if (!content) return;
  useLearningStore.getState().markLearned(content.id);
  showToast(`Selesai dibaca: ${content.title}`);
  recordQuestEvent({ type: "learn", contentId: content.id });
}
