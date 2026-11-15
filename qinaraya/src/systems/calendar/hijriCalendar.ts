import { MINUTES_PER_DAY } from "../time/gameClock.ts";

/**
 * Kalender Hijriah SIMULASI untuk gameplay. Bukan kalender astronomis dan bukan
 * penetapan tanggal ibadah dunia nyata. Tanggal diturunkan dari menit total Game Clock,
 * jadi hanya ada satu sumber waktu dan tidak ada state kalender yang perlu disimpan.
 */

export const HIJRI_MONTH_NAMES = [
  "Muharam",
  "Safar",
  "Rabiulawal",
  "Rabiulakhir",
  "Jumadilawal",
  "Jumadilakhir",
  "Rajab",
  "Syakban",
  "Ramadan",
  "Syawal",
  "Zulkaidah",
  "Zulhijah",
] as const;

export const MONTHS_PER_HIJRI_YEAR = HIJRI_MONTH_NAMES.length;

export interface HijriStart {
  day: number;
  month: number;
  year: number;
}

export interface HijriDate extends HijriStart {
  monthName: string;
}

export interface HijriCalendarConfig {
  daysPerMonth: number;
  calendarDaysPerGameDay: number;
  startingDate: HijriStart;
}

export function hijriDayIndex(date: HijriStart, cfg: HijriCalendarConfig): number {
  return ((date.year - 1) * MONTHS_PER_HIJRI_YEAR + (date.month - 1)) * cfg.daysPerMonth + (date.day - 1);
}

export function dateFromDayIndex(index: number, cfg: HijriCalendarConfig): HijriDate {
  const i = Math.max(0, Math.floor(index));
  const monthIndex = Math.floor(i / cfg.daysPerMonth);
  const yearIndex = Math.floor(monthIndex / MONTHS_PER_HIJRI_YEAR);
  const month = monthIndex - yearIndex * MONTHS_PER_HIJRI_YEAR + 1;
  return {
    day: i - monthIndex * cfg.daysPerMonth + 1,
    month,
    year: yearIndex + 1,
    monthName: HIJRI_MONTH_NAMES[month - 1] ?? "",
  };
}

/** Indeks hari kalender (sejak 1 Muharam tahun 1) untuk menit total Game Clock tertentu. */
export function getCalendarDayIndex(totalMinutes: number, cfg: HijriCalendarConfig): number {
  const gameDay = Math.floor(Math.max(0, totalMinutes) / MINUTES_PER_DAY);
  return hijriDayIndex(cfg.startingDate, cfg) + Math.floor(gameDay * cfg.calendarDaysPerGameDay);
}

export function getHijriDate(totalMinutes: number, cfg: HijriCalendarConfig): HijriDate {
  return dateFromDayIndex(getCalendarDayIndex(totalMinutes, cfg), cfg);
}

export function formatHijriDate(date: HijriDate, withYear = true): string {
  return withYear ? `${date.day} ${date.monthName} ${date.year}` : `${date.day} ${date.monthName}`;
}

/**
 * Menit total Game Clock (pukul 06.00) untuk kemunculan berikutnya dari bulan dan hari tertentu,
 * mulai hari ini. Dipakai panel debug untuk melompat ke tanggal event.
 */
export function findGameMinutesForHijri(month: number, day: number, nowTotalMinutes: number, cfg: HijriCalendarConfig): number {
  const m = Math.min(MONTHS_PER_HIJRI_YEAR, Math.max(1, Math.floor(month)));
  const d = Math.min(cfg.daysPerMonth, Math.max(1, Math.floor(day)));
  const today = getCalendarDayIndex(nowTotalMinutes, cfg);
  const currentYear = dateFromDayIndex(today, cfg).year;

  let target = hijriDayIndex({ day: d, month: m, year: currentYear }, cfg);
  if (target < today) target = hijriDayIndex({ day: d, month: m, year: currentYear + 1 }, cfg);

  const startIndex = hijriDayIndex(cfg.startingDate, cfg);
  const gameDay = Math.max(0, Math.ceil((target - startIndex) / cfg.calendarDaysPerGameDay));
  return gameDay * MINUTES_PER_DAY + 6 * 60;
}
