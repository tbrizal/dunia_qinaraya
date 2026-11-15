import { NPCS } from "../../data/npcs";
import type { Interactable } from "../../systems/interaction/interactables";
import { villageLayout } from "./villageLayout";

/** Semua objek yang bisa diajak berinteraksi di desa. Posisi berasal dari layout dan data NPC. */
export const villageInteractables: readonly Interactable[] = [
  ...villageLayout.gardenPlots.map((p) => ({ kind: "plot" as const, id: p.id, cx: p.cx, cz: p.cz, w: p.w, d: p.d })),
  ...NPCS.map((n) => ({ kind: "npc" as const, id: n.id, x: n.x, z: n.z })),
];
