import assert from "node:assert/strict";
import { test } from "node:test";
import { CROPS } from "../src/data/crops.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { ITEMS } from "../src/data/items.ts";
import { QUESTS } from "../src/data/quests.ts";
import { NPCS } from "../src/data/npcs.ts";
import { describeNpc, describePlot } from "../src/systems/interaction/actions.ts";
import { findNearestInteractable, distanceToInteractable } from "../src/systems/interaction/interactables.ts";
import type { Interactable } from "../src/systems/interaction/interactables.ts";
import { renderDialogueText, selectEntryNode } from "../src/systems/dialogue/dialogue.ts";
import {
  createPlot,
  getGrowthProgress,
  harvestPlot,
  isWet,
  plantCrop,
  syncPlot,
  tillPlot,
  waterPlot,
} from "../src/systems/farming/farmPlot.ts";
import type { FarmPlot } from "../src/systems/farming/farmPlot.ts";
import {
  addAll,
  addItem,
  canAdd,
  canAddAll,
  countItem,
  createInventory,
  freeSpaceFor,
  hasItem,
  removeItem,
} from "../src/systems/inventory/inventory.ts";
import { applyEvent, completeQuest, getNextObjective, getStatus, startQuest } from "../src/systems/quest/questEngine.ts";

const WATER = 480;
const tutorial = QUESTS.tutorial_farming!;

// ---------- Data ----------

test("data konsisten: tanaman merujuk item yang ada, dialog dan quest merujuk NPC yang ada", () => {
  for (const crop of Object.values(CROPS)) {
    assert.ok(ITEMS[crop.seedItemId]?.category === "seed", `${crop.id}: benih`);
    assert.ok(ITEMS[crop.harvestItemId]?.category === "crop", `${crop.id}: hasil panen`);
    assert.ok(crop.growthMinutes > 0 && crop.yield > 0);
  }
  const npcIds = new Set(NPCS.map((n) => n.id));
  for (const d of Object.values(DIALOGUES)) {
    assert.ok(npcIds.has(d.npcId));
    for (const entry of d.entries) assert.ok(d.nodes[entry.node], `entri ${entry.node} tanpa node`);
    for (const node of Object.values(d.nodes)) {
      if (node.next) assert.ok(d.nodes[node.next], `next ${node.next} tidak ada`);
      for (const c of node.choices ?? []) if (c.next) assert.ok(d.nodes[c.next], `choice next ${c.next} tidak ada`);
    }
  }
  for (const q of Object.values(QUESTS)) {
    assert.ok(npcIds.has(q.giverNpcId));
    for (const g of [...q.startItems, ...q.rewardItems]) assert.ok(ITEMS[g.itemId], `item ${g.itemId}`);
  }
  for (const item of Object.values(ITEMS)) assert.ok(item.maxStack >= 1);
});

test("alat dan benih awal quest muat di inventory kosong", () => {
  assert.ok(canAddAll(createInventory(20), tutorial.startItems));
});

// ---------- Inventory ----------

test("inventory: tambah, tumpuk, dan hitung", () => {
  let inv = createInventory(5);
  inv = addItem(inv, "carrot", 60).inventory;
  const r = addItem(inv, "carrot", 60);
  assert.equal(r.added, 60);
  assert.equal(countItem(r.inventory, "carrot"), 120);
  assert.equal(r.inventory.stacks.length, 2); // 99 + 21
  assert.equal(r.inventory.stacks[0]!.quantity, 99);
});

test("inventory: alat tidak menumpuk (maxStack 1) dan inventory asal tidak berubah", () => {
  const inv = createInventory(3);
  const a = addItem(inv, "hoe", 1).inventory;
  const b = addItem(a, "hoe", 1).inventory;
  assert.equal(b.stacks.length, 2);
  assert.equal(inv.stacks.length, 0);
});

test("inventory penuh: sebagian muat, sisanya tidak hilang diam-diam", () => {
  let inv = createInventory(2);
  inv = addItem(inv, "hoe", 1).inventory;
  const r = addItem(inv, "watering_can", 5);
  assert.equal(r.added, 1);
  assert.equal(canAdd(r.inventory, "carrot", 1), false);
  assert.equal(freeSpaceFor(r.inventory, "carrot"), 0);
});

test("inventory: item tidak dikenal atau jumlah tidak valid ditolak", () => {
  const inv = createInventory(5);
  assert.equal(addItem(inv, "tidak-ada", 1).added, 0);
  assert.equal(addItem(inv, "carrot", 0).added, 0);
  assert.equal(addItem(inv, "carrot", -3).added, 0);
});

test("inventory: remove mengurangi, mengosongkan slot, dan menolak bila kurang", () => {
  let inv = addItem(createInventory(5), "carrot_seed", 3).inventory;
  assert.equal(removeItem(inv, "carrot_seed", 4), null);
  assert.equal(countItem(inv, "carrot_seed"), 3);
  inv = removeItem(inv, "carrot_seed", 2)!;
  assert.equal(countItem(inv, "carrot_seed"), 1);
  inv = removeItem(inv, "carrot_seed", 1)!;
  assert.equal(inv.stacks.length, 0);
  assert.equal(hasItem(inv, "carrot_seed"), false);
});

test("canAddAll dan addAll untuk hadiah quest", () => {
  const full = addAll(createInventory(2), [{ itemId: "hoe", quantity: 1 }, { itemId: "watering_can", quantity: 1 }]);
  assert.equal(canAddAll(full, tutorial.rewardItems), false);
  assert.equal(canAddAll(createInventory(20), tutorial.rewardItems), true);
});

// ---------- Farming ----------

function plantedPlot(cropId: string, now = 0): FarmPlot {
  return plantCrop(tillPlot(createPlot("plot-1"))!, cropId, now)!;
}

test("alur status: empty > tilled > planted > growing > harvestable > tilled", () => {
  let plot = createPlot("plot-1");
  assert.equal(plot.status, "empty");
  plot = tillPlot(plot)!;
  assert.equal(plot.status, "tilled");
  plot = plantCrop(plot, "carrot", 0)!;
  assert.equal(plot.status, "planted");
  plot = waterPlot(plot, 0, WATER)!;
  plot = syncPlot(plot, 100);
  assert.equal(plot.status, "growing");
  plot = syncPlot(plot, 360);
  assert.equal(plot.status, "harvestable");
  const harvested = harvestPlot(plot)!;
  assert.equal(harvested.cropId, "carrot");
  assert.equal(harvested.plot.status, "tilled");
  assert.equal(harvested.plot.cropId, null);
});

test("aksi tidak valid ditolak pada status yang salah", () => {
  const empty = createPlot("p");
  assert.equal(plantCrop(empty, "carrot", 0), null);
  assert.equal(waterPlot(empty, 0, WATER), null);
  assert.equal(harvestPlot(empty), null);
  const tilled = tillPlot(empty)!;
  assert.equal(tillPlot(tilled), null);
  assert.equal(plantCrop(tilled, "tidak-ada", 0), null);
  const planted = plantedPlot("carrot");
  assert.equal(harvestPlot(planted), null);
  assert.equal(plantCrop(planted, "tomato", 0), null);
});

test("tanaman tumbuh hanya saat tanah basah", () => {
  let plot = plantedPlot("carrot");
  plot = syncPlot(plot, 1000); // kering seribu menit
  assert.equal(plot.growthMinutes, 0);
  assert.equal(plot.status, "planted");

  plot = waterPlot(plot, 1000, WATER)!;
  plot = syncPlot(plot, 1100);
  assert.equal(plot.growthMinutes, 100);
  assert.equal(isWet(plot), true);
});

test("tanah mengering setelah masa basah habis; pertumbuhan berhenti di titik itu", () => {
  let plot = plantedPlot("tomato"); // butuh 600, air 480
  plot = waterPlot(plot, 0, WATER)!;
  plot = syncPlot(plot, 5000);
  assert.equal(plot.growthMinutes, 480);
  assert.equal(plot.status, "growing");
  assert.equal(isWet(plot), false);
  plot = waterPlot(plot, 5000, WATER)!;
  plot = syncPlot(plot, 5200);
  assert.equal(plot.status, "harvestable");
  assert.equal(plot.growthMinutes, 600);
});

test("sync tidak peduli seberapa sering dipanggil, hasilnya sama", () => {
  const base = waterPlot(plantedPlot("potato"), 0, WATER)!;
  let a = base;
  for (let t = 1; t <= 300; t++) a = syncPlot(a, t);
  const b = syncPlot(base, 300);
  assert.equal(a.growthMinutes, b.growthMinutes);
});

test("tanaman tidak pernah mati: lompatan waktu sangat besar tidak merusak apa pun", () => {
  const carrot = waterPlot(plantedPlot("carrot"), 0, WATER)!;
  const done = syncPlot(carrot, 10_000_000);
  assert.equal(done.status, "harvestable");
  assert.equal(done.cropId, "carrot");
  const dryForever = syncPlot(plantedPlot("carrot"), 10_000_000);
  assert.equal(dryForever.status, "planted");
  assert.equal(dryForever.cropId, "carrot");
  assert.equal(syncPlot(done, 20_000_000).status, "harvestable");
});

test("waktu mundur atau tetap tidak mengubah apa pun", () => {
  const plot = waterPlot(plantedPlot("carrot", 500), 500, WATER)!;
  assert.equal(syncPlot(plot, 500), plot);
  assert.equal(syncPlot(plot, 100).growthMinutes, 0);
});

test("menyiram sebelum menanam: kelembapan terbawa", () => {
  let plot = tillPlot(createPlot("p"))!;
  plot = waterPlot(plot, 0, WATER)!;
  plot = plantCrop(plot, "carrot", 50)!;
  plot = syncPlot(plot, 150);
  assert.equal(plot.growthMinutes, 100);
});

test("progres pertumbuhan 0..1", () => {
  const plot = syncPlot(waterPlot(plantedPlot("carrot"), 0, WATER)!, 180);
  assert.equal(getGrowthProgress(plot), 0.5);
  assert.equal(getGrowthProgress(createPlot("p")), 0);
});

test("setiap tanaman awal bisa diselesaikan dengan satu atau dua siraman", () => {
  for (const crop of Object.values(CROPS)) {
    let plot = plantedPlot(crop.id);
    let now = 0;
    let waterings = 0;
    while (plot.status !== "harvestable" && waterings < 5) {
      plot = waterPlot(syncPlot(plot, now), now, WATER)!;
      waterings++;
      now += WATER;
      plot = syncPlot(plot, now);
    }
    assert.equal(plot.status, "harvestable", crop.id);
    assert.ok(waterings <= 2, `${crop.id} butuh ${waterings} siraman`);
  }
});

// ---------- Aksi tersedia ----------

test("aksi petak mengikuti kepemilikan alat dan benih", () => {
  const empty = createPlot("plot-3");
  let inv = createInventory(20);
  const noTool = describePlot(empty, inv);
  assert.equal(noTool.title, "Petak kebun 3");
  assert.equal(noTool.actions[0]!.enabled, false);
  assert.equal(noTool.actions[0]!.hint, "Butuh cangkul");

  inv = addAll(inv, tutorial.startItems);
  assert.equal(describePlot(empty, inv).actions[0]!.enabled, true);

  const tilled = tillPlot(empty)!;
  const ids = describePlot(tilled, inv).actions.map((a) => a.id);
  assert.deepEqual(ids, ["plant:carrot", "plant:tomato", "plant:potato", "water"]);

  const noSeeds = describePlot(tilled, createInventory(20)).actions[0]!;
  assert.equal(noSeeds.id, "plant:none");
  assert.equal(noSeeds.enabled, false);
});

test("panen dinonaktifkan saat tas penuh", () => {
  const ready = syncPlot(waterPlot(plantedPlot("carrot"), 0, WATER)!, 400);
  assert.equal(ready.status, "harvestable");
  assert.equal(describePlot(ready, createInventory(20)).actions[0]!.enabled, true);
  const full = addAll(createInventory(1), [{ itemId: "hoe", quantity: 1 }]);
  const view = describePlot(ready, full);
  assert.equal(view.actions[0]!.enabled, false);
  assert.equal(view.actions[0]!.hint, "Tas penuh");
});

test("status petak menjelaskan kondisi tanaman", () => {
  const dry = describePlot(plantedPlot("carrot"), createInventory(20));
  assert.match(dry.status!, /butuh air/);
  const wet = describePlot(waterPlot(plantedPlot("carrot"), 0, WATER)!, createInventory(20));
  assert.doesNotMatch(wet.status!, /butuh air/);
});

test("NPC memiliki aksi bicara; NPC tidak dikenal menghasilkan null", () => {
  assert.equal(describeNpc("pak-hasan")!.actions[0]!.id, "talk");
  assert.equal(describeNpc("tidak-ada"), null);
});

// ---------- Interaksi ----------

const targets: Interactable[] = [
  { kind: "plot", id: "plot-1", cx: 0, cz: 0, w: 2, d: 2 },
  { kind: "plot", id: "plot-2", cx: 3, cz: 0, w: 2, d: 2 },
  { kind: "npc", id: "npc", x: 8, z: 0 },
];
const ranges = { plotRange: 0.9, npcRange: 2.2 };

test("jarak ke petak diukur dari tepi, dan 0 saat berdiri di dalamnya", () => {
  assert.equal(distanceToInteractable(targets[0]!, 0.5, 0.5), 0);
  assert.equal(distanceToInteractable(targets[0]!, 2, 0), 1);
});

test("target terdekat dalam jangkauan; di luar jangkauan tidak ada", () => {
  assert.equal(findNearestInteractable(0, 0, targets, ranges)!.id, "plot-1");
  assert.equal(findNearestInteractable(2.1, 0, targets, ranges)!.id, "plot-2");
  assert.equal(findNearestInteractable(1.5, 5, targets, ranges), null);
});

test("NPC yang dekat menang atas petak di sebelahnya (normalisasi jarak)", () => {
  const list: Interactable[] = [
    { kind: "plot", id: "plot-1", cx: 0, cz: 0, w: 2, d: 2 },
    { kind: "npc", id: "npc", x: 2.2, z: 0 },
  ];
  assert.equal(findNearestInteractable(1.7, 0, list, ranges)!.id, "npc");
});

// ---------- Quest ----------

test("quest: mulai, progres per event, siap, lalu selesai", () => {
  let state = {};
  assert.equal(getStatus(state, "tutorial_farming"), "inactive");
  state = startQuest(state, tutorial)!;
  assert.equal(startQuest(state, tutorial), null, "tidak bisa dimulai dua kali");
  assert.equal(getNextObjective(state, "tutorial_farming")!.label, "Cangkul 1 petak tanah");

  let r = applyEvent(state, { type: "plant", cropId: "carrot" });
  assert.equal(getStatus(r.state, "tutorial_farming"), "active");
  r = applyEvent(r.state, { type: "till" });
  r = applyEvent(r.state, { type: "water" });
  assert.deepEqual(r.readyQuestIds, []);
  assert.equal(getNextObjective(r.state, "tutorial_farming")!.label, "Panen 1 tanaman");
  r = applyEvent(r.state, { type: "harvest", itemId: "carrot", quantity: 2 });
  assert.deepEqual(r.readyQuestIds, ["tutorial_farming"]);
  assert.equal(getStatus(r.state, "tutorial_farming"), "ready");

  const done = completeQuest(r.state, "tutorial_farming")!;
  assert.equal(getStatus(done, "tutorial_farming"), "completed");
  assert.equal(completeQuest(done, "tutorial_farming"), null, "hadiah tidak bisa diklaim dua kali");
});

test("quest: event diabaikan bila quest belum aktif atau objektif sudah penuh", () => {
  const r = applyEvent({}, { type: "till" });
  assert.deepEqual(r.state, {});
  let state = startQuest({}, tutorial)!;
  state = applyEvent(state, { type: "till" }).state;
  const again = applyEvent(state, { type: "till" });
  assert.equal(again.state, state, "tidak ada perubahan");
  assert.equal(completeQuest(state, "tutorial_farming"), null, "belum siap");
});

// ---------- Dialog ----------

test("dialog Pak Hasan mengikuti status quest", () => {
  const d = DIALOGUES["pak-hasan"]!;
  assert.equal(selectEntryNode(d, {}), "intro");
  let state = startQuest({}, tutorial)!;
  assert.equal(selectEntryNode(d, state), "reminder");
  for (const e of [{ type: "till" }, { type: "water" }, { type: "plant", cropId: "carrot" }, { type: "harvest", itemId: "carrot", quantity: 1 }] as const) {
    state = applyEvent(state, e).state;
  }
  assert.equal(selectEntryNode(d, state), "turnin");
  assert.equal(selectEntryNode(d, completeQuest(state, "tutorial_farming")!), "done");
});

test("teks dialog memakai waktu dari Game Clock", () => {
  assert.equal(renderDialogueText("Selamat {timeOfDay}!", { timeOfDay: "pagi" }), "Selamat pagi!");
  assert.equal(renderDialogueText("{timeOfDay} dan {timeOfDay}", { timeOfDay: "sore" }), "sore dan sore");
});
