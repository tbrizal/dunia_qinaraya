import { useMemo } from "react";
import { getNpcDef } from "../../data/npcs";
import { advanceDialogue, chooseDialogueOption, closeDialogue, getDialogueView } from "../../stores/dialogueActions";
import { useUiStore } from "../../stores/useUiStore";

/** Dialog NPC sebagai panel bawah. Dunia tetap terlihat; waktu dan gerakan dijeda. */
export function DialoguePanel() {
  const dialogue = useUiStore((s) => s.dialogue);
  const view = useMemo(() => (dialogue ? getDialogueView(dialogue.npcId, dialogue.nodeId) : null), [dialogue]);
  if (!dialogue || !view) return null;

  const npc = getNpcDef(view.npcId);
  const hasChoices = view.choices.length > 0;

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialogue-speaker"
        className="max-h-[60vh] w-full max-w-xl overflow-y-auto rounded-2xl p-4"
        style={{ background: "var(--qin-night)", border: "2px solid rgba(230, 216, 180, 0.4)", touchAction: "pan-y" }}
      >
        <p id="dialogue-speaker" className="mb-1 text-sm font-bold" style={{ color: "var(--qin-moss)" }}>
          {npc?.name ?? "..."}
        </p>
        <p className="mb-4 text-base leading-relaxed">{view.text}</p>

        <div className="flex flex-col gap-2">
          {hasChoices ? (
            view.choices.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => chooseDialogueOption(i)}
                className="min-h-12 touch-manipulation rounded-xl px-4 py-2 text-left text-base font-semibold"
                style={{ background: i === 0 ? "var(--qin-moss)" : "rgba(230, 216, 180, 0.9)", color: "var(--qin-night)" }}
              >
                {label}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={view.hasNext ? advanceDialogue : closeDialogue}
              className="min-h-12 touch-manipulation rounded-xl px-4 py-2 text-base font-semibold"
              style={{ background: "var(--qin-moss)", color: "var(--qin-night)" }}
            >
              {view.hasNext ? "Lanjut" : "Tutup"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
