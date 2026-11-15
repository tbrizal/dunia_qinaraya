import { registerDialogueContent } from "../dialogues.ts";
import { registerLearningContent } from "../learning.ts";
import { registerQuests } from "../quests.ts";
import { DRAFT_LEARNING_CONTENT } from "./learning.ts";
import { DRAFT_QUESTS } from "./quests.ts";
import { USTADZ_DRAFT_ENTRIES, USTADZ_DRAFT_NODES } from "./ustadzDialogue.ts";

/**
 * Mendaftarkan seluruh konten yang belum ditinjau. Dipanggil saat boot HANYA bila build mengizinkan
 * (lihat src/main.tsx dan vite.config.ts). Di build produksi modul ini tidak ikut terbundel.
 */
export function registerUnreviewedContent(): void {
  registerLearningContent(DRAFT_LEARNING_CONTENT);
  registerQuests(DRAFT_QUESTS);
  registerDialogueContent("ustadz-harun", USTADZ_DRAFT_ENTRIES, USTADZ_DRAFT_NODES);
}
