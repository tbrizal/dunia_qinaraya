import { useEffect, useState } from "react";
import { useSettingsStore } from "../../stores/useSettingsStore";

/** Petunjuk kontrol singkat. Hilang saat pemain mulai berinteraksi atau setelah beberapa detik. */
export function ControlsHint() {
  const touch = useSettingsStore((s) => s.showTouchControls);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = () => setVisible(false);
    const timer = window.setTimeout(hide, 14000);
    window.addEventListener("keydown", hide, { once: true });
    window.addEventListener("pointerdown", hide, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", hide);
      window.removeEventListener("pointerdown", hide);
    };
  }, []);

  if (!visible) return null;
  return (
    <div
      className="pointer-events-none rounded-xl px-3 py-2 text-sm"
      style={{ background: "rgba(31, 42, 46, 0.6)", color: "var(--qin-sand)" }}
    >
      {touch ? (
        <p>Joystick kiri untuk berjalan. Geser layar untuk memutar kamera.</p>
      ) : (
        <>
          <p>WASD atau panah untuk berjalan, Shift untuk berlari.</p>
          <p>E untuk berinteraksi, I untuk tas.</p>
        </>
      )}
    </div>
  );
}
