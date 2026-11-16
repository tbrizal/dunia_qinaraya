import { useMemo } from "react";
import { hijriCalendarConfig, prayerScheduleConfig } from "../../config/lifestyleConfig";
import { useClockStore } from "../../stores/useClockStore";
import { useUiStore } from "../../stores/useUiStore";
import { formatHijriDate, getHijriDate } from "../../systems/calendar/hijriCalendar";
import { PRAYER_LABELS, getActivePrayer, getNextPrayer } from "../../systems/prayer/prayerSchedule";
import { MINUTES_PER_DAY } from "../../systems/time/gameClock";
import { formatClock } from "../../systems/time/timeOfDay";

/** Jam game, tanggal Hijriah simulasi, dan waktu salat berikutnya. Ketuk untuk membuka kalender dan jadwal. */
export function ClockPill() {
  const state = useClockStore((s) => s.state);
  const totalMinutes = useClockStore((s) => s.totalMinutes);
  const setOpen = useUiStore((s) => s.setTimePanelOpen);

  const dayNumber = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1;
  const date = useMemo(() => getHijriDate(totalMinutes, hijriCalendarConfig), [totalMinutes]);
  const active = getActivePrayer(state.hour, state.minute, prayerScheduleConfig);
  const next = getNextPrayer(state.hour, state.minute, prayerScheduleConfig);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Hari ${dayNumber}, pukul ${formatClock(state.hour, state.minute)}, ${formatHijriDate(date)}. Buka kalender dan jadwal salat simulasi`}
      className="pointer-events-auto flex min-h-11 w-fit flex-col items-start rounded-xl px-3 py-1.5 text-left text-sm"
      style={{ background: "rgba(31, 42, 46, 0.6)", color: "var(--qin-sand)" }}
    >
      <span className="flex items-baseline gap-3">
        <span className="font-semibold">Hari {dayNumber}</span>
        <span className="text-base font-bold tabular-nums">{formatClock(state.hour, state.minute)}</span>
        {state.speedMultiplier > 1 && <span className="text-xs opacity-80">{state.speedMultiplier}x</span>}
      </span>
      <span className="opacity-90">{formatHijriDate(date, false)}</span>
      {active ? (
        <span className="text-xs font-semibold" style={{ color: "#8fbeb4" }}>
          Waktu {PRAYER_LABELS[active.prayer]} sekarang
        </span>
      ) : (
        next && (
          <span className="text-xs opacity-80">
            {PRAYER_LABELS[next.prayer]} {formatClock(next.hour, next.minute)}
          </span>
        )
      )}
    </button>
  );
}
