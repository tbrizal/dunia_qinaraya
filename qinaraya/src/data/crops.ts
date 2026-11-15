/** Definisi tanaman. Menambah tanaman baru cukup menambah entri di sini (dan item terkait). */

export type CropShape = "tall" | "bush" | "low";

export interface CropDef {
  id: string;
  name: string;
  seedItemId: string;
  harvestItemId: string;
  /** Jumlah item hasil panen. */
  yield: number;
  /**
   * Menit game "basah" yang dibutuhkan sampai siap panen.
   * Tanaman hanya tumbuh saat tanah basah; tanah kering menjeda pertumbuhan, tidak mematikan tanaman.
   */
  growthMinutes: number;
  look: { shape: CropShape; leafColor: string; fruitColor: string };
}

export const CROPS: Record<string, CropDef> = {
  carrot: {
    id: "carrot",
    name: "Wortel",
    seedItemId: "carrot_seed",
    harvestItemId: "carrot",
    yield: 2,
    growthMinutes: 360,
    look: { shape: "tall", leafColor: "#5f9a4e", fruitColor: "#e08a3c" },
  },
  tomato: {
    id: "tomato",
    name: "Tomat",
    seedItemId: "tomato_seed",
    harvestItemId: "tomato",
    yield: 3,
    growthMinutes: 600,
    look: { shape: "bush", leafColor: "#4f8a4a", fruitColor: "#d24b3e" },
  },
  potato: {
    id: "potato",
    name: "Kentang",
    seedItemId: "potato_seed",
    harvestItemId: "potato",
    yield: 3,
    growthMinutes: 480,
    look: { shape: "low", leafColor: "#6f9f55", fruitColor: "#c9a86a" },
  },
};

export function getCropDef(id: string): CropDef | undefined {
  return CROPS[id];
}

export function getCropBySeed(seedItemId: string): CropDef | undefined {
  return Object.values(CROPS).find((c) => c.seedItemId === seedItemId);
}

export const CROP_LIST: readonly CropDef[] = Object.values(CROPS);
