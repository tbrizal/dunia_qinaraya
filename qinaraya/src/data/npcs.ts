/** Definisi NPC awal. Dialog statis; jadwal dan relasi ditambahkan pada fase berikutnya. */

export type Accessory = "none" | "straw-hat" | "peci";

export interface CharacterPalette {
  tunic: string;
  pants: string;
  hair: string;
  skin: string;
  bag: string;
}

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  x: number;
  z: number;
  /** Arah hadap awal (radian). 0 menghadap +Z (selatan). */
  heading: number;
  palette: CharacterPalette;
  accessory: Accessory;
}

export const NPCS: readonly NpcDef[] = [
  {
    id: "pak-hasan",
    name: "Pak Hasan",
    role: "Petani senior",
    x: -10.4,
    z: 12.0,
    heading: Math.PI / 2,
    palette: { tunic: "#6f8f4e", pants: "#5b4a3a", hair: "#b8b8b0", skin: "#e0b48a", bag: "#8a6a44" },
    accessory: "straw-hat",
  },
  {
    id: "nara",
    name: "Nara",
    role: "Petualang muda",
    x: -3.2,
    z: 2.8,
    heading: Math.PI / 2,
    palette: { tunic: "#4f8fb5", pants: "#4a4a58", hair: "#6b3f28", skin: "#f0c8a0", bag: "#d9784a" },
    accessory: "none",
  },
  {
    id: "ustadz-harun",
    name: "Ustadz Harun",
    role: "Pembimbing desa",
    x: -2.8,
    z: -10.2,
    heading: Math.PI / 2,
    palette: { tunic: "#e8e0c8", pants: "#4a4a58", hair: "#cfcfc8", skin: "#d9a87a", bag: "#8a6a44" },
    accessory: "peci",
  },
];

export function getNpcDef(id: string): NpcDef | undefined {
  return NPCS.find((n) => n.id === id);
}
