import type { Vec2 } from "./movementMath.ts";

/** Collider 2D di bidang XZ. Pemain diperlakukan sebagai lingkaran. */
export interface BoxCollider {
  kind: "box";
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface CircleCollider {
  kind: "circle";
  x: number;
  z: number;
  radius: number;
}

export type Collider = BoxCollider | CircleCollider;

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function boxFromCenter(cx: number, cz: number, width: number, depth: number): BoxCollider {
  return {
    kind: "box",
    minX: cx - width / 2,
    maxX: cx + width / 2,
    minZ: cz - depth / 2,
    maxZ: cz + depth / 2,
  };
}

const EPSILON = 1e-9;

function pushOutOfBox(pos: Vec2, radius: number, box: BoxCollider): boolean {
  const closestX = Math.min(Math.max(pos.x, box.minX), box.maxX);
  const closestZ = Math.min(Math.max(pos.z, box.minZ), box.maxZ);
  const dx = pos.x - closestX;
  const dz = pos.z - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= radius * radius) return false;

  if (distSq > EPSILON) {
    const dist = Math.sqrt(distSq);
    const push = radius - dist;
    pos.x += (dx / dist) * push;
    pos.z += (dz / dist) * push;
    return true;
  }

  // Pusat lingkaran berada di dalam kotak: keluarkan lewat sisi terdekat.
  const toMinX = pos.x - box.minX;
  const toMaxX = box.maxX - pos.x;
  const toMinZ = pos.z - box.minZ;
  const toMaxZ = box.maxZ - pos.z;
  const nearest = Math.min(toMinX, toMaxX, toMinZ, toMaxZ);
  if (nearest === toMinX) pos.x = box.minX - radius;
  else if (nearest === toMaxX) pos.x = box.maxX + radius;
  else if (nearest === toMinZ) pos.z = box.minZ - radius;
  else pos.z = box.maxZ + radius;
  return true;
}

function pushOutOfCircle(pos: Vec2, radius: number, circle: CircleCollider): boolean {
  const dx = pos.x - circle.x;
  const dz = pos.z - circle.z;
  const minDist = radius + circle.radius;
  const distSq = dx * dx + dz * dz;
  if (distSq >= minDist * minDist) return false;

  if (distSq > EPSILON) {
    const dist = Math.sqrt(distSq);
    const push = minDist - dist;
    pos.x += (dx / dist) * push;
    pos.z += (dz / dist) * push;
  } else {
    pos.x = circle.x + minDist;
  }
  return true;
}

/**
 * Mendorong `pos` keluar dari semua collider dan menjaganya di dalam batas dunia.
 * Mengubah `pos` secara langsung. Mengembalikan true bila ada koreksi posisi.
 */
export function resolveCollisions(
  pos: Vec2,
  radius: number,
  colliders: readonly Collider[],
  bounds: WorldBounds,
  iterations = 3,
): boolean {
  let corrected = false;

  for (let i = 0; i < iterations; i++) {
    let hit = false;
    for (const collider of colliders) {
      const pushed =
        collider.kind === "box" ? pushOutOfBox(pos, radius, collider) : pushOutOfCircle(pos, radius, collider);
      if (pushed) hit = true;
    }
    if (!hit) break;
    corrected = true;
  }

  const clampedX = Math.min(Math.max(pos.x, bounds.minX + radius), bounds.maxX - radius);
  const clampedZ = Math.min(Math.max(pos.z, bounds.minZ + radius), bounds.maxZ - radius);
  if (clampedX !== pos.x || clampedZ !== pos.z) corrected = true;
  pos.x = clampedX;
  pos.z = clampedZ;

  return corrected;
}
