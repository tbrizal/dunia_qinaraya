/** Definisi item. Data murni: UI dan logic hanya membaca dari sini. */

export type ItemCategory = "tool" | "seed" | "crop";

export interface ItemDef {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  /** Ikon placeholder (emoji). Diganti ikon final pada fase aset. */
  icon: string;
  /** Warna latar ikon. */
  color: string;
  maxStack: number;
}

export const ITEMS: Record<string, ItemDef> = {
  hoe: {
    id: "hoe",
    name: "Cangkul",
    description: "Untuk mengolah tanah kebun agar siap ditanami.",
    category: "tool",
    icon: "⛏️",
    color: "#8a6a44",
    maxStack: 1,
  },
  watering_can: {
    id: "watering_can",
    name: "Penyiram",
    description: "Untuk menyiram tanah dan tanaman.",
    category: "tool",
    icon: "🪣",
    color: "#4f8fb5",
    maxStack: 1,
  },
  carrot_seed: {
    id: "carrot_seed",
    name: "Benih wortel",
    description: "Tanam di tanah yang sudah diolah. Tumbuh cepat.",
    category: "seed",
    icon: "🌱",
    color: "#d9784a",
    maxStack: 99,
  },
  tomato_seed: {
    id: "tomato_seed",
    name: "Benih tomat",
    description: "Butuh waktu lebih lama, tetapi hasilnya banyak.",
    category: "seed",
    icon: "🌱",
    color: "#c94f4f",
    maxStack: 99,
  },
  potato_seed: {
    id: "potato_seed",
    name: "Benih kentang",
    description: "Tanaman yang mudah dirawat.",
    category: "seed",
    icon: "🌱",
    color: "#b89463",
    maxStack: 99,
  },
  carrot: {
    id: "carrot",
    name: "Wortel",
    description: "Hasil panen kebun. Renyah dan manis.",
    category: "crop",
    icon: "🥕",
    color: "#e08a3c",
    maxStack: 99,
  },
  tomato: {
    id: "tomato",
    name: "Tomat",
    description: "Hasil panen kebun. Segar dan berair.",
    category: "crop",
    icon: "🍅",
    color: "#d24b3e",
    maxStack: 99,
  },
  potato: {
    id: "potato",
    name: "Kentang",
    description: "Hasil panen kebun. Enak diolah menjadi banyak makanan.",
    category: "crop",
    icon: "🥔",
    color: "#b89463",
    maxStack: 99,
  },
};

export function getItemDef(id: string): ItemDef | undefined {
  return ITEMS[id];
}

export function isKnownItem(id: string): boolean {
  return Object.prototype.hasOwnProperty.call(ITEMS, id);
}
