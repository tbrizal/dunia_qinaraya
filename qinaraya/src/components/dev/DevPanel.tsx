import { useState } from "react";
import { ALLOW_UNREVIEWED } from "../../config/contentPolicy";
import { hijriCalendarConfig, prayerScheduleConfig } from "../../config/lifestyleConfig";
import { useClockStore } from "../../stores/useClockStore";
import { useLearningStore } from "../../stores/useLearningStore";
import { useQuestStore } from "../../stores/useQuestStore";
import { HIJRI_MONTH_NAMES, findGameMinutesForHijri, formatHijriDate, getHijriDate } from "../../systems/calendar/hijriCalendar";
import { PRAYER_LABELS, getNextPrayer } from "../../systems/prayer/prayerSchedule";
import { fromTotalMinutes } from "../../systems/time/gameClock";
import { clockConfig, gameClock } from "../../systems/time/gameClockInstance";
import { formatClock } from "../../systems/time/timeOfDay";

/**
 * Panel debug KHUSUS DEVELOPMENT untuk mengubah waktu dan tanggal simulasi. Hanya dimuat saat
 * import.meta.env.DEV, jadi tidak ada di build produksi. Lompatan besar tidak memicu notifikasi salat.
 */
export default function DevPanel() {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(9);
  const [day, setDay] = useState(1);
  const state = useClockStore((s) => s.state);
  const total = useClockStore((s) => s.totalMinutes);

  const date = getHijriDate(total, hijriCalendarConfig);
  const next = getNextPrayer(state.hour, state.minute, prayerScheduleConfig);

  const jumpToHijri = () => {
    const target = findGameMinutesForHijri(month, day, total, hijriCalendarConfig);
    gameClock.setState(fromTotalMinutes(target, clockConfig, gameClock.getState()), 0);
  };

  const btn = "min-h-9 rounded-lg px-2 text-xs font-semibold";
  const btnStyle = { background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" } as const;

  return (
    <div className="absolute z-30" style={{ left: "50%", bottom: "0.5rem", transform: "translateX(-50%)" }}>
      <button type="button" onClick={() => setOpen(!open)} className={btn} style={{ ...btnStyle, background: "#d9784a" }}>
        DEV waktu
      </button>
      {open && (
        <div
          className="mt-1 w-[min(22rem,92vw)] rounded-xl p-3 text-xs"
          style={{ background: "rgba(20, 28, 30, 0.95)", border: "1px solid #d9784a", position: "absolute", bottom: "2.5rem", left: "50%", transform: "translateX(-50%)" }}
        >
          <p className="mb-1 font-bold">Panel debug (hanya development)</p>
          <p className="mb-1 tabular-nums">
            {formatClock(state.hour, state.minute)} | {formatHijriDate(date)} | menit total {total}
          </p>
          <p className="mb-2 opacity-80">
            Berikutnya: {next ? `${PRAYER_LABELS[next.prayer]} ${formatClock(next.hour, next.minute)} (+${next.minutesUntil} mnt)` : "-"} | Konten belum ditinjau:{" "}
            {ALLOW_UNREVIEWED ? "TAMPIL" : "disembunyikan"}
          </p>

          <div className="mb-2 flex flex-wrap gap-1">
            {[
              ["+10 mnt", 10],
              ["+1 jam", 60],
              ["+6 jam", 360],
              ["+1 hari", 1440],
            ].map(([label, minutes]) => (
              <button key={label} type="button" className={btn} style={btnStyle} onClick={() => gameClock.advanceMinutes(minutes as number)}>
                {label}
              </button>
            ))}
            <button type="button" className={btn} style={btnStyle} onClick={() => gameClock.advanceMonths(1)}>
              +1 bulan
            </button>
          </div>

          <p className="mb-1 font-semibold">Uji notifikasi: maju sampai 1 menit sebelum waktu berikutnya</p>
          <button
            type="button"
            className={btn}
            style={btnStyle}
            onClick={() => next && gameClock.advanceMinutes(Math.max(0, next.minutesUntil - 1))}
          >
            Maju ke {next ? PRAYER_LABELS[next.prayer] : "-"} - 1 menit
          </button>

          <p className="mb-1 mt-2 font-semibold">Lompat ke tanggal Hijriah (pukul 06.00)</p>
          <div className="flex items-center gap-1">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="min-h-9 rounded-lg px-1"
              style={{ background: "#2a363a", color: "var(--qin-sand)" }}
            >
              {HIJRI_MONTH_NAMES.map((name, i) => (
                <option key={name} value={i + 1}>
                  {i + 1}. {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={hijriCalendarConfig.daysPerMonth}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              className="min-h-9 w-14 rounded-lg px-1"
              style={{ background: "#2a363a", color: "var(--qin-sand)" }}
            />
            <button type="button" className={btn} style={btnStyle} onClick={jumpToHijri}>
              Lompat
            </button>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            <button type="button" className={btn} style={btnStyle} onClick={() => useLearningStore.getState().reset()}>
              Reset materi dibaca
            </button>
            <button type="button" className={btn} style={btnStyle} onClick={() => useQuestStore.getState().reset()}>
              Reset semua quest
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
