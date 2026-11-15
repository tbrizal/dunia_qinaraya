import { gameConfig } from "../config/gameConfig";
import { getCropDef } from "../data/crops";
import { getItemDef } from "../data/items";
import { getNpcDef } from "../data/npcs";
import { getQuestDef } from "../data/quests";
import { harvestPlot, plantCrop, syncPlot, tillPlot, waterPlot } from "../systems/farming/farmPlot";
import { describeNpc, describePlot } from "../systems/interaction/actions";
import type { TargetView } from "../systems/interaction/actions";
import type { TargetRef } from "../systems/interaction/interactables";
import { addAll, addItem, canAddAll, removeItem } from "../systems/inventory/inventory";
import { applyEvent, completeQuest, startQuest } from "../systems/quest/questEngine";
import type { QuestEvent } from "../systems/quest/questEngine";
import { gameClock } from "../systems/time/gameClockInstance";
import { startDialogue } from "./dialogueActions";
import { useFarmStore } from "./useFarmStore";
import { useInteractionStore } from "./useInteractionStore";
import { useInventoryStore } from "./useInventoryStore";
import { useQuestStore } from "./useQuestStore";
import { isModalOpen, useUiStore } from "./useUiStore";

/**
 * Orkestrasi aksi pemain lintas store. Logic aturan ada di systems/; di sini hanya
 * memeriksa, menerapkan hasilnya ke store, mencatat event quest, dan memberi umpan balik.
 */

const toast = (text: string) => useUiStore.getState().showToast(text);

export function computeTargetView(target: TargetRef | null): TargetView | null {
  if (!target) return null;
  if (target.kind === "npc") return describeNpc(target.id);
  const plot = useFarmStore.getState().plots[target.id];
  return plot ? describePlot(plot, useInventoryStore.getState().inventory) : null;
}

export function recordQuestEvent(event: QuestEvent): void {
  const store = useQuestStore.getState();
  const { state, readyQuestIds } = applyEvent(store.quests, event);
  if (state === store.quests) return;
  store.setQuests(state);
  for (const id of readyQuestIds) {
    const quest = getQuestDef(id);
    if (!quest) continue;
    const giver = getNpcDef(quest.giverNpcId)?.name ?? "pemberi misi";
    toast(`Misi selesai: ${quest.title}. Temui ${giver}.`);
  }
}

/** Memulai quest dan memberi alat awal. Mengembalikan false bila tas tidak muat. */
export function startQuestWithItems(questId: string): boolean {
  const quest = getQuestDef(questId);
  if (!quest) return false;
  const inventory = useInventoryStore.getState().inventory;
  if (!canAddAll(inventory, quest.startItems)) {
    toast("Tas penuh. Kosongkan beberapa item dulu.");
    return false;
  }
  const questStore = useQuestStore.getState();
  const next = startQuest(questStore.quests, quest);
  if (!next) return false;
  useInventoryStore.getState().setInventory(addAll(inventory, quest.startItems));
  questStore.setQuests(next);
  toast(`Misi baru: ${quest.title}`);
  return true;
}

export function completeQuestWithRewards(questId: string): boolean {
  const quest = getQuestDef(questId);
  if (!quest) return false;
  const inventory = useInventoryStore.getState().inventory;
  if (!canAddAll(inventory, quest.rewardItems)) {
    toast("Tas penuh. Kosongkan beberapa item dulu.");
    return false;
  }
  const questStore = useQuestStore.getState();
  const next = completeQuest(questStore.quests, questId);
  if (!next) return false;
  useInventoryStore.getState().setInventory(addAll(inventory, quest.rewardItems));
  questStore.setQuests(next);
  toast(`Misi selesai: ${quest.title}`);
  return true;
}

/** Menjalankan satu aksi pada target saat ini. Dipakai tombol layar dan keyboard. */
export function runAction(actionId: string): void {
  if (isModalOpen()) return;
  const target = useInteractionStore.getState().target;
  if (!target) return;

  if (target.kind === "npc") {
    if (actionId === "talk") startDialogue(target.id);
    return;
  }

  const farm = useFarmStore.getState();
  const stored = farm.plots[target.id];
  if (!stored) return;

  const now = gameClock.getTotalMinutes();
  const plot = syncPlot(stored, now);
  if (plot !== stored) farm.setPlot(plot);

  const inventoryStore = useInventoryStore.getState();
  const option = describePlot(plot, inventoryStore.inventory).actions.find((a) => a.id === actionId);
  if (!option) return;
  if (!option.enabled) {
    toast(option.hint ?? "Belum bisa dilakukan sekarang");
    return;
  }

  if (actionId === "till") {
    const next = tillPlot(plot);
    if (!next) return;
    farm.setPlot(next);
    toast("Tanah diolah");
    recordQuestEvent({ type: "till" });
    return;
  }

  if (actionId.startsWith("plant:")) {
    const crop = getCropDef(actionId.slice("plant:".length));
    const planted = crop ? plantCrop(plot, crop.id, now) : null;
    const inventory = crop ? removeItem(inventoryStore.inventory, crop.seedItemId, 1) : null;
    if (!crop || !planted || !inventory) return;
    inventoryStore.setInventory(inventory);
    farm.setPlot(planted);
    toast(`Menanam ${crop.name.toLowerCase()}`);
    recordQuestEvent({ type: "plant", cropId: crop.id });
    return;
  }

  if (actionId === "water") {
    const next = waterPlot(plot, now, gameConfig.farming.waterDurationMinutes);
    if (!next) return;
    farm.setPlot(next);
    toast("Tanah disiram");
    recordQuestEvent({ type: "water" });
    return;
  }

  if (actionId === "harvest") {
    const result = harvestPlot(plot);
    const crop = result ? getCropDef(result.cropId) : undefined;
    if (!result || !crop) return;
    const added = addItem(inventoryStore.inventory, crop.harvestItemId, crop.yield);
    if (added.added < crop.yield) {
      toast("Tas penuh");
      return;
    }
    inventoryStore.setInventory(added.inventory);
    farm.setPlot(result.plot);
    const name = getItemDef(crop.harvestItemId)?.name ?? crop.name;
    toast(`+${crop.yield} ${name}`);
    recordQuestEvent({ type: "harvest", itemId: crop.harvestItemId, quantity: crop.yield });
  }
}

/** Menjalankan aksi ke-`index` (0 = utama) pada target saat ini. */
export function triggerAction(index: number): void {
  if (isModalOpen()) return;
  const view = computeTargetView(useInteractionStore.getState().target);
  const option = view?.actions[index];
  if (option) runAction(option.id);
}
