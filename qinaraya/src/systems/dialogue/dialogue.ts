import type { NpcDialogue } from "../../data/dialogues.ts";
import { getStatus } from "../quest/questEngine.ts";
import type { QuestState } from "../quest/questEngine.ts";
import type { TimeOfDay } from "../time/timeOfDay.ts";

/** Memilih node awal: entri pertama yang syarat quest-nya terpenuhi. */
export function selectEntryNode(dialogue: NpcDialogue, quests: QuestState): string {
  for (const entry of dialogue.entries) {
    if (!entry.when) return entry.node;
    if (entry.when.status.includes(getStatus(quests, entry.when.questId))) return entry.node;
  }
  const fallback = dialogue.entries[dialogue.entries.length - 1];
  if (!fallback) throw new Error(`Dialog ${dialogue.npcId} tidak punya entri`);
  return fallback.node;
}

/** Mengisi placeholder teks dari konteks game. */
export function renderDialogueText(text: string, context: { timeOfDay: TimeOfDay }): string {
  return text.replaceAll("{timeOfDay}", context.timeOfDay);
}
