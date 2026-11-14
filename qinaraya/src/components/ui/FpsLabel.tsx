import { useSettingsStore } from "../../stores/useSettingsStore";

export function FpsLabel() {
  const showFps = useSettingsStore((s) => s.showFps);
  const fps = useSettingsStore((s) => s.fps);
  if (!showFps) return null;
  return (
    <div
      className="pointer-events-none absolute z-[3] rounded-lg px-2 py-1 text-xs tabular-nums"
      style={{
        left: "max(0.75rem, env(safe-area-inset-left))",
        bottom: "calc(var(--joy-size) + 2.5rem)",
        color: "var(--qin-sand)",
        background: "rgba(31, 42, 46, 0.6)",
      }}
    >
      {fps} FPS
    </div>
  );
}
