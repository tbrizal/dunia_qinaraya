import { ClockPill } from "./ClockPill";
import { ControlsHint } from "./ControlsHint";
import { QuestTracker } from "./QuestTracker";

/** Kolom HUD kiri atas. Sisi kanan dikosongkan untuk tombol tas dan pengaturan. */
export function TopLeftHud() {
  return (
    <div
      className="pointer-events-none absolute z-[3] flex max-w-[22rem] flex-col items-start gap-2"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        left: "max(0.75rem, env(safe-area-inset-left))",
        right: "calc(7.5rem + env(safe-area-inset-right))",
      }}
    >
      <ClockPill />
      <QuestTracker />
      <ControlsHint />
    </div>
  );
}
