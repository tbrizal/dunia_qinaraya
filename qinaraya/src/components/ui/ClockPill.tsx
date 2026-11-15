import { useClockStore } from "../../stores/useClockStore";
import { MINUTES_PER_DAY } from "../../systems/time/gameClock";
import { formatClock } from "../../systems/time/timeOfDay";

/** Hari dan jam game. Kalender Hijriah ditampilkan pada Phase 3. */
export function ClockPill() {
  const state = useClockStore((s) => s.state);
  const totalMinutes = useClockStore((s) => s.totalMinutes);
  const dayNumber = Math.floor(totalMinutes / MINUTES_PER_DAY) + 1;

  return (
    <div
      className="pointer-events-none flex w-fit items-baseline gap-3 rounded-xl px-3 py-2 text-sm"
      style={{ background: "rgba(31, 42, 46, 0.6)", color: "var(--qin-sand)" }}
      aria-label={`Hari ${dayNumber}, pukul ${formatClock(state.hour, state.minute)}`}
    >
      <span className="font-semibold">Hari {dayNumber}</span>
      <span className="text-base font-bold tabular-nums">{formatClock(state.hour, state.minute)}</span>
      {state.speedMultiplier > 1 && <span className="text-xs opacity-80">{state.speedMultiplier}x</span>}
    </div>
  );
}
