import assert from "node:assert/strict";
import { test } from "node:test";
import { gameConfig } from "../src/config/gameConfig.ts";
import { resolveCollisions } from "../src/systems/movement/collision.ts";
import { createPlayerState, stepPlayer } from "../src/systems/movement/stepPlayer.ts";
import { villageLayout } from "../src/worlds/qinaraya-village/villageLayout.ts";

const { player } = gameConfig;
const { colliders, bounds, buildings } = villageLayout;

function walk(startX: number, startZ: number, moveX: number, moveY: number, seconds: number, yaw = 0) {
  const s = createPlayerState(startX, startZ, 0);
  for (let i = 0; i < seconds * 60; i++) stepPlayer(s, { moveX, moveY, sprint: false }, yaw, 1 / 60, player, colliders, bounds);
  return s;
}

test("titik spawn bebas dari collider dan berada di dalam batas", () => {
  const pos = { x: player.spawn.x, z: player.spawn.z };
  const corrected = resolveCollisions(pos, player.radius, colliders, bounds);
  assert.equal(corrected, false);
});

test("footprint bangunan tidak saling tumpang tindih", () => {
  for (let i = 0; i < buildings.length; i++) {
    for (let j = i + 1; j < buildings.length; j++) {
      const a = buildings[i]!;
      const b = buildings[j]!;
      const overlapX = Math.abs(a.x - b.x) < (a.width + b.width) / 2;
      const overlapZ = Math.abs(a.z - b.z) < (a.depth + b.depth) / 2;
      assert.ok(!(overlapX && overlapZ), `${a.id} tumpang tindih dengan ${b.id}`);
    }
  }
});

test("semua bangunan berada di dalam area bermain", () => {
  for (const b of buildings) {
    assert.ok(Math.abs(b.x) + b.width / 2 <= gameConfig.world.halfSize, `${b.id} keluar batas X`);
    assert.ok(Math.abs(b.z) + b.depth / 2 <= gameConfig.world.halfSize, `${b.id} keluar batas Z`);
  }
});

test("pemain bisa berjalan dari spawn lurus ke utara sampai depan masjid", () => {
  const s = walk(player.spawn.x, player.spawn.z, 0, 1, 8);
  assert.ok(s.z < -11, `tertahan di z=${s.z}`);
});

test("pemain bisa berjalan ke jalan timur dan barat tanpa tertahan", () => {
  const east = walk(0, 0, 1, 0, 6);
  const west = walk(0, 0, -1, 0, 6);
  assert.ok(east.x > 15, `timur tertahan di x=${east.x}`);
  assert.ok(west.x < -15, `barat tertahan di x=${west.x}`);
});

test("bangunan benar-benar memblokir: masjid tidak bisa ditembus", () => {
  const s = walk(0, -11, 0, 1, 6);
  assert.ok(s.z >= -12 + player.radius - 1e-6, `menembus masjid, z=${s.z}`);
});

test("pohon dan sumur memiliki collider; dinding hutan tidak (di luar batas)", () => {
  const circles = colliders.filter((c) => c.kind === "circle").length;
  assert.ok(circles >= villageLayout.interiorTrees.length + 1);
  for (const t of villageLayout.forestTrees) {
    assert.ok(Math.abs(t.x) > gameConfig.world.halfSize || Math.abs(t.z) > gameConfig.world.halfSize, "pohon hutan berada di dalam area bermain");
  }
});

test("pohon dalam desa tidak berada di atas bangunan, jalan utama, atau titik spawn", () => {
  for (const t of villageLayout.interiorTrees) {
    for (const b of buildings) {
      const inside = Math.abs(t.x - b.x) < b.width / 2 && Math.abs(t.z - b.z) < b.depth / 2;
      assert.ok(!inside, `pohon di dalam ${b.id}`);
    }
    assert.ok(Math.hypot(t.x - player.spawn.x, t.z - player.spawn.z) > 3, "pohon terlalu dekat spawn");
    assert.ok(!(Math.abs(t.x) < 1.5 && t.z > -12), "pohon menghalangi jalan utama");
  }
});

test("jumlah objek dunia wajar untuk perangkat mobile", () => {
  const trees = villageLayout.interiorTrees.length + villageLayout.forestTrees.length;
  assert.ok(trees < 400, `terlalu banyak pohon: ${trees}`);
  assert.ok(villageLayout.interiorTrees.length >= 15, "terlalu sedikit pohon di desa");
});
