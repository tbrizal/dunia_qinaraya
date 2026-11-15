import { create } from "zustand";
import type { GameClockState } from "../systems/time/gameClock";
import { gameClock } from "../systems/time/gameClockInstance";

interface ClockSnapshot {
  state: GameClockState;
  totalMinutes: number;
}

/** Salinan state Game Clock untuk UI. Diperbarui lewat subscribe, bukan timer terpisah. */
export const useClockStore = create<ClockSnapshot>(() => ({
  state: gameClock.getState(),
  totalMinutes: gameClock.getTotalMinutes(),
}));

gameClock.subscribe((event) => {
  useClockStore.setState({ state: event.current, totalMinutes: event.totalMinutes });
});
