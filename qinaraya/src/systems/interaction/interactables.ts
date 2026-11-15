/** Pemilihan target interaksi terdekat. Murni: hanya geometri 2D di bidang XZ. */

export type PlotInteractable = { kind: "plot"; id: string; cx: number; cz: number; w: number; d: number };
export type NpcInteractable = { kind: "npc"; id: string; x: number; z: number };
export type PoiInteractable = { kind: "poi"; id: string; x: number; z: number };
export type Interactable = PlotInteractable | NpcInteractable | PoiInteractable;

export interface TargetRef {
  kind: Interactable["kind"];
  id: string;
}

export interface InteractionRanges {
  plotRange: number;
  npcRange: number;
  poiRange: number;
}

/** Jarak ke tepi petak (0 bila di dalam), atau ke pusat NPC. */
export function distanceToInteractable(target: Interactable, px: number, pz: number): number {
  if (target.kind === "npc" || target.kind === "poi") return Math.hypot(px - target.x, pz - target.z);
  const dx = Math.max(Math.abs(px - target.cx) - target.w / 2, 0);
  const dz = Math.max(Math.abs(pz - target.cz) - target.d / 2, 0);
  return Math.hypot(dx, dz);
}

/**
 * Target dengan jarak ternormalisasi (jarak / jangkauan) terkecil di dalam jangkauannya.
 * Normalisasi membuat NPC yang dekat tidak kalah oleh petak kebun di sebelahnya.
 */
export function findNearestInteractable(
  px: number,
  pz: number,
  targets: readonly Interactable[],
  ranges: InteractionRanges,
): Interactable | null {
  let best: Interactable | null = null;
  let bestScore = Infinity;
  for (const target of targets) {
    const range = target.kind === "npc" ? ranges.npcRange : target.kind === "poi" ? ranges.poiRange : ranges.plotRange;
    const distance = distanceToInteractable(target, px, pz);
    if (distance > range) continue;
    const score = distance / range;
    if (score < bestScore) {
      bestScore = score;
      best = target;
    }
  }
  return best;
}
