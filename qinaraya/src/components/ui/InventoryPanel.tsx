import { useEffect, useRef, useState } from "react";
import { getItemDef } from "../../data/items";
import type { ItemCategory } from "../../data/items";
import { useInventoryStore } from "../../stores/useInventoryStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { useUiStore } from "../../stores/useUiStore";

const CATEGORY_LABEL: Record<ItemCategory, string> = { tool: "Alat", seed: "Benih", crop: "Hasil panen" };

function BackpackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 6a4 4 0 0 1 8 0" />
      <rect x="5" y="6" width="14" height="15" rx="3" />
      <path d="M9 14h6" />
    </svg>
  );
}

/** Tombol tas (kanan atas, di kiri tombol pengaturan) dan panel isinya. */
export function InventoryPanel() {
  const open = useUiStore((s) => s.inventoryOpen);
  const setOpen = useUiStore((s) => s.setInventoryOpen);
  const dialogueOpen = useUiStore((s) => s.dialogue !== null);
  const settingsOpen = useSettingsStore((s) => s.settingsOpen);
  const inventory = useInventoryStore((s) => s.inventory);
  const [selected, setSelected] = useState(0);

  const closeRef = useRef<HTMLButtonElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) buttonRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const stack = inventory.stacks[Math.min(selected, Math.max(0, inventory.stacks.length - 1))];
  const def = stack ? getItemDef(stack.itemId) : undefined;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Buka tas"
        disabled={dialogueOpen || settingsOpen}
        onClick={() => setOpen(true)}
        className="absolute z-[3] flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          right: "calc(max(0.75rem, env(safe-area-inset-right)) + 3.5rem)",
          color: "var(--qin-sand)",
          background: "rgba(31, 42, 46, 0.55)",
          border: "2px solid rgba(230, 216, 180, 0.45)",
        }}
      >
        <BackpackIcon />
      </button>

      {open && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center p-4"
          style={{ background: "rgba(15, 22, 24, 0.6)" }}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-title"
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
            style={{ background: "var(--qin-night)", border: "2px solid rgba(230, 216, 180, 0.35)", touchAction: "pan-y" }}
          >
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="inventory-title" className="text-xl font-bold">
                Tas
              </h2>
              <p className="text-sm tabular-nums opacity-80">
                {inventory.stacks.length}/{inventory.slots} slot
              </p>
            </div>

            <div className="mb-4 grid grid-cols-5 gap-2">
              {Array.from({ length: inventory.slots }, (_, i) => {
                const s = inventory.stacks[i];
                const d = s ? getItemDef(s.itemId) : undefined;
                const isSelected = s !== undefined && i === selected;
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!s}
                    aria-label={d && s ? `${d.name}, ${s.quantity}` : "Slot kosong"}
                    aria-pressed={isSelected}
                    onClick={() => setSelected(i)}
                    className="relative flex aspect-square items-center justify-center rounded-xl text-2xl"
                    style={{
                      background: d ? d.color : "rgba(230, 216, 180, 0.08)",
                      border: isSelected ? "3px solid var(--qin-sand)" : "2px solid rgba(230, 216, 180, 0.2)",
                      opacity: d ? 1 : 0.7,
                    }}
                  >
                    {d?.icon}
                    {s && s.quantity > 1 && (
                      <span
                        className="absolute bottom-0.5 right-1 rounded px-1 text-xs font-bold tabular-nums"
                        style={{ background: "rgba(31, 42, 46, 0.85)", color: "var(--qin-sand)" }}
                      >
                        {s.quantity}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mb-4 min-h-[4.5rem] rounded-xl p-3 text-sm" style={{ background: "rgba(230, 216, 180, 0.08)" }}>
              {def && stack ? (
                <>
                  <p className="font-semibold">
                    {def.name} <span className="font-normal opacity-70">({CATEGORY_LABEL[def.category]})</span>
                  </p>
                  <p className="opacity-90">{def.description}</p>
                </>
              ) : (
                <p className="opacity-80">Tas masih kosong.</p>
              )}
            </div>

            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-12 w-full rounded-xl text-base font-semibold"
              style={{ background: "var(--qin-moss)", color: "var(--qin-night)" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
