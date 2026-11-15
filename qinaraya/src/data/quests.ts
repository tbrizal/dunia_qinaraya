/** Definisi quest. Progres dihitung dari event aksi pemain (lihat systems/quest). */

export type ObjectiveType = "till" | "plant" | "water" | "harvest";

export interface QuestObjectiveDef {
  type: ObjectiveType;
  count: number;
  label: string;
  /** Opsional: batasi pada tanaman (plant) atau item hasil panen (harvest) tertentu. */
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

export const QUEST_LIST: readonly QuestDef[] = Object.values(QUESTS);
