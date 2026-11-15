import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";

/**
 * Tes integrasi: memuat modul store asli lewat Vite SSR (tanpa browser) dan menjalankan
 * satu putaran penuh: dialog, quest, olah tanah, tanam, siram, tunggu waktu game, panen, serah quest.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mod = any;
let server: ViteDevServer;
let m: {
  actions: Mod;
  dialogue: Mod;
  persistence: Mod;
  farm: Mod;
  inv: Mod;
  quest: Mod;
  ui: Mod;
  inter: Mod;
  clock: Mod;
  layout: Mod;
  settings: Mod;
};

// localStorage palsu agar autosave dan load bisa diuji.
const memory = new Map<string, string>();
(globalThis as Mod).window = {
  localStorage: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  },
  matchMedia: () => ({ matches: false }),
};

before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent", optimizeDeps: { noDiscovery: true } });
  const load = (p: string) => server.ssrLoadModule(p);
  m = {
    actions: await load("/src/stores/gameActions.ts"),
    dialogue: await load("/src/stores/dialogueActions.ts"),
    persistence: await load("/src/stores/persistence.ts"),
    farm: await load("/src/stores/useFarmStore.ts"),
    inv: await load("/src/stores/useInventoryStore.ts"),
    quest: await load("/src/stores/useQuestStore.ts"),
    ui: await load("/src/stores/useUiStore.ts"),
    inter: await load("/src/stores/useInteractionStore.ts"),
    clock: await load("/src/systems/time/gameClockInstance.ts"),
    layout: await load("/src/worlds/qinaraya-village/villageLayout.ts"),
    settings: await load("/src/stores/useSettingsStore.ts"),
  };
  // Seperti main.tsx pada build development: konten belum ditinjau didaftarkan sebelum game dimulai.
  const unreviewed: Mod = await load("/src/data/unreviewed/index.ts");
  unreviewed.registerUnreviewedContent();
});

after(async () => {
  await server.close();
});

const count = (id: string): number => m.inv.useInventoryStore.getState().inventory.stacks.filter((s: Mod) => s.itemId === id).reduce((n: number, s: Mod) => n + s.quantity, 0);
const plot = (id: string) => m.farm.useFarmStore.getState().plots[id];
const target = (kind: string, id: string) => m.inter.useInteractionStore.setState({ target: { kind, id } });
const toastText = (): string => m.ui.useUiStore.getState().toast?.text ?? "";

/** Memajukan Game Clock seperti game loop, dan menyinkronkan kebun lewat langganan pusat. */
function passTime(minutes: number) {
  m.clock.gameClock.advanceMinutes(minutes);
}

test("game baru: kebun kosong, tas kosong, belum ada quest", () => {
  assert.equal(m.persistence.bootstrapGame(), "new");
  m.persistence.connectSystemsToClock();
  assert.equal(Object.keys(m.farm.useFarmStore.getState().plots).length, 6);
  assert.equal(m.inv.useInventoryStore.getState().inventory.stacks.length, 0);
  assert.deepEqual(m.quest.useQuestStore.getState().quests, {});
});

test("tanpa cangkul, aksi mencangkul ditolak dengan penjelasan", () => {
  target("plot", "plot-1");
  m.actions.triggerAction(0);
  assert.equal(plot("plot-1").status, "empty");
  assert.equal(toastText(), "Butuh cangkul");
});

test("dialog Pak Hasan: terima quest memberi alat dan benih", () => {
  m.actions.runAction("talk"); // tidak ada target NPC: diabaikan
  target("npc", "pak-hasan");
  m.actions.runAction("talk");
  assert.equal(m.ui.useUiStore.getState().dialogue.nodeId, "intro");
  assert.equal(m.ui.isModalOpen(), true, "dialog menjeda dunia");

  m.dialogue.advanceDialogue();
  assert.equal(m.ui.useUiStore.getState().dialogue.nodeId, "offer");
  m.dialogue.advanceDialogue(); // node pilihan: Lanjut tidak berlaku
  assert.equal(m.ui.useUiStore.getState().dialogue.nodeId, "offer");

  m.dialogue.chooseDialogueOption(0);
  assert.equal(m.quest.useQuestStore.getState().quests.tutorial_farming.status, "active");
  assert.equal(count("hoe"), 1);
  assert.equal(count("watering_can"), 1);
  assert.equal(count("carrot_seed"), 3);
  m.dialogue.advanceDialogue();
  assert.equal(m.ui.useUiStore.getState().dialogue, null);
  assert.equal(m.ui.isModalOpen(), false);
});

test("menolak quest tidak memberi apa pun dan tidak menyimpan status", () => {
  m.persistence.startNewGame();
  target("npc", "pak-hasan");
  m.actions.runAction("talk");
  m.dialogue.advanceDialogue();
  m.dialogue.chooseDialogueOption(1); // Nanti saja
  assert.equal(m.ui.useUiStore.getState().dialogue, null);
  assert.deepEqual(m.quest.useQuestStore.getState().quests, {});
  assert.equal(m.inv.useInventoryStore.getState().inventory.stacks.length, 0);
});

test("loop farming lengkap sampai quest selesai", () => {
  m.persistence.startNewGame();
  target("npc", "pak-hasan");
  m.actions.runAction("talk");
  m.dialogue.advanceDialogue();
  m.dialogue.chooseDialogueOption(0);
  m.dialogue.advanceDialogue();

  target("plot", "plot-1");
  m.actions.triggerAction(0); // cangkul
  assert.equal(plot("plot-1").status, "tilled");

  m.actions.runAction("plant:carrot");
  assert.equal(plot("plot-1").status, "planted");
  assert.equal(plot("plot-1").cropId, "carrot");
  assert.equal(count("carrot_seed"), 2, "benih berkurang saat menanam");

  passTime(1000); // kering: tidak tumbuh dan tidak mati
  assert.equal(plot("plot-1").status, "planted");
  assert.equal(plot("plot-1").growthMinutes, 0);

  m.actions.runAction("water");
  assert.equal(toastText(), "Tanah disiram");
  passTime(200);
  assert.equal(plot("plot-1").status, "growing");
  assert.ok(plot("plot-1").growthMinutes > 0);

  m.actions.runAction("harvest"); // belum matang: tidak ada aksi panen
  assert.equal(count("carrot"), 0);

  passTime(200); // total 400 menit basah >= 360
  assert.equal(plot("plot-1").status, "harvestable");
  assert.equal(m.quest.useQuestStore.getState().quests.tutorial_farming.status, "active", "belum panen");

  m.actions.runAction("harvest");
  assert.equal(count("carrot"), 2, "hasil panen masuk tas");
  assert.equal(plot("plot-1").status, "tilled");
  assert.equal(m.quest.useQuestStore.getState().quests.tutorial_farming.status, "ready");
  assert.match(toastText(), /Misi selesai/);

  target("npc", "pak-hasan");
  m.actions.runAction("talk");
  assert.equal(m.ui.useUiStore.getState().dialogue.nodeId, "turnin");
  const before = count("tomato_seed");
  m.dialogue.chooseDialogueOption(0);
  assert.equal(m.quest.useQuestStore.getState().quests.tutorial_farming.status, "completed");
  assert.equal(count("tomato_seed"), before + 3, "hadiah masuk");

  // Hadiah tidak bisa diklaim dua kali.
  m.dialogue.advanceDialogue();
  target("npc", "pak-hasan");
  m.actions.runAction("talk");
  assert.equal(m.ui.useUiStore.getState().dialogue.nodeId, "done");
  m.dialogue.closeDialogue();
});

test("panen ditolak saat tas penuh dan tanaman tidak hilang", () => {
  m.persistence.startNewGame();
  const slots = m.inv.useInventoryStore.getState().inventory.slots;
  m.inv.useInventoryStore.setState({
    inventory: { slots, stacks: Array.from({ length: slots }, () => ({ itemId: "hoe", quantity: 1 })) },
  });
  m.farm.useFarmStore.getState().setPlot({ id: "plot-2", status: "harvestable", cropId: "tomato", growthMinutes: 600, wetUntil: 0, lastSync: 0 });
  target("plot", "plot-2");
  m.actions.runAction("harvest");
  assert.equal(plot("plot-2").status, "harvestable");
  assert.equal(toastText(), "Tas penuh");
});

test("aksi diabaikan saat panel terbuka", () => {
  m.persistence.startNewGame();
  m.inv.useInventoryStore.getState().add("hoe", 1);
  target("plot", "plot-3");
  m.ui.useUiStore.getState().setInventoryOpen(true);
  m.actions.runAction("till");
  assert.equal(plot("plot-3").status, "empty");
  m.ui.useUiStore.getState().setInventoryOpen(false);
  m.actions.runAction("till");
  assert.equal(plot("plot-3").status, "tilled");
});

test("load dari save yang tersimpan memulihkan state", () => {
  m.persistence.startNewGame();
  m.inv.useInventoryStore.getState().add("hoe", 1);
  m.inv.useInventoryStore.getState().add("carrot_seed", 2);
  target("plot", "plot-4");
  m.actions.runAction("till");
  m.actions.runAction("plant:carrot");
  m.actions.runAction("water");
  assert.equal(toastText(), "Butuh penyiram", "tanpa penyiram, aksi siram ditolak");
  m.inv.useInventoryStore.getState().add("watering_can", 1);
  m.actions.runAction("water");
  m.clock.gameClock.advanceMinutes(100);
  const total = m.clock.gameClock.getTotalMinutes();
  const growth = plot("plot-4").growthMinutes;
  m.persistence.saveGame();

  // Acak state, lalu muat ulang dari penyimpanan.
  m.farm.useFarmStore.getState().reset(["plot-4"]);
  m.inv.useInventoryStore.getState().reset();
  m.clock.gameClock.advanceDays(9);
  assert.equal(m.persistence.bootstrapGame(), "loaded");

  assert.equal(m.clock.gameClock.getTotalMinutes(), total, "waktu dunia kembali ke saat disimpan");
  assert.equal(growth, 100);
  assert.equal(plot("plot-4").status, "growing");
  assert.equal(plot("plot-4").growthMinutes, growth);
  assert.equal(count("hoe"), 1);
  assert.equal(count("watering_can"), 1);
  assert.equal(count("carrot_seed"), 1);
  assert.equal(Object.keys(m.farm.useFarmStore.getState().plots).length, 6);
});

test("save rusak: dicadangkan, game baru dimulai, dan tidak melempar error", () => {
  memory.set("qinaraya.save", "{rusak");
  assert.equal(m.persistence.bootstrapGame(), "new");
  assert.equal(memory.get("qinaraya.save.backup"), "{rusak");
});

test("save dari versi lebih baru tidak ditimpa oleh autosave", () => {
  const future = JSON.stringify({ version: 99, data: "masa depan" });
  memory.set("qinaraya.save", future);
  assert.equal(m.persistence.bootstrapGame(), "new");
  assert.equal(m.persistence.saveGame(), false);
  assert.equal(memory.get("qinaraya.save"), future);
  m.persistence.startNewGame(); // pemain memilih mulai baru: boleh menimpa
  assert.notEqual(memory.get("qinaraya.save"), future);
});

test("posisi tersimpan di dalam collider dipindahkan ke tempat aman saat load", async () => {
  const { playerState } = await server.ssrLoadModule("/src/systems/player/playerState.ts");
  m.persistence.startNewGame();
  const raw = JSON.parse(memory.get("qinaraya.save")!);
  raw.player = { x: 0, z: -16, heading: 0 }; // tepat di tengah masjid
  memory.set("qinaraya.save", JSON.stringify(raw));
  assert.equal(m.persistence.bootstrapGame(), "loaded");
  const inside = m.layout.villageLayout.colliders.some(
    (c: Mod) => c.kind === "box" && playerState.x > c.minX && playerState.x < c.maxX && playerState.z > c.minZ && playerState.z < c.maxZ,
  );
  assert.equal(inside, false, `pemain masih di dalam bangunan: (${playerState.x}, ${playerState.z})`);
});
