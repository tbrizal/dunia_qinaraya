import { getDialogue } from "../data/dialogues";
import type { DialogueEffect } from "../data/dialogues";
import { renderDialogueText, selectEntryNode } from "../systems/dialogue/dialogue";
import { gameClock } from "../systems/time/gameClockInstance";
import { getTimeOfDay } from "../systems/time/timeOfDay";
import { completeQuestWithRewards, startQuestWithItems } from "./gameActions";
import { useQuestStore } from "./useQuestStore";
import { useUiStore } from "./useUiStore";

export interface DialogueView {
  npcId: string;
  text: string;
  choices: string[];
  /** True bila ada node berikutnya (tombol Lanjut); false berarti dialog selesai (tombol Tutup). */
  hasNext: boolean;
}

/** Menerjemahkan dialog aktif menjadi teks siap tampil (sapaan mengikuti Game Clock). */
export function getDialogueView(npcId: string, nodeId: string): DialogueView | null {
  const node = getDialogue(npcId)?.nodes[nodeId];
  if (!node) return null;
  return {
    npcId,
    text: renderDialogueText(node.text, { timeOfDay: getTimeOfDay(gameClock.getState().hour) }),
    choices: (node.choices ?? []).map((c) => c.label),
    hasNext: Boolean(node.next),
  };
}

function applyEffect(effect: DialogueEffect): boolean {
  if (effect.type === "startQuest") return startQuestWithItems(effect.questId);
  return completeQuestWithRewards(effect.questId);
}

export function startDialogue(npcId: string): void {
  const dialogue = getDialogue(npcId);
  if (!dialogue) return;
  const nodeId = selectEntryNode(dialogue, useQuestStore.getState().quests);
  useUiStore.getState().setDialogue({ npcId, nodeId });
}

export function closeDialogue(): void {
  useUiStore.getState().setDialogue(null);
}

/** Lanjut ke node berikutnya. Tidak berlaku untuk node dengan pilihan. */
export function advanceDialogue(): void {
  const active = useUiStore.getState().dialogue;
  if (!active) return;
  const node = getDialogue(active.npcId)?.nodes[active.nodeId];
  if (!node || (node.choices && node.choices.length > 0)) return;
  if (!node.next) closeDialogue();
  else useUiStore.getState().setDialogue({ npcId: active.npcId, nodeId: node.next });
}

export function chooseDialogueOption(index: number): void {
  const active = useUiStore.getState().dialogue;
  if (!active) return;
  const choice = getDialogue(active.npcId)?.nodes[active.nodeId]?.choices?.[index];
  if (!choice) return;
  if (choice.effect && !applyEffect(choice.effect)) return; // gagal (mis. tas penuh): tetap di node ini
  if (!choice.next) closeDialogue();
  else useUiStore.getState().setDialogue({ npcId: active.npcId, nodeId: choice.next });
}
