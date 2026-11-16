import assert from "node:assert/strict";
import { test } from "node:test";
import { ACTIVITIES } from "../src/data/activities.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { LEARNING_CONTENT } from "../src/data/learning.ts";
import { QUESTS, QUEST_LIST } from "../src/data/quests.ts";
import { selectEntryNode } from "../src/systems/dialogue/dialogue.ts";
import { parseSave, serializeSave, SAVE_VERSION } from "../src/systems/save/saveSystem.ts";
import type { SaveContext } from "../src/systems/save/saveSystem.ts";

/**
 * Proses ini TIDAK mendaftarkan konten yang belum ditinjau, meniru build produksi.
 * Data dasar tidak boleh memuat materi atau quest agama sama sekali.
 */

test("data dasar tidak memuat materi edukasi", () => {
  assert.equal(LEARNING_CONTENT.length, 0);
});

test("data dasar tidak memuat aktivitas wudu atau salat", () => {
  assert.equal(ACTIVITIES.length, 0);
});

test("data dasar hanya memuat quest non-agama", () => {
  assert.deepEqual(Object.keys(QUESTS), ["tutorial_farming"]);
  assert.deepEqual(QUEST_LIST.map((q) => q.id), ["tutorial_farming"]);
  assert.ok(QUEST_LIST.every((q) => q.category !== "islamic-learning"));
});

test("Ustadz Harun tanpa konten terdaftar hanya punya dialog cadangan non-agama", () => {
  const d = DIALOGUES["ustadz-harun"]!;
  assert.deepEqual(d.entries.map((e) => e.node), ["unavailable"]);
  assert.deepEqual(Object.keys(d.nodes), ["unavailable"]);
  assert.equal(selectEntryNode(d, {}), "unavailable");
  assert.doesNotMatch(d.nodes.unavailable!.text, /masjid|wudu|salat|ibadah|musala/i);
});

test("save dari build dev yang memuat id materi draf tetap terbaca aman di produksi (id dibuang, sisanya utuh)", () => {
  const ctx: SaveContext = {
    plotIds: ["plot-1"],
    clockConfig: { realSecondsPerGameHour: 60, daysPerMonth: 30, monthsPerYear: 12 },
    inventorySlots: 20,
    speedOptions: [1, 4, 16],
    spawn: { x: 0, z: 10, heading: Math.PI },
    sensitivity: { min: 0.4, max: 2.5, default: 1 },
  };
  const raw = serializeSave({
    version: SAVE_VERSION,
    savedAt: 1,
    profile: { name: "Pemain" },
    player: { x: 0, z: 10, heading: 0 },
    clock: { state: { day: 1, month: 1, year: 1, hour: 6, minute: 30, speedMultiplier: 1 }, accumulator: 0 },
    inventory: { slots: 20, stacks: [{ itemId: "hoe", quantity: 1 }] },
    farm: { plots: [] },
    quests: { learn_masjid: { status: "active", objectives: [1, 0] }, tutorial_farming: { status: "completed", objectives: [1, 1, 1, 1] } },
    learning: { learned: ["masjid-intro"] },
    settings: { cameraSensitivity: 1, showFps: false, prayerNotifications: true, prayerSound: false },
  });
  const result = parseSave(raw, ctx);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.data.learning.learned, []);
  assert.deepEqual(Object.keys(result.data.quests), ["tutorial_farming"]);
  assert.equal(result.data.inventory.stacks.length, 1);
});
