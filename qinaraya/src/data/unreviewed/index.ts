import { registerActivities } from "../activities.ts";
import { registerDialogueContent } from "../dialogues.ts";
import { registerWorshipGuide } from "../worship.ts";
import { registerLearningContent } from "../learning.ts";
import { registerQuests } from "../quests.ts";
import { DRAFT_ACTIVITIES } from "./activities.ts";
import { buildWorshipGuide } from "./ibadahGuide.ts";
import { buildGuideLearning } from "./ibadahLearning.ts";
import { DRAFT_LEARNING_CONTENT } from "./learning.ts";
import { DRAFT_QUESTS } from "./quests.ts";
import { USTADZ_DRAFT_ENTRIES, USTADZ_DRAFT_NODES } from "./ustadzDialogue.ts";

/**
 * Mendaftarkan seluruh konten yang belum ditinjau. Dipanggil saat boot HANYA bila build mengizinkan
 * (lihat src/main.tsx dan vite.config.ts). Di build produksi modul ini tidak ikut terbundel.
 */
export function registerUnreviewedContent(): void {
  registerLearningContent(DRAFT_LEARNING_CONTENT);
  registerLearningContent(buildGuideLearning());
  registerActivities(DRAFT_ACTIVITIES);
  registerWorshipGuide(buildWorshipGuide());
  registerQuests(DRAFT_QUESTS);
  registerDialogueContent("ustadz-harun", USTADZ_DRAFT_ENTRIES, USTADZ_DRAFT_NODES);
}
