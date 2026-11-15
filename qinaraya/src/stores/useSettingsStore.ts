import { create } from "zustand";
import { gameConfig } from "../config/gameConfig";

interface SettingsState {
  cameraSensitivity: number;
  showTouchControls: boolean;
  showFps: boolean;
  /** Pengingat lembut saat waktu salat simulasi tiba. */
  prayerNotifications: boolean;
  /** Denting lembut bersama pengingat. Default mati. */
  prayerSound: boolean;
  settingsOpen: boolean;
  fps: number;
  setCameraSensitivity: (value: number) => void;
  setShowTouchControls: (value: boolean) => void;
  setShowFps: (value: boolean) => void;
  setPrayerNotifications: (value: boolean) => void;
  setPrayerSound: (value: boolean) => void;
  setSettingsOpen: (value: boolean) => void;
  toggleSettings: () => void;
  setFps: (value: number) => void;
}

const { sensitivityMin, sensitivityMax, sensitivityDefault } = gameConfig.settings;

function detectTouchDevice(): boolean {
  return typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
}

/** Preferensi pemain. Penyimpanan permanen ditambahkan bersama Save System. */
export const useSettingsStore = create<SettingsState>((set) => ({
  cameraSensitivity: sensitivityDefault,
  showTouchControls: detectTouchDevice(),
  showFps: false,
  prayerNotifications: true,
  prayerSound: false,
  settingsOpen: false,
  fps: 0,
  setCameraSensitivity: (value) =>
    set({ cameraSensitivity: Math.min(sensitivityMax, Math.max(sensitivityMin, value)) }),
  setShowTouchControls: (value) => set({ showTouchControls: value }),
  setShowFps: (value) => set({ showFps: value }),
  setPrayerNotifications: (value) => set({ prayerNotifications: value }),
  setPrayerSound: (value) => set({ prayerSound: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  setFps: (value) => set({ fps: value }),
}));
