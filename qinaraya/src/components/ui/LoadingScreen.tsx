import { gameConfig } from "../../config/gameConfig";

export function LoadingScreen() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6 text-center"
      style={{ background: "var(--qin-night)" }}
    >
      <h1 className="text-3xl font-bold tracking-wide" style={{ color: "var(--qin-sand)" }}>
        {gameConfig.title}
      </h1>
      <p className="max-w-xs text-sm opacity-80">{gameConfig.tagline}</p>
      <p className="text-sm">Memuat dunia…</p>
    </div>
  );
}
