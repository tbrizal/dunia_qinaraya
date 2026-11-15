import { useEffect } from "react";
import { prayerNoticeConfig } from "../../config/lifestyleConfig";
import { useUiStore } from "../../stores/useUiStore";

/** Pengingat lembut waktu salat simulasi. Tidak bisa diklik, hilang sendiri, dan tanpa konsekuensi. */
export function PrayerNotice() {
  const notice = useUiStore((s) => s.prayerNotice);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => useUiStore.setState({ prayerNotice: null }), prayerNoticeConfig.displayMs);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute left-1/2 z-[24] w-max max-w-[88vw] -translate-x-1/2"
      style={{ top: "30%" }}
    >
      {notice && (
        <div
          key={notice.id}
          className="rounded-2xl px-5 py-3 text-center"
          style={{ background: "rgba(63, 112, 106, 0.92)", color: "#f3ecd6" }}
        >
          <p className="text-base font-semibold">{notice.text}</p>
          <p className="text-xs opacity-85">Jadwal simulasi. Santai saja, tidak perlu terburu-buru.</p>
        </div>
      )}
    </div>
  );
}
