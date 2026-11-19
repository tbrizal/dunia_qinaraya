import assert from "node:assert/strict";
import { test } from "node:test";
import { gameConfig } from "../src/config/gameConfig.ts";
import { NPCS } from "../src/data/npcs.ts";
import { PLACES } from "../src/data/places.ts";
import { QIBLA_HEADING, WORSHIP_STAGES } from "../src/worlds/qinaraya-village/worshipStages.ts";
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

test("tempat aktivitas ibadah bebas collider dan dekat titik lokasinya", () => {
  const near = (stageId: "wudu" | "salat", placeId: string) => {
    const stage = WORSHIP_STAGES[stageId];
    const place = PLACES.find((p) => p.id === placeId)!;
    assert.ok(Math.hypot(stage.x - place.x, stage.z - place.z) <= gameConfig.interaction.poiRange, `${stageId}: terlalu jauh dari titik lokasi`);
    assert.equal(resolveCollisions({ x: stage.x, z: stage.z }, player.radius, colliders, bounds), false, `${stageId}: titik berdiri terhalang`);
  };
  near("wudu", "wudu");
  near("salat", "masjid");
});

test("ruang gerak salat: area sujud ke arah qibla, dan di sisi kamera, bebas dari bangunan dan pohon", () => {
  const s = WORSHIP_STAGES.salat;
  assert.equal(s.heading, QIBLA_HEADING);
  // Qibla utara (-Z): sujud memanjang ke utara sekitar 0,8 m, dan tikar selebar 1 m.
  for (let dz = -1.0; dz <= 0.6; dz += 0.2) {
    for (const dx of [-0.6, 0, 0.6]) {
      assert.equal(resolveCollisions({ x: s.x + dx, z: s.z + dz }, 0.25, colliders, bounds), false, `terhalang di (${(s.x + dx).toFixed(1)}, ${(s.z + dz).toFixed(1)})`);
    }
  }
});

test("pelaku wudu menghadap bak wudu dengan jarak lega; pelaku menghadap utara ke arah bak", () => {
  const stage = WORSHIP_STAGES.wudu;
  const bak = buildings.find((b) => b.id === "wudu")!;
  assert.equal(stage.heading, Math.PI, "menghadap utara (-Z), ke arah bak");
  const gap = stage.z - (bak.z + bak.depth / 2);
  assert.ok(gap > 0.3 && gap < 0.9, `jarak ke tepi bak ${gap.toFixed(2)} m`);
  assert.ok(Math.abs(stage.x - bak.x) < 0.5, "berdiri tepat di depan bak");
});

test("kamera adegan ibadah: sudut samping agar rukuk dan sujud terlihat, jarak dan sudut wajar", () => {
  for (const stage of Object.values(WORSHIP_STAGES)) {
    assert.ok(stage.camera.distance >= 3.5 && stage.camera.distance <= 7, stage.id);
    assert.ok(stage.camera.pitch > 0.1 && stage.camera.pitch < 0.6, stage.id);
    assert.ok(stage.camera.focusY < 0, "titik pandang di bawah karakter agar karakter tampil di atas panel");
  }
  const yaw = WORSHIP_STAGES.salat.camera.yaw;
  assert.ok(Math.abs(Math.sin(yaw)) > 0.9, "kamera di sisi timur atau barat, melihat karakter dari samping");
});
