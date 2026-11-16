/** Definisi quest. Progres dihitung dari event aksi pemain (lihat systems/quest). */

import type { ReviewStatus } from "../systems/content/review.ts";

export type ObjectiveType = "till" | "plant" | "water" | "harvest" | "learn" | "clean" | "give" | "practice";

export type QuestCategory = "farming" | "islamic-learning";

export interface QuestObjectiveDef {
  /** Id stabil. Progres disimpan berdasarkan id ini agar urutan objektif boleh berubah antar versi. */
  id: string;
  type: ObjectiveType;
  count: number;
  label: string;
  /** Opsional: batasi pada tanaman (plant), item hasil panen (harvest), id materi (learn), atau id aktivitas (practice). */
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
  /**
   * Urutan id objektif pada save lama yang belum menyimpan id, dikunci oleh jumlah objektifnya.
   * Dipakai agar progres tidak bergeser ketika objektif ditambah atau diurutkan ulang.
   */
  legacyObjectiveLayouts?: Record<number, readonly string[]>;
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
      { id: "till", type: "till", count: 1, label: "Cangkul 1 petak tanah" },
      { id: "plant", type: "plant", count: 1, label: "Tanam 1 benih" },
      { id: "water", type: "water", count: 1, label: "Siram 1 petak" },
      { id: "harvest", type: "harvest", count: 1, label: "Panen 1 tanaman" },
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
