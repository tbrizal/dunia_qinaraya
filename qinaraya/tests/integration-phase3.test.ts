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
    activityActions: await l("/src/stores/activityActions.ts"),
    activities: await l("/src/data/activities.ts"),
    perf: await l("/src/systems/worship/performance.ts"),
    worship: await l("/src/data/worship.ts"),
    player: await l("/src/systems/player/playerState.ts"),
    poses: await l("/src/systems/worship/poseLibrary.ts"),
    director: await l("/src/systems/camera/cameraDirector.ts"),
    stages: await l("/src/worlds/qinaraya-village/worshipStages.ts"),
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

/** Menjalankan latihan wudu sampai selesai, seperti pemain menekan Lanjut berkali-kali. */
function practiceWudu(m: Record<string, Mod>) {
  target(m, "poi", "wudu");
  m.actions.runAction("activity:wudu-practice");
  assert.equal(m.ui.useUiStore.getState().activity?.activityId, "wudu-practice");
  assert.equal(m.ui.isModalOpen(), true, "aktivitas menjeda dunia");
  for (let guard = 0; guard < 20 && m.ui.useUiStore.getState().activity; guard++) m.activityActions.activityNext();
  assert.equal(m.ui.useUiStore.getState().activity, null);
  assert.equal(m.ui.isModalOpen(), true, "input tetap terkunci sampai pelaku selesai kembali berdiri");
  m.perf.finishPerformance(); // pelaku selesai kembali berdiri
  assert.equal(m.ui.isModalOpen(), false);
}

function setTime(m: Record<string, Mod>, hour: number, minute: number) {
  m.clock.gameClock.setState({ day: 1, month: 1, year: 1, hour, minute, speedMultiplier: 1, isPaused: false }, 0);
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
  assert.deepEqual(
    d.actions.computeTargetView(d.inter.useInteractionStore.getState().target).actions.map((a: Mod) => a.id),
    ["learn:masjid-intro", "learn:masjid-adab", "activity:salat-moment", "clean"],
  );
  readContent(d, "masjid", "masjid-intro");
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_masjid.objectives, [1, 0]);
  assert.ok(d.learning.useLearningStore.getState().learned.includes("masjid-intro"));
  assert.equal(status(d, "learn_masjid"), "active");
  readContent(d, "masjid", "masjid-adab");
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
  assert.equal(status(d, "learn_wudu"), "active");
  practiceWudu(d);
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_wudu.objectives.slice(0, 2), [1, 1]);
  target(d, "poi", "masjid");
  for (let i = 0; i < 3; i++) d.actions.runAction("clean");
  assert.equal(d.quest.useQuestStore.getState().quests.learn_wudu.objectives[2], 3);
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
  assert.match(notices[0]!, /Zuhur/);

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
  d.quest.useQuestStore.getState().setQuests({ learn_masjid: { status: "active", objectives: [1, 0] } });
  d.learning.useLearningStore.getState().markLearned("masjid-intro");
  d.persistence.saveGame();
  d.learning.useLearningStore.getState().reset();
  d.quest.useQuestStore.getState().reset();
  d.persistence.bootstrapGame();
  assert.deepEqual(d.learning.useLearningStore.getState().learned, ["masjid-intro"]);
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_masjid.objectives, [1, 0]);
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

test("produksi: lokasi hanya menawarkan aktivitas non-agama, tempat wudu tanpa prompt, bahkan saat waktu salat", () => {
  setTime(p, 12, 30);
  target(p, "poi", "masjid");
  assert.deepEqual(p.actions.computeTargetView(p.inter.useInteractionStore.getState().target).actions.map((a: Mod) => a.id), ["clean"]);
  assert.equal(p.actions.computeTargetView({ kind: "poi", id: "musala" }), null, "musala sudah dihapus");
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

test("produksi: aktivitas wudu dan salat tidak bisa dibuka dan pengingat tanpa saran aktivitas", () => {
  setTime(p, 12, 30);
  p.activityActions.openActivity("wudu-practice");
  assert.equal(p.ui.useUiStore.getState().activity, null);
  assert.equal(toast(p), "Aktivitas ini belum tersedia");
  p.activityActions.openActivity("salat-moment");
  assert.equal(p.ui.useUiStore.getState().activity, null);
  assert.equal(p.perf.worshipPerformance.phase, "idle", "tidak ada pertunjukan 3D di produksi");
  assert.equal(p.director.cameraDirector.active, false);
  assert.equal(p.activities.getVisibleActivity("salat-moment"), undefined);
  assert.equal(p.activities.getVisibleActivity("salat-moment", true)?.reminderHint, "Kamu bisa berwudu dan salat di masjid, atau lanjut bermain.");
});

// ---------- Wudu dan salat 3D (build uji) ----------

const snapshot = (m: Record<string, Mod>) =>
  JSON.stringify([m.inv.useInventoryStore.getState().inventory, m.quest.useQuestStore.getState().quests, m.learning.useLearningStore.getState().learned, m.farm.useFarmStore.getState().plots]);

/** Menekan Berikutnya sampai aktivitas selesai. */
function finishActivityByNext(m: Record<string, Mod>) {
  for (let guard = 0; guard < 60 && m.ui.useUiStore.getState().activity; guard++) m.activityActions.activityNext();
  assert.equal(m.ui.useUiStore.getState().activity, null);
}

test("panduan terdaftar pada build uji: 11 langkah wudu dan rakaat tiap salat sesuai panduan", () => {
  const guide = d.worship.getWorshipGuide();
  assert.ok(guide);
  assert.equal(guide.wuduSteps.length, 11);
  assert.deepEqual(guide.prayers.map((x: Mod) => x.rakaat), [2, 4, 4, 3, 4]);
});

test("wudu: 11 langkah, pertunjukan 3D berjalan dengan klip tiap langkah, dan tidak mengubah milik pemain", () => {
  d.persistence.startNewGame();
  const before = snapshot(d);
  for (const [h, m] of [[3, 0], [10, 0], [12, 30]] as const) {
    setTime(d, h, m);
    target(d, "poi", "wudu");
    d.actions.runAction("activity:wudu-practice");
    const a = d.ui.useUiStore.getState().activity;
    assert.equal(a.kind, "wudu");
    assert.equal(a.steps.length, 11);
    assert.equal(a.stage, "play");
    assert.equal(d.perf.worshipPerformance.phase, "active");
    assert.equal(d.perf.worshipPerformance.stage.id, "wudu");
    assert.equal(d.perf.worshipPerformance.clip, a.steps[0].clip);
    assert.equal(d.director.cameraDirector.active, true, "kamera diarahkan ke adegan");
    assert.equal(d.ui.isModalOpen(), true);

    for (let i = 1; i <= 11; i++) {
      d.activityActions.activityNext();
      const now = d.ui.useUiStore.getState().activity;
      assert.equal(now.index, i);
      assert.equal(d.perf.worshipPerformance.clip, i < 11 ? now.steps[i].clip : "return-stand");
    }
    d.activityActions.activityNext(); // dari halaman penutup berarti selesai
    assert.equal(d.ui.useUiStore.getState().activity, null);
    assert.equal(d.perf.worshipPerformance.phase, "returning");
    d.perf.finishPerformance();
  }
  assert.equal(toast(d), "Latihan wudu selesai");
  assert.equal(snapshot(d), before, "tanpa hadiah, skor, atau catatan");
});

test("setelah aktivitas, pemain muncul di tempat aktivitas menghadap arah yang benar dan kamera dilepas", () => {
  d.persistence.startNewGame();
  setTime(d, 12, 30);
  target(d, "poi", "masjid");
  d.actions.runAction("activity:salat-moment");
  assert.equal(d.perf.worshipPerformance.stage.id, "salat");
  finishActivityByNext(d);
  d.perf.finishPerformance();
  const salat = d.stages.WORSHIP_STAGES.salat;
  assert.equal(d.perf.worshipPerformance.phase, "idle");
  assert.equal(d.player.playerState.x, salat.x);
  assert.equal(d.player.playerState.z, salat.z);
  assert.equal(d.player.playerState.heading, d.stages.QIBLA_HEADING);
  assert.equal(d.director.cameraDirector.active, false);
  assert.equal(d.stages.QIBLA_HEADING, Math.PI, "qibla dunia Qinaraya: utara (-Z)");
});

test("wudu ditutup di tengah jalan kapan saja tanpa konsekuensi dan tanpa progres quest", () => {
  d.persistence.startNewGame();
  d.quest.useQuestStore.getState().setQuests({ learn_wudu: { status: "active", objectives: [1, 0, 0, 0] } });
  target(d, "poi", "wudu");
  d.actions.runAction("activity:wudu-practice");
  d.activityActions.activityNext();
  d.activityActions.activityNext();
  assert.equal(d.ui.useUiStore.getState().activity.index, 2);
  d.activityActions.activityPrev();
  assert.equal(d.ui.useUiStore.getState().activity.index, 1);
  assert.equal(d.perf.worshipPerformance.clip, d.ui.useUiStore.getState().activity.steps[1].clip);
  d.activityActions.closeActivity();
  assert.equal(d.ui.useUiStore.getState().activity, null);
  assert.equal(d.perf.worshipPerformance.phase, "returning");
  assert.deepEqual(d.quest.useQuestStore.getState().quests.learn_wudu.objectives, [1, 0, 0, 0], "belum selesai, belum dihitung");
  d.perf.finishPerformance();
});

test("ulangi gerakan: pose dimundurkan ke akhir langkah sebelumnya lalu klip langkah ini diputar", () => {
  d.persistence.startNewGame();
  target(d, "poi", "wudu");
  d.actions.runAction("activity:wudu-practice");
  const steps = d.ui.useUiStore.getState().activity.steps;

  d.activityActions.activityReplay();
  assert.equal(d.perf.worshipPerformance.clip, `pose:stand|${steps[0].clip}`);
  assert.equal(d.ui.useUiStore.getState().activity.replay, 1);

  d.activityActions.activityNext();
  d.activityActions.activityReplay();
  assert.equal(d.perf.worshipPerformance.clip, `pose:${d.poses.lastPoseOf(steps[0].clip)}|${steps[1].clip}`);
  d.activityActions.closeActivity();
  d.perf.finishPerformance();
});

test("salat di luar waktu: Latihan salat membuka pemilih, dan tiap salat memberi jumlah langkah yang benar", () => {
  d.persistence.startNewGame();
  setTime(d, 10, 0);
  target(d, "poi", "masjid");
  const label = d.actions.computeTargetView(d.inter.useInteractionStore.getState().target).actions.find((a: Mod) => a.id === "activity:salat-moment");
  assert.equal(label.label, "Latihan salat");
  assert.equal(label.enabled, true);

  d.actions.runAction("activity:salat-moment");
  let a = d.ui.useUiStore.getState().activity;
  assert.equal(a.stage, "choose");
  assert.equal(a.practice, true);
  assert.deepEqual(a.steps, []);
  d.activityActions.activityNext(); // belum memilih: tidak ada efek
  assert.equal(d.ui.useUiStore.getState().activity.stage, "choose");

  const expected = { subuh: 22, dzuhur: 37, ashar: 37, maghrib: 30, isya: 37 } as const;
  for (const [prayer, count] of Object.entries(expected)) {
    d.activityActions.closeActivity();
    d.perf.finishPerformance();
    d.actions.runAction("activity:salat-moment");
    d.activityActions.choosePrayer(prayer);
    a = d.ui.useUiStore.getState().activity;
    assert.equal(a.stage, "play", prayer);
    assert.equal(a.practice, true);
    assert.equal(a.steps.length, count, prayer);
    assert.equal(a.prayer, prayer);
    assert.equal(d.perf.worshipPerformance.clip, "salat-niat");
  }
  assert.equal(d.ui.useUiStore.getState().activity.prayerLabel, "Isya");
  d.activityActions.closeActivity();
  d.perf.finishPerformance();
});

test("salat saat waktu Zuhur berlangsung: langsung berjalan, memakai nama waktunya, dan selesai tanpa mencatat apa pun", () => {
  d.persistence.startNewGame();
  setTime(d, 12, 30);
  d.inv.useInventoryStore.getState().add("hoe", 1);
  const before = snapshot(d);
  const minutesBefore = d.clock.gameClock.getTotalMinutes();

  target(d, "poi", "masjid");
  const view = d.actions.computeTargetView(d.inter.useInteractionStore.getState().target);
  assert.equal(view.actions.find((a: Mod) => a.id === "activity:salat-moment").label, "Salat Zuhur");

  d.actions.runAction("activity:salat-moment");
  const open = d.ui.useUiStore.getState().activity;
  assert.equal(open.stage, "play");
  assert.equal(open.practice, false);
  assert.equal(open.prayer, "dzuhur");
  assert.equal(open.prayerLabel, "Zuhur");
  assert.equal(open.steps.length, 37, "salat empat rakaat");
  assert.equal(open.steps[0].indicator.totalRakaat, 4);
  assert.equal(d.ui.isModalOpen(), true);
  d.clock.gameClock.setPaused(true);
  assert.equal(d.clock.gameClock.tick(5), 0, "waktu dunia berhenti selama aktivitas");
  d.clock.gameClock.setPaused(false);

  finishActivityByNext(d);
  assert.equal(toast(d), "Terima kasih sudah berhenti sejenak");
  d.perf.finishPerformance();
  assert.equal(snapshot(d), before, "tidak ada hadiah, skor, catatan, atau perubahan apa pun");
  assert.equal(d.clock.gameClock.getTotalMinutes(), minutesBefore, "tidak memakan waktu game");
});

test("salat: jendela berakhir tepat sesuai konfigurasi; sesudahnya tersedia sebagai latihan", () => {
  d.persistence.startNewGame();
  target(d, "poi", "masjid");

  setTime(d, 14, 59);
  d.actions.runAction("activity:salat-moment");
  assert.equal(d.ui.useUiStore.getState().activity.practice, false, "menit terakhir jendela Zuhur masih waktu salat");
  d.activityActions.closeActivity();
  d.perf.finishPerformance();

  setTime(d, 15, 0);
  d.actions.runAction("activity:salat-moment");
  assert.equal(d.ui.useUiStore.getState().activity.stage, "choose", "jendela Zuhur berakhir: berlatih");
  d.activityActions.closeActivity();
  d.perf.finishPerformance();

  setTime(d, 15, 30);
  d.actions.runAction("activity:salat-moment");
  assert.equal(d.ui.useUiStore.getState().activity.prayerLabel, "Asar");
  assert.equal(d.ui.useUiStore.getState().activity.practice, false);
  d.activityActions.closeActivity();
  d.perf.finishPerformance();
});

test("salat tiga rakaat (Magrib) saat waktunya: tiga rakaat dengan tasyahud awal dan akhir", () => {
  d.persistence.startNewGame();
  setTime(d, 18, 30);
  target(d, "poi", "masjid");
  d.actions.runAction("activity:salat-moment");
  const a = d.ui.useUiStore.getState().activity;
  assert.equal(a.prayerLabel, "Magrib");
  assert.equal(a.steps.length, 30);
  assert.equal(a.steps.filter((x: Mod) => x.id.endsWith("tasyahud-awal")).length, 1);
  assert.equal(a.steps.filter((x: Mod) => x.id.endsWith("tasyahud-akhir")).length, 1);
  d.activityActions.closeActivity();
  d.perf.finishPerformance();
});

test("pengingat salat di build uji menyertakan saran aktivitas; sesudah tombol tutup tidak ada yang tercatat", () => {
  d.persistence.startNewGame();
  assert.equal(d.activities.getVisibleActivity("salat-moment").reminderHint, "Kamu bisa berwudu dan salat di masjid, atau lanjut bermain.");
  assert.equal(d.activities.getVisibleActivity("wudu-practice").availability, "anytime");
});

test("save lama dengan quest bersuci siap-diserahkan (sebelum ada latihan wudu) kembali aktif dan bisa diselesaikan", () => {
  d.persistence.startNewGame();
  const old = JSON.parse(JSON.stringify(d.persistence.buildSaveData()));
  old.quests = { learn_wudu: { status: "ready", objectives: [1, 3, 1] } };
  memory.set("qinaraya.save", JSON.stringify(old));
  d.persistence.bootstrapGame();
  assert.equal(status(d, "learn_wudu"), "active");
  practiceWudu(d);
  assert.equal(status(d, "learn_wudu"), "ready");
});
