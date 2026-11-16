import assert from "node:assert/strict";
import { test } from "node:test";
import { gameConfig } from "../src/config/gameConfig.ts";
import { NPCS } from "../src/data/npcs.ts";
import { PLACES } from "../src/data/places.ts";
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

test("setiap petak dan NPC bisa dijangkau dari titik yang bebas collider", () => {
  const { gardenPlots } = villageLayout;
  assert.equal(gardenPlots.length, 6);
  assert.equal(new Set(gardenPlots.map((p) => p.id)).size, 6);

  const free = (x: number, z: number) => !resolveCollisions({ x, z }, player.radius, colliders, bounds);
  for (const p of gardenPlots) assert.ok(free(p.cx, p.cz), `${p.id}: pusat petak terhalang`);

  for (const npc of NPCS) {
    let reachable = false;
    for (let a = 0; a < 360 && !reachable; a += 15) {
      const x = npc.x + Math.cos((a * Math.PI) / 180) * 1.4;
      const z = npc.z + Math.sin((a * Math.PI) / 180) * 1.4;
      reachable = free(x, z);
    }
    assert.ok(reachable, `${npc.id} tidak bisa didekati`);
  }
});

test("NPC tidak berada di dalam bangunan atau di atas petak kebun", () => {
  for (const npc of NPCS) {
    for (const b of buildings) {
      assert.ok(!(Math.abs(npc.x - b.x) < b.width / 2 + 0.5 && Math.abs(npc.z - b.z) < b.depth / 2 + 0.5), `${npc.id} di ${b.id}`);
    }
    for (const p of villageLayout.gardenPlots) {
      assert.ok(!(Math.abs(npc.x - p.cx) < p.w / 2 && Math.abs(npc.z - p.cz) < p.d / 2), `${npc.id} di ${p.id}`);
    }
  }
});

test("titik berdiri lokasi (masjid dan tempat wudu) bebas collider dan dekat bangunannya", () => {
  for (const place of PLACES) {
    assert.equal(resolveCollisions({ x: place.x, z: place.z }, player.radius, colliders, bounds), false, `${place.id}: titik terhalang`);
    const building = buildings.find((b) => b.id === place.id || (place.id === "masjid" && b.id === "mosque"));
    assert.ok(building, `${place.id}: bangunan tidak ditemukan`);
    const dx = Math.max(Math.abs(place.x - building!.x) - building!.width / 2, 0);
    const dz = Math.max(Math.abs(place.z - building!.z) - building!.depth / 2, 0);
    assert.ok(Math.hypot(dx, dz) <= gameConfig.interaction.poiRange, `${place.id}: terlalu jauh dari bangunan (${Math.hypot(dx, dz).toFixed(2)} m)`);
  }
});

test("setiap lokasi bisa dijangkau berjalan dari titik awal", () => {
  for (const place of PLACES) {
    const s = createPlayerState(player.spawn.x, player.spawn.z, 0);
    let reached = false;
    for (let i = 0; i < 60 * 40 && !reached; i++) {
      const dx = place.x - s.x;
      const dz = place.z - s.z;
      const dist = Math.hypot(dx, dz);
      if (dist < 0.6) reached = true;
      // Arahkan langsung ke tujuan (yaw 0: maju = -Z, kanan = +X).
      stepPlayer(s, { moveX: dx / (dist || 1), moveY: -dz / (dist || 1), sprint: true }, 0, 1 / 60, player, colliders, bounds);
    }
    assert.ok(reached, `${place.id}: tidak terjangkau (tertahan di ${s.x.toFixed(1)}, ${s.z.toFixed(1)})`);
  }
});

test("Ustadz Harun berdiri dekat pintu masjid dan titik masjid tidak tertutup olehnya", () => {
  const ustadz = NPCS.find((n) => n.id === "ustadz-harun")!;
  const masjid = PLACES.find((p) => p.id === "masjid")!;
  assert.ok(Math.hypot(ustadz.x - masjid.x, ustadz.z - masjid.z) < 4);
  assert.ok(Math.hypot(ustadz.x - masjid.x, ustadz.z - masjid.z) > 1.2, "NPC tidak boleh menutup titik berdiri masjid");
});
