import { useSettingsStore } from "../../stores/useSettingsStore";
import { SprintButton } from "./SprintButton";
import { VirtualJoystick } from "./VirtualJoystick";

/** Kontrol sentuh: joystick kiri, tombol aksi kanan. Disusun agar tengah layar tetap bebas. */
export function TouchControls() {
  const visible = useSettingsStore((s) => s.showTouchControls);
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[2]">
      <div
        className="absolute"
        style={{
          left: "max(1rem, env(safe-area-inset-left))",
          bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        }}
      >
        <VirtualJoystick />
      </div>
      <div
        className="absolute"
        style={{
          right: "max(1.25rem, env(safe-area-inset-right))",
          bottom: "max(2rem, calc(env(safe-area-inset-bottom) + 0.75rem))",
        }}
      >
        <SprintButton />
      </div>
    </div>
  );
}
