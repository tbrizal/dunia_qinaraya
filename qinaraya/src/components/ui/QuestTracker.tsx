import { useQuestStore } from "../../stores/useQuestStore";
import { getTrackedQuest } from "../../systems/quest/questTracker";

/** Satu baris petunjuk: apa yang bisa dilakukan selanjutnya. Quest yang belum boleh tampil tidak muncul. */
export function QuestTracker() {
  const quests = useQuestStore((s) => s.quests);
  const tracked = getTrackedQuest(quests);
  if (!tracked) return null;

  return (
    <div
      className="pointer-events-none max-w-full rounded-xl px-3 py-2 text-sm"
      style={{ background: "rgba(31, 42, 46, 0.6)", color: "var(--qin-sand)" }}
    >
      <p className="font-semibold">{tracked.quest.title}</p>
      <p className="opacity-90">{tracked.line}</p>
    </div>
  );
}
