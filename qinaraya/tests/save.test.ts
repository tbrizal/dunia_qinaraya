import assert from "node:assert/strict";
import { test } from "node:test";
import { registerUnreviewedContent } from "../src/data/unreviewed/index.ts";
import { addAll, createInventory } from "../src/systems/inventory/inventory.ts";
import { createPlot, plantCrop, tillPlot, waterPlot } from "../src/systems/farming/farmPlot.ts";
import { SAVE_VERSION, parseSave, serializeQuests, serializeSave } from "../src/systems/save/saveSystem.ts";
import type { SaveContext, SaveData } from "../src/systems/save/saveSystem.ts";

// Meniru build development: materi draf dikenal, sehingga id-nya valid pada save.
registerUnreviewedContent();

const ctx: SaveContext = {
  plotIds: ["plot-1", "plot-2", "plot-3"],
  clockConfig: { realSecondsPerGameHour: 60, daysPerMonth: 30, monthsPerYear: 12 },
  inventorySlots: 20,
  speedOptions: [1, 4, 16],
  spawn: { x: 0, z: 10, heading: Math.PI },
  sensitivity: { min: 0.4, max: 2.5, default: 1 },
};

function sample(): SaveData {
  const planted = waterPlot(plantCrop(tillPlot(createPlot("plot-1"))!, "tomato", 100)!, 100, 480)!;
  return {
    version: SAVE_VERSION,
    savedAt: 1700000000000,
    profile: { name: "Aisyah" },
    player: { x: -5.5, z: 3.25, heading: 1.2 },
    clock: { state: { day: 7, month: 3, year: 1, hour: 14, minute: 45, speedMultiplier: 4 }, accumulator: 0.4 },
    inventory: addAll(createInventory(20), [
      { itemId: "hoe", quantity: 1 },
      { itemId: "carrot", quantity: 5 },
    ]),
    farm: { plots: [planted, createPlot("plot-2"), createPlot("plot-3")] },
    quests: { tutorial_farming: { status: "active", objectives: [1, 1, 0, 0] } },
    learning: { learned: ["masjid-intro"] },
    settings: { cameraSensitivity: 1.6, showFps: true, prayerNotifications: false, prayerSound: true },
  };
}

function parseOk(raw: string) {
  const r = parseSave(raw, ctx);
  assert.equal(r.ok, true, JSON.stringify(r));
  return (r as { ok: true; data: SaveData }).data;
}

test("save lalu load mengembalikan data yang sama", () => {
  const original = sample();
  assert.deepEqual(parseOk(serializeSave(original)), original);
});

test("JSON rusak dan bentuk salah ditolak tanpa melempar error", () => {
  for (const raw of ["", "{", "bukan json", "null", "[]", "123", '"teks"']) {
    assert.equal(parseSave(raw, ctx).ok, false, raw);
  }
  const noClock = parseSave(JSON.stringify({ version: 1 }), ctx);
  assert.deepEqual(noClock, { ok: false, reason: "invalid-shape" });
});

test("versi lebih baru ditolak agar tidak menimpa save masa depan", () => {
  const r = parseSave(JSON.stringify({ ...sample(), version: SAVE_VERSION + 1 }), ctx);
  assert.deepEqual(r, { ok: false, reason: "newer-version" });
});

test("migrasi v1 ke v2: save Phase 2 tetap terbuka dan mendapat nilai default Phase 3", () => {
  const v1 = JSON.parse(serializeSave(sample()));
  v1.version = 1;
  delete v1.learning;
  v1.settings = { cameraSensitivity: 1.3, showFps: true };
  const data = parseOk(JSON.stringify(v1));
  assert.equal(data.version, SAVE_VERSION);
  assert.deepEqual(data.learning.learned, []);
  assert.equal(data.settings.prayerNotifications, true);
  assert.equal(data.settings.prayerSound, false, "bunyi default mati");
  assert.equal(data.settings.cameraSensitivity, 1.3);
  assert.deepEqual(data.inventory, sample().inventory, "kemajuan lama tetap utuh");
});

test("catatan materi: id tidak dikenal dan duplikat dibuang", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.learning = { learned: ["masjid-intro", "masjid-intro", "materi-hantu", 5, "wudu-intro"] };
  assert.deepEqual(parseOk(JSON.stringify(raw)).learning.learned, ["masjid-intro", "wudu-intro"]);
});

test("versi lama tanpa migrasi ditolak dengan aman", () => {
  assert.equal(parseSave(JSON.stringify({ ...sample(), version: 0 }), ctx).ok, false);
  assert.equal(parseSave(JSON.stringify({ ...sample(), version: 1.5 }), ctx).ok, false);
});

test("item tidak dikenal dibuang, jumlah dibatasi, slot dibatasi", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.inventory.stacks = [
    { itemId: "item-hantu", quantity: 5 },
    { itemId: "carrot", quantity: 100000 },
    { itemId: "hoe", quantity: -3 },
    { itemId: "tomato", quantity: "banyak" },
    "bukan objek",
    ...Array.from({ length: 40 }, () => ({ itemId: "potato", quantity: 1 })),
  ];
  const data = parseOk(JSON.stringify(raw));
  assert.equal(data.inventory.stacks[0]!.itemId, "carrot");
  assert.equal(data.inventory.stacks[0]!.quantity, 99);
  assert.ok(data.inventory.stacks.length <= 20);
  assert.ok(data.inventory.stacks.every((s) => s.itemId !== "item-hantu"));
});

test("petak: id asing dibuang, petak hilang dibuat kosong, tanaman tak dikenal jadi tanah terolah", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.farm.plots = [
    { id: "plot-1", status: "growing", cropId: "tanaman-hantu", growthMinutes: 50, wetUntil: 0, lastSync: 0 },
    { id: "plot-asing", status: "tilled", cropId: null, growthMinutes: 0, wetUntil: 0, lastSync: 0 },
    { id: "plot-3", status: "status-aneh", cropId: null, growthMinutes: -5, wetUntil: "x", lastSync: null },
  ];
  const { plots } = parseOk(JSON.stringify(raw)).farm;
  assert.deepEqual(plots.map((p) => p.id), ctx.plotIds);
  assert.equal(plots[0]!.status, "tilled");
  assert.equal(plots[0]!.cropId, null);
  assert.equal(plots[1]!.status, "empty");
  assert.equal(plots[2]!.status, "empty");
  assert.equal(plots[2]!.growthMinutes, 0);
});

test("pertumbuhan tidak boleh melebihi kebutuhan tanaman", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.farm.plots[0].growthMinutes = 999999;
  assert.equal(parseOk(JSON.stringify(raw)).farm.plots[0]!.growthMinutes, 600);
});

test("jam game dinormalkan dan kecepatan tidak valid kembali ke 1x", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.clock.state = { day: 99, month: 99, year: -4, hour: 77, minute: -9, speedMultiplier: 9999 };
  raw.clock.accumulator = 55;
  const { clock } = parseOk(JSON.stringify(raw));
  assert.ok(clock.state.day >= 1 && clock.state.day <= 30);
  assert.ok(clock.state.month >= 1 && clock.state.month <= 12);
  assert.ok(clock.state.year >= 1);
  assert.ok(clock.state.hour >= 0 && clock.state.hour <= 23);
  assert.equal(clock.state.speedMultiplier, 1);
  assert.ok(clock.accumulator < 1);
});

test("quest: status tidak valid dibuang, progres dibatasi sesuai objektif", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.quests = { tutorial_farming: { status: "active", objectives: [99, -5, "x"] }, quest_hantu: { status: "active", objectives: [] } };
  const { quests } = parseOk(JSON.stringify(raw));
  assert.deepEqual(quests.tutorial_farming!.objectives, [1, 0, 0, 0]);
  assert.equal(quests.quest_hantu, undefined);

  raw.quests = { tutorial_farming: { status: "curang", objectives: [1, 1, 1, 1] } };
  assert.deepEqual(parseOk(JSON.stringify(raw)).quests, {});
});

test("quest dari versi lama yang objektifnya berubah: status disesuaikan agar tidak macet", () => {
  const raw = JSON.parse(serializeSave(sample()));
  // Quest A dulu 3 objektif (dengan musala). Sekarang 2: [1,1,0] aktif harus menjadi siap diserahkan.
  raw.quests = { learn_masjid: { status: "active", objectives: [1, 1, 0] } };
  assert.equal(parseOk(JSON.stringify(raw)).quests.learn_masjid!.status, "ready");
  assert.deepEqual(parseOk(JSON.stringify(raw)).quests.learn_masjid!.objectives, [1, 1]);

  // Quest B kini punya objektif latihan wudu. Save lama [1,3,1] berstatus ready harus kembali aktif.
  raw.quests = { learn_wudu: { status: "ready", objectives: [1, 3, 1] } };
  const b = parseOk(JSON.stringify(raw)).quests.learn_wudu!;
  assert.equal(b.status, "active", "ada objektif baru yang belum dilakukan");
  assert.deepEqual(b.objectives, [1, 0, 3, 1], "progres lama pindah ke objektif yang benar, bukan bergeser");

  // Quest yang sudah selesai tidak diubah (hadiah sudah diterima).
  raw.quests = { learn_wudu: { status: "completed", objectives: [1, 3, 1] } };
  assert.equal(parseOk(JSON.stringify(raw)).quests.learn_wudu!.status, "completed");
});

test("progres quest disimpan berdasarkan id objektif sehingga urutan boleh berubah", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.quests = {
    learn_wudu: {
      status: "active",
      objectives: [3, 1, 0, 0],
      objectiveIds: ["clean-yard", "learn-wudu-intro", "practice-wudu", "learn-prayer-times"],
    },
  };
  assert.deepEqual(parseOk(JSON.stringify(raw)).quests.learn_wudu!.objectives, [1, 0, 3, 0]);
});

test("objektif yang dihapus pada versi baru dibuang, dan id asing diabaikan", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.quests = { learn_masjid: { status: "active", objectives: [1, 1, 1], objectiveIds: ["learn-masjid-intro", "id-hantu", "learn-musala-intro"] } };
  assert.deepEqual(parseOk(JSON.stringify(raw)).quests.learn_masjid!.objectives, [1, 0]);
});

test("serializeQuests menyertakan id objektif dan hasilnya kembali utuh saat dibaca", () => {
  const quests = { learn_wudu: { status: "active" as const, objectives: [1, 0, 2, 0] }, tutorial_farming: { status: "ready" as const, objectives: [1, 1, 1, 1] } };
  const saved = serializeQuests(quests);
  assert.deepEqual(saved.learn_wudu!.objectiveIds, ["learn-wudu-intro", "practice-wudu", "clean-yard", "learn-prayer-times"]);
  const raw = JSON.parse(serializeSave(sample()));
  raw.quests = saved;
  assert.deepEqual(parseOk(JSON.stringify(raw)).quests, quests);
});

test("id materi musala dari save lama dibuang tanpa merusak sisanya", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.learning = { learned: ["musala-intro", "masjid-intro"] };
  assert.deepEqual(parseOk(JSON.stringify(raw)).learning.learned, ["masjid-intro"]);
});

test("posisi, pengaturan, dan nama profil yang rusak memakai nilai default", () => {
  const raw = JSON.parse(serializeSave(sample()));
  raw.player = { x: "a", z: null, heading: Infinity };
  raw.settings = { cameraSensitivity: 50, showFps: "ya", prayerSound: "ya" };
  raw.profile = { name: "   " };
  const data = parseOk(JSON.stringify(raw));
  assert.deepEqual(data.player, { x: 0, z: 10, heading: Math.PI });
  assert.equal(data.settings.cameraSensitivity, 2.5);
  assert.equal(data.settings.showFps, false);
  assert.equal(data.settings.prayerSound, false);
  assert.equal(data.settings.prayerNotifications, true);
  assert.equal(data.profile.name, "Pemain");
});

test("save tidak memuat secret atau credential", () => {
  const text = serializeSave(sample()).toLowerCase();
  for (const word of ["password", "token", "secret", "apikey", "api_key"]) assert.ok(!text.includes(word), word);
});
