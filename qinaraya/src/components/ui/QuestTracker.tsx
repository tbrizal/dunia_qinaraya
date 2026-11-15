import { QUEST_LIST } from "../../data/quests";
import { getNpcDef } from "../../data/npcs";
import { useQuestStore } from "../../stores/useQuestStore";
import { getNextObjective, getStatus } from "../../systems/quest/questEngine";

/** Satu baris petunjuk: apa yang harus dilakukan selanjutnya. */
export function QuestTracker() {
  const quests = useQuestStore((s) => s.quests);

  for (const quest of QUEST_LIST) {
    const status = getStatus(quests, quest.id);
    const giver = getNpcDef(quest.giverNpcId)?.name ?? "pemberi misi";
    let line: string | null = null;

    if (status === "inactive") line = quest.startHint;
    else if (status === "ready") line = `Kembali ke ${giver} untuk menyerahkan misi.`;
    else if (status === "active") {
      const next = getNextObjective(quests, quest.id);
      if (next) line = `${next.label} (${next.current}/${next.count})`;
    }
    if (!line) continue;

    return (
      <div
        className="pointer-events-none max-w-full rounded-xl px-3 py-2 text-sm"
        style={{ background: "rgba(31, 42, 46, 0.6)", color: "var(--qin-sand)" }}
      >
        <p className="font-semibold">{quest.title}</p>
        <p className="opacity-90">{line}</p>
      </div>
    );
  }
  return null;
}
