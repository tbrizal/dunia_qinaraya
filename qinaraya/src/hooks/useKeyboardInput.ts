import { useEffect } from "react";
import { keyboardInput, resetInput } from "../systems/input/inputState";
import { useSettingsStore } from "../stores/useSettingsStore";

type KeyAction = "forward" | "back" | "left" | "right" | "sprint";

const KEY_MAP: Record<string, KeyAction> = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  ShiftLeft: "sprint",
  ShiftRight: "sprint",
};

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

/** Menghubungkan keyboard ke input state. Escape membuka/menutup menu pengaturan. */
export function useKeyboardInput(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        useSettingsStore.getState().toggleSettings();
        resetInput();
        return;
      }
      const action = KEY_MAP[e.code];
      if (!action) return;
      if (useSettingsStore.getState().settingsOpen) return;
      if (isTypingTarget(e.target) && action !== "sprint") return;
      e.preventDefault();
      keyboardInput[action] = true;
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const action = KEY_MAP[e.code];
      if (action) keyboardInput[action] = false;
    };

    // Tanpa ini tombol bisa "tersangkut" saat jendela kehilangan fokus.
    const onLoseFocus = () => resetInput();
    const onVisibility = () => {
      if (document.hidden) resetInput();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onLoseFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onLoseFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      resetInput();
    };
  }, []);
}
