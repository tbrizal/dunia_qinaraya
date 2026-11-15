import type { HijriCalendarConfig } from "../systems/calendar/hijriCalendar.ts";
import type { PrayerScheduleEntry } from "../systems/prayer/prayerSchedule.ts";

/**
 * Konfigurasi kalender dan jadwal salat SIMULASI Qinaraya.
 * Ini bukan perhitungan lokasi atau tanggal dunia nyata dan tidak memakai GPS atau API apa pun.
 * Semua komponen membaca jadwal dari sini; jangan menuliskan jam salat di tempat lain.
 */

export const hijriCalendarConfig: HijriCalendarConfig = {
  /** Prototipe memakai 30 hari per bulan agar sederhana. */
  daysPerMonth: 30,
  /** Berapa hari kalender berlalu per satu hari game (1 = berjalan seirama Game Clock). */
  calendarDaysPerGameDay: 1,
  /** Tanggal pada hari pertama permainan. Tahun adalah tahun fiktif Qinaraya. */
  startingDate: { day: 1, month: 1, year: 1 },
};

/** Jadwal awal sebagai keputusan desain game. Urutkan dari pagi ke malam. */
export const prayerScheduleConfig: readonly PrayerScheduleEntry[] = [
  { prayer: "subuh", hour: 5, minute: 0, enabled: true, notificationEnabled: true },
  { prayer: "dzuhur", hour: 12, minute: 0, enabled: true, notificationEnabled: true },
  { prayer: "ashar", hour: 15, minute: 30, enabled: true, notificationEnabled: true },
  { prayer: "maghrib", hour: 18, minute: 15, enabled: true, notificationEnabled: true },
  { prayer: "isya", hour: 19, minute: 30, enabled: true, notificationEnabled: true },
];

export const prayerNoticeConfig = {
  /** Lompatan waktu lebih besar dari ini (menit game) tidak memicu notifikasi, misalnya saat debug. */
  maxJumpMinutes: 30,
  /** Lama notifikasi tampil (milidetik). */
  displayMs: 4500,
};
