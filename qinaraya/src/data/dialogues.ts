import type { ReviewStatus } from "../systems/content/review.ts";
import type { QuestStatus } from "../systems/quest/questEngine.ts";

/**
 * Dialog statis per NPC. Teks boleh memakai {timeOfDay} (pagi/siang/sore/malam)
 * yang diisi dari Game Clock. Belum ada konten keagamaan pada fase ini.
 */

export type DialogueEffect =
  | { type: "startQuest"; questId: string }
  | { type: "completeQuest"; questId: string }
  /** Memberikan hasil panen apa pun dari tas untuk dibagikan. */
  | { type: "donateCrops"; quantity: number };

export interface DialogueChoice {
  label: string;
  /** Node tujuan; null menutup dialog. */
  next: string | null;
  effect?: DialogueEffect;
}

export interface DialogueNode {
  text: string;
  /** Node berikutnya saat pemain menekan Lanjut. Kosong atau null menutup dialog. */
  next?: string | null;
  choices?: readonly DialogueChoice[];
}

export interface DialogueCondition {
  questId: string;
  status: readonly QuestStatus[];
}

export interface DialogueEntry {
  node: string;
  /** Entri pertama yang cocok dipakai. Beberapa syarat harus terpenuhi semuanya. Tanpa `when` selalu cocok. */
  when?: DialogueCondition | readonly DialogueCondition[];
  /** Entri bermateri agama berstatus draft sampai ditinjau dan dilewati di produksi. */
  reviewStatus?: ReviewStatus;
}

export interface NpcDialogue {
  npcId: string;
  entries: readonly DialogueEntry[];
  nodes: Record<string, DialogueNode>;
}

export const DIALOGUES: Record<string, NpcDialogue> = {
  "pak-hasan": {
    npcId: "pak-hasan",
    entries: [
      { node: "done", when: { questId: "tutorial_farming", status: ["completed"] } },
      { node: "turnin", when: { questId: "tutorial_farming", status: ["ready"] } },
      { node: "reminder", when: { questId: "tutorial_farming", status: ["active"] } },
      { node: "intro" },
    ],
    nodes: {
      intro: {
        text: "Selamat {timeOfDay}, Nak! Aku Pak Hasan. Kebun di sebelah sana sudah lama menunggu tangan yang rajin.",
        next: "offer",
      },
      offer: {
        text: "Mau belajar bertani? Aku punya cangkul, penyiram, dan beberapa benih untukmu.",
        choices: [
          { label: "Mau, Pak!", next: "started", effect: { type: "startQuest", questId: "tutorial_farming" } },
          { label: "Nanti saja", next: null },
        ],
      },
      started: {
        text: "Bagus! Cangkul tanah dulu, tanam benihnya, lalu siram. Tanaman hanya tumbuh saat tanahnya basah. Tenang saja, tanaman tidak akan mati kalau kamu lupa menyiram.",
        next: null,
      },
      reminder: {
        text: "Selamat {timeOfDay}. Cangkul tanah, tanam benih, siram, lalu tunggu sampai siap dipanen. Kalau sudah selesai, temui aku lagi.",
        next: null,
      },
      turnin: {
        text: "Wah, panenmu bagus sekali! Kamu sudah paham dasar-dasarnya. Ini sedikit benih tambahan untuk kebunmu.",
        choices: [{ label: "Terima hadiah", next: "done_thanks", effect: { type: "completeQuest", questId: "tutorial_farming" } }],
      },
      done_thanks: {
        text: "Terus rawat kebunmu ya. Kebun yang dirawat dengan sabar akan membalas dengan hasil yang baik.",
        next: null,
      },
      done: {
        text: "Selamat {timeOfDay}, Nak. Kebunmu makin rapi saja. Kalau ada yang ingin ditanam, silakan pakai petak mana pun.",
        next: null,
      },
    },
  },
  // Hanya cadangan non-agama. Dialog materi dan quest Ustadz Harun ada di data/unreviewed.
  "ustadz-harun": {
    npcId: "ustadz-harun",
    entries: [{ node: "unavailable" }],
    nodes: {
      unavailable: {
        text: "Selamat {timeOfDay}. Aku sedang menyiapkan bahan cerita untuk warga. Datanglah lagi nanti ya.",
        next: null,
      },
    },
  },
  nara: {
    npcId: "nara",
    entries: [{ node: "hello" }],
    nodes: {
      hello: {
        text: "Selamat {timeOfDay}! Aku Nara. Aku sedang memetakan desa ini dan mencatat semua tempat menariknya.",
        next: "tips",
      },
      tips: {
        text: "Di utara ada bangunan besar berkubah, di timur ada kios pasar, dan kebun ada di barat daya. Pak Hasan biasa berada di dekat kebun.",
        next: null,
      },
    },
  },
};

/** Menyisipkan entri dan node tambahan (di depan entri cadangan). Dipakai konten yang belum ditinjau. */
export function registerDialogueContent(npcId: string, entries: readonly DialogueEntry[], nodes: Record<string, DialogueNode>): void {
  const base = DIALOGUES[npcId];
  if (!base) return;
  const known = new Set(base.entries.map((e) => e.node));
  const fresh = entries.filter((e) => !known.has(e.node));
  DIALOGUES[npcId] = { ...base, entries: [...fresh, ...base.entries], nodes: { ...base.nodes, ...nodes } };
}

export function getDialogue(npcId: string): NpcDialogue | undefined {
  return DIALOGUES[npcId];
}
