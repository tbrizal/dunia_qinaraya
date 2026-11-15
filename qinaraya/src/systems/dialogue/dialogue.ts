import type { DialogueCondition, DialogueEntry, NpcDialogue } from "../../data/dialogues.ts";
import { isVisible } from "../content/review.ts";
import { getStatus } from "../quest/questEngine.ts";
import type { QuestState } from "../quest/questEngine.ts";
import type { TimeOfDay } from "../time/timeOfDay.ts";

function matches(entry: DialogueEntry, quests: QuestState): boolean {
  if (!entry.when) return true;
  const conditions: readonly DialogueCondition[] = Array.isArray(entry.when) ? entry.when : [entry.when as DialogueCondition];
  return conditions.every((c) => c.status.includes(getStatus(quests, c.questId)));
}

/**
 * Memilih node awal: entri pertama yang syarat quest-nya terpenuhi dan boleh tampil.
 * Entri bermateri agama yang belum ditinjau dilewati di build produksi.
 */
export function selectEntryNode(dialogue: NpcDialogue, quests: QuestState, allowUnreviewed?: boolean): string {
  for (const entry of dialogue.entries) {
    if (!isVisible(entry.reviewStatus, allowUnreviewed)) continue;
    if (matches(entry, quests)) return entry.node;
  }
  const fallback = dialogue.entries[dialogue.entries.length - 1];
  if (!fallback) throw new Error(`Dialog ${dialogue.npcId} tidak punya entri`);
  return fallback.node;
}

/** Mengisi placeholder teks dari konteks game. */
export function renderDialogueText(text: string, context: { timeOfDay: TimeOfDay }): string {
  return text.replaceAll("{timeOfDay}", context.timeOfDay);
}
