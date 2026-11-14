import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useSettingsStore } from "../../stores/useSettingsStore";

/** Mengukur FPS hanya saat opsi FPS aktif; memperbarui tampilan dua kali per detik. */
export function FpsMeter() {
  const acc = useRef({ frames: 0, time: 0 });

  useFrame((_, delta) => {
    const { showFps, setFps } = useSettingsStore.getState();
    const a = acc.current;
    if (!showFps) {
      a.frames = 0;
      a.time = 0;
      return;
    }
    a.frames += 1;
    a.time += delta;
    if (a.time >= 0.5) {
      setFps(Math.round(a.frames / a.time));
      a.frames = 0;
      a.time = 0;
    }
  });

  return null;
}
