import { useEffect, useRef } from "react";
import { ALLOW_UNREVIEWED } from "../../config/contentPolicy";
import { getVisibleActivity } from "../../data/activities";
import { activityNext, activityPrev, closeActivity } from "../../stores/activityActions";
import { useUiStore } from "../../stores/useUiStore";
import { reviewLabel } from "../../systems/content/review";

/** Pemandu aktivitas langkah demi langkah. Tenang dan opsional: bisa ditutup kapan saja tanpa konsekuensi. */
export function ActivityPanel() {
  const state = useUiStore((s) => s.activity);
  const nextRef = useRef<HTMLButtonElement>(null);
  const def = state ? getVisibleActivity(state.activityId) : undefined;

  useEffect(() => {
    if (state) nextRef.current?.focus();
  }, [state?.activityId, state?.step]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!state || !def) return null;

  const total = def.steps.length;
  const isClosing = state.step >= total;
  const step = isClosing ? null : def.steps[state.step]!;
  const fill = (text: string) => text.replaceAll("{prayer}", state.prayerLabel);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ background: "rgba(10, 18, 20, 0.72)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeActivity();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-title"
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
        style={{ background: "#1c2d30", border: "2px solid rgba(143, 190, 180, 0.45)", touchAction: "pan-y" }}
      >
        {ALLOW_UNREVIEWED && def.reviewStatus !== "approved" && (
          <p className="mb-3 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "rgba(217, 120, 74, 0.25)", color: "#f4c9ad" }}>
            Mode uji: aktivitas ini belum ditinjau ({reviewLabel(def.reviewStatus)}). Tidak tampil di versi produksi.
          </p>
        )}

        <h2 id="activity-title" className="mb-1 text-xl font-bold">
          {fill(def.title)}
        </h2>

        <div className="mb-3 flex gap-1.5" aria-hidden="true">
          {Array.from({ length: total + 1 }, (_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{ background: i <= state.step ? "#8fbeb4" : "rgba(230, 216, 180, 0.2)" }}
            />
          ))}
        </div>
        <p className="mb-2 text-xs tabular-nums opacity-70">{isClosing ? "Selesai" : `Langkah ${state.step + 1} dari ${total}`}</p>

        <h3 className="mb-2 text-lg font-semibold">{step ? fill(step.title) : "Terima kasih"}</h3>
        <p className="mb-5 min-h-[6.5rem] text-base leading-relaxed">{fill(step ? step.text : def.closing)}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={activityPrev}
            disabled={state.step === 0}
            className="min-h-12 flex-1 rounded-xl text-base font-semibold disabled:opacity-40"
            style={{ background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
          >
            Kembali
          </button>
          <button
            ref={nextRef}
            type="button"
            onClick={activityNext}
            className="min-h-12 flex-[2] rounded-xl text-base font-semibold"
            style={{ background: "#8fbeb4", color: "var(--qin-night)" }}
          >
            {isClosing ? "Selesai" : "Lanjut"}
          </button>
        </div>
        <button type="button" onClick={closeActivity} className="mt-2 min-h-11 w-full rounded-xl text-sm opacity-80">
          Tutup, nanti saja
        </button>
      </div>
    </div>
  );
}
