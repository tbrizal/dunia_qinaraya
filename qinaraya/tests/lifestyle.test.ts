import assert from "node:assert/strict";
import { test } from "node:test";
import { hijriCalendarConfig, prayerScheduleConfig } from "../src/config/lifestyleConfig.ts";
import { registerUnreviewedContent } from "../src/data/unreviewed/index.ts";
import { DIALOGUES } from "../src/data/dialogues.ts";
import { ITEMS } from "../src/data/items.ts";
import { LEARNING_CONTENT, getLearningContent, getVisibleLearningContent } from "../src/data/learning.ts";
import { NPCS } from "../src/data/npcs.ts";
import { PLACES } from "../src/data/places.ts";
import { QUESTS, QUEST_LIST } from "../src/data/quests.ts";
import {
  HIJRI_MONTH_NAMES,
  dateFromDayIndex,
  findGameMinutesForHijri,
  formatHijriDate,
  getHijriDate,
  hijriDayIndex,
} from "../src/systems/calendar/hijriCalendar.ts";
import type { HijriCalendarConfig } from "../src/systems/calendar/hijriCalendar.ts";
import { isVisible } from "../src/systems/content/review.ts";
import { selectEntryNode } from "../src/systems/dialogue/dialogue.ts";
import { describePoi } from "../src/systems/interaction/actions.ts";
import { addAll, countItem, createInventory, removeAnyOf } from "../src/systems/inventory/inventory.ts";
import {
  getCurrentPrayer,
  getNextPrayer,
  getPrayerNotifications,
  getPrayersCrossed,
  validateSchedule,
} from "../src/systems/prayer/prayerSchedule.ts";
import type { PrayerScheduleEntry } from "../src/systems/prayer/prayerSchedule.ts";
import { applyEvent, completeQuest, startQuest } from "../src/systems/quest/questEngine.ts";
import type { QuestState } from "../src/systems/quest/questEngine.ts";
import { getTrackedQuest, isQuestAvailable } from "../src/systems/quest/questTracker.ts";
import { GameClock } from "../src/systems/time/gameClock.ts";
import type { TimeChangeEvent } from "../src/systems/time/gameClock.ts";

// Konten draf didaftarkan seperti pada build development; visibilitasnya tetap diuji lewat parameter.
registerUnreviewedContent();

const DAY = 1440;
const cal: HijriCalendarConfig = { daysPerMonth: 30, calendarDaysPerGameDay: 1, startingDate: { day: 1, month: 1, year: 1 } };
const schedule = prayerScheduleConfig;

// ---------- Kalender Hijriah simulasi ----------

test("12 bulan dengan nama yang benar", () => {
  assert.equal(HIJRI_MONTH_NAMES.length, 12);
  assert.equal(HIJRI_MONTH_NAMES[0], "Muharam");
  assert.equal(HIJRI_MONTH_NAMES[8], "Ramadan");
  assert.equal(HIJRI_MONTH_NAMES[11], "Zulhijah");
});

test("hari pertama permainan adalah tanggal awal dari konfigurasi", () => {
  assert.deepEqual(getHijriDate(0, cal), { day: 1, month: 1, year: 1, monthName: "Muharam" });
  const custom = { ...cal, startingDate: { day: 20, month: 8, year: 5 } };
  assert.equal(formatHijriDate(getHijriDate(390, custom)), "20 Syakban 5");
});

test("kalender berubah mengikuti Game Clock: hari, bulan, dan tahun bergulir", () => {
  const at = (days: number) => getHijriDate(days * DAY + 100, cal);
  assert.equal(at(0).day, 1);
  assert.equal(at(1).day, 2);
  assert.deepEqual([at(29).day, at(29).month], [30, 1]);
  assert.deepEqual([at(30).day, at(30).month], [1, 2]);
  assert.deepEqual([at(30 * 8).day, at(30 * 8).monthName], [1, "Ramadan"]);
  assert.deepEqual([at(359).day, at(359).month, at(359).year], [30, 12, 1]);
  assert.deepEqual([at(360).day, at(360).month, at(360).year], [1, 1, 2]);
});

test("tanggal tidak berubah di tengah hari dan berganti tepat tengah malam", () => {
  assert.equal(getHijriDate(DAY - 1, cal).day, 1);
  assert.equal(getHijriDate(DAY, cal).day, 2);
});

test("durasi bulan dan kecepatan kalender configurable", () => {
  const short = { ...cal, daysPerMonth: 10 };
  assert.deepEqual([getHijriDate(10 * DAY, short).day, getHijriDate(10 * DAY, short).month], [1, 2]);
  const fast = { ...cal, calendarDaysPerGameDay: 3 };
  assert.equal(getHijriDate(1 * DAY, fast).day, 4);
  assert.equal(getHijriDate(10 * DAY, fast).month, 2);
});

test("dayIndex dan dateFromDayIndex saling berkebalikan", () => {
  for (const idx of [0, 1, 29, 30, 359, 360, 5000]) assert.equal(hijriDayIndex(dateFromDayIndex(idx, cal), cal), idx);
});

test("lompat ke tanggal Hijriah untuk debug: tepat di hari yang dimaksud, tidak mundur", () => {
  const target = findGameMinutesForHijri(9, 1, 0, cal);
  assert.equal(formatHijriDate(getHijriDate(target, cal), false), "1 Ramadan");
  const nextYear = findGameMinutesForHijri(1, 1, 50 * DAY, cal);
  const date = getHijriDate(nextYear, cal);
  assert.deepEqual([date.day, date.month, date.year], [1, 1, 2]);
  assert.ok(nextYear > 50 * DAY);
  assert.equal(findGameMinutesForHijri(99, 99, 0, cal) >= 0, true, "nilai di luar rentang dibatasi");
});

test("konfigurasi default: mulai 1 Muharam dan 30 hari per bulan", () => {
  assert.equal(hijriCalendarConfig.daysPerMonth, 30);
  assert.deepEqual(getHijriDate(0, hijriCalendarConfig).day, 1);
});

// ---------- Jadwal salat simulasi ----------

test("konfigurasi jadwal valid dan lima waktu lengkap", () => {
  assert.deepEqual(validateSchedule(schedule), []);
  assert.deepEqual(schedule.map((e) => e.prayer), ["subuh", "dzuhur", "ashar", "maghrib", "isya"]);
});

test("validateSchedule menangkap kesalahan konfigurasi", () => {
  const bad: PrayerScheduleEntry[] = [
    { prayer: "subuh", hour: 25, minute: 0, enabled: true, notificationEnabled: true },
    { prayer: "subuh", hour: 5, minute: 70, enabled: true, notificationEnabled: true },
  ];
  assert.ok(validateSchedule(bad).length >= 3);
  const unordered: PrayerScheduleEntry[] = [
    { prayer: "dzuhur", hour: 12, minute: 0, enabled: true, notificationEnabled: true },
    { prayer: "subuh", hour: 5, minute: 0, enabled: true, notificationEnabled: true },
  ];
  assert.ok(validateSchedule(unordered).length > 0);
});

test("waktu salat berikutnya sepanjang hari", () => {
  const next = (h: number, m: number) => getNextPrayer(h, m, schedule)!;
  assert.deepEqual([next(6, 30).prayer, next(6, 30).minutesUntil], ["dzuhur", 330]);
  assert.deepEqual([next(12, 0).prayer, next(12, 0).minutesUntil], ["ashar", 210], "tepat saat tiba, berikutnya adalah waktu setelahnya");
  assert.deepEqual([next(11, 59).prayer, next(11, 59).minutesUntil], ["dzuhur", 1]);
  assert.deepEqual([next(15, 31).prayer, next(15, 31).isTomorrow], ["maghrib", false]);
});

test("pergantian hari: setelah Isya berikutnya adalah Subuh besok", () => {
  const after = getNextPrayer(23, 0, schedule)!;
  assert.deepEqual([after.prayer, after.isTomorrow, after.minutesUntil], ["subuh", true, 6 * 60]);
  const midnight = getNextPrayer(0, 0, schedule)!;
  assert.deepEqual([midnight.prayer, midnight.isTomorrow, midnight.minutesUntil], ["subuh", false, 300]);
  const isyaNow = getNextPrayer(19, 30, schedule)!;
  assert.deepEqual([isyaNow.prayer, isyaNow.isTomorrow], ["subuh", true]);
});

test("waktu salat yang dinonaktifkan dilewati; tanpa jadwal aktif hasilnya null", () => {
  const noAshar = schedule.map((e) => (e.prayer === "ashar" ? { ...e, enabled: false } : e));
  assert.equal(getNextPrayer(13, 0, noAshar)!.prayer, "maghrib");
  assert.equal(getNextPrayer(1, 0, schedule.map((e) => ({ ...e, enabled: false }))), null);
});

test("waktu salat yang sedang berlaku, termasuk dini hari sebelum Subuh", () => {
  assert.equal(getCurrentPrayer(12, 0, schedule), "dzuhur");
  assert.equal(getCurrentPrayer(17, 59, schedule), "ashar");
  assert.equal(getCurrentPrayer(2, 0, schedule), "isya");
  assert.equal(getCurrentPrayer(5, 0, schedule), "subuh");
});

test("getPrayersCrossed: tepat sekali per kejadian, batas bawah eksklusif dan batas atas inklusif", () => {
  const dzuhur = 12 * 60;
  assert.deepEqual(getPrayersCrossed(dzuhur - 1, dzuhur, schedule).map((c) => c.prayer), ["dzuhur"]);
  assert.deepEqual(getPrayersCrossed(dzuhur, dzuhur + 1, schedule), [], "tidak terhitung dua kali");
  assert.deepEqual(getPrayersCrossed(0, 0, schedule), []);
  assert.deepEqual(getPrayersCrossed(500, 100, schedule), [], "waktu mundur tidak menghasilkan apa pun");
});

test("getPrayersCrossed lintas hari berurutan dan lengkap", () => {
  const crossed = getPrayersCrossed(23 * 60, DAY + 13 * 60, schedule);
  assert.deepEqual(crossed.map((c) => c.prayer), ["subuh", "dzuhur"]);
  assert.equal(crossed[0]!.totalMinutes, DAY + 5 * 60);
  assert.equal(getPrayersCrossed(0, 3 * DAY, schedule).length, 15);
});

// ---------- Notifikasi: hanya sekali dan di waktu yang tepat ----------

function runClock(minutes: number, stepSeconds: number) {
  const clock = new GameClock({ realSecondsPerGameHour: 60, daysPerMonth: 30, monthsPerYear: 12 }, {
    day: 1, month: 1, year: 1, hour: 11, minute: 50, speedMultiplier: 1, isPaused: false,
  });
  const fired: { prayer: string; at: number }[] = [];
  let frames = 0;
  clock.subscribe((e: TimeChangeEvent) => {
    for (const n of getPrayerNotifications(e, schedule, 30)) fired.push({ prayer: n.prayer, at: e.totalMinutes });
  });
  while (clock.getTotalMinutes() < 11 * 60 + 50 + minutes) {
    clock.tick(stepSeconds);
    frames++;
    if (frames > 100000) break;
  }
  return fired;
}

test("notifikasi muncul tepat sekali saat Dzuhur tiba, bukan tiap frame", () => {
  const fired = runClock(25, 1 / 60); // 60 FPS
  assert.equal(fired.length, 1);
  assert.equal(fired[0]!.prayer, "dzuhur");
  assert.equal(fired[0]!.at, 12 * 60);
});

test("hasil notifikasi tidak bergantung frame rate", () => {
  for (const step of [1 / 144, 1 / 60, 1 / 30, 0.25]) assert.equal(runClock(25, step).length, 1, `step ${step}`);
});

test("lompatan besar, pemuatan, jeda, dan perubahan kecepatan tidak memicu notifikasi", () => {
  const ev = (type: string, advanced: number, from: number, to: number) => ({ type, minutesAdvanced: advanced, previousTotalMinutes: from, totalMinutes: to });
  assert.equal(getPrayerNotifications(ev("advance", 60, 11 * 60, 12 * 60), schedule, 30).length, 0, "lompatan besar");
  assert.equal(getPrayerNotifications(ev("set", 0, 0, 12 * 60), schedule, 30).length, 0, "muat game");
  assert.equal(getPrayerNotifications(ev("pause", 0, 12 * 60, 12 * 60), schedule, 30).length, 0);
  assert.equal(getPrayerNotifications(ev("speed", 0, 12 * 60, 12 * 60), schedule, 30).length, 0);
  assert.equal(getPrayerNotifications(ev("advance", 2, 12 * 60 - 1, 12 * 60 + 1), schedule, 30).length, 1);
});

test("notifikasi dihormati per waktu salat (notificationEnabled) dan nonaktif tidak diumumkan", () => {
  const quiet = schedule.map((e) => (e.prayer === "dzuhur" ? { ...e, notificationEnabled: false } : e));
  const e = { type: "advance", minutesAdvanced: 1, previousTotalMinutes: 719, totalMinutes: 720 };
  assert.equal(getPrayerNotifications(e, quiet, 30).length, 0);
  const off = schedule.map((p) => (p.prayer === "dzuhur" ? { ...p, enabled: false } : p));
  assert.equal(getPrayerNotifications(e, off, 30).length, 0);
});

test("setelah reload pada menit yang sama, tidak ada notifikasi ulang", () => {
  const clock = new GameClock({ realSecondsPerGameHour: 60, daysPerMonth: 30, monthsPerYear: 12 }, {
    day: 1, month: 1, year: 1, hour: 12, minute: 0, speedMultiplier: 1, isPaused: false,
  });
  let count = 0;
  clock.subscribe((e) => void (count += getPrayerNotifications(e, schedule, 30).length));
  clock.setState({ day: 1, month: 1, year: 1, hour: 12, minute: 0, speedMultiplier: 1, isPaused: false });
  clock.tick(0.5);
  assert.equal(count, 0);
});

// ---------- Penjaga status review ----------

test("hanya approved yang tampil di produksi; draft dan needs-review hanya bila diizinkan", () => {
  assert.equal(isVisible("approved", false), true);
  assert.equal(isVisible("draft", false), false);
  assert.equal(isVisible("needs-review", false), false);
  assert.equal(isVisible("draft", true), true);
  assert.equal(isVisible("needs-review", true), true);
  assert.equal(isVisible(undefined, false), true, "teks sistem non-agama selalu tampil");
});

test("setiap materi punya status eksplisit; tidak ada yang approved tanpa reviewer", () => {
  assert.ok(LEARNING_CONTENT.length >= 5);
  for (const c of LEARNING_CONTENT) {
    assert.ok(["draft", "needs-review", "approved"].includes(c.reviewStatus), c.id);
    if (c.reviewStatus === "approved") assert.ok(c.reviewedBy && c.reviewedAt, `${c.id}: approved tanpa reviewedBy/reviewedAt`);
    assert.ok(c.reviewNotes.trim().length > 0, `${c.id}: tanpa catatan reviewer`);
    assert.ok(c.pages.length >= 2 && c.pages.every((p) => p.trim().length > 10), `${c.id}: halaman kosong`);
  }
  assert.equal(new Set(LEARNING_CONTENT.map((c) => c.id)).size, LEARNING_CONTENT.length, "id kembar");
});

test("saat ini tidak ada materi yang ditandai approved (belum ada peninjau)", () => {
  assert.deepEqual(LEARNING_CONTENT.filter((c) => c.reviewStatus === "approved").map((c) => c.id), []);
});

test("materi draft tersembunyi di produksi dan tampil di dev", () => {
  assert.equal(getVisibleLearningContent("masjid-intro", false), undefined);
  assert.equal(getVisibleLearningContent("wudu-intro", false), undefined);
  assert.equal(getVisibleLearningContent("masjid-intro", true)?.id, "masjid-intro");
  assert.equal(getLearningContent("masjid-intro")?.reviewStatus, "draft");
});

test("materi ibadah rinci (wudu, waktu salat) berstatus needs-review", () => {
  assert.equal(getLearningContent("wudu-intro")!.reviewStatus, "needs-review");
  assert.equal(getLearningContent("prayer-times")!.reviewStatus, "needs-review");
});

test("batasan konten: tanpa penalti, skor pahala, atau klaim pengganti ibadah", () => {
  const all = [
    ...LEARNING_CONTENT.flatMap((c) => [c.title, c.description, ...c.pages]),
    ...Object.values(DIALOGUES).flatMap((d) => Object.values(d.nodes).map((n) => n.text)),
    ...QUEST_LIST.flatMap((q) => [q.title, q.summary, q.startHint]),
  ].join(" ").toLowerCase();
  for (const banned of ["pahala", "dosa", "hukuman:", "denda", "skor", "poin ibadah", "menggantikan ibadah", "wajib bermain"]) {
    assert.ok(!all.includes(banned), `kata terlarang: ${banned}`);
  }
  // Tidak ada kutipan teks suci dalam huruf Arab.
  assert.ok(!/[\u0600-\u06FF]/.test(all), "ada teks beraksara Arab (dilarang tanpa verifikasi)");
});

test("jadwal game ditegaskan sebagai simulasi pada materi waktu salat", () => {
  const text = getLearningContent("prayer-times")!.pages.join(" ").toLowerCase();
  assert.ok(text.includes("simulasi"));
  assert.ok(text.includes("tidak ada hukuman"));
});

// ---------- Konsistensi data ----------

test("data Phase 3 saling merujuk dengan benar", () => {
  const contentIds = new Set(LEARNING_CONTENT.map((c) => c.id));
  const npcIds = new Set(NPCS.map((n) => n.id));
  for (const place of PLACES) for (const id of place.contentIds) assert.ok(contentIds.has(id), `${place.id} -> ${id}`);
  for (const c of LEARNING_CONTENT) {
    assert.ok(!c.npcId || npcIds.has(c.npcId));
    assert.ok(!c.questId || QUESTS[c.questId], `${c.id}: quest ${c.questId}`);
  }
  for (const q of QUEST_LIST) {
    for (const o of q.objectives) if (o.type === "learn") assert.ok(contentIds.has(o.targetId!), `${q.id}: ${o.targetId}`);
    for (const req of q.requires ?? []) assert.ok(QUESTS[req], `${q.id} requires ${req}`);
    for (const g of [...q.startItems, ...q.rewardItems]) assert.ok(ITEMS[g.itemId], g.itemId);
    if (q.category === "islamic-learning") assert.notEqual(q.reviewStatus, undefined, `${q.id}: quest Islami wajib punya status review`);
  }
  for (const d of Object.values(DIALOGUES)) {
    for (const e of d.entries) {
      const cs = e.when ? (Array.isArray(e.when) ? e.when : [e.when]) : [];
      for (const c of cs) assert.ok(QUESTS[c.questId], `dialog merujuk quest ${c.questId}`);
    }
    assert.equal(d.entries[d.entries.length - 1]!.reviewStatus, undefined, `${d.npcId}: entri terakhir harus cadangan non-agama`);
  }
});

test("minimal tiga quest pembelajaran Islami", () => {
  assert.ok(QUEST_LIST.filter((q) => q.category === "islamic-learning").length >= 3);
});

test("setiap materi bisa dijangkau dari lokasi atau panel jam (tidak ada materi yatim)", () => {
  const reachable = new Set([...PLACES.flatMap((p) => p.contentIds), "prayer-times"]);
  for (const c of LEARNING_CONTENT) assert.ok(reachable.has(c.id), `${c.id} tidak punya jalur akses`);
});

test("tidak ada hadiah berupa koin, skor, atau item yang bisa hilang", () => {
  for (const q of QUEST_LIST.filter((x) => x.category === "islamic-learning")) {
    for (const g of q.rewardItems) assert.equal(ITEMS[g.itemId]!.category, "decor", `${q.id}: hadiah harus kosmetik`);
  }
});

// ---------- Dialog Ustadz Harun ----------

const harun = DIALOGUES["ustadz-harun"]!;

test("di produksi (konten belum ditinjau) Ustadz Harun hanya menampilkan cadangan non-agama", () => {
  for (const quests of [{}, { learn_masjid: { status: "active", objectives: [0, 0, 0] } }] as QuestState[]) {
    assert.equal(selectEntryNode(harun, quests, false), "unavailable");
  }
  assert.doesNotMatch(harun.nodes.unavailable!.text, /masjid|wudu|salat|ibadah/i);
});

function ready(state: QuestState, id: string): QuestState {
  const quest = QUESTS[id]!;
  let s = startQuest(state, quest)!;
  for (const o of quest.objectives) {
    for (let i = 0; i < o.count; i++) {
      const event = o.type === "learn" ? { type: "learn" as const, contentId: o.targetId! } : o.type === "clean" ? { type: "clean" as const } : { type: "give" as const, quantity: 1 };
      s = applyEvent(s, event).state;
    }
  }
  return s;
}

test("alur dialog Ustadz Harun di dev mengikuti urutan quest", () => {
  const pick = (q: QuestState) => selectEntryNode(harun, q, true);
  let q: QuestState = {};
  assert.equal(pick(q), "intro");
  q = startQuest(q, QUESTS.learn_masjid!)!;
  assert.equal(pick(q), "reminder_a");
  q = ready({}, "learn_masjid");
  assert.equal(pick(q), "turnin_a");
  q = completeQuest(q, "learn_masjid")!;
  assert.equal(pick(q), "offer_b");
  q = ready(q, "learn_wudu");
  assert.equal(pick(q), "turnin_b");
  q = completeQuest(q, "learn_wudu")!;
  assert.equal(pick(q), "need_farm", "kebun belum selesai");
  q = { ...q, tutorial_farming: { status: "completed", objectives: [1, 1, 1, 1] } };
  assert.equal(pick(q), "offer_c");
  q = ready(q, "share_harvest");
  assert.equal(pick(q), "turnin_c");
  q = completeQuest(q, "share_harvest")!;
  assert.equal(pick(q), "all_done");
});

// ---------- Quest pembelajaran ----------

test("quest belajar: objektif learn hanya menghitung materi yang tepat", () => {
  let s = startQuest({}, QUESTS.learn_masjid!)!;
  s = applyEvent(s, { type: "learn", contentId: "wudu-intro" }).state;
  assert.deepEqual(s.learn_masjid!.objectives, [0, 0, 0]);
  s = applyEvent(s, { type: "learn", contentId: "masjid-intro" }).state;
  assert.deepEqual(s.learn_masjid!.objectives, [1, 0, 0]);
  s = applyEvent(s, { type: "learn", contentId: "masjid-intro" }).state;
  assert.deepEqual(s.learn_masjid!.objectives, [1, 0, 0], "membaca ulang tidak menambah progres");
});

test("quest bersih-bersih dan berbagi menghitung aksi masing-masing", () => {
  let s = startQuest({}, QUESTS.learn_wudu!)!;
  for (let i = 0; i < 5; i++) s = applyEvent(s, { type: "clean" }).state;
  assert.equal(s.learn_wudu!.objectives[1], 3, "dibatasi sampai target");
  let t = startQuest({}, QUESTS.share_harvest!)!;
  t = applyEvent(t, { type: "give", quantity: 2 }).state;
  assert.equal(t.share_harvest!.status, "ready");
});

test("quest belajar tidak bisa dibaca lebih dulu: prasyarat dan status review dihormati", () => {
  const q = QUESTS.learn_wudu!;
  assert.equal(isQuestAvailable(q, {}, true), false, "prasyarat belum selesai");
  assert.equal(isQuestAvailable(QUESTS.learn_masjid!, {}, true), true);
  assert.equal(isQuestAvailable(QUESTS.learn_masjid!, {}, false), false, "tersembunyi di produksi");
  assert.equal(isQuestAvailable(QUESTS.tutorial_farming!, {}, false), true, "quest non-agama tetap tersedia");
});

test("pelacak HUD: produksi hanya menampilkan quest non-agama, dev menampilkan yang berjalan", () => {
  assert.equal(getTrackedQuest({}, false)!.quest.id, "tutorial_farming");
  const active = startQuest({}, QUESTS.learn_masjid!)!;
  assert.equal(getTrackedQuest(active, true)!.quest.id, "learn_masjid");
  assert.match(getTrackedQuest(active, true)!.line, /\(0\/1\)/);
  assert.equal(getTrackedQuest(active, false)!.quest.id, "tutorial_farming", "quest agama aktif tidak bocor di produksi");
  const done = { tutorial_farming: { status: "completed" as const, objectives: [1, 1, 1, 1] } };
  assert.equal(getTrackedQuest(done, false), null);
});

// ---------- Lokasi dan inventory ----------

test("lokasi: aksi materi hanya muncul bila materi boleh tampil", () => {
  assert.deepEqual(describePoi("masjid", [], false)!.actions.map((a) => a.id), ["clean"], "produksi: hanya aktivitas bersih-bersih");
  assert.equal(describePoi("musala", [], false), null, "tanpa aksi: tidak ada prompt");
  assert.equal(describePoi("wudu", [], false), null);
  assert.deepEqual(describePoi("masjid", [], true)!.actions.map((a) => a.id), ["learn:masjid-intro", "learn:masjid-adab", "clean"]);
  assert.equal(describePoi("tidak-ada", [], true), null);
});

test("lokasi menandai materi yang sudah dipelajari", () => {
  const view = describePoi("masjid", ["masjid-intro"], true)!;
  assert.match(view.actions[0]!.label, /\(sudah\)/);
  assert.match(view.status!, /1\/2/);
});

test("removeAnyOf: membagikan hasil panen apa pun, atomik bila tidak cukup", () => {
  let inv = addAll(createInventory(20), [{ itemId: "carrot", quantity: 1 }, { itemId: "tomato", quantity: 2 }, { itemId: "hoe", quantity: 1 }]);
  const crops = ["carrot", "tomato", "potato"];
  const after = removeAnyOf(inv, crops, 2)!;
  assert.equal(countItem(after, "carrot") + countItem(after, "tomato"), 1);
  assert.equal(countItem(after, "hoe"), 1, "alat tidak ikut terambil");
  assert.equal(removeAnyOf(inv, crops, 4), null);
  assert.equal(countItem(inv, "carrot"), 1, "inventory asal tidak berubah saat gagal");
  inv = after;
});
