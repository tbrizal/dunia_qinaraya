import { useMemo } from "react";
import { computeTargetView, runAction } from "../../stores/gameActions";
import { useFarmStore } from "../../stores/useFarmStore";
import { useInteractionStore } from "../../stores/useInteractionStore";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useUiStore } from "../../stores/useUiStore";

/**
 * Tombol aksi kontekstual di kanan bawah: nama target, statusnya, dan aksi yang tersedia.
 * Aksi yang belum bisa dilakukan tetap tampil (redup) dan menjelaskan alasannya saat ditekan.
 */
export function ActionPrompt() {
  const target = useInteractionStore((s) => s.target);
  const plot = useFarmStore((s) => (target?.kind === "plot" ? s.plots[target.id] : undefined));
  const inventory = useInventoryStore((s) => s.inventory);
  const showTouch = useSettingsStore((s) => s.showTouchControls);
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const panelOpen = useUiStore((s) => s.inventoryOpen || s.dialogue !== null);

  // plot dan inventory dibaca ulang di computeTargetView; di sini hanya pemicu hitung ulang.
  const view = useMemo(() => computeTargetView(target), [target, plot, inventory]);

  if (!view || settingsOpen || panelOpen) return null;

  return (
    <div
      className="pointer-events-none absolute z-[3] flex w-[min(17rem,60vw)] flex-col items-stretch gap-2"
      style={{
        right: "max(1.25rem, env(safe-area-inset-right))",
        bottom: showTouch ? "calc(var(--btn-size) + 3.25rem)" : "max(1.5rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="rounded-xl px-3 py-2 text-right text-sm" style={{ background: "rgba(31, 42, 46, 0.7)", color: "var(--qin-sand)" }}>
        <p className="font-semibold">{view.title}</p>
        {view.status && <p className="opacity-90">{view.status}</p>}
      </div>
      {view.actions.map((action, index) => (
        <button
          key={action.id}
          type="button"
          aria-disabled={!action.enabled}
          onClick={() => runAction(action.id)}
          className="pointer-events-auto flex min-h-12 touch-manipulation items-center justify-between gap-3 rounded-xl px-4 py-2 text-left text-base font-semibold"
          style={{
            background: action.enabled ? (index === 0 ? "var(--qin-moss)" : "rgba(230, 216, 180, 0.9)") : "rgba(31, 42, 46, 0.7)",
            color: action.enabled ? "var(--qin-night)" : "rgba(230, 216, 180, 0.6)",
            border: action.enabled ? "none" : "1px dashed rgba(230, 216, 180, 0.4)",
          }}
        >
          <span>{action.label}</span>
          {!showTouch && (
            <kbd className="rounded px-1.5 text-xs" style={{ background: "rgba(31, 42, 46, 0.25)" }}>
              {index === 0 ? "E" : index + 1}
            </kbd>
          )}
        </button>
      ))}
    </div>
  );
}
