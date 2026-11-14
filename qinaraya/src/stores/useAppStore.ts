import { create } from "zustand";

/** Status siklus hidup aplikasi (bukan state gameplay). */
interface AppState {
  sceneReady: boolean;
  setSceneReady: (ready: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sceneReady: false,
  setSceneReady: (ready) => set({ sceneReady: ready }),
}));
