import { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/useSettingsStore";

/** Petunjuk kontrol singkat. Hilang saat pemain mulai berinteraksi atau setelah beberapa detik. */
export function ControlsHint() {
  const touch = useSettingsStore((s) => s.showTouchControls);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    const timer = window.setTimeout(hide, 12000);
    window.addEventListener("keydown", hide, { once: true });
    window.addEventListener("pointerdown", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("pointerdown", hide);
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className="pointer-events-none absolute z-[3] max-w-[26rem] rounded-xl px-4 py-3 text-sm transition-opacity duration-500"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        left: "max(0.75rem, env(safe-area-inset-left))",
        right: "calc(4.25rem + env(safe-area-inset-right))",
        opacity: visible ? 1 : 0,
        color: "var(--qin-sand)",
        background: "rgba(31, 42, 46, 0.6)",
      }}
    >
      {touch ? (
        <p>Geser joystick kiri untuk berjalan. Geser layar untuk memutar kamera, cubit untuk zoom.</p>
      ) : (
        <>
          <p>WASD atau tombol panah untuk berjalan, Shift untuk berlari.</p>
          <p>Seret mouse untuk memutar kamera, roda mouse untuk zoom.</p>
        </>
      )}
    </div>
  );
}
