import { useEffect, useRef } from "react";
import { ALLOW_UNREVIEWED } from "../../config/contentPolicy";
import { getVisibleActivity } from "../../data/activities";
import type { Recitation, StepKind, WorshipStepView } from "../../data/worship";
import { getWorshipGuide } from "../../data/worship";
import { activityNext, activityPrev, activityReplay, choosePrayer, closeActivity } from "../../stores/activityActions";
import { useUiStore } from "../../stores/useUiStore";
import { reviewLabel } from "../../systems/content/review";
import { describeIndicator } from "../../systems/worship/sequences";

const ARABIC_FONT = '"Noto Naskh Arabic", "Geeza Pro", "Segoe UI", Tahoma, serif';

const KIND_BADGE: Record<Exclude<StepKind, "info">, { label: string; bg: string; fg: string }> = {
  rukun: { label: "Rukun", bg: "#7a9a5b", fg: "#1f2a2e" },
  sunah: { label: "Sunah", bg: "#e6d8b4", fg: "#1f2a2e" },
};

function ArabicRecitation({ recitation, lead }: { recitation: Recitation; lead?: string }) {
  return (
    <div className="mb-3 rounded-xl p-3" style={{ background: "rgba(230, 216, 180, 0.08)" }}>
      {lead && <p className="mb-1 text-sm opacity-80">{lead}</p>}
      <p className="mb-1 text-xs font-semibold opacity-70">{recitation.label}</p>
      {recitation.arab && (
        <p dir="rtl" lang="ar" className="mb-2 text-right" style={{ fontFamily: ARABIC_FONT, fontSize: "1.6rem", lineHeight: 2.1 }}>
          {recitation.arab}
        </p>
      )}
      <p className="mb-1 text-sm italic">{recitation.translit}</p>
      <p className="text-sm opacity-90">“{recitation.arti}”</p>
    </div>
  );
}

function StepBody({ step }: { step: WorshipStepView }) {
  const badge = step.kind === "info" ? null : KIND_BADGE[step.kind];
  return (
    <>
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold">{step.title}</h3>
        {badge && (
          <span className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: badge.bg, color: badge.fg }}>
            {badge.label}
          </span>
        )}
      </div>
      {step.instruction && <p className="mb-3 whitespace-pre-line text-base leading-relaxed">{step.instruction}</p>}
      {step.recitations.map((r) => (
        <ArabicRecitation key={`${r.recitation.id}-${r.lead ?? ""}`} recitation={r.recitation} lead={r.lead} />
      ))}
      {step.missingText && (
        <p className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(143, 190, 180, 0.15)" }}>
          {step.missingText}
        </p>
      )}
      {step.notes.map((n) => (
        <p key={n} className="mb-2 text-sm opacity-85">
          {n}
        </p>
      ))}
    </>
  );
}

/**
 * Panel panduan wudu dan salat sebagai lembar bawah, agar karakter yang beraktivitas tetap terlihat di atas.
 * Menampilkan bacaan Arab (kanan ke kiri), transliterasi, arti, dan label rukun atau sunah dari panduan.
 */
export function WorshipPanel() {
  const state = useUiStore((s) => s.activity);
  const nextRef = useRef<HTMLButtonElement>(null);
  const open = state !== null;

  // Font Arab hanya dimuat saat panel pertama kali dibuka.
  useEffect(() => {
    if (open) void import("@fontsource/noto-naskh-arabic/arabic-400.css");
  }, [open]);

  useEffect(() => {
    if (state?.stage === "play") nextRef.current?.focus();
  }, [state?.stage, state?.index]);

  const guide = getWorshipGuide();
  const def = state ? getVisibleActivity(state.activityId) : undefined;
  if (!state || !def || !guide) return null;

  const total = state.steps.length;
  const closing = state.index >= total;
  const step = closing ? null : state.steps[state.index];
  const indicator = step ? describeIndicator(step) : null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="worship-title"
        className="max-h-[58vh] w-full max-w-xl overflow-y-auto rounded-2xl p-4"
        style={{ background: "#1c2d30", border: "2px solid rgba(143, 190, 180, 0.45)", touchAction: "pan-y" }}
      >
        {ALLOW_UNREVIEWED && def.reviewStatus !== "approved" && (
          <p className="mb-2 rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: "rgba(217, 120, 74, 0.25)", color: "#f4c9ad" }}>
            Mode uji: materi ini belum ditinjau ({reviewLabel(def.reviewStatus)}). Tidak tampil di versi produksi.
          </p>
        )}

        <div className="mb-1 flex items-center justify-between gap-2">
          <h2 id="worship-title" className="text-xl font-bold">
            {def.kind === "salat" && state.prayerLabel ? `Salat ${state.prayerLabel}` : def.title}
          </h2>
          {def.kind === "salat" && state.stage === "play" && (
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "rgba(143, 190, 180, 0.25)" }}>
              {state.practice ? "Latihan" : "Waktu sedang berlangsung"}
            </span>
          )}
        </div>
        <details className="mb-3 text-xs opacity-80">
          <summary className="cursor-pointer">Catatan panduan</summary>
          <p className="mt-1">{guide.disclaimer}</p>
        </details>

        {state.stage === "choose" ? (
          <>
            <p className="mb-3 text-base">Pilih salat yang ingin kamu pelajari.</p>
            <div className="mb-3 flex flex-col gap-2">
              {guide.prayers.map((p) => (
                <button
                  key={p.prayer}
                  type="button"
                  onClick={() => choosePrayer(p.prayer)}
                  className="flex min-h-12 items-center justify-between rounded-xl px-4 text-left text-base font-semibold"
                  style={{ background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
                >
                  <span>{p.name}</span>
                  <span className="text-sm font-normal">{p.rakaat} rakaat</span>
                </button>
              ))}
            </div>
            <button type="button" onClick={closeActivity} className="min-h-11 w-full rounded-xl text-sm opacity-80">
              Tutup, nanti saja
            </button>
          </>
        ) : (
          <>
            <div className="mb-1 flex gap-1" aria-hidden="true">
              {Array.from({ length: total + 1 }, (_, i) => (
                <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= state.index ? "#8fbeb4" : "rgba(230, 216, 180, 0.2)" }} />
              ))}
            </div>
            <p className="mb-2 text-xs tabular-nums opacity-75">{indicator ?? (closing ? "Selesai" : `Langkah ${state.index + 1} dari ${total}`)}</p>

            {step ? (
              <StepBody step={step} />
            ) : (
              <>
                <h3 className="mb-2 text-lg font-semibold">Terima kasih</h3>
                <p className="mb-2 text-base leading-relaxed">{def.closing}</p>
                <p className="mb-3 text-sm opacity-85">{guide.closingPrinciple}</p>
              </>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={activityPrev}
                disabled={state.index === 0}
                className="min-h-12 flex-1 rounded-xl text-base font-semibold disabled:opacity-40"
                style={{ background: "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
              >
                Sebelumnya
              </button>
              {step && (
                <button
                  type="button"
                  onClick={activityReplay}
                  aria-label="Ulangi gerakan"
                  className="min-h-12 rounded-xl px-3 text-base font-semibold"
                  style={{ background: "rgba(143, 190, 180, 0.3)", color: "var(--qin-sand)" }}
                >
                  Ulangi
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={activityNext}
                className="min-h-12 flex-[2] rounded-xl text-base font-semibold"
                style={{ background: "#8fbeb4", color: "var(--qin-night)" }}
              >
                {closing ? "Selesai" : "Berikutnya"}
              </button>
            </div>
            <button type="button" onClick={closeActivity} className="mt-2 min-h-11 w-full rounded-xl text-sm opacity-80">
              Tutup, nanti saja
            </button>
          </>
        )}
      </div>
    </div>
  );
}
