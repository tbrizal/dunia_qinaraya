import assert from "node:assert/strict";
import { test } from "node:test";
import { getAtmosphere, lerpHex } from "../src/systems/time/dayNight.ts";
import {
  GameClock,
  advanceState,
  countCrossings,
  fromTotalMinutes,
  gameMinutesPerRealSecond,
  minutesUntilTime,
  toTotalMinutes,
} from "../src/systems/time/gameClock.ts";
import type { ClockConfig, GameClockState, TimeChangeEvent } from "../src/systems/time/gameClock.ts";
import { formatClock, getTimeOfDay } from "../src/systems/time/timeOfDay.ts";

const cfg: ClockConfig = { realSecondsPerGameHour: 60, daysPerMonth: 30, monthsPerYear: 12 };
const start: GameClockState = { day: 1, month: 1, year: 1, hour: 6, minute: 30, speedMultiplier: 1, isPaused: false };
const near = (a: number, b: number, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test("default: 1 hari game = 24 menit nyata", () => {
  near(gameMinutesPerRealSecond(cfg), 1);
  assert.equal((1440 / gameMinutesPerRealSecond(cfg)) / 60, 24);
});

test("toTotalMinutes dan fromTotalMinutes saling berkebalikan", () => {
  for (const total of [0, 1, 59, 60, 1439, 1440, 43199, 43200, 518399, 518400, 1234567]) {
    assert.equal(toTotalMinutes(fromTotalMinutes(total, cfg, start), cfg), total);
  }
  assert.equal(toTotalMinutes({ ...start, hour: 0, minute: 0 }, cfg), 0);
});

test("rollover menit, jam, hari, bulan, dan tahun", () => {
  const eod: GameClockState = { ...start, day: 30, month: 12, year: 1, hour: 23, minute: 59 };
  const next = advanceState(eod, 1, cfg);
  assert.deepEqual([next.day, next.month, next.year, next.hour, next.minute], [1, 1, 2, 0, 0]);

  const mid = advanceState({ ...start, day: 30, month: 1, hour: 23, minute: 59 }, 1, cfg);
  assert.deepEqual([mid.day, mid.month, mid.hour, mid.minute], [1, 2, 0, 0]);
});

test("advanceState tidak mengubah state asal dan mempertahankan kecepatan", () => {
  const original = { ...start, speedMultiplier: 4 };
  const next = advanceState(original, 90, cfg);
  assert.equal(original.hour, 6);
  assert.equal(next.speedMultiplier, 4);
  assert.deepEqual([next.hour, next.minute], [8, 0]);
});

test("countCrossings menghitung batas yang terlewati", () => {
  assert.deepEqual(countCrossings(0, 59, cfg), { hours: 0, days: 0, months: 0, years: 0 });
  assert.deepEqual(countCrossings(59, 61, cfg), { hours: 1, days: 0, months: 0, years: 0 });
  assert.equal(countCrossings(0, 1440 * 3, cfg).days, 3);
  assert.equal(countCrossings(0, 1440 * 30, cfg).months, 1);
  assert.equal(countCrossings(0, 1440 * 360, cfg).years, 1);
});

test("minutesUntilTime menghitung waktu berikutnya, termasuk lewat tengah malam", () => {
  assert.equal(minutesUntilTime({ ...start, hour: 6, minute: 30 }, 7, 0), 30);
  assert.equal(minutesUntilTime({ ...start, hour: 23, minute: 0 }, 1, 0), 120);
  assert.equal(minutesUntilTime({ ...start, hour: 6, minute: 30 }, 6, 30), 1440);
});

test("tick: 60 detik nyata = 1 jam game; pecahan menit terkumpul", () => {
  const clock = new GameClock(cfg, start);
  assert.equal(clock.tick(0.4), 0);
  assert.equal(clock.tick(0.4), 0);
  assert.equal(clock.tick(0.4), 1); // 1.2 menit terkumpul
  near(clock.getAccumulator(), 0.2);

  const c2 = new GameClock(cfg, start);
  for (let i = 0; i < 60 * 60; i++) c2.tick(1 / 60); // 60 detik pada 60 FPS
  assert.deepEqual([c2.getState().hour, c2.getState().minute], [7, 30]);
});

test("hasil tick tidak bergantung pada frame rate", () => {
  const a = new GameClock(cfg, start);
  const b = new GameClock(cfg, start);
  for (let i = 0; i < 600; i++) a.tick(0.1);
  for (let i = 0; i < 60; i++) b.tick(1);
  // Selisih hanya boleh berupa pecahan menit yang masih tertahan di accumulator.
  near(a.getTotalMinutes() + a.getAccumulator(), b.getTotalMinutes() + b.getAccumulator(), 1e-6);
});

test("pause menghentikan waktu dan resume melanjutkannya", () => {
  const clock = new GameClock(cfg, start);
  clock.setPaused(true);
  assert.equal(clock.tick(100), 0);
  assert.equal(clock.getTotalMinutes(), toTotalMinutes(start, cfg));
  clock.setPaused(false);
  assert.equal(clock.tick(10), 10);
});

test("kecepatan waktu configurable", () => {
  const clock = new GameClock(cfg, start);
  clock.setSpeedMultiplier(4);
  assert.equal(clock.tick(10), 40);
  clock.setSpeedMultiplier(-1);
  clock.setSpeedMultiplier(Number.NaN);
  assert.equal(clock.getState().speedMultiplier, 4);
});

test("advanceDays, advanceMonths, advanceYears", () => {
  const clock = new GameClock(cfg, start);
  clock.advanceDays(2);
  assert.equal(clock.getState().day, 3);
  clock.advanceMonths(1);
  assert.equal(clock.getState().month, 2);
  clock.advanceYears(1);
  assert.equal(clock.getState().year, 2);
  assert.deepEqual([clock.getState().hour, clock.getState().minute], [6, 30]);
});

test("subscribe: event dikirim dengan batas yang dilewati, unsubscribe berfungsi", () => {
  const clock = new GameClock(cfg, { ...start, hour: 23, minute: 59 });
  const events: TimeChangeEvent[] = [];
  const off = clock.subscribe((e) => events.push(e));
  clock.advanceMinutes(2);
  assert.equal(events.length, 1);
  assert.equal(events[0]!.type, "advance");
  assert.equal(events[0]!.minutesAdvanced, 2);
  assert.equal(events[0]!.crossed.days, 1);
  assert.equal(events[0]!.crossed.hours, 1);
  off();
  clock.advanceMinutes(5);
  assert.equal(events.length, 1);
});

test("onCrossing hanya aktif saat batas terlewati", () => {
  const clock = new GameClock(cfg, { ...start, hour: 6, minute: 0 });
  let hours = 0;
  let days = 0;
  clock.onCrossing("hours", () => hours++);
  clock.onCrossing("days", () => days++);
  clock.advanceMinutes(30);
  assert.equal(hours, 0);
  clock.advanceMinutes(30);
  assert.equal(hours, 1);
  clock.advanceDays(3);
  assert.equal(days, 1); // satu event batch yang melewati 3 hari
});

test("pause dan speed mengirim event tanpa memajukan waktu; error listener tidak merusak clock", () => {
  const clock = new GameClock(cfg, start);
  const types: string[] = [];
  clock.subscribe((e) => types.push(`${e.type}:${e.minutesAdvanced}`));
  clock.subscribe(() => {
    throw new Error("sengaja");
  });
  const originalError = console.error;
  console.error = () => {};
  clock.setPaused(true);
  clock.setPaused(true); // tidak berubah, tidak ada event
  clock.setSpeedMultiplier(16);
  console.error = originalError;
  assert.deepEqual(types, ["pause:0", "speed:0"]);
});

test("setState mengganti waktu dan memberi tahu pendengar (load game)", () => {
  const clock = new GameClock(cfg, start);
  let setEvents = 0;
  clock.subscribe((e) => {
    if (e.type === "set") setEvents++;
  });
  clock.setState({ ...start, day: 5, hour: 12, minute: 0 }, 0.5);
  assert.equal(clock.getState().day, 5);
  near(clock.getAccumulator(), 0.5);
  assert.equal(setEvents, 1);
});

test("waktu hari dan format jam", () => {
  assert.equal(getTimeOfDay(6), "pagi");
  assert.equal(getTimeOfDay(12), "siang");
  assert.equal(getTimeOfDay(16), "sore");
  assert.equal(getTimeOfDay(22), "malam");
  assert.equal(getTimeOfDay(3), "malam");
  assert.equal(formatClock(6, 5), "06.05");
});

test("pencahayaan: siang terang, malam tetap terbaca, siklus 24 jam mulus", () => {
  const noon = getAtmosphere(12);
  const night = getAtmosphere(23);
  assert.ok(noon.dirIntensity > night.dirIntensity);
  assert.ok(night.hemiIntensity >= 0.45, "malam tidak boleh terlalu gelap");
  near(getAtmosphere(0).hemiIntensity, getAtmosphere(24).hemiIntensity);
  near(getAtmosphere(-1).hemiIntensity, getAtmosphere(23).hemiIntensity);
  for (let h = 0; h < 24; h += 0.25) {
    const a = getAtmosphere(h);
    assert.ok(a.hemiIntensity > 0.4 && a.hemiIntensity <= 1);
    assert.ok(a.skyColor >= 0 && a.skyColor <= 0xffffff);
  }
  assert.equal(lerpHex(0x000000, 0xffffff, 0.5), 0x808080);
});
