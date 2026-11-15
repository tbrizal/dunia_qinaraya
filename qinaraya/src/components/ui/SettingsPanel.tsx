import { useEffect, useRef, useState } from "react";
import { gameConfig } from "../../config/gameConfig";
import { startNewGame } from "../../stores/persistence";
import { playSoftChime } from "../../systems/audio/softChime";
import { useClockStore } from "../../stores/useClockStore";
import { useSettingsStore } from "../../stores/useSettingsStore";
import { gameClock } from "../../systems/time/gameClockInstance";

const { sensitivityMin, sensitivityMax } = gameConfig.settings;

function SlidersIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

/** Tombol pengaturan dan dialognya. Saat terbuka, input permainan dijeda. */
export function SettingsPanel() {
  const open = useSettingsStore((s) => s.settingsOpen);
  const setOpen = useSettingsStore((s) => s.setSettingsOpen);
  const sensitivity = useSettingsStore((s) => s.cameraSensitivity);
  const setSensitivity = useSettingsStore((s) => s.setCameraSensitivity);
  const showTouch = useSettingsStore((s) => s.showTouchControls);
  const setShowTouch = useSettingsStore((s) => s.setShowTouchControls);
  const showFps = useSettingsStore((s) => s.showFps);
  const setShowFps = useSettingsStore((s) => s.setShowFps);
  const prayerNotifications = useSettingsStore((s) => s.prayerNotifications);
  const setPrayerNotifications = useSettingsStore((s) => s.setPrayerNotifications);
  const prayerSound = useSettingsStore((s) => s.prayerSound);
  const setPrayerSound = useSettingsStore((s) => s.setPrayerSound);

  const gearRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const speed = useClockStore((s) => s.state.speedMultiplier);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (open) closeRef.current?.focus();
    else if (wasOpen.current) gearRef.current?.focus();
    wasOpen.current = open;
    if (!open) setConfirmReset(false);
  }, [open]);

  return (
    <>
      <button
        ref={gearRef}
        type="button"
        aria-label="Buka pengaturan"
        onClick={() => setOpen(true)}
        className="absolute z-[3] flex h-12 w-12 items-center justify-center rounded-full"
        style={{
          top: "max(0.75rem, env(safe-area-inset-top))",
          right: "max(0.75rem, env(safe-area-inset-right))",
          color: "var(--qin-sand)",
          background: "rgba(31, 42, 46, 0.55)",
          border: "2px solid rgba(230, 216, 180, 0.45)",
        }}
      >
        <SlidersIcon />
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
            aria-labelledby="settings-title"
            className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-2xl p-5"
            style={{ background: "var(--qin-night)", border: "2px solid rgba(230, 216, 180, 0.35)", touchAction: "pan-y" }}
          >
            <h2 id="settings-title" className="mb-4 text-xl font-bold">
              Pengaturan
            </h2>

            <label className="mb-1 flex items-baseline justify-between text-sm font-semibold" htmlFor="cam-sens">
              <span>Sensitivitas kamera</span>
              <span className="tabular-nums opacity-80">{sensitivity.toFixed(1)}x</span>
            </label>
            <input
              id="cam-sens"
              type="range"
              min={sensitivityMin}
              max={sensitivityMax}
              step={0.1}
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="mb-5 h-8 w-full accent-[#7a9a5b]"
            />

            <label className="mb-3 flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[#7a9a5b]" checked={showTouch} onChange={(e) => setShowTouch(e.target.checked)} />
              Tampilkan kontrol sentuh
            </label>
            <label className="mb-5 flex min-h-11 items-center gap-3 text-sm">
              <input type="checkbox" className="h-5 w-5 accent-[#7a9a5b]" checked={showFps} onChange={(e) => setShowFps(e.target.checked)} />
              Tampilkan FPS
            </label>

            <h3 className="mb-1 text-sm font-semibold">Pengingat waktu salat (simulasi)</h3>
            <label className="mb-1 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#7a9a5b]"
                checked={prayerNotifications}
                onChange={(e) => setPrayerNotifications(e.target.checked)}
              />
              Tampilkan pengingat lembut
            </label>
            <label className="mb-1 flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[#7a9a5b]"
                checked={prayerSound}
                disabled={!prayerNotifications}
                onChange={(e) => {
                  setPrayerSound(e.target.checked);
                  if (e.target.checked) playSoftChime();
                }}
              />
              Bunyi denting lembut
            </label>
            <p className="mb-5 text-xs opacity-70">Pengingat hanya membantu mengenal waktu. Tidak ada hukuman bila diabaikan.</p>

            <h3 className="mb-1 text-sm font-semibold">Kecepatan waktu (untuk uji)</h3>
            <div className="mb-5 flex gap-2" role="group" aria-label="Kecepatan waktu">
              {gameConfig.clock.speedOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={speed === option}
                  onClick={() => gameClock.setSpeedMultiplier(option)}
                  className="min-h-11 flex-1 rounded-xl text-base font-semibold"
                  style={{
                    background: speed === option ? "var(--qin-moss)" : "rgba(230, 216, 180, 0.12)",
                    color: speed === option ? "var(--qin-night)" : "var(--qin-sand)",
                  }}
                >
                  {option}x
                </button>
              ))}
            </div>

            <h3 className="mb-1 text-sm font-semibold">Kontrol</h3>
            <p className="mb-1 text-sm opacity-80">Keyboard: WASD atau tombol panah untuk berjalan, Shift untuk berlari.</p>
            <p className="mb-1 text-sm opacity-80">Mouse: seret untuk memutar kamera, roda untuk zoom.</p>
            <p className="mb-1 text-sm opacity-80">Interaksi: E atau Enter untuk aksi utama, angka 1 sampai 4 untuk pilihan lain, I untuk tas, T untuk kalender dan jadwal.</p>
            <p className="mb-5 text-sm opacity-80">Layar sentuh: joystick kiri untuk berjalan, geser layar untuk memutar kamera, cubit untuk zoom, ketuk tombol aksi di kanan bawah.</p>

            <h3 className="mb-1 text-sm font-semibold">Permainan</h3>
            <p className="mb-2 text-sm opacity-80">Kemajuan tersimpan otomatis di perangkat ini.</p>
            <button
              type="button"
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                startNewGame();
                useSettingsStore.getState().setSettingsOpen(false);
              }}
              className="mb-5 min-h-11 w-full rounded-xl text-base font-semibold"
              style={{
                background: confirmReset ? "#d9784a" : "rgba(230, 216, 180, 0.12)",
                color: confirmReset ? "var(--qin-night)" : "var(--qin-sand)",
              }}
            >
              {confirmReset ? "Yakin? Semua kemajuan akan dihapus" : "Mulai game baru"}
            </button>

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
