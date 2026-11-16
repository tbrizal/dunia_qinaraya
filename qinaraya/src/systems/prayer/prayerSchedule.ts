import { MINUTES_PER_DAY } from "../time/gameClock.ts";

/**
 * Jadwal lima waktu salat SIMULASI. Waktu ditentukan desainer game di config,
 * bukan dihitung dari lokasi atau tanggal dunia nyata.
 */

export type PrayerName = "subuh" | "dzuhur" | "ashar" | "maghrib" | "isya";

export interface PrayerScheduleEntry {
  prayer: PrayerName;
  hour: number;
  minute: number;
  /** Lama (menit game) waktu salat ini berlangsung sejak jam tiba. */
  windowMinutes: number;
  enabled: boolean;
  notificationEnabled: boolean;
}

export const PRAYER_LABELS: Record<PrayerName, string> = {
  subuh: "Subuh",
  dzuhur: "Dzuhur",
  ashar: "Ashar",
  maghrib: "Magrib",
  isya: "Isya",
};

export interface NextPrayer {
  prayer: PrayerName;
  hour: number;
  minute: number;
  /** Menit game sampai waktu tersebut (1..1440). */
  minutesUntil: number;
  isTomorrow: boolean;
}

export interface ActivePrayer {
  prayer: PrayerName;
  hour: number;
  minute: number;
  /** Sisa menit game sebelum waktu ini berakhir. */
  minutesLeft: number;
}

export interface PrayerCrossing {
  prayer: PrayerName;
  /** Menit total Game Clock saat waktu itu tiba. */
  totalMinutes: number;
}

const minuteOfDay = (e: Pick<PrayerScheduleEntry, "hour" | "minute">) => e.hour * 60 + e.minute;

function activeEntries(schedule: readonly PrayerScheduleEntry[]): PrayerScheduleEntry[] {
  return schedule.filter((e) => e.enabled).sort((a, b) => minuteOfDay(a) - minuteOfDay(b));
}

/** Pemeriksaan konfigurasi. Mengembalikan daftar masalah (kosong bila valid). */
export function validateSchedule(schedule: readonly PrayerScheduleEntry[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const e of schedule) {
    if (!Number.isInteger(e.hour) || e.hour < 0 || e.hour > 23) errors.push(`${e.prayer}: jam tidak valid`);
    if (!Number.isInteger(e.minute) || e.minute < 0 || e.minute > 59) errors.push(`${e.prayer}: menit tidak valid`);
    if (seen.has(e.prayer)) errors.push(`${e.prayer}: duplikat`);
    seen.add(e.prayer);
  }
  for (const e of schedule) {
    if (!Number.isInteger(e.windowMinutes) || e.windowMinutes <= 0) errors.push(`${e.prayer}: windowMinutes harus bilangan bulat positif`);
  }
  const sorted = activeEntries(schedule);
  sorted.forEach((e, i) => {
    const next = sorted[(i + 1) % sorted.length]!;
    const gap = (minuteOfDay(next) - minuteOfDay(e) + MINUTES_PER_DAY) % MINUTES_PER_DAY || MINUTES_PER_DAY;
    if (e.windowMinutes > gap) errors.push(`${e.prayer}: jendela ${e.windowMinutes} menit melewati waktu salat berikutnya (${gap} menit)`);
  });
  const times = schedule.map(minuteOfDay);
  if (times.some((t, i) => i > 0 && t <= times[i - 1]!)) errors.push("jadwal harus berurutan dari pagi ke malam tanpa waktu kembar");
  return errors;
}

/** Waktu salat berikutnya (benar-benar setelah sekarang), termasuk lintas hari. */
export function getNextPrayer(hour: number, minute: number, schedule: readonly PrayerScheduleEntry[]): NextPrayer | null {
  const entries = activeEntries(schedule);
  if (entries.length === 0) return null;
  const now = hour * 60 + minute;

  const upcoming = entries.find((e) => minuteOfDay(e) > now);
  const entry = upcoming ?? entries[0]!;
  const isTomorrow = !upcoming;
  const until = minuteOfDay(entry) - now + (isTomorrow ? MINUTES_PER_DAY : 0);
  return { prayer: entry.prayer, hour: entry.hour, minute: entry.minute, minutesUntil: until, isTomorrow };
}

/** Waktu salat yang sedang berlaku: yang terakhir tiba (kemarin bila belum ada hari ini). */
export function getCurrentPrayer(hour: number, minute: number, schedule: readonly PrayerScheduleEntry[]): PrayerName | null {
  const entries = activeEntries(schedule);
  if (entries.length === 0) return null;
  const now = hour * 60 + minute;
  let current = entries[entries.length - 1]!;
  for (const e of entries) if (minuteOfDay(e) <= now) current = e;
  return current.prayer;
}

/**
 * Waktu salat yang SEDANG berlangsung (dalam jendelanya), atau null bila sekarang di luar semua jendela.
 * Dipakai untuk menentukan kapan aktivitas salat tersedia.
 */
export function getActivePrayer(hour: number, minute: number, schedule: readonly PrayerScheduleEntry[]): ActivePrayer | null {
  const now = hour * 60 + minute;
  for (const e of activeEntries(schedule)) {
    const elapsed = (((now - minuteOfDay(e)) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    if (elapsed < e.windowMinutes) return { prayer: e.prayer, hour: e.hour, minute: e.minute, minutesLeft: e.windowMinutes - elapsed };
  }
  return null;
}

/** Semua waktu salat yang tiba pada (fromTotal, toTotal]. Aman untuk lompatan banyak hari. */
export function getPrayersCrossed(fromTotal: number, toTotal: number, schedule: readonly PrayerScheduleEntry[]): PrayerCrossing[] {
  if (!(toTotal > fromTotal)) return [];
  const entries = activeEntries(schedule);
  const result: PrayerCrossing[] = [];
  const firstDay = Math.floor(fromTotal / MINUTES_PER_DAY);
  const lastDay = Math.floor(toTotal / MINUTES_PER_DAY);
  for (let day = firstDay; day <= lastDay; day++) {
    for (const e of entries) {
      const t = day * MINUTES_PER_DAY + minuteOfDay(e);
      if (t > fromTotal && t <= toTotal) result.push({ prayer: e.prayer, totalMinutes: t });
    }
  }
  return result;
}

export interface NotifiableTimeEvent {
  type: string;
  minutesAdvanced: number;
  previousTotalMinutes: number;
  totalMinutes: number;
}

/**
 * Notifikasi yang layak ditampilkan untuk satu perubahan waktu. Hanya untuk kemajuan waktu
 * biasa: lompatan besar (debug, tidur) dan pemuatan game tidak memicu notifikasi, dan
 * satu perubahan paling banyak menghasilkan satu notifikasi.
 */
export function getPrayerNotifications(
  event: NotifiableTimeEvent,
  schedule: readonly PrayerScheduleEntry[],
  maxJumpMinutes: number,
): PrayerCrossing[] {
  if (event.type !== "advance" || event.minutesAdvanced <= 0 || event.minutesAdvanced > maxJumpMinutes) return [];
  const notifiable = new Set(schedule.filter((e) => e.enabled && e.notificationEnabled).map((e) => e.prayer));
  const crossed = getPrayersCrossed(event.previousTotalMinutes, event.totalMinutes, schedule).filter((c) => notifiable.has(c.prayer));
  const last = crossed[crossed.length - 1];
  return last ? [last] : [];
}
