/** Definisi quest. Progres dihitung dari event aksi pemain (lihat systems/quest). */

import type { ReviewStatus } from "../systems/content/review.ts";

export type ObjectiveType = "till" | "plant" | "water" | "harvest" | "learn" | "clean" | "give";

export type QuestCategory = "farming" | "islamic-learning";

export interface QuestObjectiveDef {
  type: ObjectiveType;
  count: number;
  label: string;
  /** Opsional: batasi pada tanaman (plant), item hasil panen (harvest), atau id materi (learn). */
  targetId?: string;
}

export interface ItemGrant {
  itemId: string;
  quantity: number;
}

export interface QuestDef {
  id: string;
  title: string;
  summary: string;
  category: QuestCategory;
  /** Quest bermateri agama berstatus draft sampai ditinjau, dan tersembunyi di produksi. */
  reviewStatus?: ReviewStatus;
  /** Quest lain yang harus selesai lebih dulu. */
  requires?: readonly string[];
  giverNpcId: string;
  /** Petunjuk lokasi pemberi quest, ditampilkan sebelum quest dimulai. */
  startHint: string;
  objectives: readonly QuestObjectiveDef[];
  /** Diberikan saat quest dimulai (alat dan benih awal). */
  startItems: readonly ItemGrant[];
  /** Diberikan saat quest diserahkan. */
  rewardItems: readonly ItemGrant[];
}

export const QUESTS: Record<string, QuestDef> = {
  tutorial_farming: {
    id: "tutorial_farming",
    title: "Kebun Pertama",
    summary: "Belajar bertani dari Pak Hasan: olah tanah, tanam, siram, lalu panen.",
    category: "farming",
    giverNpcId: "pak-hasan",
    startHint: "Temui Pak Hasan di dekat kebun, barat daya desa.",
    objectives: [
      { type: "till", count: 1, label: "Cangkul 1 petak tanah" },
      { type: "plant", count: 1, label: "Tanam 1 benih" },
      { type: "water", count: 1, label: "Siram 1 petak" },
      { type: "harvest", count: 1, label: "Panen 1 tanaman" },
    ],
    startItems: [
      { itemId: "hoe", quantity: 1 },
      { itemId: "watering_can", quantity: 1 },
      { itemId: "carrot_seed", quantity: 3 },
      { itemId: "tomato_seed", quantity: 2 },
      { itemId: "potato_seed", quantity: 2 },
    ],
    rewardItems: [
      { itemId: "tomato_seed", quantity: 3 },
      { itemId: "potato_seed", quantity: 3 },
    ],
  },
};

export function getQuestDef(id: string): QuestDef | undefined {
  return QUESTS[id];
}

/** Array yang sama dipakai semua modul; quest draft ditambahkan saat boot pada build yang mengizinkannya. */
export const QUEST_LIST: QuestDef[] = Object.values(QUESTS);

export function registerQuests(defs: Record<string, QuestDef>): void {
  for (const def of Object.values(defs)) {
    if (QUESTS[def.id]) continue;
    QUESTS[def.id] = def;
    QUEST_LIST.push(def);
  }
}
