import type { QuestDef } from "../quests.ts";

/** Quest pembelajaran Islami yang BELUM DITINJAU. Tidak ikut build produksi (lihat data/unreviewed/index.ts). */
export const DRAFT_QUESTS: Record<string, QuestDef> = {
  learn_masjid: {
    id: "learn_masjid",
    title: "Berkenalan dengan Masjid",
    summary: "Jelajahi masjid dan musala bersama Ustadz Harun, lalu pelajari kebiasaan baik di sana.",
    category: "islamic-learning",
    reviewStatus: "draft",
    giverNpcId: "ustadz-harun",
    startHint: "Temui Ustadz Harun di depan Masjid Qinaraya, utara desa.",
    objectives: [
      { type: "learn", count: 1, targetId: "masjid-intro", label: "Pelajari tentang masjid (di depan masjid)" },
      { type: "learn", count: 1, targetId: "masjid-adab", label: "Pelajari adab di masjid (di depan masjid)" },
      { type: "learn", count: 1, targetId: "musala-intro", label: "Kunjungi musala di timur laut desa" },
    ],
    startItems: [],
    rewardItems: [{ itemId: "lantern", quantity: 1 }],
  },
  learn_wudu: {
    id: "learn_wudu",
    title: "Bersih dan Bersuci",
    summary: "Mengenal wudu, menjaga kebersihan masjid, dan mengenal waktu salat di Qinaraya.",
    category: "islamic-learning",
    reviewStatus: "draft",
    requires: ["learn_masjid"],
    giverNpcId: "ustadz-harun",
    startHint: "Temui Ustadz Harun lagi untuk misi berikutnya.",
    objectives: [
      { type: "learn", count: 1, targetId: "wudu-intro", label: "Pelajari wudu di tempat wudu" },
      { type: "clean", count: 3, label: "Bersihkan halaman masjid" },
      { type: "learn", count: 1, targetId: "prayer-times", label: "Buka panel jam di kiri atas dan pelajari waktu salat" },
    ],
    startItems: [],
    rewardItems: [{ itemId: "flower_pot", quantity: 1 }],
  },
  share_harvest: {
    id: "share_harvest",
    title: "Berbagi Hasil Kebun",
    summary: "Bagikan sebagian hasil panenmu untuk dapur warga yang dikelola Ustadz Harun.",
    category: "islamic-learning",
    reviewStatus: "draft",
    requires: ["tutorial_farming", "learn_masjid"],
    giverNpcId: "ustadz-harun",
    startHint: "Selesaikan misi kebun dan temui Ustadz Harun untuk misi berbagi.",
    objectives: [{ type: "give", count: 2, label: "Bagikan 2 hasil panen untuk dapur warga" }],
    startItems: [],
    rewardItems: [{ itemId: "wooden_bench", quantity: 1 }],
  },
};
