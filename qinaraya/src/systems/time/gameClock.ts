/**
 * Game Clock terpusat: satu-satunya sumber waktu simulasi.
 * Modul lain (farming, kalender, jadwal salat, NPC) mendengarkan lewat subscribe(),
 * dan tidak boleh membuat timer sendiri. Waktu hanya maju saat tick() dipanggil,
 * jadi dunia tidak berjalan saat game ditutup.
 */

export interface GameClockState {
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  speedMultiplier: number;
  isPaused: boolean;
}

export interface ClockConfig {
  realSecondsPerGameHour: number;
  daysPerMonth: number;
  monthsPerYear: number;
}

export interface TimeCrossings {
  hours: number;
  days: number;
  months: number;
  years: number;
}

export type TimeEventType = "advance" | "pause" | "speed" | "set";

export interface TimeChangeEvent {
  type: TimeEventType;
  previous: GameClockState;
  current: GameClockState;
  previousTotalMinutes: number;
  /** Menit game sejak awal kalender (hari 1, bulan 1, tahun 1, 00:00). */
  totalMinutes: number;
  minutesAdvanced: number;
  /** Jumlah batas jam/hari/bulan/tahun yang dilewati pada perubahan ini. */
  crossed: TimeCrossings;
}

export type TimeListener = (event: TimeChangeEvent) => void;

export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 1440;

export function toTotalMinutes(state: GameClockState, cfg: ClockConfig): number {
  const days = ((state.year - 1) * cfg.monthsPerYear + (state.month - 1)) * cfg.daysPerMonth + (state.day - 1);
  return days * MINUTES_PER_DAY + state.hour * MINUTES_PER_HOUR + state.minute;
}

export function fromTotalMinutes(
  total: number,
  cfg: ClockConfig,
  base: Pick<GameClockState, "speedMultiplier" | "isPaused">,
): GameClockState {
  const t = Math.max(0, Math.floor(total));
  const dayIndex = Math.floor(t / MINUTES_PER_DAY);
  const minuteOfDay = t - dayIndex * MINUTES_PER_DAY;
  const monthIndex = Math.floor(dayIndex / cfg.daysPerMonth);
  const yearIndex = Math.floor(monthIndex / cfg.monthsPerYear);
  return {
    day: dayIndex - monthIndex * cfg.daysPerMonth + 1,
    month: monthIndex - yearIndex * cfg.monthsPerYear + 1,
    year: yearIndex + 1,
    hour: Math.floor(minuteOfDay / MINUTES_PER_HOUR),
    minute: minuteOfDay % MINUTES_PER_HOUR,
    speedMultiplier: base.speedMultiplier,
    isPaused: base.isPaused,
  };
}

/** Mengembalikan state baru; tidak mengubah state asal. */
export function advanceState(state: GameClockState, minutes: number, cfg: ClockConfig): GameClockState {
  return fromTotalMinutes(toTotalMinutes(state, cfg) + Math.max(0, Math.floor(minutes)), cfg, state);
}

export function countCrossings(fromTotal: number, toTotal: number, cfg: ClockConfig): TimeCrossings {
  const diff = (unit: number) => Math.floor(toTotal / unit) - Math.floor(fromTotal / unit);
  const month = MINUTES_PER_DAY * cfg.daysPerMonth;
  return {
    hours: diff(MINUTES_PER_HOUR),
    days: diff(MINUTES_PER_DAY),
    months: diff(month),
    years: diff(month * cfg.monthsPerYear),
  };
}

/** Menit game sampai jam:menit berikutnya (1..1440). Bila sama dengan sekarang, berarti besok. */
export function minutesUntilTime(state: GameClockState, hour: number, minute: number): number {
  const now = state.hour * MINUTES_PER_HOUR + state.minute;
  const target = hour * MINUTES_PER_HOUR + minute;
  const diff = target - now;
  return diff <= 0 ? diff + MINUTES_PER_DAY : diff;
}

export function gameMinutesPerRealSecond(cfg: ClockConfig): number {
  return MINUTES_PER_HOUR / cfg.realSecondsPerGameHour;
}

export class GameClock {
  private state: GameClockState;
  private accumulator = 0;
  private readonly listeners = new Set<TimeListener>();
  private readonly cfg: ClockConfig;

  constructor(cfg: ClockConfig, initial: GameClockState) {
    this.cfg = cfg;
    this.state = { ...initial };
  }

  /** State selalu diganti dengan objek baru saat berubah, sehingga referensi lama adalah snapshot aman. */
  getState(): GameClockState {
    return this.state;
  }

  getTotalMinutes(): number {
    return toTotalMinutes(this.state, this.cfg);
  }

  /** Sisa menit game pecahan yang belum genap 1 menit (ikut disimpan agar waktu tidak bergeser). */
  getAccumulator(): number {
    return this.accumulator;
  }

  subscribe(listener: TimeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Mendengarkan hanya saat batas jam/hari/bulan/tahun terlewati. */
  onCrossing(unit: keyof TimeCrossings, callback: (event: TimeChangeEvent) => void): () => void {
    return this.subscribe((event) => {
      if (event.crossed[unit] > 0) callback(event);
    });
  }

  /** Memajukan waktu berdasarkan detik nyata. Mengembalikan menit game yang berlalu. */
  tick(deltaSeconds: number): number {
    if (this.state.isPaused || !(deltaSeconds > 0)) return 0;
    this.accumulator += deltaSeconds * gameMinutesPerRealSecond(this.cfg) * this.state.speedMultiplier;
    const whole = Math.floor(this.accumulator);
    if (whole < 1) return 0;
    this.accumulator -= whole;
    return this.advanceMinutes(whole);
  }

  advanceMinutes(minutes: number): number {
    const whole = Math.floor(minutes);
    if (!(whole > 0)) return 0;
    const previous = this.state;
    const previousTotal = toTotalMinutes(previous, this.cfg);
    this.state = fromTotalMinutes(previousTotal + whole, this.cfg, previous);
    this.emit("advance", previous, previousTotal, whole);
    return whole;
  }

  advanceDays(days: number): number {
    return this.advanceMinutes(days * MINUTES_PER_DAY);
  }

  advanceMonths(months: number): number {
    return this.advanceMinutes(months * this.cfg.daysPerMonth * MINUTES_PER_DAY);
  }

  advanceYears(years: number): number {
    return this.advanceMinutes(years * this.cfg.monthsPerYear * this.cfg.daysPerMonth * MINUTES_PER_DAY);
  }

  setPaused(paused: boolean): void {
    if (this.state.isPaused === paused) return;
    const previous = this.state;
    this.state = { ...previous, isPaused: paused };
    this.emit("pause", previous, toTotalMinutes(previous, this.cfg), 0);
  }

  setSpeedMultiplier(multiplier: number): void {
    if (!Number.isFinite(multiplier) || multiplier <= 0 || multiplier === this.state.speedMultiplier) return;
    const previous = this.state;
    this.state = { ...previous, speedMultiplier: multiplier };
    this.emit("speed", previous, toTotalMinutes(previous, this.cfg), 0);
  }

  /** Mengganti seluruh state (dipakai load game dan game baru). */
  setState(next: GameClockState, accumulator = 0): void {
    const previous = this.state;
    const previousTotal = toTotalMinutes(previous, this.cfg);
    this.state = { ...next };
    this.accumulator = Number.isFinite(accumulator) ? Math.min(Math.max(accumulator, 0), 0.999) : 0;
    this.emit("set", previous, previousTotal, 0);
  }

  minutesUntil(hour: number, minute: number): number {
    return minutesUntilTime(this.state, hour, minute);
  }

  private emit(type: TimeEventType, previous: GameClockState, previousTotal: number, advanced: number): void {
    if (this.listeners.size === 0) return;
    const totalMinutes = toTotalMinutes(this.state, this.cfg);
    const event: TimeChangeEvent = {
      type,
      previous,
      current: this.state,
      previousTotalMinutes: previousTotal,
      totalMinutes,
      minutesAdvanced: advanced,
      crossed: countCrossings(previousTotal, totalMinutes, this.cfg),
    };
    for (const listener of Array.from(this.listeners)) {
      try {
        listener(event);
      } catch (error) {
        console.error("Game Clock listener error:", error);
      }
    }
  }
}
