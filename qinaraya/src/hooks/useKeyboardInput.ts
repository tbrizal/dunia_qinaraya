import { useEffect } from "react";
import { advanceDialogue, chooseDialogueOption, closeDialogue } from "../stores/dialogueActions";
import { activityNext, closeActivity } from "../stores/activityActions";
import { closeLearning, learningNext } from "../stores/learningActions";
import { triggerAction } from "../stores/gameActions";
import { useSettingsStore } from "../stores/useSettingsStore";
import { isModalOpen, useUiStore } from "../stores/useUiStore";
import { keyboardInput, resetInput } from "../systems/input/inputState";

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

const DIGITS: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4 };

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
}

/** Enter dan Spasi pada tombol yang sedang fokus ditangani tombol itu sendiri. */
function isNativeActivation(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.tagName === "BUTTON" || target.tagName === "INPUT" || target.tagName === "SELECT");
}

function handleEscape(): void {
  const ui = useUiStore.getState();
  if (ui.dialogue) closeDialogue();
  else if (ui.activity) closeActivity();
  else if (ui.learning) closeLearning();
  else if (ui.timePanelOpen) ui.setTimePanelOpen(false);
  else if (ui.inventoryOpen) ui.setInventoryOpen(false);
  else useSettingsStore.getState().toggleSettings();
  resetInput();
}

/**
 * Menghubungkan keyboard ke game.
 * Gerak: WASD/panah, Shift. Aksi: E atau Enter (utama), 1-4 (pilihan aksi), I (tas), T (kalender dan jadwal), Esc (tutup/pengaturan).
 */
export function useKeyboardInput(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        handleEscape();
        return;
      }
      if (isTypingTarget(e.target)) return;

      const ui = useUiStore.getState();
      const settingsOpen = useSettingsStore.getState().settingsOpen;

      const otherPanel = settingsOpen || ui.dialogue !== null || ui.learning !== null || ui.activity !== null;

      if (e.code === "KeyI" && !e.repeat && !otherPanel && !ui.timePanelOpen) {
        ui.toggleInventory();
        resetInput();
        return;
      }
      if (e.code === "KeyT" && !e.repeat && !otherPanel && !ui.inventoryOpen) {
        ui.setTimePanelOpen(!ui.timePanelOpen);
        resetInput();
        return;
      }

      const activates = e.code === "KeyE" || ((e.code === "Enter" || e.code === "Space") && !isNativeActivation(e.target));
      const digit = DIGITS[e.code];

      if (ui.activity) {
        if (!e.repeat && activates) {
          e.preventDefault();
          activityNext();
        }
        return;
      }

      if (ui.learning) {
        if (!e.repeat && activates) {
          e.preventDefault();
          learningNext();
        }
        return;
      }

      if (ui.dialogue) {
        if (e.repeat) return;
        if (activates) {
          e.preventDefault();
          advanceDialogue();
        } else if (digit !== undefined) {
          chooseDialogueOption(digit);
        }
        return;
      }

      if (isModalOpen()) return;

      if (activates || digit !== undefined) {
        if (e.repeat) return;
        if (activates) e.preventDefault();
        triggerAction(digit ?? 0);
        return;
      }

      const action = KEY_MAP[e.code];
      if (!action) return;
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
