import { gameConfig } from "../../config/gameConfig.ts";
import { GameClock } from "./gameClock.ts";
import type { ClockConfig, GameClockState } from "./gameClock.ts";

const c = gameConfig.clock;

export const clockConfig: ClockConfig = {
  realSecondsPerGameHour: c.realSecondsPerGameHour,
  daysPerMonth: c.daysPerMonth,
  monthsPerYear: c.monthsPerYear,
};

export function createInitialClockState(): GameClockState {
  return { ...c.start, speedMultiplier: 1, isPaused: false };
}

/** Satu-satunya Game Clock untuk seluruh game. Jangan membuat timer simulasi lain. */
export const gameClock = new GameClock(clockConfig, createInitialClockState());
