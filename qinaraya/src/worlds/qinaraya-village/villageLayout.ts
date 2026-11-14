import { gameConfig } from "../../config/gameConfig.ts";
import { boxFromCenter } from "../../systems/movement/collision.ts";
import type { Collider, WorldBounds } from "../../systems/movement/collision.ts";

/**
 * Data tata letak Qinaraya Village (prototipe). Murni data dan perhitungan,
 * tanpa Three.js, sehingga collider dan rendering memakai sumber yang sama.
 * Pusat desa di (0, 0). Utara = -Z, selatan = +Z. 1 unit = 1 meter.
 */

export type BuildingKind = "house" | "mosque" | "stall";

export interface BuildingSpec {
  id: string;
  kind: BuildingKind;
  x: number;
  z: number;
  width: number;
  depth: number;
  /** Sisi pintu: "south" menghadap +Z, "north" menghadap -Z. */
  facing: "south" | "north";
  wall: string;
  roof: string;
}

export interface RectSpec {
  cx: number;
  cz: number;
  w: number;
  d: number;
}

export interface TreeSpec {
  x: number;
  z: number;
  scale: number;
  /** 0..1, dipakai untuk variasi warna daun. */
  tint: number;
}

export interface PatchSpec {
  x: number;
  z: number;
  radius: number;
  light: boolean;
}

export interface HillSpec {
  x: number;
  z: number;
  width: number;
  height: number;
  color: string;
}

const half = gameConfig.world.halfSize;
const spawn = gameConfig.player.spawn;

const buildings: BuildingSpec[] = [
  { id: "mosque", kind: "mosque", x: 0, z: -16, width: 10, depth: 8, facing: "south", wall: "#efe6cf", roof: "#4f8f86" },
  { id: "house-home", kind: "house", x: -9, z: 6, width: 5, depth: 4, facing: "north", wall: "#ead9b5", roof: "#b5533c" },
  { id: "house-b", kind: "house", x: 9, z: 6, width: 5, depth: 4, facing: "north", wall: "#d9c7a3", roof: "#8a4f3a" },
  { id: "house-c", kind: "house", x: -9, z: -6, width: 5, depth: 4, facing: "south", wall: "#e3d2b0", roof: "#a8603f" },
  { id: "house-d", kind: "house", x: 9, z: -6, width: 5, depth: 4, facing: "south", wall: "#ddd0b4", roof: "#9b5a43" },
  { id: "farm-hut", kind: "house", x: -8, z: 16, width: 4, depth: 3.5, facing: "south", wall: "#c9a779", roof: "#6f8f4e" },
  { id: "stall-a", kind: "stall", x: 15, z: 3.2, width: 3.6, depth: 2.2, facing: "north", wall: "#d9a066", roof: "#d9784a" },
  { id: "stall-b", kind: "stall", x: 15, z: -3.2, width: 3.6, depth: 2.2, facing: "south", wall: "#d9a066", roof: "#4f8f86" },
];

const roads: RectSpec[] = [
  { cx: 0, cz: 12, w: 3, d: 24 }, // jalan utama ke gerbang selatan
  { cx: 0, cz: -6, w: 3, d: 12 }, // jalan ke masjid
  { cx: 0, cz: 0, w: half * 2, d: 3 }, // jalan timur-barat
];

const plaza = { x: 0, z: 0, radius: 5 };
const well = { x: 3.4, z: -2.9, radius: 1.0 };

const gardenPlots: RectSpec[] = [];
for (const cz of [13.2, 17.8]) {
  for (const cx of [-19.5, -16.5, -13.5]) gardenPlots.push({ cx, cz, w: 2.6, d: 3.6 });
}
const gardenArea: RectSpec = { cx: -16.5, cz: 15.5, w: 9.4, d: 9 };

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function inRect(x: number, z: number, r: RectSpec, margin: number): boolean {
  return Math.abs(x - r.cx) < r.w / 2 + margin && Math.abs(z - r.cz) < r.d / 2 + margin;
}

function isBlocked(x: number, z: number): boolean {
  for (const b of buildings) {
    if (inRect(x, z, { cx: b.x, cz: b.z, w: b.width, d: b.depth }, 2.2)) return true;
  }
  for (const r of roads) if (inRect(x, z, r, 1.3)) return true;
  if (Math.hypot(x - plaza.x, z - plaza.z) < plaza.radius + 1.6) return true;
  if (inRect(x, z, gardenArea, 1.5)) return true;
  if (Math.hypot(x - spawn.x, z - spawn.z) < 3.5) return true;
  return false;
}

function createLayout() {
  const rand = mulberry32(20260);

  // Pohon di dalam desa (punya collider).
  const interiorTrees: TreeSpec[] = [];
  for (let attempt = 0; attempt < 800 && interiorTrees.length < 30; attempt++) {
    const x = (rand() * 2 - 1) * (half - 1.5);
    const z = (rand() * 2 - 1) * (half - 1.5);
    if (isBlocked(x, z)) continue;
    if (interiorTrees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.8)) continue;
    interiorTrees.push({ x, z, scale: 0.85 + rand() * 0.6, tint: rand() });
  }

  // Dinding hutan di luar batas area bermain (visual saja, pemain tidak bisa mencapainya).
  const forestTrees: TreeSpec[] = [];
  const outer = half + 1.8;
  for (let row = 0; row < 2; row++) {
    const base = outer + row * 2.4;
    for (let t = -half; t <= half; t += 2.6) {
      forestTrees.push({ x: t + (rand() - 0.5) * 1.2, z: -(base + rand()), scale: 1 + rand() * 0.7, tint: rand() });
      forestTrees.push({ x: t + (rand() - 0.5) * 1.2, z: base + rand(), scale: 1 + rand() * 0.7, tint: rand() });
    }
    for (let t = -(half + 9); t <= half + 9; t += 2.6) {
      forestTrees.push({ x: -(base + rand()), z: t + (rand() - 0.5) * 1.2, scale: 1 + rand() * 0.7, tint: rand() });
      forestTrees.push({ x: base + rand(), z: t + (rand() - 0.5) * 1.2, scale: 1 + rand() * 0.7, tint: rand() });
    }
  }

  const bushes: TreeSpec[] = [];
  for (let attempt = 0; attempt < 600 && bushes.length < 34; attempt++) {
    const x = (rand() * 2 - 1) * (half - 1);
    const z = (rand() * 2 - 1) * (half - 1);
    if (isBlocked(x, z)) continue;
    if (interiorTrees.some((t) => Math.hypot(t.x - x, t.z - z) < 1.6)) continue;
    bushes.push({ x, z, scale: 0.55 + rand() * 0.45, tint: rand() });
  }

  const patches: PatchSpec[] = [];
  for (let i = 0; i < 16; i++) {
    patches.push({
      x: (rand() * 2 - 1) * half,
      z: (rand() * 2 - 1) * half,
      radius: 2.5 + rand() * 4.5,
      light: rand() > 0.45,
    });
  }

  const hillColors = ["#6f9a73", "#7aa38a", "#5f8c6a", "#86ad8e"];
  const hills: HillSpec[] = [];
  const hillCount = 14;
  for (let i = 0; i < hillCount; i++) {
    const angle = (i / hillCount) * Math.PI * 2 + rand() * 0.25;
    const dist = 50 + rand() * 12;
    hills.push({
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist,
      width: 13 + rand() * 9,
      height: 5 + rand() * 5,
      color: hillColors[Math.floor(rand() * hillColors.length)]!,
    });
  }

  // Collider: bangunan, menara masjid, sumur, dan pohon di dalam desa.
  const colliders: Collider[] = [];
  for (const b of buildings) {
    colliders.push(boxFromCenter(b.x, b.z, b.width, b.depth));
    if (b.kind === "mosque") colliders.push({ kind: "circle", x: b.x + b.width / 2 + 1.3, z: b.z - b.depth / 2 + 1.2, radius: 0.85 });
  }
  colliders.push({ kind: "circle", x: well.x, z: well.z, radius: well.radius });
  for (const t of interiorTrees) colliders.push({ kind: "circle", x: t.x, z: t.z, radius: 0.45 * t.scale });

  const bounds: WorldBounds = { minX: -half, maxX: half, minZ: -half, maxZ: half };

  return { buildings, roads, plaza, well, gardenPlots, interiorTrees, forestTrees, bushes, patches, hills, colliders, bounds };
}

export const villageLayout = createLayout();
