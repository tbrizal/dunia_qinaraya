import { useEffect, useRef } from "react";
import { hijriCalendarConfig, prayerScheduleConfig } from "../../config/lifestyleConfig";
import { getVisibleLearningContent } from "../../data/learning";
import { openLearning } from "../../stores/learningActions";
import { useClockStore } from "../../stores/useClockStore";
import { useUiStore } from "../../stores/useUiStore";
import { formatHijriDate, getHijriDate } from "../../systems/calendar/hijriCalendar";
import { PRAYER_LABELS, getActivePrayer, getNextPrayer } from "../../systems/prayer/prayerSchedule";
import { MINUTES_PER_DAY } from "../../systems/time/gameClock";
import { formatClock } from "../../systems/time/timeOfDay";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit`;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

/** Kalender Hijriah simulasi dan jadwal lima waktu salat simulasi. */
export function TimePanel() {
  const open = useUiStore((s) => s.timePanelOpen);
  const setOpen = useUiStore((s) => s.setTimePanelOpen);
  const state = useClockStore((s) => s.state);
  const totalMinutes = useClockStore((s) => s.totalMinutes);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const date = getHijriDate(totalMinutes, hijriCalendarConfig);
  const next = getNextPrayer(state.hour, state.minute, prayerScheduleConfig);
  const current = getActivePrayer(state.hour, state.minute, prayerScheduleConfig)?.prayer ?? null;
  const dayNumber = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1;
  const canLearn = getVisibleLearningContent("prayer-times") !== undefined;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 22, 24, 0.6)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="time-title"
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
        style={{ background: "var(--qin-night)", border: "2px solid rgba(230, 216, 180, 0.35)", touchAction: "pan-y" }}
      >
        <h2 id="time-title" className="mb-1 text-xl font-bold">
          Waktu di Qinaraya
        </h2>
        <p className="mb-4 text-sm opacity-80">Kalender dan jadwal simulasi untuk permainan</p>

        <div className="mb-4 rounded-xl p-3" style={{ background: "rgba(230, 216, 180, 0.08)" }}>
          <p className="text-2xl font-bold tabular-nums">{formatClock(state.hour, state.minute)}</p>
          <p className="text-base font-semibold">{formatHijriDate(date)}</p>
          <p className="text-sm opacity-80">
            Hari ke-{dayNumber} permainan, tanggal {date.day} dari {hijriCalendarConfig.daysPerMonth}
          </p>
        </div>

        <h3 className="mb-2 text-sm font-semibold">Jadwal lima waktu (simulasi)</h3>
        <ul className="mb-3 flex flex-col gap-1.5">
          {prayerScheduleConfig
            .filter((e) => e.enabled)
            .map((e) => {
              const isNext = next?.prayer === e.prayer;
              const isCurrent = current === e.prayer;
              return (
                <li
                  key={e.prayer}
                  className="flex items-baseline justify-between rounded-lg px-3 py-2 text-base"
                  style={{
                    background: isNext ? "rgba(122, 154, 91, 0.35)" : "rgba(230, 216, 180, 0.06)",
                    border: isNext ? "1px solid var(--qin-moss)" : "1px solid transparent",
                  }}
                >
                  <span className="font-semibold">
                    {PRAYER_LABELS[e.prayer]}
                    {isCurrent && <span className="ml-2 text-xs font-normal opacity-80">sedang berlangsung</span>}
                  </span>
                  <span className="tabular-nums">
                    {formatClock(e.hour, e.minute)}
                    {isNext && next && <span className="ml-2 text-xs opacity-80">dalam {formatDuration(next.minutesUntil)}</span>}
                  </span>
                </li>
              );
            })}
        </ul>

        <p className="mb-4 text-sm opacity-80">
          Kalender dan jadwal ini adalah simulasi buatan game, bukan penetapan tanggal atau waktu ibadah yang sebenarnya. Untuk waktu salat
          yang sebenarnya, ikuti jadwal dari masjid atau lembaga di daerahmu. Tidak ada hukuman jika kamu tidak mengikuti pengingat.
        </p>

        <div className="flex flex-col gap-2">
          {canLearn && (
            <button
              type="button"
              onClick={() => openLearning("prayer-times")}
              className="min-h-12 rounded-xl text-base font-semibold"
              style={{ background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
            >
              Mengenal waktu salat
            </button>
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="min-h-12 rounded-xl text-base font-semibold"
            style={{ background: "var(--qin-moss)", color: "var(--qin-night)" }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
