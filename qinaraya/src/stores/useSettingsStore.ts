import { create } from "zustand";
import { gameConfig } from "../config/gameConfig";

interface SettingsState {
  cameraSensitivity: number;
  showTouchControls: boolean;
  showFps: boolean;
  settingsOpen: boolean;
  fps: number;
  setCameraSensitivity: (value: number) => void;
  setShowTouchControls: (value: boolean) => void;
  setShowFps: (value: boolean) => void;
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
  settingsOpen: false,
  fps: 0,
  setCameraSensitivity: (value) =>
    set({ cameraSensitivity: Math.min(sensitivityMax, Math.max(sensitivityMin, value)) }),
  setShowTouchControls: (value) => set({ showTouchControls: value }),
  setShowFps: (value) => set({ showFps: value }),
  setSettingsOpen: (value) => set({ settingsOpen: value }),
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
  setFps: (value) => set({ fps: value }),
}));
