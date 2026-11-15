import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";
import type { ViteDevServer } from "vite";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Mod = any;

const memory = new Map<string, string>();
(globalThis as Mod).window = {
  localStorage: {
    getItem: (k: string) => memory.get(k) ?? null,
    setItem: (k: string, v: string) => void memory.set(k, v),
    removeItem: (k: string) => void memory.delete(k),
  },
  matchMedia: () => ({ matches: false }),
};

let dev: ViteDevServer;
let prod: ViteDevServer;
let d: Record<string, Mod>;
let p: Record<string, Mod>;

async function load(server: ViteDevServer) {
  const l = (path: string): Promise<Mod> => server.ssrLoadModule(path);
  return {
    policy: await l("/src/config/contentPolicy.ts"),
    actions: await l("/src/stores/gameActions.ts"),
    dialogueActions: await l("/src/stores/dialogueActions.ts"),
    learningActions: await l("/src/stores/learningActions.ts"),
    persistence: await l("/src/stores/persistence.ts"),
    farm: await l("/src/stores/useFarmStore.ts"),
    inv: await l("/src/stores/useInventoryStore.ts"),
    quest: await l("/src/stores/useQuestStore.ts"),
    learning: await l("/src/stores/useLearningStore.ts"),
    ui: await l("/src/stores/useUiStore.ts"),
    inter: await l("/src/stores/useInteractionStore.ts"),
    settings: await l("/src/stores/useSettingsStore.ts"),
    clock: await l("/src/systems/time/gameClockInstance.ts"),
    learningData: await l("/src/data/learning.ts"),
    tracker: await l("/src/systems/quest/questTracker.ts"),
    unreviewed: await l("/src/data/unreviewed/index.ts"),
  };
}

before(async () => {
  const opts = { server: { middlewareMode: true }, appType: "custom" as const, logLevel: "silent" as const, optimizeDeps: { noDiscovery: true } };
  dev = await createServer({ ...opts, mode: "development" });
  prod = await createServer({ ...opts, mode: "production" });
  d = await load(dev);
  p = await load(prod);
  d.unreviewed.registerUnreviewedContent(); // seperti main.tsx pada build development
  p.unreviewed.registerUnreviewedContent(); // skenario terburuk: konten terdaftar, tetapi build melarang tampil
});

after(async () => {
  await dev.close();
  await prod.close();
});

const count = (m: Record<string, Mod>, id: string): number =>
  m.inv.useInventoryStore.getState().inventory.stacks.filter((s: Mod) => s.itemId === id).reduce((n: number, s: Mod) => n + s.quantity, 0);
const status = (m: Record<string, Mod>, id: string): string => m.quest.useQuestStore.getState().quests[id]?.status ?? "inactive";
const target = (m: Record<string, Mod>, kind: string, id: string) => m.inter.useInteractionStore.setState({ target: { kind, id } });
const toast = (m: Record<string, Mod>): string => m.ui.useUiStore.getState().toast?.text ?? "";
const dialogueNode = (m: Record<string, Mod>): string | undefined => m.ui.useUiStore.getState().dialogue?.nodeId;

/** Membaca materi sampai selesai lewat aksi lokasi, seperti pemain. */
function readContent(m: Record<string, Mod>, placeId: string, contentId: string) {
  target(m, "poi", placeId);
  m.actions.runAction(`learn:${contentId}`);
  assert.equal(m.ui.useUiStore.getState().learning?.contentId, contentId, `panel ${contentId} tidak terbuka`);
  for (let guard = 0; guard < 10 && m.ui.useUiStore.getState().learning; guard++) m.learningActions.learningNext();
  assert.equal(m.ui.useUiStore.getState().learning, null);
}

function talkTo(m: Record<string, Mod>) {
  target(m, "npc", "ustadz-harun");
  m.actions.runAction("talk");
}

test("kebijakan konten mengikuti mode build: dev menampilkan draf, produksi tidak", () => {
  assert.equal(d.policy.ALLOW_UNREVIEWED, true);
  assert.equal(p.policy.ALLOW_UNREVIEWED, false);
});

test("alur lengkap tiga quest Ustadz Harun (build uji)", () => {
  d.persistence.bootstrapGame();
  d.persistence.connectSystemsToClock();
  d.persistence.startNewGame();

  // Quest A: berkenalan dengan masjid
  talkTo(d);
  assert.equal(dialogueNode(d), "intro");
  d.dialogueActions.advanceDialogue();
  assert.equal(dialogueNode(d), "offer_a");
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(status(d, "learn_masjid"), "active");
  d.dialogueActions.advanceDialogue();

  target(d, "poi", "masjid");
  assert.deepEqual(d.actions.computeTargetView(d.inter.useInteractionStore.getState().target).actions.map((a: Mod) => a.id), ["learn:masjid-intro", "learn:masjid-adab", "clean"]);
  readContent(d, "masjid", "masjid-intro");
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_masjid.objectives, [1, 0, 0]);
  assert.ok(d.learning.useLearningStore.getState().learned.includes("masjid-intro"));
  readContent(d, "masjid", "masjid-adab");
  assert.equal(status(d, "learn_masjid"), "active");
  readContent(d, "musala", "musala-intro");
  assert.equal(status(d, "learn_masjid"), "ready");
  assert.match(toast(d), /Misi selesai/);

  talkTo(d);
  assert.equal(dialogueNode(d), "turnin_a");
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(status(d, "learn_masjid"), "completed");
  assert.equal(count(d, "lantern"), 1, "hadiah kosmetik");
  d.dialogueActions.advanceDialogue();

  // Quest B: bersih dan bersuci
  talkTo(d);
  assert.equal(dialogueNode(d), "offer_b");
  d.dialogueActions.chooseDialogueOption(0);
  d.dialogueActions.advanceDialogue();
  readContent(d, "wudu", "wudu-intro");
  target(d, "poi", "masjid");
  for (let i = 0; i < 3; i++) d.actions.runAction("clean");
  assert.equal(d.quest.useQuestStore.getState().quests.learn_wudu.objectives[1], 3);
  d.learningActions.openLearning("prayer-times"); // dari panel jam
  d.learningActions.learningNext();
  d.learningActions.learningNext();
  d.learningActions.learningNext();
  d.learningActions.learningNext();
  assert.equal(status(d, "learn_wudu"), "ready");
  talkTo(d);
  assert.equal(dialogueNode(d), "turnin_b");
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(count(d, "flower_pot"), 1);
  d.dialogueActions.advanceDialogue();

  // Quest C: berbagi hasil kebun. Butuh quest kebun selesai dan hasil panen.
  talkTo(d);
  assert.equal(dialogueNode(d), "need_farm", "kebun belum selesai");
  d.dialogueActions.advanceDialogue();
  const quests = d.quest.useQuestStore.getState().quests;
  d.quest.useQuestStore.getState().setQuests({ ...quests, tutorial_farming: { status: "completed", objectives: [1, 1, 1, 1] } });

  talkTo(d);
  assert.equal(dialogueNode(d), "offer_c");
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(status(d, "share_harvest"), "active");
  assert.equal(dialogueNode(d), "share_active");

  d.dialogueActions.chooseDialogueOption(0); // belum punya hasil panen
  assert.match(toast(d), /belum cukup/);
  assert.equal(status(d, "share_harvest"), "active", "gagal membagikan tidak merusak apa pun");
  assert.equal(dialogueNode(d), "share_active", "tetap di dialog");

  d.inv.useInventoryStore.getState().add("carrot", 1);
  d.inv.useInventoryStore.getState().add("tomato", 2);
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(count(d, "carrot") + count(d, "tomato"), 1, "2 hasil panen dibagikan");
  assert.equal(status(d, "share_harvest"), "ready");
  d.dialogueActions.advanceDialogue();

  talkTo(d);
  assert.equal(dialogueNode(d), "turnin_c");
  d.dialogueActions.chooseDialogueOption(0);
  assert.equal(count(d, "wooden_bench"), 1);
  d.dialogueActions.advanceDialogue();
  talkTo(d);
  assert.equal(dialogueNode(d), "all_done");
  d.dialogueActions.closeDialogue();
});

test("tidak ada penalti: mengabaikan semua waktu salat tidak mengubah apa pun yang dimiliki pemain", () => {
  d.persistence.startNewGame();
  d.inv.useInventoryStore.getState().add("hoe", 1);
  d.inv.useInventoryStore.getState().add("watering_can", 1);
  d.inv.useInventoryStore.getState().add("carrot_seed", 1);
  target(d, "plot", "plot-1");
  d.actions.runAction("till");
  d.actions.runAction("plant:carrot");
  d.actions.runAction("water");

  const inventoryBefore = JSON.stringify(d.inv.useInventoryStore.getState().inventory);
  const questsBefore = JSON.stringify(d.quest.useQuestStore.getState().quests);
  const learnedBefore = JSON.stringify(d.learning.useLearningStore.getState().learned);

  // Dua hari penuh game berjalan tanpa pemain peduli pada pengingat apa pun.
  for (let i = 0; i < 2 * 1440; i++) d.clock.gameClock.advanceMinutes(1);

  assert.equal(JSON.stringify(d.inv.useInventoryStore.getState().inventory), inventoryBefore);
  assert.equal(JSON.stringify(d.quest.useQuestStore.getState().quests), questsBefore);
  assert.equal(JSON.stringify(d.learning.useLearningStore.getState().learned), learnedBefore);
  const plot = d.farm.useFarmStore.getState().plots["plot-1"];
  assert.equal(plot.status, "harvestable", "tanaman tetap sehat dan siap panen");
  assert.equal(plot.cropId, "carrot");
});

test("pengingat salat: tepat sekali per waktu, bukan tiap frame, dan menghormati preferensi", () => {
  d.persistence.startNewGame();
  d.settings.useSettingsStore.setState({ prayerNotifications: true, prayerSound: false });
  const notices: string[] = [];
  const off = d.ui.useUiStore.subscribe((s: Mod, prev: Mod) => {
    if (s.prayerNotice && s.prayerNotice !== prev.prayerNotice) notices.push(s.prayerNotice.text);
  });

  // Mulai 11.59 lalu jalankan 5 detik nyata pada 60 FPS (5 menit game).
  d.clock.gameClock.setState({ day: 1, month: 1, year: 1, hour: 11, minute: 59, speedMultiplier: 1, isPaused: false }, 0);
  for (let i = 0; i < 5 * 60; i++) d.clock.gameClock.tick(1 / 60);
  assert.equal(notices.length, 1);
  assert.match(notices[0]!, /Dzuhur/);

  // Lompatan debug melewati Ashar: tidak ada pengingat.
  d.clock.gameClock.advanceMinutes(400);
  assert.equal(notices.length, 1, "lompatan besar tidak memicu pengingat");

  // Dinonaktifkan pemain: tidak ada pengingat saat Magrib tiba.
  d.settings.useSettingsStore.setState({ prayerNotifications: false });
  d.clock.gameClock.setState({ day: 3, month: 1, year: 1, hour: 18, minute: 14, speedMultiplier: 1, isPaused: false }, 0);
  for (let i = 0; i < 3 * 60; i++) d.clock.gameClock.tick(1 / 60);
  assert.equal(notices.length, 1);

  // Dinyalakan lagi: Isya tiba dan diumumkan sekali.
  d.settings.useSettingsStore.setState({ prayerNotifications: true });
  d.clock.gameClock.setState({ day: 3, month: 1, year: 1, hour: 19, minute: 29, speedMultiplier: 1, isPaused: false }, 0);
  for (let i = 0; i < 3 * 60; i++) d.clock.gameClock.tick(1 / 60);
  assert.equal(notices.length, 2);
  assert.match(notices[1]!, /Isya/);
  off();
});

test("memuat game tepat di waktu salat tidak memunculkan pengingat", () => {
  d.persistence.startNewGame();
  let count2 = 0;
  const off = d.ui.useUiStore.subscribe((s: Mod, prev: Mod) => {
    if (s.prayerNotice !== prev.prayerNotice) count2++;
  });
  d.clock.gameClock.setState({ day: 2, month: 1, year: 1, hour: 12, minute: 0, speedMultiplier: 1, isPaused: false }, 0);
  d.persistence.saveGame();
  d.persistence.bootstrapGame();
  d.clock.gameClock.tick(0.3);
  assert.equal(count2, 0);
  off();
});

test("save Phase 2 (kunci lama, versi 1) dimuat, dimigrasikan, dan dipindah ke kunci baru", () => {
  d.persistence.startNewGame();
  d.inv.useInventoryStore.getState().add("hoe", 1);
  d.inv.useInventoryStore.getState().add("carrot", 3);
  const v1 = JSON.parse(JSON.stringify(d.persistence.buildSaveData()));
  v1.version = 1;
  delete v1.learning;
  v1.settings = { cameraSensitivity: 1.8, showFps: false };
  memory.clear();
  memory.set("qinaraya.save.v1", JSON.stringify(v1));

  d.inv.useInventoryStore.getState().reset();
  assert.equal(d.persistence.bootstrapGame(), "loaded");
  assert.equal(count(d, "hoe"), 1);
  assert.equal(count(d, "carrot"), 3);
  assert.equal(d.settings.useSettingsStore.getState().cameraSensitivity, 1.8);
  assert.equal(d.settings.useSettingsStore.getState().prayerNotifications, true);
  assert.equal(d.settings.useSettingsStore.getState().prayerSound, false);
  assert.deepEqual(d.learning.useLearningStore.getState().learned, []);
  assert.equal(JSON.parse(memory.get("qinaraya.save")!).version, 2, "tersimpan ulang dengan format baru");
  assert.ok(memory.has("qinaraya.save.v1"), "kunci lama dibiarkan sebagai cadangan");
});

test("progres belajar tersimpan dan kembali setelah muat ulang", () => {
  d.persistence.startNewGame();
  d.quest.useQuestStore.getState().setQuests({ learn_masjid: { status: "active", objectives: [1, 0, 0] } });
  d.learning.useLearningStore.getState().markLearned("masjid-intro");
  d.persistence.saveGame();
  d.learning.useLearningStore.getState().reset();
  d.quest.useQuestStore.getState().reset();
  d.persistence.bootstrapGame();
  assert.deepEqual(d.learning.useLearningStore.getState().learned, ["masjid-intro"]);
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_masjid.objectives, [1, 0, 0]);
});

// ---------- Skenario produksi (build menolak konten belum ditinjau) ----------

test("produksi: materi draf tidak bisa dibuka walau terdaftar", () => {
  p.persistence.startNewGame();
  assert.equal(p.learningData.getVisibleLearningContent("masjid-intro"), undefined);
  assert.equal(p.learningData.getVisibleLearningContent("wudu-intro"), undefined);
  p.learningActions.openLearning("wudu-intro");
  assert.equal(p.ui.useUiStore.getState().learning, null);
  assert.equal(toast(p), "Materi ini belum tersedia");
});

test("produksi: lokasi hanya menawarkan aktivitas non-agama, musala dan tempat wudu tanpa prompt", () => {
  target(p, "poi", "masjid");
  assert.deepEqual(p.actions.computeTargetView(p.inter.useInteractionStore.getState().target).actions.map((a: Mod) => a.id), ["clean"]);
  assert.equal(p.actions.computeTargetView({ kind: "poi", id: "musala" }), null);
  assert.equal(p.actions.computeTargetView({ kind: "poi", id: "wudu" }), null);
});

test("produksi: Ustadz Harun hanya memberi dialog cadangan non-agama dan quest agama tidak bisa dimulai", () => {
  p.persistence.startNewGame();
  target(p, "npc", "ustadz-harun");
  p.actions.runAction("talk");
  assert.equal(dialogueNode(p), "unavailable");
  const view = p.dialogueActions.getDialogueView("ustadz-harun", "unavailable");
  assert.doesNotMatch(view.text, /masjid|wudu|salat|ibadah|musala/i);
  p.dialogueActions.advanceDialogue();
  assert.equal(p.ui.useUiStore.getState().dialogue, null);
  assert.equal(status(p, "learn_masjid"), "inactive");
});

test("produksi: HUD hanya melacak quest non-agama", () => {
  assert.equal(p.tracker.getTrackedQuest({})?.quest.id, "tutorial_farming");
  const active = { learn_masjid: { status: "active", objectives: [0, 0, 0] } };
  assert.equal(p.tracker.getTrackedQuest(active)?.quest.id, "tutorial_farming");
});
