import { getNpcDef } from "../../data/npcs.ts";
import { QUEST_LIST } from "../../data/quests.ts";
import type { QuestDef } from "../../data/quests.ts";
import { isVisible } from "../content/review.ts";
import { getNextObjective, getStatus } from "./questEngine.ts";
import type { QuestState } from "./questEngine.ts";

export interface TrackedQuest {
  quest: QuestDef;
  line: string;
}

/** Quest dapat dimulai: belum dimulai, prasyarat selesai, dan boleh tampil pada build ini. */
export function isQuestAvailable(quest: QuestDef, state: QuestState, allowUnreviewed?: boolean): boolean {
  if (!isVisible(quest.reviewStatus, allowUnreviewed)) return false;
  if (getStatus(state, quest.id) !== "inactive") return false;
  return (quest.requires ?? []).every((id) => getStatus(state, id) === "completed");
}

/**
 * Quest yang ditampilkan di HUD: yang sedang berjalan atau siap diserahkan lebih dulu,
 * lalu petunjuk untuk quest berikutnya yang sudah bisa dimulai. Quest tersembunyi
 * (belum ditinjau di produksi) tidak pernah tampil.
 */
export function getTrackedQuest(state: QuestState, allowUnreviewed?: boolean): TrackedQuest | null {
  const visible = QUEST_LIST.filter((q) => isVisible(q.reviewStatus, allowUnreviewed));

  for (const quest of visible) {
    const status = getStatus(state, quest.id);
    if (status === "ready") {
      const giver = getNpcDef(quest.giverNpcId)?.name ?? "pemberi misi";
      return { quest, line: `Kembali ke ${giver} untuk menyerahkan misi.` };
    }
    if (status === "active") {
      const next = getNextObjective(state, quest.id);
      if (next) return { quest, line: `${next.label} (${next.current}/${next.count})` };
    }
  }
  for (const quest of visible) {
    if (isQuestAvailable(quest, state, allowUnreviewed)) return { quest, line: quest.startHint };
  }
  return null;
}
