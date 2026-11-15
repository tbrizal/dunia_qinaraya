import { useEffect } from "react";
import { useUiStore } from "../../stores/useUiStore";

const DURATION_MS = 2600;

/** Notifikasi singkat untuk umpan balik aksi (item masuk, alasan aksi gagal, quest). */
export function Toast() {
  const toast = useUiStore((s) => s.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => useUiStore.setState({ toast: null }), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute left-1/2 z-[25] w-max max-w-[90vw] -translate-x-1/2"
      style={{ top: "calc(max(0.75rem, env(safe-area-inset-top)) + 7.5rem)" }}
    >
      {toast && (
        <p
          key={toast.id}
          className="rounded-xl px-4 py-2 text-center text-base font-semibold"
          style={{ background: "rgba(230, 216, 180, 0.95)", color: "var(--qin-night)" }}
        >
          {toast.text}
        </p>
      )}
    </div>
  );
}
