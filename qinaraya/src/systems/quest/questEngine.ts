import { QUEST_LIST, getQuestDef } from "../../data/quests.ts";
import type { QuestDef } from "../../data/quests.ts";

export type QuestStatus = "inactive" | "active" | "ready" | "completed";

export interface QuestProgress {
  status: QuestStatus;
  /** Progres tiap objektif, sejajar dengan QuestDef.objectives. */
  objectives: number[];
}

export type QuestState = Record<string, QuestProgress>;

export type QuestEvent =
  | { type: "till" }
  | { type: "plant"; cropId: string }
  | { type: "water" }
  | { type: "harvest"; itemId: string; quantity: number }
  | { type: "learn"; contentId: string }
  | { type: "clean" }
  | { type: "give"; quantity: number };

export const QUEST_STATUSES: readonly QuestStatus[] = ["inactive", "active", "ready", "completed"];

export function createQuestState(): QuestState {
  return {};
}

export function getStatus(state: QuestState, questId: string): QuestStatus {
  return state[questId]?.status ?? "inactive";
}

export function startQuest(state: QuestState, quest: QuestDef): QuestState | null {
  if (getStatus(state, quest.id) !== "inactive") return null;
  return { ...state, [quest.id]: { status: "active", objectives: quest.objectives.map(() => 0) } };
}

function eventAmount(event: QuestEvent, type: string, targetId?: string): number {
  if (event.type !== type) return 0;
  if (event.type === "plant") return targetId && targetId !== event.cropId ? 0 : 1;
  if (event.type === "harvest") return targetId && targetId !== event.itemId ? 0 : event.quantity;
  if (event.type === "learn") return targetId && targetId !== event.contentId ? 0 : 1;
  if (event.type === "give") return event.quantity;
  return 1;
}

/** Menerapkan satu event ke semua quest aktif. Mengembalikan quest yang baru siap diserahkan. */
export function applyEvent(state: QuestState, event: QuestEvent): { state: QuestState; readyQuestIds: string[] } {
  let next = state;
  const readyQuestIds: string[] = [];

  for (const quest of QUEST_LIST) {
    const progress = state[quest.id];
    if (!progress || progress.status !== "active") continue;

    const objectives = progress.objectives.slice();
    let changed = false;
    quest.objectives.forEach((def, i) => {
      const gain = eventAmount(event, def.type, def.targetId);
      if (gain <= 0) return;
      const current = objectives[i] ?? 0;
      if (current >= def.count) return;
      objectives[i] = Math.min(def.count, current + gain);
      changed = true;
    });
    if (!changed) continue;

    const allDone = quest.objectives.every((def, i) => (objectives[i] ?? 0) >= def.count);
    if (allDone) readyQuestIds.push(quest.id);
    next = { ...next, [quest.id]: { status: allDone ? "ready" : "active", objectives } };
  }
  return { state: next, readyQuestIds };
}

export function completeQuest(state: QuestState, questId: string): QuestState | null {
  const progress = state[questId];
  if (!progress || progress.status !== "ready") return null;
  return { ...state, [questId]: { ...progress, status: "completed" } };
}

/** Objektif aktif pertama yang belum selesai (untuk pelacak quest). */
export function getNextObjective(state: QuestState, questId: string): { label: string; current: number; count: number } | null {
  const quest = getQuestDef(questId);
  const progress = state[questId];
  if (!quest || !progress || progress.status !== "active") return null;
  for (let i = 0; i < quest.objectives.length; i++) {
    const def = quest.objectives[i]!;
    const current = progress.objectives[i] ?? 0;
    if (current < def.count) return { label: def.label, current, count: def.count };
  }
  return null;
}
