import { useEffect, useRef } from "react";
import { ALLOW_UNREVIEWED } from "../../config/contentPolicy";
import { getVisibleLearningContent } from "../../data/learning";
import { closeLearning, learningNext, learningPrev } from "../../stores/learningActions";
import { useUiStore } from "../../stores/useUiStore";
import { reviewLabel } from "../../systems/content/review";

/** Pembaca materi edukasi per halaman. Materi yang belum ditinjau diberi label jelas pada build uji. */
export function LearningPanel() {
  const learning = useUiStore((s) => s.learning);
  const nextRef = useRef<HTMLButtonElement>(null);
  const content = learning ? getVisibleLearningContent(learning.contentId) : undefined;

  useEffect(() => {
    if (learning) nextRef.current?.focus();
  }, [learning?.contentId, learning?.page]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!learning || !content) return null;

  const last = learning.page >= content.pages.length - 1;

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 22, 24, 0.6)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) closeLearning();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="learning-title"
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
        style={{ background: "var(--qin-night)", border: "2px solid rgba(230, 216, 180, 0.35)", touchAction: "pan-y" }}
      >
        {ALLOW_UNREVIEWED && content.reviewStatus !== "approved" && (
          <p
            className="mb-3 rounded-lg px-3 py-2 text-xs font-semibold"
            style={{ background: "rgba(217, 120, 74, 0.25)", color: "#f4c9ad" }}
          >
            Mode uji: materi ini belum ditinjau ({reviewLabel(content.reviewStatus)}). Tidak tampil di versi produksi.
          </p>
        )}
        <h2 id="learning-title" className="mb-1 text-xl font-bold">
          {content.title}
        </h2>
        <p className="mb-3 text-xs tabular-nums opacity-70">
          Halaman {learning.page + 1} dari {content.pages.length}
        </p>
        <p className="mb-5 min-h-[7rem] text-base leading-relaxed">{content.pages[learning.page]}</p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={learningPrev}
            disabled={learning.page === 0}
            className="min-h-12 flex-1 rounded-xl text-base font-semibold disabled:opacity-40"
            style={{ background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
          >
            Kembali
          </button>
          <button
            ref={nextRef}
            type="button"
            onClick={learningNext}
            className="min-h-12 flex-[2] rounded-xl text-base font-semibold"
            style={{ background: "var(--qin-moss)", color: "var(--qin-night)" }}
          >
            {last ? "Selesai" : "Lanjut"}
          </button>
        </div>
        <button type="button" onClick={closeLearning} className="mt-2 min-h-11 w-full rounded-xl text-sm opacity-80">
          Tutup tanpa menyelesaikan
        </button>
      </div>
    </div>
  );
}
